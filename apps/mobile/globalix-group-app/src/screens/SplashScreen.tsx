/**
 * SplashScreen.tsx
 * Initial splash screen with animated logo and loading indicators
 * Features: Logo animation, loading spinner, brand display
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';

// 2. Third party & context
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

// ===== CONSTANTS & DATA =====
const BRAND_NAME = 'GLOBALIX';
const BRAND_SUBTITLE = 'Group of Companies';
const LOADING_TEXT = 'Preparing for you...';
const LOGO_EMOJI = '🌍';

// ===== INTERFACES & TYPES =====
interface SplashScreenProps {}

// ===== MAIN COMPONENT =====
export const SplashScreen: React.FC<SplashScreenProps> = () => {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  // ===== ANIMATED VALUES =====
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const translateYAnim = React.useRef(new Animated.Value(30)).current;
  const loaderOpacityAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  // ===== HANDLERS =====
  useEffect(() => {
    Animated.sequence([
      // Logo entrance animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Pause before showing loader
      Animated.delay(400),
      // Loader fade in
      Animated.timing(loaderOpacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for loader
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [scaleAnim, opacityAnim, translateYAnim, loaderOpacityAnim, rotateAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ===== RENDER =====
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* ===== BACKGROUND GRADIENT ===== */}
      <View
        style={[
          styles.backgroundGradient,
          {
            backgroundColor: isDark
              ? 'rgba(0, 61, 165, 0.05)'
              : 'rgba(0, 61, 165, 0.08)',
          },
        ]}
      />

      {/* ===== LOGO SECTION ===== */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View
            style={[
              styles.glowRing,
              {
                borderColor: isDark
                  ? 'rgba(0, 153, 255, 0.2)'
                  : 'rgba(0, 61, 165, 0.15)',
              },
            ]}
          />

          <View
            style={[
              styles.globeWrapper,
              { backgroundColor: isDark ? '#1A3A5C' : '#E8F4FF' },
            ]}
          >
            <Text style={styles.globeText}>{LOGO_EMOJI}</Text>
          </View>
        </Animated.View>

        {/* ===== BRAND TEXT ===== */}
        <Animated.View style={{ opacity: opacityAnim, alignItems: 'center' }}>
          <Text style={[styles.brandName, { color: theme.text }]}>
            {BRAND_NAME}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.primary }]} />
          <Text style={[styles.brandSubtitle, { color: theme.secondary }]}>
            {BRAND_SUBTITLE}
          </Text>
        </Animated.View>
      </View>

      {/* ===== LOADING INDICATOR ===== */}
      <Animated.View
        style={[styles.loaderContainer, { opacity: loaderOpacityAnim }]}
      >
        <Animated.View
          style={[
            styles.rotatingLoader,
            { transform: [{ rotate: rotateInterpolate }] },
          ]}
        >
          <View
            style={[styles.loaderRing, { borderColor: theme.primary }]}
          />
        </Animated.View>
        <Text style={[styles.loadingText, { color: theme.secondary }]}>
          {LOADING_TEXT}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Background
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Content section
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    zIndex: 1,
  },

  // Logo
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  globeWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003DA5',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  globeText: { fontSize: 80 },

  // Brand text
  brandName: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    marginVertical: 12,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  // Loader
  loaderContainer: {
    alignItems: 'center',
    paddingBottom: 60,
    zIndex: 1,
  },
  rotatingLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderTopColor: '#003DA5',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 20,
  },
});
