/**
 * HomeScreen.tsx
 * Main home screen displaying featured properties and property browsing by type
 * Features: Search navigation, featured listings, category filtering, filtered results
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
  Dimensions,
} from 'react-native';

// 2. Third party & context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// 3. Components & utils
import { GlobalixHeader } from '../components/GlobalixHeader';

// ===== CONSTANTS & DATA =====
const PROPERTY_DATA = [
  {
    id: '1',
    title: 'Skyline Penthouse',
    location: 'Downtown, Toronto',
    price: '$4,500,000',
    beds: '4',
    baths: '3',
    sqft: '3,200',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800',
    tag: 'RESERVED',
    type: 'Penthouses'
  },
  {
    id: '2',
    title: 'Modern Lake Villa',
    location: 'Hamilton, ON',
    price: '$2,850,000',
    beds: '5',
    baths: '4',
    sqft: '4,500',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
    tag: 'NEW',
    type: 'Villas'
  },
  {
    id: '3',
    title: 'Glass House Estate',
    location: 'Oakville, ON',
    price: '$6,200,000',
    beds: '6',
    baths: '7',
    sqft: '8,100',
    image: 'https://images.unsplash.com/photo-1600607687940-c52af084399b?q=80&w=800',
    tag: 'EXCLUSIVE',
    type: 'Estates'
  },
  {
    id: '4',
    title: 'Premium Office Tower',
    location: 'Financial District, Toronto',
    price: '$15,000,000',
    beds: 'N/A',
    baths: 'N/A',
    sqft: '50,000',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=800',
    tag: 'COMMERCIAL',
    type: 'Commercial'
  },
  {
    id: '5',
    title: 'Residential Land Plot',
    location: 'Burlington, ON',
    price: '$1,200,000',
    beds: 'N/A',
    baths: 'N/A',
    sqft: '25,000',
    image: 'https://images.unsplash.com/photo-1500622944904-200ce0ecc86d?q=80&w=800',
    tag: 'INVESTMENT',
    type: 'Land'
  }
];

const CATEGORIES = ['Villas', 'Penthouses', 'Estates', 'Commercial', 'Land'];

// ===== INTERFACES & TYPES =====
interface HomeScreenProps {
  navigation: any;
}

interface PropertyItem {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  image: string;
  tag: string;
  type: string;
}

// ===== HELPER COMPONENTS =====
interface PropertyCardProps {
  item: PropertyItem;
  cardWidth: number;
  imageHeight: number;
  titleSize: number;
  theme: any;
  onPress: () => void;
  renderAmenity: (icon: string, label: string) => React.ReactNode;
}

const FeaturedCard: React.FC<PropertyCardProps> = ({
  item,
  cardWidth,
  imageHeight,
  titleSize,
  theme,
  onPress,
  renderAmenity,
}) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={onPress}
    style={[
      styles.featuredCard,
      {
        backgroundColor: theme.card,
        borderColor: theme.border,
        width: cardWidth,
      },
    ]}
  >
    <Image source={{ uri: item.image }} style={[styles.cardImage, { height: imageHeight }]} />
    <View style={[styles.tagBadge, { backgroundColor: theme.primary }]}>
      <Text style={styles.tagText}>{item.tag}</Text>
    </View>
    <View style={styles.cardInfo}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.propTitle, { color: theme.text, fontSize: titleSize }]}
          >
            {item.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={theme.primary} />
            <Text style={[styles.locationText, { color: theme.secondary }]}>
              {item.location}
            </Text>
          </View>
        </View>
        <Text style={[styles.priceText, { color: theme.primary }]}>
          {item.price}
        </Text>
      </View>
      <View style={[styles.amenityGrid, { borderTopColor: theme.border }]}>
        {renderAmenity('bed', `${item.beds} Beds`)}
        {renderAmenity('water', `${item.baths} Baths`)}
        {renderAmenity('resize', `${item.sqft} sqft`)}
      </View>
    </View>
  </TouchableOpacity>
);

interface CategoryCardProps {
  item: PropertyItem;
  theme: any;
  onPress: () => void;
  renderAmenity: (icon: string, label: string) => React.ReactNode;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  item,
  theme,
  onPress,
  renderAmenity,
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[
      styles.categoryCard,
      {
        backgroundColor: theme.card,
        borderColor: theme.border,
      },
    ]}
  >
    <Image source={{ uri: item.image }} style={styles.categoryCardImage} />
    <View style={[styles.categoryTagBadge, { backgroundColor: theme.primary }]}>
      <Text style={styles.categoryTagText}>{item.tag}</Text>
    </View>
    <View style={styles.categoryCardInfo}>
      <View style={styles.categoryTitleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.categoryPropTitle, { color: theme.text }]}>
            {item.title}
          </Text>
          <View style={styles.categoryLocationRow}>
            <Ionicons name="location" size={12} color={theme.primary} />
            <Text style={[styles.categoryLocationText, { color: theme.secondary }]}>
              {item.location}
            </Text>
          </View>
        </View>
        <Text style={[styles.categoryPriceText, { color: theme.primary }]}>
          {item.price}
        </Text>
      </View>
      <View style={[styles.categoryAmenityGrid, { borderTopColor: theme.border }]}>
        {item.beds !== 'N/A' && renderAmenity('bed', `${item.beds} Beds`)}
        {item.baths !== 'N/A' && renderAmenity('water', `${item.baths} Baths`)}
        {renderAmenity('resize', `${item.sqft} sqft`)}
      </View>
    </View>
  </TouchableOpacity>
);

// ===== MAIN COMPONENT =====
export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  // ===== STATE =====
  const [selectedCategory, setSelectedCategory] = useState('Villas');

  // ===== RESPONSIVE SIZING =====
  const cardWidth = width > 600 ? width * 0.75 : width * 0.85;
  const imageHeight = height > 800 ? 240 : 200;
  const titleSize = width > 600 ? 20 : 18;
  const sectionTitleSize = width > 600 ? 26 : 22;

  // ===== MEMOIZED VALUES =====
  const filteredProperties = useMemo(
    () => PROPERTY_DATA.filter((prop) => prop.type === selectedCategory),
    [selectedCategory]
  );

  // ===== HANDLERS =====
  const handleCategoryPress = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const renderAmenity = useCallback(
    (icon: string, label: string) => (
      <View style={styles.amenityItem}>
        <Ionicons name={icon as any} size={14} color={theme.primary} />
        <Text style={[styles.amenityText, { color: theme.secondary }]}>
          {label}
        </Text>
      </View>
    ),
    [theme]
  );

  // ===== RENDER =====
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <GlobalixHeader subtitle="Premium Real Estate" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {/* ===== SEARCH SECTION ===== */}
        <TouchableOpacity
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              marginHorizontal: width * 0.05,
              paddingHorizontal: width * 0.04,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Explore')}
        >
          <Ionicons name="search" size={20} color={theme.secondary} />
          <Text style={[styles.searchText, { color: theme.secondary }]}>
            Search Globalix listings...
          </Text>
          <Ionicons name="options-outline" size={20} color={theme.primary} />
        </TouchableOpacity>

        {/* ===== FEATURED SECTION ===== */}
        <View
          style={[
            styles.sectionHeader,
            { paddingHorizontal: width * 0.05 },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text, fontSize: sectionTitleSize },
            ]}
          >
            Featured Properties
          </Text>
        </View>

        <FlatList
          data={PROPERTY_DATA}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 20}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: width * 0.05, gap: 12 }}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <FeaturedCard
              item={item}
              cardWidth={cardWidth}
              imageHeight={imageHeight}
              titleSize={titleSize}
              theme={theme}
              onPress={() =>
                navigation.navigate('Details', { property: item })
              }
              renderAmenity={renderAmenity}
            />
          )}
          keyExtractor={(item) => item.id}
        />

        {/* ===== CATEGORIES SECTION ===== */}
        <View
          style={[
            styles.sectionHeader,
            { paddingHorizontal: width * 0.05, marginTop: 30 },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text, fontSize: sectionTitleSize },
            ]}
          >
            Browse by Type
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.catScroll,
            { paddingHorizontal: width * 0.05, gap: 10 },
          ]}
          scrollEventThrottle={16}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress(cat)}
              style={[
                styles.catChip,
                {
                  backgroundColor:
                    selectedCategory === cat ? theme.primary : theme.card,
                  borderColor:
                    selectedCategory === cat ? theme.primary : theme.border,
                  minWidth: 100,
                },
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  {
                    color: selectedCategory === cat ? '#FFF' : theme.text,
                    fontWeight: selectedCategory === cat ? '800' : '700',
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ===== FILTERED RESULTS SECTION ===== */}
        <View
          style={[
            styles.sectionHeader,
            { paddingHorizontal: width * 0.05, marginTop: 25 },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text, fontSize: sectionTitleSize },
            ]}
          >
            {selectedCategory}
          </Text>
          <Text style={[styles.resultCount, { color: theme.secondary }]}>
            {filteredProperties.length}{' '}
            {filteredProperties.length === 1 ? 'Property' : 'Properties'}
          </Text>
        </View>

        {filteredProperties.length > 0 ? (
          <FlatList
            data={filteredProperties}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: width * 0.05, gap: 12 }}
            renderItem={({ item }) => (
              <CategoryCard
                item={item}
                theme={theme}
                onPress={() =>
                  navigation.navigate('Details', { property: item })
                }
                renderAmenity={renderAmenity}
              />
            )}
          />
        ) : (
          <View style={[styles.emptyContainer, { paddingHorizontal: width * 0.05 }]}>
            <Ionicons name="home-outline" size={60} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.secondary }]}>
              No properties found in this category
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ===== STYLES =====

