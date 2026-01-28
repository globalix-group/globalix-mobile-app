import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Platform,
  LayoutAnimation,
  UIManager,
  TextInput,
  Animated,
  RefreshControl,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalixHeader } from '../components/GlobalixHeader';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
const isTablet = width > 600;
const cardWidth = isTablet ? width * 0.6 : width * 0.85;

// 1. DATA SOURCE
const CAR_DATA = [
  { 
    id: '1', 
    name: 'Lamborghini Urus', 
    price: '$260,000', 
    type: 'Super SUV', 
    category: 'Exotic SUV',
    hp: '650 HP',
    speed: '305 km/h',
    engine: 'V8 Bi-Turbo',
    image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=800' 
  },
  { 
    id: '2', 
    name: 'Rolls-Royce Ghost', 
    price: '$390,000', 
    type: 'Luxury Sedan', 
    category: 'Executive',
    hp: '563 HP',
    speed: '250 km/h',
    engine: 'V12 Twin',
    image: 'https://images.unsplash.com/photo-1631214503951-3751369ede00?q=80&w=800' 
  },
  { 
    id: '3', 
    name: 'Ferrari Purosangue', 
    price: '$400,000', 
    type: 'Active SUV', 
    category: 'Exotic SUV',
    hp: '715 HP',
    speed: '310 km/h',
    engine: 'V12 Natural',
    image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=800' 
  },
  { 
    id: '4', 
    name: 'McLaren 720S', 
    price: '$299,000', 
    type: 'Supercar', 
    category: 'Supercars',
    hp: '710 HP',
    speed: '341 km/h',
    engine: 'V8 Twin-Turbo',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=800' 
  },
];

const CATEGORIES = ['All', 'Supercars', 'Exotic SUV', 'Executive'];

// CAR CARD COMPONENT
interface CarCardProps {
  item: typeof CAR_DATA[0];
  index: number;
  isSelected: boolean;
  onPress: () => void;
  onInquire: () => void;
  theme: any;
  isDark: boolean;
  isTablet?: boolean;
}

