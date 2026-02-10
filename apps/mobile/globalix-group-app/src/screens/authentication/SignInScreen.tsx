/**
 * SignInScreen.tsx
 * User authentication screen with email/password and Apple Sign-In
 * Features: Form validation, Apple authentication, error handling, responsive design
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';

// 2. Third party & context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useTheme } from '../../theme/ThemeContext';
import { activityApi, authApi, setAuthTokens } from '../../services/apiClient';

/* ============================================================================
   INTERFACES & TYPES
   ============================================================================ */

interface SignInScreenProps {
  navigation: any;
}

interface FormErrors {
  email?: string;
  password?: string;
}

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  /* ========================================================================
     STATE
     ======================================================================== */

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  /* ========================================================================
     RESPONSIVE SIZING
     ======================================================================== */

  const isTablet = width > 600;
  const titleSize = isTablet ? 36 : 28;
  const subtitleSize = isTablet ? 18 : 16;
  const inputHeight = 56;
  const buttonHeight = 56;
  const horizontalPadding = width * 0.06;

  /* ========================================================================
     AUTH HOOK
     ======================================================================== */

  const useAuth = () => {
    try {
      const { useAuth: authHook } = require('../../../App');
      return authHook();
    } catch (e) {
      return { login: async () => {} };
    }
  };
  const { login } = useAuth();

  /* ========================================================================
     HANDLERS
     ======================================================================== */

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleEmailSignIn = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Invalid email or password');
      }

      const { token, refreshToken, user } = response.data as any;
      if (token) {
        await setAuthTokens(token, refreshToken);
      }

      // Log activity to backend (non-blocking)
      Promise.resolve().then(() => {
        activityApi.logActivity(
          user?.id || `user-${email.split('@')[0]}`,
          `User login: ${user?.name || email}`,
          'login',
          { email }
        ).catch((err) => console.warn('Activity log failed:', err));
      });

      await login();
    } catch (error: any) {
      Alert.alert('Sign-In Failed', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }, [validateForm, login, email, password]);

  const handleAppleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple Sign-In Success:', credential);

      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ');

      const response = await authApi.appleCallback(
        credential.user,
        credential.email || '',
        fullName || 'Apple User'
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Apple sign-in failed');
      }

      const { token } = response.data as any;
      if (token) {
        await setAuthTokens(token);
      }

      await login();
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User cancelled Apple Sign-In');
      } else {
        Alert.alert('Sign-In Failed', error.message || 'Failed to sign in with Apple');
      }
    } finally {
      setLoading(false);
    }
  }, [login]);

  /* ========================================================================
     RENDER
     ======================================================================== */

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
        >
          {/* Header Section */}
          <View style={[styles.headerSection, { paddingHorizontal: horizontalPadding }]}>
            {/* Back button disabled on SignIn - it's the entry point */}
            <View style={styles.backButton} />
            
            <Text style={[styles.title, { color: theme.text, fontSize: titleSize }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: theme.secondary, fontSize: subtitleSize }]}>
              Sign in to access premium properties
            </Text>
          </View>

          {/* Form Section */}
          <View style={[styles.formSection, { paddingHorizontal: horizontalPadding }]}>
            
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: errors.email ? '#FF6B6B' : theme.border,
                  borderWidth: errors.email ? 1.5 : 1
                }
              ]}>
                <Ionicons name="mail" size={20} color={theme.secondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.secondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <View style={[
                styles.inputContainer, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: errors.password ? '#FF6B6B' : theme.border,
                  borderWidth: errors.password ? 1.5 : 1
                }
              ]}>
                <Ionicons name="lock-closed" size={20} color={theme.secondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.secondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity 
                  activeOpacity={0.6}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye' : 'eye-off'} 
                    size={20} 
                    color={theme.secondary} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotContainer}
            >
              <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: theme.primary, height: buttonHeight }]}
              activeOpacity={0.85}
              onPress={handleEmailSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* Divider */}
          <View style={[styles.dividerContainer, { paddingHorizontal: horizontalPadding }]}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.secondary }]}>Or continue with</Text>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>

          {/* Social Sign In */}
          <View style={[styles.socialContainer, { paddingHorizontal: horizontalPadding }]}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.7}
              onPress={handleAppleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons name="logo-apple" size={24} color={theme.text} />
              )}
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: theme.secondary }]}>Don't have an account? </Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={[styles.signUpLink, { color: theme.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { paddingBottom: 50 },
  headerSection: { marginTop: 20, marginBottom: 40 },
  backButton: { marginBottom: 20 },
  title: { fontWeight: '900', marginBottom: 8, letterSpacing: 0.3 },
  subtitle: { fontWeight: '500', lineHeight: 22 },
  formSection: { gap: 24 },
  inputWrapper: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 1 }
    })
  },
  input: { flex: 1, fontSize: 16, fontWeight: '500', paddingVertical: 16 },
  errorText: { color: '#FF6B6B', fontSize: 12, fontWeight: '600', marginTop: 4 },
  forgotContainer: { alignItems: 'flex-end' },
  forgotText: { fontSize: 14, fontWeight: '700' },
  signInButton: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 }
    })
  },
  signInButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 32 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontWeight: '600' },
  socialContainer: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  signUpContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  signUpText: { fontSize: 14, fontWeight: '500' },
  signUpLink: { fontSize: 14, fontWeight: '800' }
});