const styles = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  scrollContent: { paddingBottom: 150 },

  // Search section
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  searchText: { flex: 1, marginHorizontal: 12, fontSize: 14, fontWeight: '500' },

  // Section headers
  sectionHeader: { marginVertical: 12 },
  sectionTitle: { fontWeight: '800', letterSpacing: 0.3 },
  resultCount: { fontSize: 14, fontWeight: '600' },

  // Featured cards
  featuredCard: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 5 },
    }),
  },
  cardImage: { width: '100%' },
  tagBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 3 },
    }),
  },
  tagText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardInfo: { padding: 18 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 10,
  },
  propTitle: { fontWeight: '800', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, fontWeight: '500' },
  priceText: { fontSize: 18, fontWeight: '900' },
  amenityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    marginTop: 14,
  },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  amenityText: { fontSize: 11, fontWeight: '600' },

  // Categories
  catScroll: { gap: 10 },
  catChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  // Category cards
  categoryCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  categoryCardImage: { width: 120, height: 120 },
  categoryTagBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  categoryTagText: { color: '#FFF', fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  categoryCardInfo: { flex: 1, padding: 14 },
  categoryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  categoryPropTitle: { fontWeight: '800', fontSize: 15, marginBottom: 6 },
  categoryLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  categoryLocationText: { fontSize: 11, fontWeight: '500' },
  categoryPriceText: { fontSize: 16, fontWeight: '900' },
  categoryAmenityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 10,
    gap: 4,
  },

  // Empty state
  emptyContainer: { alignItems: 'center', marginVertical: 40 },
  emptyText: { marginTop: 12, fontWeight: '600', fontSize: 14 },
});