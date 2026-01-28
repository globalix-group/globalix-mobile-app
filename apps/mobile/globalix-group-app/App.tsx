/**
 * App.tsx
 * Main application root component with navigation, authentication, and theme management
 * Features: Navigation stacks, auth context, tab navigation, splash/onboarding flows
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { View, StyleSheet, Platform, Animated, ActivityIndicator } from 'react-native';

// 2. Third party & context
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

// 3. Components & screens
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ContactScreen } from './src/screens/ContactScreen';
import { CarsScreen } from './src/screens/CarsScreen';
import { DocsScreen } from './src/screens/DocsScreen';
import { InquireScreen } from './src/screens/InquireScreen';
import { HelpCenterScreen } from './src/screens/HelpCenterScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { SignInScreen, SignUpScreen, ForgotPasswordScreen } from './src/screens/authentication';

// ===== CONSTANTS & NAVIGATION =====
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// ===== INTERFACES & TYPES =====
interface AuthContextType {
  isLoggedIn: boolean | null;
  hasSeenOnboarding: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
}

interface TabIconProps {
  focused: boolean;
  color: string;
  iconName: string;
  activeColor: string;
}

// ===== AUTH CONTEXT =====
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: null,
  hasSeenOnboarding: false,
  login: async () => {},
  logout: async () => {},
  completeOnboarding: async () => {},
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);

// ===== HELPER COMPONENTS =====
const TabIcon: React.FC<TabIconProps> = ({ focused, color, iconName, activeColor }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [focused, animValue]);

  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <View style={styles.iconContainer}>
      <Animated.View 
        style={[
          styles.activePill, 
          { 
            backgroundColor: activeColor, 
            opacity: animValue, 
            transform: [{ scale }] 
          }
        ]} 
      />
      <Animated.View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}>
        <Ionicons 
          name={focused ? (iconName as any) : (`${iconName}-outline` as any)} 
          size={22} 
          color={color} 
        />
      </Animated.View>
    </View>
  );
};

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
};

const TabNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator 
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#FFF',
        tabBarInactiveTintColor: isDark ? '#666' : '#999',
        tabBarStyle: { 
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 35,
          backgroundColor: isDark ? 'rgba(28, 28, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderWidth: 1,
          borderColor: isDark ? '#333' : '#F0F0F0',
        },
      }}
    >
      <Tab.Screen 
        name="Properties" 
        component={HomeStack} 
        options={{ tabBarIcon: (props) => <TabIcon {...props} iconName="business" activeColor={theme.primary} /> }} 
      />
      <Tab.Screen 
        name="Cars" 
        component={CarsScreen} 
        options={{ tabBarIcon: (props) => <TabIcon {...props} iconName="car-sport" activeColor={theme.primary} /> }} 
      />
      <Tab.Screen 
        name="Docs" 
        component={DocsScreen} 
        options={{ tabBarIcon: (props) => <TabIcon {...props} iconName="document-text" activeColor={theme.primary} /> }} 
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{ tabBarIcon: (props) => <TabIcon {...props} iconName="search" activeColor={theme.primary} /> }} 
      />
      <Tab.Screen 
        name="Account" 
        component={ProfileScreen} 
        options={{ tabBarIcon: (props) => <TabIcon {...props} iconName="person" activeColor={theme.primary} /> }} 
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isLoggedIn, hasSeenOnboarding, isLoading } = useAuth();

  if (isLoading) {
    return (
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Splash" component={SplashScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : isLoggedIn ? (
          <>
            <RootStack.Screen name="MainTabs" component={TabNavigator} />
            <RootStack.Group screenOptions={{ presentation: 'modal' }}>
              <RootStack.Screen name="Inquire" component={InquireScreen} />
              <RootStack.Screen name="Contact" component={ContactScreen} />
              <RootStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
              <RootStack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: false }} />
              <RootStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
            </RootStack.Group>
          </>
        ) : (
          <RootStack.Group screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="SignIn" component={SignInScreen} />
            <RootStack.Screen name="SignUp" component={SignUpScreen} />
            <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

// ===== MAIN COMPONENT =====
export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            isLoading: false,
            isLoggedIn: action.payload.isLoggedIn,
            hasSeenOnboarding: action.payload.hasSeenOnboarding,
          };
        case 'SIGN_IN':
          return { ...prevState, isLoggedIn: true };
        case 'SIGN_OUT':
          return { ...prevState, isLoggedIn: false };
        case 'COMPLETE_ONBOARDING':
          return { ...prevState, hasSeenOnboarding: true };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isLoggedIn: false,
      hasSeenOnboarding: false,
    }
  );

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        dispatch({ 
          type: 'RESTORE_TOKEN', 
          payload: { 
            isLoggedIn: false, 
            hasSeenOnboarding: false 
          } 
        });
      } catch (e) {
        console.error('Error restoring state:', e);
        dispatch({ 
          type: 'RESTORE_TOKEN', 
          payload: { 
            isLoggedIn: false, 
            hasSeenOnboarding: false 
          } 
        });
      }
    };

    checkAuthState();
  }, []);

  const authContext = React.useMemo(
    () => ({
      isLoggedIn: state.isLoggedIn,
      hasSeenOnboarding: state.hasSeenOnboarding,
      isLoading: state.isLoading,
      login: async () => { dispatch({ type: 'SIGN_IN' }); },
      logout: async () => { dispatch({ type: 'SIGN_OUT' }); },
      completeOnboarding: async () => { dispatch({ type: 'COMPLETE_ONBOARDING' }); },
    }),
    [state]
  );

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthContext.Provider value={authContext}>
          <AppNavigator />
        </AuthContext.Provider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  // Tab navigation
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  activePill: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: '#004aad',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});