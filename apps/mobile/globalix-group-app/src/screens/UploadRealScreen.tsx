/**
 * UploadRealScreen.tsx
 * Screen for uploading new Reals (short videos) about properties or cars
 * Features: Video picker, category selection, title/description, location, price
 */

// ===== IMPORTS =====
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

// ===== INTERFACES =====
interface UploadRealScreenProps {
  navigation: any;
}

// ===== MAIN COMPONENT =====
const UploadRealScreen: React.FC<UploadRealScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [selectedType, setSelectedType] = useState<'property' | 'car' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ===== HANDLERS =====
  const handlePickVideo = async () => {
    // TODO: Integrate with expo-image-picker for video selection
    Alert.alert('Video Picker', 'Video picker will be integrated here');
  };

  const handleUpload = async () => {
    if (!videoUri || !selectedType || !title || !price || !location) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    try {
      // TODO: Integrate with backend API to upload video
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload
      Alert.alert('Success', 'Your Real has been uploaded!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // ===== RENDER =====
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Upload Real</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Video Preview */}
          <TouchableOpacity 
            style={[styles.videoPickerContainer, { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }]}
            onPress={handlePickVideo}
          >
            {videoUri ? (
              <Image source={{ uri: videoUri }} style={styles.videoPreview} />
            ) : (
              <View style={styles.videoPlaceholder}>
                <Ionicons name="videocam" size={64} color={theme.secondary} />
                <Text style={[styles.videoPlaceholderText, { color: theme.secondary }]}>
                  Tap to select video
                </Text>
                <Text style={[styles.videoHint, { color: theme.secondary }]}>
                  Max 60 seconds
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
            <View style={styles.categoryRow}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedType === 'property' && styles.categoryButtonActive,
                  { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }
                ]}
                onPress={() => setSelectedType('property')}
              >
                <Ionicons 
                  name="business" 
                  size={24} 
                  color={selectedType === 'property' ? '#3b82f6' : theme.secondary} 
                />
                <Text style={[
                  styles.categoryText,
                  { color: selectedType === 'property' ? '#3b82f6' : theme.secondary }
                ]}>
                  Property
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedType === 'car' && styles.categoryButtonActive,
                  { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }
                ]}
                onPress={() => setSelectedType('car')}
              >
                <Ionicons 
                  name="car-sport" 
                  size={24} 
                  color={selectedType === 'car' ? '#10b981' : theme.secondary} 
                />
                <Text style={[
                  styles.categoryText,
                  { color: selectedType === 'car' ? '#10b981' : theme.secondary }
                ]}>
                  Car
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
                  color: theme.text,
                  borderColor: theme.border
                }
              ]}
              placeholder="e.g. Luxury Penthouse Downtown"
              placeholderTextColor={theme.secondary}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { 
                  backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
                  color: theme.text,
                  borderColor: theme.border
                }
              ]}
              placeholder="Tell viewers about this property or car..."
              placeholderTextColor={theme.secondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
          </View>

          {/* Price Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Price *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
                  color: theme.text,
                  borderColor: theme.border
                }
              ]}
              placeholder="e.g. $4.5M or $185K"
              placeholderTextColor={theme.secondary}
              value={price}
              onChangeText={setPrice}
              keyboardType="default"
            />
          </View>

          {/* Location Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>Location *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
                  color: theme.text,
                  borderColor: theme.border
                }
              ]}
              placeholder="e.g. Toronto, ON"
              placeholderTextColor={theme.secondary}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            <LinearGradient
              colors={isUploading ? ['#999', '#777'] : ['#3b82f6', '#8b5cf6']}
              style={styles.uploadGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isUploading ? (
                <Text style={styles.uploadButtonText}>Uploading...</Text>
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={24} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Upload Real</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  videoPickerContainer: {
    width: '100%',
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
  videoHint: {
    fontSize: 13,
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 15,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default UploadRealScreen;
