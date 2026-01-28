/**
 * ProfileScreen.tsx
 * User profile screen with account settings, preferences, and logout
 * Features: Avatar, theme toggle, notification settings, help & legal, logout
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';

// 2. Third party & context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// ===== CONSTANTS & DATA =====
const USER_NAME = 'Emmanuel Tangadivine';
const USER_EMAIL = 'emmadivine214@gmail.com';
const USER_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400';

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

  // ===== HANDLERS =====
  const handleLogout = async () => {
    await logout();
  };

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
            <Image source={{ uri: USER_AVATAR }} style={styles.avatar} />
            <TouchableOpacity
              style={[styles.editBadge, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="camera" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>
            {USER_NAME}
          </Text>
          <Text style={styles.userEmail}>{USER_EMAIL}</Text>
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