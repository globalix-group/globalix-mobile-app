/**
 * ChatConversationScreen.tsx
 * Individual chat conversation with messaging functionality
 * Features: Message history, send messages, image sharing, typing indicators
 */

// ===== IMPORTS =====
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { chatApi, getAuthToken, SOCKET_BASE_URL } from '../services/apiClient';
import { mediaApi } from '../services/mediaApi';
import { io, Socket } from 'socket.io-client';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

// ===== INTERFACES =====
interface Message {
  id: string;
  text: string;
  isMine: boolean;
  timestamp: string;
  isRead: boolean;
  isDelivered?: boolean;
  type?: 'text' | 'image' | 'voice' | 'location';
  imageUri?: string;
  voiceUri?: string;
  voiceDuration?: number;
  location?: { latitude: number; longitude: number; address?: string };
  replyTo?: { id: string; text: string; senderName: string };
  reactions?: { emoji: string; userIds: string[] }[];
}

interface ChatConversationScreenProps {
  navigation: any;
  route: any;
}

// ===== MOCK DATA =====
const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hi! I\'m interested in viewing this property.',
    isMine: true,
    timestamp: '10:30 AM',
    isRead: true,
    isDelivered: true,
  },
  {
    id: '2',
    text: 'Hello! Thanks for your interest. When would you like to schedule a viewing?',
    isMine: false,
    timestamp: '10:32 AM',
    isRead: true,
    isDelivered: true,
  },
  {
    id: '3',
    text: 'Would tomorrow at 2 PM work?',
    isMine: true,
    timestamp: '10:35 AM',
    isRead: true,
    isDelivered: true,
  },
  {
    id: '4',
    text: 'Yes, I can show you the property tomorrow at 2 PM',
    isMine: false,
    timestamp: '10:36 AM',
    isRead: false,
    isDelivered: true,
  },
];

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

