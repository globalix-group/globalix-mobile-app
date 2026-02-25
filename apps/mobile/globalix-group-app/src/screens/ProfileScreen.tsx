/**
 * ProfileScreen.tsx
 * User profile screen with account settings, preferences, and logout
 * Features: Avatar upload, theme toggle, notification settings, help & legal, logout
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';

// 2. Third party & context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { mediaApi } from '../services/mediaApi';
import { userApi } from '../services/userApi';

// ===== CONSTANTS & DATA =====
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400';

// ===== INTERFACES & TYPES =====
interface ProfileScreenProps {
  navigation: any;
}

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  type?: 'arrow' | 'toggle';
  color?: string;
  onPress?: () => void;
  isDark?: boolean;
  toggleTheme?: () => void;
  theme: any;
  borderBottomColor?: string;
}

// ===== HELPER COMPONENTS =====
const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  value,
  type = 'arrow',
  color,
  onPress,
  isDark,
  toggleTheme,
  theme,
  borderBottomColor,
}) => (
  <TouchableOpacity
    style={[styles.settingRow, { borderBottomColor: borderBottomColor || theme.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.settingLeft}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isDark ? '#1A1A1A' : '#F0F5FF' },
        ]}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.settingTitle, { color: theme.text }]}>
        {title}
      </Text>
    </View>

    {type === 'toggle' ? (
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ false: '#767577', true: color }}
        thumbColor={
          Platform.OS === 'ios' ? '#fff' : isDark ? '#fff' : '#f4f3f4'
        }
      />
    ) : (
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={18} color="#CCC" />
      </View>
    )}
  </TouchableOpacity>
);

// ===== MAIN COMPONENT =====
export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  navigation,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  
  // State management
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const isMountedRef = React.useRef(true);

  // Dynamic auth hook
  const useAuth = () => {
    try {
      const { useAuth: authHook } = require('../../App');
      return authHook();
    } catch (e) {
      return { logout: async () => {} };
    }
  };
  const { logout } = useAuth();

  // ===== LIFECYCLE =====
  useEffect(() => {
    isMountedRef.current = true;
    loadUserProfile();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ===== HANDLERS =====
  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> =>
    new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error('Profile load timed out')), timeoutMs);
      promise
        .then((value) => {
          clearTimeout(timeoutId);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const result = await withTimeout(userApi.getProfile(), 8000);
      if (result.success && result.data) {
        if (isMountedRef.current) {
          setUser(result.data);
        }
      } else {
        // Set default user info if fetch fails
        if (isMountedRef.current) {
          setUser({
            name: 'Emmanuel Tangadivine',
            email: 'emmadivine214@gmail.com',
            avatar: DEFAULT_AVATAR,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      if (isMountedRef.current) {
        setUser({
          name: 'Emmanuel Tangadivine',
          email: 'emmadivine214@gmail.com',
          avatar: DEFAULT_AVATAR,
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSelectImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to select images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleUploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUploadImage = async (asset: any) => {
    try {
      setUploading(true);

      // Upload image to media API
      const uploadResult = await mediaApi.upload({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: `profile_${Date.now()}.jpg`,
      }, '', 'private');

      if (!uploadResult.success) {
        Alert.alert('Upload Failed', uploadResult.message || 'Failed to upload image');
        return;
      }

      // Update user profile with new avatar URL
      const imageUrl = uploadResult.data?.url || asset.uri;
      const updateResult = await userApi.updateAvatar(imageUrl);

      if (updateResult.success) {
        setUser(prev => ({
          ...prev,
          avatar: imageUrl,
        }));
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', updateResult.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ===== RENDER =====
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== PROFILE HEADER ===== */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: user?.avatar || DEFAULT_AVATAR }} 
              style={styles.avatar}
            />
            <TouchableOpacity
              style={[styles.editBadge, { backgroundColor: theme.primary }]}
              onPress={handleSelectImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={14} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
        </View>

        {/* ===== PREFERENCES SECTION ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>
            PREFERENCES
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <SettingItem
              icon="moon"
              title="Dark Mode"
              type="toggle"
              color="#A29BFE"
              isDark={isDark}
              toggleTheme={toggleTheme}
              theme={theme}
              borderBottomColor={theme.border}
            />
            <SettingItem
              icon="notifications"
              title="Notifications"
              value="On"
              color="#FF7675"
              onPress={() => navigation.navigate('Notifications')}
              theme={theme}
              borderBottomColor={theme.border}
            />
          </View>
        </View>

        {/* ===== DOCUMENTS SECTION ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>
            DOCUMENTS
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <SettingItem
              icon="document-text"
              title="Immigration Docs"
              color="#3b82f6"
              onPress={() => navigation.navigate('ImmigrationDocs')}
              theme={theme}
              borderBottomColor={theme.border}
            />
          </View>
        </View>

        {/* ===== MY MEDIA SECTION ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>
            MY MEDIA
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <SettingItem
              icon="images"
              title="Photos & Videos"
              color="#FF6B9D"
              onPress={() => navigation.navigate('MediaGallery')}
              theme={theme}
              borderBottomColor={theme.border}
            />
          </View>
        </View>

        {/* ===== SUPPORT & LEGAL SECTION ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>
            SUPPORT & LEGAL
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <SettingItem
              icon="help-circle"
              title="Help Center"
              onPress={() => navigation.navigate('HelpCenter')}
              theme={theme}
              borderBottomColor={theme.border}
            />
            <SettingItem
              icon="shield-checkmark"
              title="Privacy Policy"
              onPress={() => navigation.navigate('PrivacyPolicy')}
              theme={theme}
              borderBottomColor={theme.border}
            />
          </View>
        </View>

        {/* ===== LOGOUT SECTION ===== */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out" size={20} color="#FF5252" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Globalix App v1.0.4 (Hamilton, ON)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: { alignItems: 'center', marginVertical: 30 },
  avatarWrapper: { position: 'relative', marginBottom: 15 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#004aad',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#999', fontWeight: '500' },

  // Sections
  section: { marginTop: 25 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 10,
    marginBottom: 10,
  },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },

  // Setting items
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingTitle: { fontSize: 16, fontWeight: '600' },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 14, color: '#999', marginRight: 8 },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    padding: 15,
  },
  logoutText: { color: '#FF5252', fontWeight: '700', fontSize: 16, marginLeft: 10 },

  // Footer
  versionText: { textAlign: 'center', color: '#CCC', fontSize: 12, marginTop: 20 },
});