const CarCard = ({ item, index, isSelected, onPress, onInquire, theme, isDark, isTablet }: CarCardProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500 + index * 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, index]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          styles.featuredCard, 
          { 
            backgroundColor: theme.card, 
            borderColor: isSelected ? theme.primary : theme.border,
            borderWidth: isSelected ? 2 : 1,
            width: isTablet ? (width - 60) / 2 : width * 0.85,
            marginBottom: isTablet ? 16 : 0,
          }
        ]}
      >
        <Image source={{ uri: item.image }} style={styles.featuredImage} />
        
        {/* TYPE BADGE */}
        <View style={[styles.typeBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)' }]}>
          <Text style={[styles.typeText, { color: theme.primary }]}>{item.type}</Text>
        </View>

        {/* FAVORITE ICON */}
        {isSelected && (
          <View style={[styles.favoriteIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="heart" size={16} color="#FFF" />
          </View>
        )}
        
        {/* CARD INFO */}
        <View style={styles.cardInfo}>
          <Text style={[styles.carName, { color: theme.text, fontSize: isTablet ? 18 : 22 }]}>
            {item.name}
          </Text>
          
          {/* SPEC GRID */}
          <View style={[styles.specGrid, { paddingVertical: isTablet ? 10 : 12 }]}>
            <View style={styles.specItem}>
              <Ionicons name="flash" size={13} color={theme.primary} />
              <Text style={[styles.specText, { color: theme.secondary, fontSize: isTablet ? 10 : 11 }]}>
                {item.hp}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="speedometer" size={13} color={theme.primary} />
              <Text style={[styles.specText, { color: theme.secondary, fontSize: isTablet ? 10 : 11 }]}>
                {item.speed}
              </Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="settings" size={13} color={theme.primary} />
              <Text style={[styles.specText, { color: theme.secondary, fontSize: isTablet ? 10 : 11 }]}>
                {item.engine}
              </Text>
            </View>
          </View>

          {/* PRICE AND BUTTON */}
          <View style={styles.priceRow}>
            <Text style={[styles.priceText, { color: theme.primary, fontSize: isTablet ? 18 : 20 }]}>
              {item.price}
            </Text>
            <TouchableOpacity 
              style={[styles.bookBtn, { backgroundColor: theme.primary }]}
              onPress={onInquire}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={[styles.bookBtnText, { fontSize: isTablet ? 12 : 14 }]}>Inquire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const CarsScreen = ({ navigation }: any) => { 
  const { theme, isDark } = useTheme();
  
  // REFS AND ANIMATIONS
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // STATE
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  // 2. LIVE FILTER LOGIC
  const filteredCars = useMemo(() => {
    return CAR_DATA.filter(car => {
      const matchesCategory = activeCategory === 'All' || car.category === activeCategory;
      const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // ANIMATIONS
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCategoryPress = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveCategory(category);
  };

  const renderSpec = (icon: string, label: string) => (
    <View style={styles.specItem}>
      <Ionicons name={icon as any} size={14} color={theme.primary} />
      <Text style={[styles.specText, { color: theme.secondary }]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <GlobalixHeader subtitle="Globalix Fleet" />
      
      {/* SEARCH BAR */}
      <Animated.View style={[styles.searchSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.secondary} />
          <TextInput 
            placeholder="Search fleet..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.text }]}
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={theme.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <ScrollView 
        ref={scrollRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        
        {/* CATEGORY SELECTOR */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
          <Text style={[styles.resultCount, { color: theme.secondary }]}>{filteredCars.length}</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryRow}
          scrollEventThrottle={16}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Animated.View key={cat}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => {
                    handleCategoryPress(cat);
                    setSelectedCar(null);
                  }}
                  style={[
                    styles.catChip, 
                    { 
                      backgroundColor: isActive ? theme.primary : theme.card, 
                      borderColor: isActive ? theme.primary : theme.border,
                      transform: [{ scale: isActive ? 1.05 : 1 }]
                    }
                  ]}
                >
                  <Text style={{
                    color: isActive ? '#FFF' : theme.text, 
                    fontSize: isTablet ? 14 : 13, 
                    fontWeight: '700'
                  }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* RESULTS HEADER */}
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {activeCategory === 'All' ? 'Full Fleet' : activeCategory}
            </Text>
            <Text style={{ color: theme.secondary, fontSize: isTablet ? 13 : 12, fontWeight: '600', marginTop: 4 }}>
              {filteredCars.length} {filteredCars.length === 1 ? 'VEHICLE' : 'VEHICLES'}
            </Text>
          </View>
        </View>

        {/* RESPONSIVE LAYOUT - GRID FOR TABLET, HORIZONTAL FOR MOBILE */}
        {!isTablet ? (
          // MOBILE: Horizontal FlatList
          <FlatList
            data={filteredCars}
            keyExtractor={(item) => item.id}
            extraData={activeCategory + searchQuery}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + 20}
            decelerationRate="fast"
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
            renderItem={({ item, index }) => (
              <CarCard 
                item={item} 
                index={index}
                isSelected={selectedCar === item.id}
                onPress={() => setSelectedCar(selectedCar === item.id ? null : item.id)}
                onInquire={() => navigation.navigate('Inquire', { item })}
                theme={theme}
                isDark={isDark}
              />
            )}
          />
        ) : (
          // TABLET: 2-column grid
          <FlatList
            data={filteredCars}
            keyExtractor={(item) => item.id}
            extraData={activeCategory + searchQuery}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            renderItem={({ item, index }) => (
              <CarCard 
                item={item} 
                index={index}
                isSelected={selectedCar === item.id}
                onPress={() => setSelectedCar(selectedCar === item.id ? null : item.id)}
                onInquire={() => navigation.navigate('Inquire', { item })}
                theme={theme}
                isDark={isDark}
                isTablet={isTablet}
              />
            )}
          />
        )}
        
        {filteredCars.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={60} color={theme.border} />
            <Text style={{ color: theme.secondary, marginTop: 15, fontWeight: '600', fontSize: 16 }}>
              No vehicles found
            </Text>
            <Text style={{ color: theme.border, marginTop: 8, fontSize: 13 }}>
              Try adjusting your search or category
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 150 },
  searchSection: { marginHorizontal: 20, marginTop: 12, marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15
  },
  sectionTitle: { fontSize: 24, fontWeight: '800' },
  resultCount: { fontSize: 14, fontWeight: '600', backgroundColor: 'rgba(150,150,150,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  categoryRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 8 },
  catChip: { 
    paddingHorizontal: 22, 
    paddingVertical: 12, 
    borderRadius: 16, 
    borderWidth: 1,
    minHeight: 45,
    justifyContent: 'center',
  },
  gridRow: { justifyContent: 'space-between', gap: 16 },
  featuredCard: {
    borderRadius: 25,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 6 }
    })
  },
  featuredImage: { width: '100%', height: 180 },
  typeBadge: { 
    position: 'absolute', 
    top: 12, 
    left: 12, 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 10 
  },
  typeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },
  favoriteIcon: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  cardInfo: { padding: 16, paddingBottom: 14 },
  carName: { fontWeight: '800', marginBottom: 10 },
  specGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 14, 
    backgroundColor: 'rgba(150,150,150,0.08)', 
    padding: 11, 
    borderRadius: 12 
  },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specText: { fontWeight: '600' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  priceText: { fontWeight: '900' },
  bookBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, 
    paddingVertical: 9, 
    borderRadius: 10,
    justifyContent: 'center'
  },
  bookBtnText: { color: '#FFF', fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 }
});