/**
 * NotificationsScreen.tsx
 * User notification preferences and settings management
 * Features: Channel toggles, notification types, preferences configuration
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from 'react-native';

// 2. Third party & context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// ===== CONSTANTS & DATA =====
const NOTIFICATION_CHANNELS = [
  {
    key: 'push',
    icon: 'notifications',
    title: 'Push Notifications',
    description: 'Get alerts on your device',
    color: '#FF7675',
  },
  {
    key: 'email',
    icon: 'mail',
    title: 'Email Notifications',
    description: 'Receive updates via email',
    color: '#74B9FF',
  },
  {
    key: 'inApp',
    icon: 'chatbubble',
    title: 'In-App Messages',
    description: 'See messages within the app',
    color: '#A29BFE',
  },
];

const NOTIFICATION_TYPES = [
  {
    key: 'properties',
    icon: 'home',
    title: 'Property Updates',
    description: 'New listings & price changes',
    color: '#00B894',
  },
  {
    key: 'messages',
    icon: 'chatbox',
    title: 'Messages',
    description: 'Seller & buyer communications',
    color: '#FDCB6E',
  },
  {
    key: 'updates',
    icon: 'megaphone',
    title: 'App Updates',
    description: 'New features & improvements',
    color: '#6C5CE7',
  },
  {
    key: 'promotions',
    icon: 'pricetag',
    title: 'Special Promotions',
    description: 'Deals & exclusive offers',
    color: '#FF6B9D',
  },
];

// ===== INTERFACES & TYPES =====
interface NotificationsScreenProps {
  navigation: any;
}

interface NotificationState {
  push: boolean;
  email: boolean;
  inApp: boolean;
  properties: boolean;
  messages: boolean;
  updates: boolean;
  promotions: boolean;
}

interface NotificationItemProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  color?: string;
  theme: any;
  isDark: boolean;
}

// ===== HELPER COMPONENTS =====
const NotificationItem: React.FC<NotificationItemProps> = ({
  icon,
  title,
  description,
  value,
  onToggle,
  color,
  theme,
  isDark,
}) => (
  <View style={[styles.itemContainer, { borderBottomColor: theme.border }]}>
    <View style={styles.itemLeft}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isDark ? '#1A1A1A' : '#F0F5FF' },
        ]}
      >
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.itemDescription, { color: theme.secondary }]}>
          {description}
        </Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#767577', true: color }}
      thumbColor={
        Platform.OS === 'ios' ? '#fff' : value ? '#fff' : '#f4f3f4'
      }
    />
  </View>
);

// ===== MAIN COMPONENT =====
export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const { theme, isDark } = useTheme();

  // ===== STATE =====
  const [notifications, setNotifications] = useState<NotificationState>({
    push: true,
    email: true,
    inApp: true,
    properties: true,
    messages: true,
    updates: false,
    promotions: false,
  });

  // ===== HANDLERS =====
  const handleToggle = (key: keyof NotificationState) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ===== RENDER =====
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Notifications
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== CHANNELS SECTION ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>
            NOTIFICATION CHANNELS
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {NOTIFICATION_CHANNELS.map((item) => (
              <NotificationItem
                key={item.key}
                icon={item.icon}
                title={item.title}
                description={item.description}
                value={notifications[item.key as keyof NotificationState]}
                onToggle={() => handleToggle(item.key as keyof NotificationState)}
                color={item.color}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </View>
        </View>

        {/* ===== TYPES SECTION ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondary }]}>
            NOTIFICATION TYPES
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {NOTIFICATION_TYPES.map((item) => (
              <NotificationItem
                key={item.key}
                icon={item.icon}
                title={item.title}
                description={item.description}
                value={notifications[item.key as keyof NotificationState]}
                onToggle={() => handleToggle(item.key as keyof NotificationState)}
                color={item.color}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </View>
        </View>

        {/* ===== INFO CARD ===== */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? '#1A1A1A' : '#F0F5FF',
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={theme.primary}
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, { color: theme.text }]}>
            Turning off notifications won't affect your account activity. You can always manage these settings anytime.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  // Scroll content
  scrollContent: { padding: 20, paddingBottom: 120 },

  // Sections
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },

  // Cards
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },

  // Notification items
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  itemDescription: { fontSize: 13, fontWeight: '400' },

  // Info card
  infoCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  infoIcon: { marginRight: 10, marginTop: 2 },
  infoText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
});
