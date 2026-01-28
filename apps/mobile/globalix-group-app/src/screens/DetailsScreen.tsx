/**
 * DetailsScreen.tsx
 * Property details screen displaying comprehensive information and contact options
 * Features: Image display, property features, pricing, agent contact, property description
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

// 2. Third party & context
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// ===== CONSTANTS & DATA =====
const DEFAULT_PROPERTY = {
  title: 'Globalix Luxury Suite',
  price: '$1,200,000',
  location: 'Victoria Island, Lagos',
  description:
    'Experience the pinnacle of luxury living with Globalix. This 4-bedroom penthouse features panoramic ocean views, a private elevator, and state-of-the-art smart home integration.',
  features: ['4 Bedrooms', '5 Bathrooms', 'Smart Security', 'Private Pool'],
};

// ===== INTERFACES & TYPES =====
interface DetailsScreenProps {
  navigation: any;
  route: any;
}

interface PropertyData {
  title: string;
  price: string;
  location: string;
  description: string;
  features: string[];
}

// ===== MAIN COMPONENT =====
export const DetailsScreen: React.FC<DetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme, isDark } = useTheme();

  // ===== STATE =====
  const property: PropertyData = DEFAULT_PROPERTY;

  // ===== RENDER =====
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* ===== HEADER IMAGE SECTION ===== */}
        <View style={[styles.imageHeader, { backgroundColor: theme.primary }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ===== CONTENT SECTION ===== */}
        <View style={[styles.infoSection, { backgroundColor: theme.background }]}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.text }]}>
                {property.title}
              </Text>
              <Text style={[styles.location, { color: theme.secondary }]}>
                {property.location}
              </Text>
            </View>
            <View
              style={[
                styles.priceTag,
                { backgroundColor: isDark ? '#1a1a1a' : '#f0f5ff' },
              ]}
            >
              <Text style={[styles.price, { color: theme.primary }]}>
                {property.price}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Description Section */}
          <Text style={[styles.sectionHeader, { color: theme.text }]}>
            Description
          </Text>
          <Text
            style={[
              styles.descText,
              { color: isDark ? '#ccc' : '#444' },
            ]}
          >
            {property.description}
          </Text>

          {/* Features Section */}
          <Text
            style={[
              styles.sectionHeader,
              { color: theme.text, marginTop: 25 },
            ]}
          >
            Key Features
          </Text>
          <View style={styles.featureGrid}>
            {property.features.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.featureBadge,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={theme.primary}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.featureText, { color: theme.primary }]}>
                  {f}
                </Text>
              </View>
            ))}
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ===== FOOTER ACTION BAR ===== */}
      <SafeAreaView
        style={[
          styles.footer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: theme.primary }]}
          onPress={() =>
            navigation.navigate('Contact', { title: property.title })
          }
        >
          <Text style={styles.contactButtonText}>Contact Globalix Agent</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1 },

  // Image header
  imageHeader: { width: '100%', height: 380 },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info section
  infoSection: {
    padding: 25,
    marginTop: -35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
  location: { fontSize: 14, marginTop: 4, fontWeight: '500' },

  // Price tag
  priceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  price: { fontSize: 18, fontWeight: '900' },

  // Divider
  divider: { height: 1, marginVertical: 25 },

  // Section headers
  sectionHeader: { fontSize: 18, fontWeight: '800', marginBottom: 12 },

  // Description
  descText: { fontSize: 15, lineHeight: 24 },

  // Features
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 15,
  },
  featureText: { fontSize: 13, fontWeight: '700' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  // Contact button
  contactButton: {
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#004aad',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});