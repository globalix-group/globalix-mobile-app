import React, { useEffect, useRef, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MessageSquare, Search, Send, Users } from 'lucide-react';
import { adminApi } from '../api/adminClient';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  lastActive?: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  fromAdmin: boolean;
  createdAt: string;
  read: boolean;
  type?: 'text' | 'image' | 'voice' | 'location';
  imageUri?: string;
  voiceUri?: string;
  voiceDuration?: number;
  location?: { latitude: number; longitude: number; address: string };
  replyTo?: { id: string; text: string; senderName: string };
  reactions?: { emoji: string; userIds: string[] }[];
}

interface UserChat {
  userId: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  messages: ChatMessage[];
}

const Chats: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userChats, setUserChats] = useState<Record<string, UserChat>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    unreadMessages: 0,
    activeChats: 0,
  });
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const selectedUserRef = useRef<User | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resolveMediaUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_GLOBALIX_API_URL || 'http://localhost:3002';
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    loadUsers();
  }, []);
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_GLOBALIX_API_URL || 'http://localhost:3002';
    const socket = io(socketUrl, {
      transports: ['websocket'],
      auth: { admin: true },
    });

    socketRef.current = socket;

    socket.on('chat:message', (payload: any) => {
      console.log('📩 Admin received message:', payload);
      console.log('📩 Message properties:', {
        userId: payload?.userId,
        text: payload?.text,
        type: payload?.type,
        fromAdmin: payload?.fromAdmin,
        voiceUri: payload?.voiceUri,
        imageUri: payload?.imageUri
      });
      
      if (!payload?.userId) {
        console.warn('⚠️ No userId in payload, ignoring message');
        return;
      }

      const message: ChatMessage = {
        id: payload.id || Date.now().toString(),
        userId: payload.userId,
        message: payload.text || '',
        fromAdmin: payload.fromAdmin,
        createdAt: payload.timestamp || payload.createdAt || new Date().toISOString(),
        read: payload.read || false,
        type: payload.type || 'text',
        imageUri: payload.imageUri,
        voiceUri: payload.voiceUri,
        voiceDuration: payload.voiceDuration,
        location: payload.location,
        replyTo: payload.replyTo,
        reactions: payload.reactions,
      };

      console.log('✅ Processed message:', message);

      setUserChats((prev) => {
        const existing = prev[message.userId] || {
          userId: message.userId,
          unreadCount: 0,
          messages: [],
        };

        const isActiveChat = selectedUserRef.current?.id === message.userId;
        const nextUnread = isActiveChat
          ? 0
          : existing.unreadCount + (message.fromAdmin ? 0 : 1);

        const nextMessages = [...(existing.messages || []), message].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        return {
          ...prev,
          [message.userId]: {
            ...existing,
            unreadCount: nextUnread,
            messages: nextMessages,
            lastMessage: nextMessages[nextMessages.length - 1],
          },
        };
      });

      if (selectedUserRef.current?.id === message.userId) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === message.id)) {
            return prev;
          }
          return [...prev, message].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    });

    socket.on('chat:typing', (payload: any) => {
      if (!payload || payload.fromAdmin) return;
      if (selectedUserRef.current?.id !== payload.userId) return;

      setIsUserTyping(payload.isTyping === true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (payload.isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsUserTyping(false);
        }, 2000);
      }
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    calculateStats(users, userChats);
  }, [users, userChats]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
      // Emit read event when admin views a user's chat
      if (socketRef.current) {
        socketRef.current.emit('chat:markRead', { userId: selectedUser.id });
      }
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllUserChats();
      const usersData = response.data?.data || [];

      const chatsMap: Record<string, UserChat> = {};
      const normalizedUsers: User[] = usersData.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      }));

      usersData.forEach((user: any) => {
        const rawMessages = user.chatMessages || [];
        const mappedMessages: ChatMessage[] = rawMessages.map((msg: any) => ({
          id: msg.id,
          userId: msg.userId,
          message: msg.message,
          fromAdmin: msg.fromAdmin,
          createdAt: msg.createdAt,
          read: msg.read,
        }));

        const sortedMessages = [...mappedMessages].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const unreadCount = sortedMessages.filter(
          (msg) => !msg.fromAdmin && !msg.read
        ).length;

        chatsMap[user.id] = {
          userId: user.id,
          unreadCount,
          messages: sortedMessages,
          lastMessage: sortedMessages[sortedMessages.length - 1],
        };
      });

      setUsers(normalizedUsers);
      setUserChats(chatsMap);
      calculateStats(normalizedUsers, chatsMap);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    setMessages(userChats[userId]?.messages || []);
  };

  const calculateStats = (usersData: User[], chatsData: Record<string, UserChat>) => {
    const unread = Object.values(chatsData).reduce((sum, chat) => sum + chat.unreadCount, 0);
    const active = Object.values(chatsData).filter(chat => chat.messages.length > 0).length;
    
    setStats({
      totalUsers: usersData.length,
      unreadMessages: unread,
      activeChats: active,
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return;

    setSending(true);
    try {
      const response = await adminApi.sendChatMessage(selectedUser.id, newMessage.trim());
      const sent = response.data?.data;

      const message: ChatMessage = {
        id: sent?.id || Date.now().toString(),
        userId: selectedUser.id,
        message: sent?.message || newMessage.trim(),
        fromAdmin: true,
        createdAt: sent?.createdAt || new Date().toISOString(),
        read: sent?.read ?? false,
      };

      const nextMessages = [...messages, message].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessages(nextMessages);
      setUserChats({
        ...userChats,
        [selectedUser.id]: {
          ...userChats[selectedUser.id],
          lastMessage: message,
          messages: nextMessages,
        },
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const emitAdminTyping = (isTyping: boolean) => {
    if (!socketRef.current || !selectedUserRef.current) return;
    socketRef.current.emit('chat:typing', {
      userId: selectedUserRef.current.id,
      isTyping,
    });
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col">
        {/* Animated Header - Globalix System Admin */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 border-b-4 border-blue-800 shadow-xl overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)',
              animation: 'pulse 4s ease-in-out infinite'
            }}></div>
          </div>

          <div className="relative px-8 py-6">
            {/* Main Title with Gradient Animation */}
            <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-gradient-x" style={{
              backgroundSize: '200% auto',
              animation: 'gradient 3s ease infinite',
            }}>
              GLOBALIX SYSTEM ADMIN
            </h1>
            
            {/* Subtitle */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400"></div>
                <p className="text-blue-100 font-semibold text-sm tracking-wide">Real-time Messaging Dashboard</p>
              </div>
              <div className="h-4 w-px bg-blue-400"></div>
              <p className="text-blue-200 text-sm">Manage all user communications</p>
            </div>

            {/* Decorative Line */}
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-white/50 to-transparent rounded-full animate-pulse"></div>
          </div>

          {/* Add keyframes for animations */}
          <style jsx>{`
            @keyframes gradient {
              0%, 100% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
            }
            @keyframes pulse {
              0%, 100% {
                opacity: 0.1;
              }
              50% {
                opacity: 0.2;
              }
            }
          `}</style>
        </div>

        {/* Stats Cards */}
        <div className="p-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-gray-800">{stats.activeChats}</p>
              </div>
              <MessageSquare className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-800">{stats.unreadMessages}</p>
              </div>
              <MessageSquare className="text-red-500" size={32} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* User List */}
          <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            {/* Search */}
            {/* Search Bar - Globalix Style */}
            <div className="p-5 border-b border-gray-100">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-0 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* User List - Globalix Modern Design */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-100 border-t-blue-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MessageSquare size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 px-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-4">
                    <Users size={36} className="text-blue-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-600">No users found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredUsers.map((user) => {
                    const userChat = userChats[user.id];
                    const hasUnread = userChat?.unreadCount > 0;
                    const isSelected = selectedUser?.id === user.id;
                    
                    return (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`mb-2 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-200 scale-[0.98]' 
                            : 'hover:bg-gray-50 active:scale-[0.98]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md transition-all ${
                              isSelected 
                                ? 'bg-white/20 backdrop-blur' 
                                : 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600'
                            }`}>
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            {hasUnread && !isSelected && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-pink-500 border-2 border-white flex items-center justify-center shadow-lg">
                                <span className="text-white text-xs font-bold">{userChat.unreadCount}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                {user.name || 'Unknown User'}
                              </h3>
                              {userChat?.lastMessage && (
                                <span className={`text-xs font-medium ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                  {new Date(userChat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm truncate ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                              {user.email}
                            </p>
                            {userChat?.lastMessage && (
                              <p className={`text-xs mt-1 truncate font-medium ${isSelected ? 'text-white/75' : 'text-gray-400'}`}>
                                {userChat.lastMessage.fromAdmin && <span className={isSelected ? 'text-white/90' : 'text-blue-600'}>You: </span>}
                                {userChat.lastMessage.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages Area - Unique Globalix Design */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            {selectedUser ? (
              <>
                {/* Chat Header - Modern Glassmorphism */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                          {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{selectedUser.name || 'Unknown User'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-gray-600 font-medium">Active now</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Search size={20} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages - Unique Globalix Style */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <MessageSquare size={48} className="text-blue-500" />
                        </div>
                        <p className="text-xl font-bold text-gray-800 mb-2">Start the conversation</p>
                        <p className="text-sm text-gray-500">Send a message to {selectedUser.name}</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isAdmin = message.fromAdmin;
                      const showAvatar = index === 0 || messages[index - 1]?.fromAdmin !== isAdmin;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex items-end gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {/* Avatar */}
                          {showAvatar ? (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                              isAdmin 
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                                : 'bg-gradient-to-br from-gray-500 to-gray-600'
                            }`}>
                              {isAdmin ? 'A' : selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          ) : (
                            <div className="w-10"></div>
                          )}

                          {/* Message Bubble */}
                          <div className={`max-w-lg ${isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`rounded-2xl p-4 shadow-md transition-all hover:shadow-lg ${
                              isAdmin
                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                            }`}>
                              {/* Sender Name */}
                              {showAvatar && (
                                <p className={`text-xs font-bold mb-2 ${isAdmin ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {isAdmin ? 'Admin' : selectedUser.name}
                                </p>
                              )}
                              
                              {/* Message Content */}
                              {message.type === 'image' && message.imageUri ? (
                                <div>
                                  <img 
                                    src={resolveMediaUrl(message.imageUri)} 
                                    alt="Shared image" 
                                    className="rounded-xl max-w-full h-auto mb-2 shadow-lg"
                                    style={{ maxHeight: '350px' }}
                                  />
                                  {message.message && <p className="mt-2 text-sm leading-relaxed">{message.message}</p>}
                                </div>
                              ) : message.type === 'voice' && message.voiceUri ? (
                                <div className={`flex items-center gap-3 p-2 rounded-xl ${isAdmin ? 'bg-white/10' : 'bg-blue-50'}`}>
                                  <button
                                    onClick={() => {
                                      let voiceUrl = message.voiceUri || '';
                                      
                                      // Handle relative URLs
                                      if (voiceUrl && !voiceUrl.startsWith('http://') && !voiceUrl.startsWith('https://')) {
                                        const baseUrl = process.env.NEXT_PUBLIC_GLOBALIX_API_URL || 'http://localhost:3002';
                                        voiceUrl = `${baseUrl}${voiceUrl}`;
                                      }
                                      
                                      console.log('🎵 Playing voice from:', message.fromAdmin ? 'ADMIN' : 'USER');
                                      console.log('🎵 Original URI:', message.voiceUri);
                                      console.log('🎵 Resolved URL:', voiceUrl);
                                      
                                      if (playingVoiceId === message.id) {
                                        audioRef.current?.pause();
                                        setPlayingVoiceId(null);
                                      } else {
                                        if (audioRef.current) {
                                          audioRef.current.pause();
                                        }
                                        audioRef.current = new Audio(voiceUrl);
                                        audioRef.current.preload = 'auto';
                                        audioRef.current.onerror = (e) => {
                                          console.error('❌ Audio load error:', e);
                                          console.error('❌ Failed URL:', voiceUrl);
                                          alert(`Cannot load voice message.\n\nURL: ${voiceUrl}\n\nThis might be a CORS or network issue. Check if the backend is accessible from your browser.`);
                                          setPlayingVoiceId(null);
                                        };
                                        audioRef.current.play().catch((error) => {
                                          console.error('❌ Audio play error:', error);
                                          alert(`Cannot play voice message.\n\nURL: ${voiceUrl}\n\nError: ${error.message}`);
                                          setPlayingVoiceId(null);
                                        });
                                        audioRef.current.onended = () => setPlayingVoiceId(null);
                                        setPlayingVoiceId(message.id);
                                      }
                                    }}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 shadow-md ${
                                      isAdmin ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                                    }`}
                                  >
                                    {playingVoiceId === message.id ? '⏸' : '▶️'}
                                  </button>
                                  <div className="flex-1">
                                    <div className={`text-sm font-semibold mb-1 ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
                                      Voice Message
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-1">
                                        {[3, 5, 7, 5, 8, 4, 6, 5, 7, 4].map((h, i) => (
                                          <div key={i} className={`w-1 rounded-full ${isAdmin ? 'bg-white/60' : 'bg-blue-600/60'}`} style={{ height: `${h * 2}px` }}></div>
                                        ))}
                                      </div>
                                      <span className={`text-xs font-medium ${isAdmin ? 'text-white/80' : 'text-gray-600'}`}>
                                        {message.voiceDuration || 0}s
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : message.type === 'location' && message.location ? (
                                <div className={`flex items-center gap-3 p-3 rounded-xl ${isAdmin ? 'bg-white/10' : 'bg-blue-50'}`}>
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isAdmin ? 'bg-white/20' : 'bg-blue-100'}`}>
                                    📍
                                  </div>
                                  <div className="flex-1">
                                    <div className={`text-sm font-semibold ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
                                      Location Shared
                                    </div>
                                    <div className={`text-xs ${isAdmin ? 'text-white/70' : 'text-gray-600'}`}>
                                      {message.location.address}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[15px] leading-relaxed">{message.message}</p>
                              )}
                              
                              {/* Timestamp & Status */}
                              <div className={`flex items-center gap-2 mt-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                <p className={`text-[11px] font-medium ${isAdmin ? 'text-blue-100' : 'text-gray-400'}`}>
                                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {isAdmin && (
                                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                    message.read 
                                      ? 'bg-green-400/20 text-green-100' 
                                      : 'bg-white/20 text-white'
                                  }`}>
                                    {message.read ? '✓✓' : '✓'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input - Modern Globalix Design */}
                <div className="bg-white/80 backdrop-blur-xl border-t border-gray-100 p-5 shadow-lg">
                  {isUserTyping && (
                    <div className="flex items-center gap-2 mb-3 px-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600">{selectedUser.name} is typing...</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    {/* Input Field */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          emitAdminTyping(true);
                          if (typingTimeoutRef.current) {
                            clearTimeout(typingTimeoutRef.current);
                          }
                          typingTimeoutRef.current = setTimeout(() => {
                            emitAdminTyping(false);
                          }, 1500);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        disabled={sending}
                        className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-0 focus:border-blue-500 focus:bg-white disabled:bg-gray-100 transition-all text-[15px] font-medium"
                      />
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 font-bold disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg hover:shadow-blue-200 hover:scale-105 active:scale-95"
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-100 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <MessageSquare size={64} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mb-2">Select a conversation</p>
                  <p className="text-sm text-gray-500">Choose a user from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;
