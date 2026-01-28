import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  useWindowDimensions,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Premium Properties',
    subtitle: 'Find Your Dream Home',
    description: 'Explore exclusive real estate listings from around the world. Luxury homes tailored to your lifestyle and preferences.',
    icon: 'home',
    color: '#003DA5',
    bgColor: '#E8F4FF'
  },
  {
    id: '2',
    title: 'Luxury Fleet',
    subtitle: 'Drive Excellence',
    description: 'Discover high-performance vehicles and luxury cars. Find the perfect ride that matches your style and needs.',
    icon: 'car-sport',
    color: '#0099FF',
    bgColor: '#E0F2FE'
  },
  {
    id: '3',
    title: 'Immigration Resources',
    subtitle: 'Study, Work & PR in Canada',
    description: 'Access official IRCC guides, travel documents, and connect with immigration consultants via live meetings. Get everything you need for your Canadian journey.',
    icon: 'document-text',
    color: '#27AE60',
    bgColor: '#E8F8F0'
  },
  {
    id: '4',
    title: 'Global Network',
    subtitle: 'Connect Worldwide',
    description: 'Access opportunities across our international business portfolio. Network with like-minded individuals globally.',
    icon: 'globe',
    color: '#5B9BD5',
    bgColor: '#E3F2FD'
  },
  {
    id: '5',
    title: 'Seamless Experience',
    subtitle: 'Everything at Your Fingertips',
    description: 'Manage properties, vehicles, immigration documents, and inquiries all in one intuitive platform. Your complete business solution.',
    icon: 'checkmark-done-circle',
    color: '#70AD47',
    bgColor: '#F0F8E8'
  },
];

/**
 * OnboardingScreen
 * 
 * Displays an interactive onboarding carousel with animations to introduce
 * app features and guide users through the initial setup. Includes slide
 * transitions, icon animations, and feature list animations.
 * 
 * Features:
 * - Animated carousel with swipe navigation
 * - Fade-in and scale animations for content
 * - Staggered feature list animations
 * - Smooth progress bar transitions
 * - Dynamic dot indicator animations
 */

export const OnboardingScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // ===== ANIMATION VALUES =====
  const slideOpacity = useRef(new Animated.Value(0)).current;
  const slideScale = useRef(new Animated.Value(0.8)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const featureAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  // Import useAuth dynamically to avoid circular dependency
  const useAuth = () => {
    try {
      const { useAuth: authHook } = require('../../App');
      return authHook();
    } catch (e) {
      return { completeOnboarding: async () => {} };
    }
  };
  const { completeOnboarding } = useAuth();

  // ===== ANIMATIONS =====
  useEffect(() => {
    // Fade in and scale animation for slide content
    Animated.parallel([
      Animated.timing(slideOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon rotation animation
    Animated.loop(
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Staggered feature animations
    Animated.stagger(150, [
      Animated.timing(featureAnimations[0], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(featureAnimations[1], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(featureAnimations[2], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Button pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      slideOpacity.setValue(0);
      slideScale.setValue(0.8);
    };
  }, [currentPage]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    const pageIndex = Math.round(contentOffset.x / width);
    setCurrentPage(pageIndex);
    scrollX.setValue(contentOffset.x);
  };

  // ===== HANDLERS =====
  const handleNext = async () => {
    if (currentPage < ONBOARDING_DATA.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentPage + 1) * width,
        animated: true,
      });
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const DotIndicator = ({ index }: { index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1.3, 0.6],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.dot,
          {
            transform: [{ scale }],
            opacity,
            backgroundColor: theme.primary,
          },
        ]}
      />
    );
  };

  // ===== HELPER COMPONENTS =====
  const SlideContent = () => {
    const currentSlide = ONBOARDING_DATA[currentPage];
    const iconRotation = iconRotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          {
            opacity: slideOpacity,
            transform: [{ scale: slideScale }],
          },
        ]}
      >
        {/* Icon with rotation animation */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDark 
                ? `${currentSlide.color}20` 
                : currentSlide.bgColor,
              transform: [{ rotate: iconRotation }],
            },
          ]}
        >
          <Ionicons 
            name={currentSlide.icon as any} 
            size={90} 
            color={currentSlide.color} 
          />
        </Animated.View>

        <Text style={[styles.subtitle, { color: currentSlide.color }]}>
          {currentSlide.subtitle}
        </Text>

        <Text style={[styles.title, { color: theme.text }]}>
          {currentSlide.title}
        </Text>
        
        <Text style={[styles.description, { color: theme.secondary }]}>
          {currentSlide.description}
        </Text>

        {/* Animated features list */}
        <View style={styles.featuresContainer}>
          {[0, 1, 2].map((index) => {
            const translateX = featureAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.featureRow,
                  {
                    opacity: featureAnimations[index],
                    transform: [{ translateX }],
                  },
                ]}
              >
                <View style={[styles.checkmark, { backgroundColor: currentSlide.color }]}>
                  <Ionicons name="checkmark-sharp" size={14} color="#FFF" />
                </View>
                <Text style={[styles.featureText, { color: theme.text }]}>
                  Feature {index + 1} {String.fromCharCode(97 + index)}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  // ===== RENDER =====
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with Skip */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleSkip}
          activeOpacity={0.6}
          style={styles.skipButton}
        >
          <Text style={[styles.skipText, { color: theme.secondary }]}>Skip</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.secondary} />
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {ONBOARDING_DATA.map((item) => (
          <View key={item.id} style={[styles.slide, { width }]}>
            <SlideContent />
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {ONBOARDING_DATA.map((_, index) => (
          <DotIndicator key={index} index={index} />
        ))}
      </View>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, {
            width: `${((currentPage + 1) / ONBOARDING_DATA.length) * 100}%`,
            backgroundColor: ONBOARDING_DATA[currentPage]?.color || theme.primary,
          }]} />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.secondary }]}
            onPress={() => {
              if (currentPage > 0) {
                scrollViewRef.current?.scrollTo({
                  x: (currentPage - 1) * width,
                  animated: true,
                });
              }
            }}
            disabled={currentPage === 0}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={currentPage === 0 ? theme.secondary : theme.text} 
            />
          </TouchableOpacity>

          <Animated.View
            style={[
              {
                flex: 1,
                transform: [{ scale: buttonPulse }],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.nextButton, 
                { 
                  backgroundColor: ONBOARDING_DATA[currentPage]?.color || theme.primary,
                }
              ]}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>
                {currentPage === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons 
                name={currentPage === ONBOARDING_DATA.length - 1 ? "arrow-forward" : "chevron-forward"} 
                size={20} 
                color="#FFF" 
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={[styles.slideCounter, { color: theme.secondary }]}>
          {currentPage + 1} of {ONBOARDING_DATA.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  slide: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.2,
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginVertical: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  progressContainer: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 }
    })
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 }
    })
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  slideCounter: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  }
});
