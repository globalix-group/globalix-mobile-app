/**
 * MediaGalleryScreen.tsx
 * Instagram-style media gallery for user profile
 * Features: Grid layout, image/video upload, caption editing, media viewing
 */

// ===== IMPORTS =====
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { useTheme } from '../theme/ThemeContext';
import { mediaApi, Media } from '../services/mediaApi';
import { API_BASE_URL } from '../services/apiClient';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const ITEM_SIZE = (width - 6) / GRID_SIZE; // 2px spacing between items

// ===== INTERFACES =====
interface MediaGalleryScreenProps {
  navigation: any;
  route?: { params?: { userId: string } };
}

// ===== MAIN COMPONENT =====
export const MediaGalleryScreen: React.FC<MediaGalleryScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showModal, setShowModal] = useState(false);
  const mediaBaseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  
  // Dynamic auth hook to get current user ID
  const useAuth = () => {
    try {
      const { useAuth: authHook } = require('../../App');
      return authHook();
    } catch (e) {
      return { user: null };
    }
  };
  const { user } = useAuth();
  const currentUserId = user?.id || route?.params?.userId || user?.userId;

  useEffect(() => {
    fetchMedia();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera and media library access to upload media.');
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      if (!currentUserId) {
        console.warn('No user ID available');
        return;
      }
      const response = await mediaApi.getUserMedia(currentUserId);
      setMedia(response.data);
    } catch (error: any) {
      console.error('Fetch media error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const pickMedia = async (sourceType: 'camera' | 'library') => {
    try {
      let result;
      
      if (sourceType === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        await uploadMedia(result.assets[0]);
      }
    } catch (error: any) {
      console.error('Pick media error:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const uploadMedia = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);
      
      const fileType = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
      const fileName = asset.uri.split('/').pop() || `media-${Date.now()}.jpg`;

      const response = await mediaApi.upload(
        {
          uri: asset.uri,
          type: fileType,
          name: fileName,
        },
        undefined,
        'public'
      );

      Alert.alert('Success', 'Media uploaded successfully!');
      await fetchMedia(); // Refresh gallery
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.response?.data?.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const showUploadOptions = () => {
    Alert.alert(
      'Upload Media',
      'Choose upload source',
      [
        { text: 'Camera', onPress: () => pickMedia('camera') },
        { text: 'Photo Library', onPress: () => pickMedia('library') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleMediaPress = (item: Media) => {
    setSelectedMedia(item);
    setShowModal(true);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this media?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await mediaApi.deleteMedia(mediaId);
              setShowModal(false);
              await fetchMedia();
              Alert.alert('Success', 'Media deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete media');
            }
          },
        },
      ]
    );
  };

  const renderMediaItem = ({ item }: { item: Media }) => {
    const mediaUrl = `${mediaBaseUrl}${item.thumbnailUrl || item.url}`;
    
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handleMediaPress(item)}
        activeOpacity={0.8}
      >
        {item.type === 'video' ? (
          <>
            <Image
              source={{ uri: mediaUrl }}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={32} color="#FFF" />
            </View>
          </>
        ) : (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.gridImage}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={80} color={theme.secondary} />
      <Text style={[styles.emptyText, { color: theme.text }]}>No media yet</Text>
      <Text style={[styles.emptySubtext, { color: theme.secondary }]}>
        Upload your first photo or video
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Media</Text>
        <TouchableOpacity onPress={showUploadOptions} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color={theme.primary} />
          ) : (
            <Ionicons name="add-circle" size={28} color={theme.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Media Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={media}
          renderItem={renderMediaItem}
          keyExtractor={(item) => item.id}
          numColumns={GRID_SIZE}
          contentContainerStyle={styles.gridContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Media Detail Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => selectedMedia && handleDeleteMedia(selectedMedia.id)}>
                <Ionicons name="trash" size={24} color="#FF5252" />
              </TouchableOpacity>
            </View>

            {selectedMedia && (
              <>
                {selectedMedia.type === 'video' ? (
                  <Video
                    source={{ uri: `${mediaBaseUrl}${selectedMedia.url}` }}
                    style={styles.modalMedia}
                    useNativeControls
                    resizeMode={"contain" as any}
                  />
                ) : (
                  <Image
                    source={{ uri: `${mediaBaseUrl}${selectedMedia.url}` }}
                    style={styles.modalMedia}
                    resizeMode="contain"
                  />
                )}

                <View style={styles.mediaInfo}>
                  <Text style={[styles.mediaCaption, { color: theme.text }]}>
                    {selectedMedia.caption || 'No caption'}
                  </Text>
                  <Text style={[styles.mediaStats, { color: theme.secondary }]}>
                    {selectedMedia.views} views • {new Date(selectedMedia.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: { padding: 1 },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: { fontSize: 20, fontWeight: '700', marginTop: 20 },
  emptySubtext: { fontSize: 14, marginTop: 8 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  modalMedia: {
    width: '100%',
    height: 400,
  },
  mediaInfo: {
    padding: 20,
  },
  mediaCaption: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  mediaStats: {
    fontSize: 14,
  },
});
