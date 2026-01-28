/**
 * GlobalixHeader.tsx
 * Reusable header component for screens displaying brand and subtitle
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

// 2. Third party & context
import { useTheme } from '../theme/ThemeContext';

// ===== INTERFACES & TYPES =====
interface GlobalixHeaderProps {
  subtitle: string;
}

// ===== MAIN COMPONENT =====
export const GlobalixHeader: React.FC<GlobalixHeaderProps> = ({ subtitle }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  // ===== RESPONSIVE SIZING =====
  const isTablet = width > 600;
  const brandSize = isTablet ? 26 : 22;
  const subtitleSize = isTablet ? 12 : 10;

  return (
    <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <Text style={[styles.brand, { color: theme.primary, fontSize: brandSize }]}>
        GLOBALIX
      </Text>
      <Text style={[styles.subtitle, { color: theme.secondary, fontSize: subtitleSize }]}>
        {subtitle.toUpperCase()}
      </Text>
    </View>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  // Layout
  header: {
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
});