// ===== MESSAGE BUBBLE COMPONENT =====
const MessageBubble: React.FC<{ 
  message: Message; 
  theme: any; 
  onLongPress: (message: Message) => void;
  onReply: (message: Message) => void;
  onReact: (message: Message, emoji: string) => void;
  playingMessageId: string | null;
  onPlayVoice: (message: Message) => void;
}> = ({ message, theme, onLongPress, onReply, onReact, playingMessageId, onPlayVoice }) => {
  const [showActions, setShowActions] = React.useState(false);
  const quickReactions = ['👍', '❤️', '🎉', '🔥', '✨', '💡'];
  const isPlaying = playingMessageId === message.id;

  const renderMessageContent = () => {
    // Reply indicator - Globalix style with accent
    const replySection = message.replyTo ? (
      <View style={[styles.replyContainer, { 
        backgroundColor: message.isMine ? 'rgba(255,255,255,0.15)' : 'rgba(0,122,255,0.08)',
        borderLeftWidth: 3,
        borderLeftColor: message.isMine ? '#FFF' : theme.primary 
      }]}>
        <Text style={[styles.replyName, { color: message.isMine ? '#FFF' : theme.primary, fontWeight: '700' }]}>
          {message.replyTo.senderName}
        </Text>
        <Text style={[styles.replyText, { color: message.isMine ? 'rgba(255,255,255,0.85)' : theme.secondary }]} numberOfLines={1}>
          {message.replyTo.text}
        </Text>
      </View>
    ) : null;

    // Image message - Globalix style with rounded corners
    if (message.type === 'image' && message.imageUri) {
      return (
        <>
          {replySection}
          <Image 
            source={{ uri: message.imageUri }} 
            style={[styles.messageImage, { borderRadius: 12 }]} 
            resizeMode="cover" 
          />
          {message.text ? (
            <Text style={[styles.messageText, { 
              color: message.isMine ? '#FFF' : theme.text, 
              marginTop: 10,
              fontSize: 15,
              lineHeight: 22
            }]}>
              {message.text}
            </Text>
          ) : null}
        </>
      );
    }

    // Voice message - Unique Globalix style with gradient wave
    if (message.type === 'voice' && message.voiceUri) {
      return (
        <>
          {replySection}
          <TouchableOpacity 
            style={[styles.voiceMessage, { 
              backgroundColor: message.isMine ? 'rgba(255,255,255,0.12)' : 'rgba(0,122,255,0.06)',
              borderRadius: 20,
              paddingVertical: 10,
              paddingHorizontal: 14
            }]} 
            onPress={() => onPlayVoice(message)}
            activeOpacity={0.6}
          >
            <View style={[styles.voicePlayButton, { 
              backgroundColor: message.isMine ? '#FFF' : theme.primary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 4,
              elevation: 3
            }]}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={18} 
                color={message.isMine ? theme.primary : '#FFF'} 
                style={{ marginLeft: isPlaying ? 0 : 2 }}
              />
            </View>
            <View style={styles.voiceWaveContainer}>
              <View style={[styles.voiceWave, { gap: 3 }]}>
                {[6, 10, 15, 12, 18, 14, 20, 16, 12, 18, 14, 10, 16, 12, 8, 12, 16].map((height, idx) => (
                  <View 
                    key={idx}
                    style={[
                      styles.waveBar, 
                      { 
                        height,
                        width: 2.5,
                        borderRadius: 2,
                        backgroundColor: message.isMine ? '#FFF' : theme.primary,
                        opacity: isPlaying ? (0.4 + (Math.sin(Date.now() / 200 + idx) + 1) * 0.3) : 0.45
                      }
                    ]} 
                  />
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons 
                  name="mic" 
                  size={12} 
                  color={message.isMine ? 'rgba(255,255,255,0.7)' : theme.secondary} 
                />
                <Text style={[styles.voiceDuration, { 
                  color: message.isMine ? 'rgba(255,255,255,0.85)' : theme.text,
                  fontSize: 13,
                  fontWeight: '600'
                }]}>
                  {Math.floor((message.voiceDuration || 0) / 60)}:{((message.voiceDuration || 0) % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </>
      );
    }

    // Location message - Globalix style with gradient background
    if (message.type === 'location' && message.location) {
      return (
        <>
          {replySection}
          <View style={[styles.locationMessage, {
            backgroundColor: message.isMine ? 'rgba(255,255,255,0.15)' : 'rgba(0,122,255,0.08)',
            borderRadius: 14,
            padding: 14
          }]}>
            <View style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: message.isMine ? 'rgba(255,255,255,0.25)' : 'rgba(0,122,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8
            }}>
              <Ionicons name="location-sharp" size={28} color={message.isMine ? '#FFF' : theme.primary} />
            </View>
            <Text style={[styles.locationText, { 
              color: message.isMine ? '#FFF' : theme.text,
              fontSize: 14,
              fontWeight: '600',
              textAlign: 'center'
            }]}>
              {message.location.address || 'Location Shared'}
            </Text>
          </View>
        </>
      );
    }

    // Text message - Globalix style with better typography
    return (
      <>
        {replySection}
        <Text style={[styles.messageText, { 
          color: message.isMine ? '#FFF' : theme.text,
          fontSize: 15,
          lineHeight: 22,
          letterSpacing: 0.2
        }]}>
          {message.text}
        </Text>
      </>
    );
  };

  return (
    <View style={[styles.messageRow, message.isMine && styles.myMessageRow]}>
      {!message.isMine && (
        <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20' }]}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>A</Text>
        </View>
      )}
      
      <TouchableOpacity
        onLongPress={() => onLongPress(message)}
        onPress={() => setShowActions(!showActions)}
        activeOpacity={0.75}
        style={{ maxWidth: '75%' }}
      >
        <View
          style={[
            styles.messageBubble,
            message.isMine
              ? { 
                  backgroundColor: theme.primary,
                  borderTopRightRadius: 4,
                  shadowColor: theme.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 4
                }
              : { 
                  backgroundColor: theme.card,
                  borderWidth: 1.5,
                  borderColor: theme.border + '40',
                  borderTopLeftRadius: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2
                },
          ]}
        >
          {renderMessageContent()}
          
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, { 
              color: message.isMine ? 'rgba(255,255,255,0.75)' : theme.secondary,
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 0.3
            }]}>
              {message.timestamp}
            </Text>
            {message.isMine && (
              <View style={{ 
                backgroundColor: message.isRead ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.15)',
                borderRadius: 8,
                paddingHorizontal: 4,
                paddingVertical: 2,
                marginLeft: 6
              }}>
                <Ionicons
                  name={message.isRead ? 'checkmark-done-sharp' : message.isDelivered ? 'checkmark-done-outline' : 'checkmark-outline'}
                  size={13}
                  color={message.isRead ? '#22c55e' : 'rgba(255,255,255,0.85)'}
                />
              </View>
            )}
          </View>
        </View>

        {/* Reactions - Globalix style with gradient bubbles */}
        {message.reactions && message.reactions.length > 0 && (
          <View style={[styles.reactionsContainer, message.isMine ? styles.reactionsRight : styles.reactionsLeft]}>
            {message.reactions.map((reaction, idx) => (
              <View key={idx} style={[styles.reactionBubble, {
                backgroundColor: '#FFF',
                borderWidth: 2,
                borderColor: theme.primary + '30',
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3
              }]}>
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                {reaction.userIds.length > 1 && (
                  <Text style={[styles.reactionCount, { 
                    color: theme.primary,
                    fontWeight: '700',
                    fontSize: 11
                  }]}>
                    {reaction.userIds.length}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Quick actions - Globalix style with modern buttons */}
        {showActions && (
          <View style={[styles.quickReactions, {
            backgroundColor: '#FFF',
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            flexDirection: 'row',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 8
          }, message.isMine ? { right: 0 } : { left: 0 }]}>
            {quickReactions.map((emoji, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => {
                  onReact(message, emoji);
                  setShowActions(false);
                }}
                style={[styles.quickReactionButton, {
                  backgroundColor: theme.primary + '10',
                  borderRadius: 18,
                  width: 36,
                  height: 36
                }]}
              >
                <Text style={[styles.quickReactionEmoji, { fontSize: 18 }]}>{emoji}</Text>
              </TouchableOpacity>
            ))}
            <View style={[styles.reactionDivider, { 
              width: 1.5, 
              backgroundColor: theme.border, 
              marginHorizontal: 6 
            }]} />
            <TouchableOpacity
              onPress={() => {
                onReply(message);
                setShowActions(false);
              }}
              style={[styles.quickReactionButton, {
                backgroundColor: theme.primary + '15',
                borderRadius: 18,
                width: 36,
                height: 36
              }]}
            >
              <Ionicons name="arrow-undo-sharp" size={18} color={theme.primary} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {message.isMine && (
        <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20' }]}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '700' }}>Y</Text>
        </View>
      )}
    </View>
  );
};

// ===== MAIN COMPONENT =====
export const ChatConversationScreen: React.FC<ChatConversationScreenProps> = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { chat } = route.params;
  const isAdminChat = chat?.isAdminChat || chat?.userId === 'admin';
  const [messages, setMessages] = useState<Message[]>(isAdminChat ? [] : MOCK_MESSAGES);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScreenFocusedRef = useRef(true);

  const mapChatMessages = (rawMessages: any[]): Message[] =>
    [...rawMessages]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((msg) => ({
        id: msg.id,
        text: msg.message,
        isMine: !msg.fromAdmin,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: !!msg.read,
        isDelivered: true, // Messages from server are already delivered
      }));

  const loadAdminMessages = async () => {
    const response = await chatApi.list();
    if (!response.success) {
      return;
    }
    const rawMessages = Array.isArray(response.data) ? response.data : [];
    const mapped = mapChatMessages(rawMessages);
    
    // Merge server messages with local unsent messages (voice, image, location)
    setMessages((prevMessages) => {
      // Keep local messages that aren't in server response
      const serverIds = new Set(mapped.map(m => m.id));
      const localOnly = prevMessages.filter(m => 
        !serverIds.has(m.id) && (m.type === 'voice' || m.type === 'image' || m.type === 'location')
      );
      
      // Combine and sort by timestamp
      return [...mapped, ...localOnly].sort((a, b) => {
        const timeA = a.timestamp ? new Date(`1970-01-01 ${a.timestamp}`).getTime() : 0;
        const timeB = b.timestamp ? new Date(`1970-01-01 ${b.timestamp}`).getTime() : 0;
        return timeA - timeB;
      });
    });
  };

  useEffect(() => {
    if (!isAdminChat) return;

    let isActive = true;
    const refresh = async () => {
      if (!isActive) return;
      try {
        await loadAdminMessages();
        await chatApi.markAsRead();
      } catch (error) {
        console.warn('Failed to load admin messages:', error);
      }
    };

    refresh();
    const interval = setInterval(refresh, 5000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [isAdminChat]);

  useEffect(() => {
    if (!isAdminChat) return;

    let socket: Socket | null = null;
    let isMounted = true;

    const connect = async () => {
      const token = await getAuthToken();
      socket = io(SOCKET_BASE_URL, {
        transports: ['websocket'],
        auth: { token },
      });

      socketRef.current = socket;

      // Listen for admin online/offline status
      socket.on('connect', () => {
        setIsAdminOnline(true);
        // Mark pending messages as delivered
        setMessages(prev => prev.map(msg => 
          msg.isMine && !msg.isDelivered ? { ...msg, isDelivered: true } : msg
        ));
      });

      socket.on('disconnect', () => {
        setIsAdminOnline(false);
      });

      socket.on('chat:message', (payload: any) => {
        if (!isMounted || !payload?.fromAdmin) return;

        // Only play sound if screen is not focused
        if (isScreenFocusedRef.current === false) {
          playNotificationSound();
        }

        setMessages((prev) => {
          if (prev.some((msg) => msg.id === payload.id)) {
            return prev;
          }

          const messageData = payload.message || {};
          const next: Message = {
            id: payload.id || messageData.id,
            text: messageData.text || payload.message || '',
            isMine: false,
            timestamp: new Date(payload.createdAt || messageData.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isRead: !!payload.read,
            isDelivered: true,
            type: messageData.type || 'text',
            imageUri: messageData.imageUri,
            voiceUri: messageData.voiceUri,
            voiceDuration: messageData.voiceDuration,
            location: messageData.location,
            replyTo: messageData.replyTo,
            reactions: messageData.reactions,
          };

          return [...prev, next];
        });

        chatApi.markAsRead().catch(() => undefined);
      });

      socket.on('chat:typing', (payload: any) => {
        if (!isMounted || !payload?.fromAdmin) return;

        setIsAdminTyping(payload.isTyping === true);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        if (payload.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsAdminTyping(false);
          }, 2000);
        }
      });

      // Listen for message read events
      socket.on('chat:read', (payload: any) => {
        if (!isMounted) return;
        // Mark all user messages as read
        setMessages(prev => prev.map(msg => 
          msg.isMine ? { ...msg, isRead: true } : msg
        ));
      });
    };

    connect();

    return () => {
      isMounted = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket?.disconnect();
    };
  }, [isAdminChat]);

  // Track screen focus to prevent notifications when viewing chat
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      isScreenFocusedRef.current = true;
      // Mark messages as read when screen is focused
      if (isAdminChat) {
        chatApi.markAsRead().catch(() => undefined);
        // Update all messages to read status
        setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      }
    });
    
    const unsubscribeBlur = navigation.addListener('blur', () => {
      isScreenFocusedRef.current = false;
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation, isAdminChat]);

  const emitUserTyping = (isTyping: boolean) => {
    if (!isAdminChat || !socketRef.current) return;
    socketRef.current.emit('chat:typing', { isTyping });
  };

  // ===== HANDLERS =====
  const handleSend = async () => {
    if (inputText.trim().length === 0) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitUserTyping(false);

    if (isAdminChat) {
      try {
        const response = await chatApi.send(inputText.trim());
        const sent = response.data;

        if (sent) {
          const newMessage: Message = {
            id: sent.id || Date.now().toString(),
            text: sent.message || inputText.trim(),
            isMine: true,
            timestamp: new Date(sent.createdAt || new Date()).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
            isRead: !!sent.read,
            isDelivered: isAdminOnline, // Delivered if admin is online
          };

          setMessages((prev) => [...prev, newMessage]);
        }
        setInputText('');
      } catch (error) {
        console.warn('Failed to send admin message:', error);
      }
    } else {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isMine: true,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isRead: false,
        isDelivered: false,
      };

      setMessages([...messages, newMessage]);
      setInputText('');
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleMoreOptions = () => {
    const options = [
      'Clear Chat',
      'View Profile',
      'Mute Notifications',
      'Block User',
      'Report',
      'Cancel',
    ];

    const destructiveButtonIndex = 3; // Block User
    const cancelButtonIndex = 5;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          handleMenuAction(buttonIndex);
        }
      );
    } else {
      // For Android, show Alert with options
      Alert.alert(
        'Chat Options',
        'Choose an action',
        [
          {
            text: 'Clear Chat',
            onPress: () => handleMenuAction(0),
          },
          {
            text: 'View Profile',
            onPress: () => handleMenuAction(1),
          },
          {
            text: 'Mute Notifications',
            onPress: () => handleMenuAction(2),
          },
          {
            text: 'Block User',
            onPress: () => handleMenuAction(3),
            style: 'destructive',
          },
          {
            text: 'Report',
            onPress: () => handleMenuAction(4),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleMenuAction = (index: number) => {
    switch (index) {
      case 0: // Clear Chat
        Alert.alert(
          'Clear Chat',
          'Are you sure you want to delete all messages in this chat?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Clear',
              style: 'destructive',
              onPress: () => {
                (async () => {
                  try {
                    if (isAdminChat) {
                      await chatApi.clear();
                    }
                    setMessages([]);
                    setLocalMessages([]);
                    Alert.alert('Success', 'Chat cleared successfully');
                  } catch (error) {
                    console.warn('Failed to clear chat:', error);
                    Alert.alert('Error', 'Failed to clear chat. Please try again.');
                  }
                })();
              },
            },
          ]
        );
        break;

      case 1: // View Profile
        Alert.alert('View Profile', `View ${chat.userName}'s profile`);
        // Navigate to user profile screen
        // navigation.navigate('UserProfile', { userId: chat.userId });
        break;

      case 2: // Mute Notifications
        Alert.alert(
          'Mute Notifications',
          'How long would you like to mute notifications?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: '8 Hours',
              onPress: () => Alert.alert('Success', 'Notifications muted for 8 hours'),
            },
            {
              text: '1 Week',
              onPress: () => Alert.alert('Success', 'Notifications muted for 1 week'),
            },
            {
              text: 'Always',
              onPress: () => Alert.alert('Success', 'Notifications muted'),
            },
          ]
        );
        break;

      case 3: // Block User
        Alert.alert(
          'Block User',
          `Are you sure you want to block ${chat.userName}? They won't be able to message you.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Block',
              style: 'destructive',
              onPress: () => {
                Alert.alert('Success', `${chat.userName} has been blocked`);
                navigation.goBack();
              },
            },
          ]
        );
        break;

      case 4: // Report
        Alert.alert(
          'Report User',
          'Why are you reporting this user?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Spam',
              onPress: () => Alert.alert('Success', 'User reported for spam'),
            },
            {
              text: 'Harassment',
              onPress: () => Alert.alert('Success', 'User reported for harassment'),
            },
            {
              text: 'Inappropriate',
              onPress: () => Alert.alert('Success', 'User reported for inappropriate behavior'),
            },
          ]
        );
        break;

      case 5: // Cancel
        break;
    }
  };

  // ===== IMAGE & MEDIA HANDLERS =====
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      let imageUri = asset.uri;

      // Create timestamp BEFORE upload to maintain chronological order
      const messageId = Date.now().toString();
      const messageTimestamp = new Date().toISOString();
      const displayTimestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      // Upload to backend if it's an admin chat
      if (isAdminChat) {
        try {
          const extension = asset.uri.split('.').pop() || 'jpg';
          const mimeType = asset.type === 'video' ? 'video/mp4' : `image/${extension}`;
          const name = `image-${Date.now()}.${extension}`;

          const uploadResponse = await mediaApi.upload(
            { uri: asset.uri, type: mimeType, name },
            inputText.trim() || 'Image',
            'private'
          );

          if (uploadResponse?.success && uploadResponse?.data?.url) {
            const remoteUrl = uploadResponse.data.url;
            imageUri = remoteUrl.startsWith('http://') || remoteUrl.startsWith('https://') 
              ? remoteUrl 
              : `${SOCKET_BASE_URL}${remoteUrl}`;
          }
        } catch (error) {
          console.warn('Image upload failed:', error);
          Alert.alert('Upload failed', 'Could not upload image. Please try again.');
          return;
        }
      }

      const newMessage: Message = {
        id: messageId,
        text: inputText.trim(),
        isMine: true,
        timestamp: displayTimestamp,
        isRead: false,
        isDelivered: isAdminOnline,
        type: 'image',
        imageUri,
        replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, senderName: replyingTo.isMine ? 'You' : chat.userName } : undefined,
      };

      setMessages(prev => [...prev, newMessage]);
      setLocalMessages(prev => [...prev, newMessage]); // Persist across refreshes
      setInputText('');
      setReplyingTo(null);
      
      // Emit to Socket.IO for admin to receive with ISO timestamp
      if (isAdminChat && socketRef.current) {
        socketRef.current.emit('chat:message', {
          message: {
            ...newMessage,
            timestamp: messageTimestamp, // Use ISO timestamp for backend sorting
          },
        });
      }
      
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      let imageUri = asset.uri;

      // Create timestamp BEFORE upload to maintain chronological order
      const messageId = Date.now().toString();
      const messageTimestamp = new Date().toISOString();
      const displayTimestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      // Upload to backend if it's an admin chat
      if (isAdminChat) {
        try {
          const extension = asset.uri.split('.').pop() || 'jpg';
          const mimeType = `image/${extension}`;
          const name = `photo-${Date.now()}.${extension}`;

          const uploadResponse = await mediaApi.upload(
            { uri: asset.uri, type: mimeType, name },
            inputText.trim() || 'Photo',
            'private'
          );

          if (uploadResponse?.success && uploadResponse?.data?.url) {
            const remoteUrl = uploadResponse.data.url;
            imageUri = remoteUrl.startsWith('http://') || remoteUrl.startsWith('https://') 
              ? remoteUrl 
              : `${SOCKET_BASE_URL}${remoteUrl}`;
          }
        } catch (error) {
          console.warn('Photo upload failed:', error);
          Alert.alert('Upload failed', 'Could not upload photo. Please try again.');
          return;
        }
      }

      const newMessage: Message = {
        id: messageId,
        text: inputText.trim(),
        isMine: true,
        timestamp: displayTimestamp,
        isRead: false,
        isDelivered: isAdminOnline,
        type: 'image',
        imageUri,
        replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, senderName: replyingTo.isMine ? 'You' : chat.userName } : undefined,
      };

      setMessages(prev => [...prev, newMessage]);
      setLocalMessages(prev => [...prev, newMessage]); // Persist across refreshes
      setInputText('');
      setReplyingTo(null);
      
      // Emit to Socket.IO for admin to receive with ISO timestamp
      if (isAdminChat && socketRef.current) {
        socketRef.current.emit('chat:message', {
          message: {
            ...newMessage,
            timestamp: messageTimestamp, // Use ISO timestamp for backend sorting
          },
        });
      }
      
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // ===== VOICE PLAYBACK HANDLER =====
  const handlePlayVoice = async (message: Message) => {
    try {
      // Stop current sound if playing
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        
        // If clicking same message, just stop
        if (playingMessageId === message.id) {
          setPlayingMessageId(null);
          return;
        }
      }

      if (!message.voiceUri) return;

      // Load and play new sound
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: message.voiceUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setPlayingMessageId(message.id);

      // When playback finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingMessageId(null);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (error) {
      console.error('Failed to play voice message:', error);
      Alert.alert('Error', 'Could not play voice message');
      setPlayingMessageId(null);
    }
  };

  // ===== MESSAGE ACTION HANDLERS =====
  const handleMessageLongPress = (message: Message) => {
    const options = ['Reply', 'Copy', 'Forward', 'Delete', 'Cancel'];
    const destructiveButtonIndex = 3;
    const cancelButtonIndex = 4;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          handleMessageAction(message, buttonIndex);
        }
      );
    } else {
      Alert.alert(
        'Message Options',
        '',
        [
          { text: 'Reply', onPress: () => handleMessageAction(message, 0) },
          { text: 'Copy', onPress: () => handleMessageAction(message, 1) },
          { text: 'Forward', onPress: () => handleMessageAction(message, 2) },
          { text: 'Delete', onPress: () => handleMessageAction(message, 3), style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleMessageAction = (message: Message, action: number) => {
    switch (action) {
      case 0: // Reply
        setReplyingTo(message);
        break;
      case 1: // Copy
        Alert.alert('Copied', 'Message copied to clipboard');
        break;
      case 2: // Forward
        Alert.alert('Forward', 'Forward message to another chat');
        break;
      case 3: // Delete
        Alert.alert(
          'Delete Message',
          'Are you sure you want to delete this message?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setMessages(prev => prev.filter(m => m.id !== message.id));
              },
            },
          ]
        );
        break;
    }
  };

  const scrollToMessage = (messageId: string) => {
    const index = filteredMessages.findIndex(m => m.id === messageId);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const handleReaction = (message: Message, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === message.id) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          // Toggle reaction
          if (existingReaction.userIds.includes('currentUser')) {
            existingReaction.userIds = existingReaction.userIds.filter(id => id !== 'currentUser');
            if (existingReaction.userIds.length === 0) {
              return { ...msg, reactions: reactions.filter(r => r.emoji !== emoji) };
            }
          } else {
            existingReaction.userIds.push('currentUser');
          }
        } else {
          reactions.push({ emoji, userIds: ['currentUser'] });
        }
        
        return { ...msg, reactions: [...reactions] };
      }
      return msg;
    }));
  };

  // ===== LOCATION SHARING =====
  const shareLocation = () => {
    // In production, use expo-location to get real coordinates
    const newMessage: Message = {
      id: Date.now().toString(),
      text: '',
      isMine: true,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isRead: false,
      isDelivered: isAdminOnline,
      type: 'location',
      location: { latitude: 43.6532, longitude: -79.3832, address: 'Toronto, ON' },
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, senderName: replyingTo.isMine ? 'You' : chat.userName } : undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    setLocalMessages(prev => [...prev, newMessage]); // Persist across refreshes
    setReplyingTo(null);
    
    // Emit to Socket.IO for admin to receive
    if (isAdminChat && socketRef.current) {
      socketRef.current.emit('chat:message', {
        message: newMessage,
      });
    }
    
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ===== ATTACHMENT MENU =====
  const handleAttachmentMenu = () => {
    const options = ['Photo Library', 'Camera', 'Location', 'Cancel'];
    const cancelButtonIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) handleImagePicker();
          else if (buttonIndex === 1) handleCamera();
          else if (buttonIndex === 2) shareLocation();
        }
      );
    } else {
      Alert.alert(
        'Send',
        'Choose attachment type',
        [
          { text: 'Photo Library', onPress: handleImagePicker },
          { text: 'Camera', onPress: handleCamera },
          { text: 'Location', onPress: shareLocation },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  // ===== SEARCH HANDLER =====
  const handleSearch = () => {
    setSearchVisible(!searchVisible);
    setSearchQuery('');
  };

  const filteredMessages = searchQuery
    ? messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  // ===== RENDER =====
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {chat.userAvatar ? (
            <Image 
              source={{ uri: chat.userAvatar }}
              style={styles.headerAvatar} 
            />
          ) : (
            <View style={[styles.headerAvatar, { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFF' }}>
                {chat.userName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View>
            <Text style={[styles.headerName, { color: theme.text }]}>{chat.userName}</Text>
            {isAdminOnline ? (
              <View style={styles.onlineContainer}>
                <View style={styles.onlineDot} />
                <Text style={[styles.onlineText, { color: '#10b981' }]}>Online</Text>
              </View>
            ) : (
              <Text style={[styles.lastSeenText, { color: theme.secondary }]}>Last seen recently</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton} onPress={handleMoreOptions}>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {searchVisible && (
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.secondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search messages..."
            placeholderTextColor={theme.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity onPress={() => { setSearchVisible(false); setSearchQuery(''); }}>
            <Ionicons name="close-circle" size={20} color={theme.secondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Messages List */}
      {isAdminChat && isAdminTyping && (
        <View style={styles.typingIndicator}>
          <Text style={[styles.typingText, { color: theme.secondary }]}>Admin is typing…</Text>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble 
            message={item} 
            theme={theme} 
            onLongPress={handleMessageLongPress}
            onReply={setReplyingTo}
            onReact={handleReaction}
            playingMessageId={playingMessageId}
            onPlayVoice={handlePlayVoice}
          />
        )}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Reply Preview */}
      {replyingTo && (
        <View style={[styles.replyPreview, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity 
            style={styles.replyPreviewContent}
            onPress={() => scrollToMessage(replyingTo.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.replyBar, { backgroundColor: theme.primary }]} />
            <View style={styles.replyPreviewText}>
              <Text style={[styles.replyToName, { color: theme.primary }]}>
                {replyingTo.isMine ? 'You' : chat.userName}
              </Text>
              <Text style={[styles.replyToText, { color: theme.secondary }]} numberOfLines={1}>
                {replyingTo.text || (replyingTo.type === 'voice' ? '🎤 Voice message' : replyingTo.type === 'image' ? '📷 Photo' : replyingTo.type === 'location' ? '📍 Location' : 'Message')}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <Ionicons name="close" size={24} color={theme.secondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Bar - Unique Globalix Design */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { 
          backgroundColor: isDark ? '#1A1A1A' : '#FFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#2A2A2A' : '#E5E7EB',
          paddingHorizontal: 16,
          paddingVertical: 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 10
        }]}>
          {/* Text Input with Modern Container */}
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6',
            borderRadius: 24,
            paddingHorizontal: 6,
            paddingVertical: 4,
            borderWidth: 1.5,
            borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
          }}>
            {/* Attachment Button */}
            <TouchableOpacity 
              style={[styles.attachButton, {
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDark ? '#3A3A3A' : '#FFF',
              }]} 
              onPress={handleAttachmentMenu}
            >
              <Ionicons name="add-circle" size={24} color={theme.primary} />
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { 
                color: theme.text,
                fontSize: 15,
                fontWeight: '500',
                paddingHorizontal: 12,
                paddingVertical: 8
              }]}
              placeholder="Message..."
              placeholderTextColor={theme.secondary}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
                emitUserTyping(true);
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                  emitUserTyping(false);
                }, 1500);
              }}
              multiline
              maxLength={500}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, { 
              backgroundColor: theme.primary,
              marginLeft: 10,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.35,
              shadowRadius: 6,
              elevation: 5,
              transform: [{ scale: 1 }]
            }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send-sharp" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  itemBadgeText: {
    fontSize: 12,
  },
  moreButton: {
    padding: 5,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  typingText: {
    fontSize: 12,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  myMessageRow: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,122,255,0.2)',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    minWidth: 80,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  attachButton: {
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 5,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastSeenText: {
    fontSize: 12,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  replyPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  replyBar: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 8,
  },
  replyPreviewText: {
    flex: 1,
  },
  replyToName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyToText: {
    fontSize: 13,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  recordingHint: {
    fontSize: 12,
    marginTop: 2,
  },
  // Message content styles
  replyContainer: {
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  replyName: {
    fontSize: 13,
    marginBottom: 3,
  },
  replyText: {
    fontSize: 13,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    paddingVertical: 4,
  },
  voicePlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  voiceWaveContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceWave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  waveBar: {
    width: 2.5,
    borderRadius: 1.5,
  },
  voiceDuration: {
    fontSize: 11,
    marginLeft: 8,
    minWidth: 35,
    textAlign: 'right',
    fontWeight: '500',
  },
  locationMessage: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationText: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  reactionsContainer: {
    position: 'absolute',
    bottom: -12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reactionsRight: {
    right: 8,
  },
  reactionsLeft: {
    left: 8,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    marginLeft: 2,
  },
  quickReactions: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
    alignItems: 'center',
  },
  quickReactionsRight: {
    alignSelf: 'flex-end',
  },
  quickReactionsLeft: {
    alignSelf: 'flex-start',
  },
  quickReactionButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickReactionEmoji: {
    fontSize: 26,
  },
  reactionDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
});

export default ChatConversationScreen;
