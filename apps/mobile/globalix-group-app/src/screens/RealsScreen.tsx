/**
 * RealsScreen.tsx
 * Short-form video feed featuring properties and cars (like Instagram Reels/TikTok)
 * Features: Swipe up/down, like, comment, share, upload reals
 */

// ===== IMPORTS =====
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

// ===== INTERFACES =====
interface Real {
  id: string;
  type: 'property' | 'car';
  title: string;
  price: string;
  location: string;
  thumbnail: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  username: string;
  userAvatar: string;
}

interface RealsScreenProps {
  navigation: any;
}

// ===== MOCK DATA =====
const MOCK_REALS: Real[] = [
  {
    id: '1',
    type: 'property',
    title: 'Luxury Penthouse Downtown',
    price: '$4.5M',
    location: 'Toronto, ON',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800',
    likes: 1240,
    comments: 89,
    shares: 45,
    isLiked: false,
    username: 'luxuryhomes_to',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    type: 'car',
    title: '2024 Mercedes AMG GT',
    price: '$185K',
    location: 'Mississauga, ON',
    thumbnail: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800',
    likes: 2150,
    comments: 156,
    shares: 78,
    isLiked: true,
    username: 'premium_autos',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    type: 'property',
    title: 'Modern Lake Villa',
    price: '$2.8M',
    location: 'Hamilton, ON',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
    likes: 980,
    comments: 67,
    shares: 34,
    isLiked: false,
    username: 'realestate_pro',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    type: 'car',
    title: 'Porsche 911 Turbo S',
    price: '$220K',
    location: 'Toronto, ON',
    thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800',
    likes: 3420,
    comments: 234,
    shares: 112,
    isLiked: false,
    username: 'exotic_motors',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: '5',
    type: 'property',
    title: 'Glass House Estate',
    price: '$6.2M',
    location: 'Oakville, ON',
    thumbnail: 'https://images.unsplash.com/photo-1600607687940-c52af084399b?q=80&w=800',
    likes: 1560,
    comments: 98,
    shares: 56,
    isLiked: true,
    username: 'elite_estates',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
  },
];

// ===== REAL ITEM COMPONENT =====
const RealItem: React.FC<{ real: Real; onLike: (id: string) => void }> = ({ real, onLike }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleValue, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onLike(real.id);
  };

  return (
    <View style={styles.realContainer}>
      {/* Background Image/Video */}
      <Image source={{ uri: real.thumbnail }} style={styles.thumbnail} />
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      {/* Top Badge */}
      <View style={styles.topBadge}>
        <View style={[styles.badge, { backgroundColor: real.type === 'property' ? '#3b82f6' : '#10b981' }]}>
          <Ionicons 
            name={real.type === 'property' ? 'business' : 'car-sport'} 
            size={16} 
            color="#FFF" 
          />
          <Text style={styles.badgeText}>
            {real.type === 'property' ? 'Property' : 'Car'}
          </Text>
        </View>
      </View>

      {/* Right Action Buttons */}
      <View style={styles.actions}>
        {/* User Avatar */}
        <TouchableOpacity style={styles.avatarContainer}>
          <Image source={{ uri: real.userAvatar }} style={styles.avatar} />
          <View style={styles.followButton}>
            <Ionicons name="add" size={14} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Like */}
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Ionicons 
              name={real.isLiked ? 'heart' : 'heart-outline'} 
              size={32} 
              color={real.isLiked ? '#ef4444' : '#FFF'} 
            />
          </Animated.View>
          <Text style={styles.actionText}>{real.likes}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={30} color="#FFF" />
          <Text style={styles.actionText}>{real.comments}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={28} color="#FFF" />
          <Text style={styles.actionText}>{real.shares}</Text>
        </TouchableOpacity>

        {/* More */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="ellipsis-vertical" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={styles.info}>
        <Text style={styles.username}>@{real.username}</Text>
        <Text style={styles.title}>{real.title}</Text>
        <View style={styles.details}>
          <View style={styles.priceTag}>
            <Text style={styles.price}>{real.price}</Text>
          </View>
          <View style={styles.locationTag}>
            <Ionicons name="location" size={14} color="#FFF" />
            <Text style={styles.location}>{real.location}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ===== MAIN COMPONENT =====
const RealsScreen: React.FC<RealsScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [reals, setReals] = useState<Real[]>(MOCK_REALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleLike = (id: string) => {
    setReals(prevReals =>
      prevReals.map(real =>
        real.id === id
          ? { ...real, isLiked: !real.isLiked, likes: real.isLiked ? real.likes - 1 : real.likes + 1 }
          : real
      )
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>Reals</Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => navigation.navigate('UploadReal')}
        >
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            style={styles.uploadGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={24} color="#FFF" />
            <Text style={styles.uploadText}>Upload</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Reals Feed */}
      <FlatList
        ref={flatListRef}
        data={reals}
        renderItem={({ item }) => <RealItem real={item} onLike={handleLike} />}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {reals.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              { backgroundColor: index === currentIndex ? '#FFF' : 'rgba(255,255,255,0.3)' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  uploadButton: {
    overflow: 'hidden',
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  uploadText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  realContainer: {
    width,
    height,
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  topBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    position: 'absolute',
    right: 15,
    bottom: 120,
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  followButton: {
    position: 'absolute',
    bottom: -6,
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 100,
  },
  username: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  price: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  location: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  progressContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default RealsScreen;
