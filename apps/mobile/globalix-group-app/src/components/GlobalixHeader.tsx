/**
 * GlobalixHeader.tsx
 * Reusable header component for screens displaying brand and subtitle
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';

// 2. Third party & context
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

// ===== INTERFACES & TYPES =====
interface GlobalixHeaderProps {
  subtitle: string;
  showSearch?: boolean;
}

// ===== MAIN COMPONENT =====
export const GlobalixHeader: React.FC<GlobalixHeaderProps> = ({ subtitle, showSearch = false }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();

  // ===== RESPONSIVE SIZING =====
  const isTablet = width > 600;
  const brandSize = isTablet ? 26 : 22;
  const subtitleSize = isTablet ? 12 : 10;

  return (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <View>
        <Text style={[styles.brand, { color: theme.primary, fontSize: brandSize }]}>
          GLOBALIX
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondary, fontSize: subtitleSize }]}>
          {subtitle.toUpperCase()}
        </Text>
      </View>
      
      {showSearch && (
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Explore')}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={theme.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  // Layout
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },

  // Text
  brand: {
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  subtitle: {
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: -2,
  },
  
  // Search Button
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});