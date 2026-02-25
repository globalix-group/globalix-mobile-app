/**
 * ChatsScreen.tsx
 * Messaging screen for conversations with property/car sellers
 * Features: Chat list, recent messages, unread indicators, search
 */

// ===== IMPORTS =====
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { chatApi, getAuthToken, SOCKET_BASE_URL } from '../services/apiClient';
import { io, Socket } from 'socket.io-client';
import { Audio } from 'expo-av';

// ===== INTERFACES =====
interface Chat {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  itemType: 'property' | 'car';
  itemTitle: string;
  itemImage: string;
  isOnline: boolean;
  isAdminChat?: boolean;
}

interface ChatsScreenProps {
  navigation: any;
}

const formatTimestamp = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const playNotificationSound = async () => {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync({
      uri: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_6b1b8c7f59.mp3?filename=message-pop-alert-132199.mp3',
    });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('Failed to play notification sound:', error);
  }
};

const MOCK_CHATS: Chat[] = [];

// ===== CHAT ITEM COMPONENT =====
const ChatItem: React.FC<{ chat: Chat; onPress: () => void; theme: any; isDark: boolean }> = ({
  chat,
  onPress,
  theme,
  isDark,
}) => (
  <TouchableOpacity style={styles.chatItem} onPress={onPress} activeOpacity={0.7}>
    {/* User Avatar with Online Status */}
    <View style={styles.avatarContainer}>
      {chat.userAvatar ? (
        <Image 
          source={{ uri: chat.userAvatar }}
          style={styles.avatar} 
        />
      ) : (
        <View style={[styles.avatar, { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>
            {chat.userName?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
      )}
      {chat.isOnline && <View style={styles.onlineIndicator} />}
    </View>

    {/* Chat Info */}
    <View style={styles.chatContent}>
      {/* Top Row: Name & Timestamp */}
      <View style={styles.chatHeader}>
        <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
          {chat.userName}
        </Text>
        <Text style={styles.timestamp}>{chat.timestamp}</Text>
      </View>

      {/* Item Info */}
      <View style={styles.itemInfo}>
        <Ionicons
          name={chat.itemType === 'property' ? 'business' : 'car-sport'}
          size={14}
          color={chat.itemType === 'property' ? '#3b82f6' : '#10b981'}
        />
        <Text style={[styles.itemTitle, { color: theme.secondary }]} numberOfLines={1}>
          {chat.itemTitle}
        </Text>
      </View>

      {/* Last Message */}
      <Text
        style={[
          styles.lastMessage,
          { color: chat.unreadCount > 0 ? theme.text : theme.secondary },
          chat.unreadCount > 0 && styles.unreadMessage,
        ]}
        numberOfLines={1}
      >
        {chat.lastMessage}
      </Text>
    </View>

    {/* Item Thumbnail & Unread Badge */}
    <View style={styles.rightSection}>
      {chat.itemImage ? (
        <Image source={{ uri: chat.itemImage }} style={styles.itemThumbnail} />
      ) : (
        <View style={[styles.itemThumbnail, { backgroundColor: '#e5e7eb' }]} />
      )}
      {chat.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{chat.unreadCount}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// ===== MAIN COMPONENT =====
export const ChatsScreen: React.FC<ChatsScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [adminChats, setAdminChats] = useState<Chat[]>([]);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'admin'>('all');
  const socketRef = React.useRef<Socket | null>(null);
  const isScreenFocusedRef = React.useRef(true);

  const loadAdminChats = useCallback(async () => {
    const fallbackAdminChat: Chat = {
      id: 'admin-chat',
      userId: 'admin',
      userName: 'Globalix Admin',
      userAvatar: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff',
      lastMessage: 'Start a conversation with Globalix Admin',
      timestamp: '',
      unreadCount: 0,
      itemType: 'property',
      itemTitle: 'Admin Support',
      itemImage: '',
      isOnline: true,
      isAdminChat: true,
    };

    try {
      const response = await chatApi.list();
      if (!response?.success) {
        setAdminChats([fallbackAdminChat]);
        return;
      }
      const rawMessages = Array.isArray(response.data) ? response.data : [];

      const sorted = [...rawMessages].sort(
        (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const lastMessage = sorted[sorted.length - 1];
      const unreadCount = sorted.filter(
        (msg: any) => msg.fromAdmin && !msg.read
      ).length;

      const adminChat: Chat = {
        ...fallbackAdminChat,
        lastMessage: lastMessage?.message || fallbackAdminChat.lastMessage,
        timestamp: formatTimestamp(lastMessage?.createdAt),
        unreadCount,
      };

      setAdminChats([adminChat]);
    } catch (error) {
      console.warn('Failed to load admin chats:', error);
      setAdminChats([fallbackAdminChat]);
    }
  }, []);

  useEffect(() => {
    loadAdminChats();
    const interval = setInterval(loadAdminChats, 5000);
    return () => clearInterval(interval);
  }, [loadAdminChats]);

  useEffect(() => {
    const focus = navigation.addListener('focus', () => {
      isScreenFocusedRef.current = true;
      loadAdminChats();
    });
    const blur = navigation.addListener('blur', () => {
      isScreenFocusedRef.current = false;
    });

    return () => {
      focus();
      blur();
    };
  }, [navigation, loadAdminChats]);

  useEffect(() => {
    let socket: Socket | null = null;
    let isMounted = true;

    const connect = async () => {
      const token = await getAuthToken();
      socket = io(SOCKET_BASE_URL, {
        transports: ['websocket'],
        auth: { token },
      });

      socketRef.current = socket;

      socket.on('chat:message', (payload: any) => {
        if (!isMounted || !payload?.fromAdmin) return;

        // Only play sound if chat list screen is focused (not in conversation)
        if (isScreenFocusedRef.current === true) {
          playNotificationSound();
        }

        const lastMessage = payload.message || 'New message';
        const timestamp = formatTimestamp(payload.createdAt);

        setAdminChats((prev) => {
          const existing = prev[0];
          const unread = existing?.unreadCount ?? 0;
          const shouldIncrementUnread = !isScreenFocusedRef.current;

          return [
            {
              id: 'admin-chat',
              userId: 'admin',
              userName: 'Globalix Admin',
              userAvatar: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff',
              lastMessage,
              timestamp,
              unreadCount: shouldIncrementUnread ? unread + 1 : unread,
              itemType: 'property',
              itemTitle: 'Admin Support',
              itemImage: '',
              isOnline: true,
              isAdminChat: true,
            },
          ];
        });
      });
    };

    connect();

    return () => {
      isMounted = false;
      socket?.disconnect();
    };
  }, []);

  // ===== HANDLERS =====
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAdminChats();
    } finally {
      setRefreshing(false);
    }
  }, [loadAdminChats]);

  const handleChatPress = (chat: Chat) => {
    if (chat.isAdminChat) {
      setAdminChats((prev) =>
        prev.map((item) =>
          item.id === 'admin-chat' ? { ...item, unreadCount: 0 } : item
        )
      );
      chatApi.markAsRead().catch(() => undefined);
    }
    navigation.navigate('ChatConversation', { chatId: chat.id, chat });
  };

  const allChats = [...adminChats, ...chats];
  const displayChats = activeTab === 'admin' ? adminChats : allChats;
  
  const filteredChats = displayChats.filter(
    (chat) =>
      chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.itemTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== RENDER =====
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Messages</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Ionicons name="create-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'all' && { borderBottomWidth: 2, borderBottomColor: theme.primary },
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'all' ? theme.primary : theme.secondary }]}>
            All Messages
          </Text>
          {allChats.reduce((sum, chat) => sum + chat.unreadCount, 0) > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.tabBadgeText}>
                {allChats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'admin' && { borderBottomWidth: 2, borderBottomColor: theme.primary },
          ]}
          onPress={() => setActiveTab('admin')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'admin' ? theme.primary : theme.secondary }]}>
            Admin Messages
          </Text>
          {adminChats.reduce((sum, chat) => sum + chat.unreadCount, 0) > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: '#ef4444' }]}>
              <Text style={styles.tabBadgeText}>
                {adminChats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }]}>
        <Ionicons name="search" size={20} color={theme.secondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search messages..."
          placeholderTextColor={theme.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Chat List */}
      {filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatItem
              chat={item}
              onPress={() => handleChatPress(item)}
              theme={theme}
              isDark={isDark}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color={theme.secondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No messages yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
            {activeTab === 'admin' 
              ? 'No messages from admin'
              : 'Start a conversation with property or car sellers'}
          </Text>
        </View>
      )}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  newChatButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  chatContent: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTitle: {
    fontSize: 13,
    flex: 1,
  },
  lastMessage: {
    fontSize: 14,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'center',
    gap: 8,
  },
  itemThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default ChatsScreen;
