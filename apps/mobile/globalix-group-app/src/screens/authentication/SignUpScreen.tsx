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
  Pressable,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useTheme } from '../../theme/ThemeContext';
import { activityApi, authApi, setAuthTokens } from '../../services/apiClient';

export const SignUpScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Responsive sizing
  const titleSize = width > 600 ? 36 : 28;
  const subtitleSize = width > 600 ? 18 : 16;
  const inputHeight = 56;
  const buttonHeight = 56;
  const horizontalPadding = width * 0.06;
  
  // Import useAuth dynamically to avoid circular dependency
  const useAuth = () => {
    try {
      const { useAuth: authHook } = require('../../../App');
      return authHook();
    } catch (e) {
      return { login: async () => {} };
    }
  };
  const { login } = useAuth();
  
  const handleAppleSignUp = useCallback(async () => {
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      console.log('Apple Sign-Up Success:', credential);
      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ');

      const response = await authApi.appleCallback(
        credential.user,
        credential.email || '',
        fullName || 'Apple User'
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Apple sign-up failed');
      }

      const { token } = response.data as any;
      if (token) {
        await setAuthTokens(token);
      }

      await login();
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User cancelled Apple Sign-Up');
      } else {
        Alert.alert('Sign-Up Failed', error.message || 'Failed to sign up with Apple');
      }
    } finally {
      setLoading(false);
    }
  }, [login]);
  
  const validateForm = useCallback(() => {
    const newErrors: typeof errors = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, email, password, confirmPassword, agreeToTerms]);
  
  const handleSignUp = useCallback(async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();

      const registerResponse = await authApi.register(email, password, fullName);
      if (!registerResponse.success) {
        throw new Error(registerResponse.error || 'Sign up failed');
      }

      const loginResponse = await authApi.login(email, password);
      if (!loginResponse.success || !loginResponse.data) {
        throw new Error(loginResponse.error || 'Login failed after sign up');
      }

      const { token, refreshToken, user } = loginResponse.data as any;
      if (token) {
        await setAuthTokens(token, refreshToken);
      }

      // Log activity to backend (non-blocking)
      Promise.resolve().then(() => {
        activityApi.logActivity(
          user?.id || `user-${email.split('@')[0]}`,
          `New signup: ${fullName}`,
          'signup',
          { email, name: fullName }
        ).catch((err) => console.warn('Activity log failed:', err));
      });

      await login();
    } catch (error) {
      setErrors({ email: 'Sign up failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [validateForm, login, firstName, lastName, email, password]);
  
  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    icon: string,
    fieldKey: string,
    placeholder: string,
    isPassword: boolean = false,
    showPasswordField: boolean = false,
    togglePassword?: () => void,
    secureTextEntry?: boolean
  ) => (
    <View style={styles.inputWrapper}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: theme.card, 
          borderColor: errors[fieldKey] ? '#FF6B6B' : theme.border,
          borderWidth: errors[fieldKey] ? 1.5 : 1
        }
      ]}>
        <Ionicons name={icon as any} size={20} color={theme.secondary} />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.secondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={isPassword ? 'none' : 'words'}
          editable={!loading}
        />
        {showPasswordField && togglePassword && (
          <TouchableOpacity activeOpacity={0.6} onPress={togglePassword}>
            <Ionicons 
              name={secureTextEntry ? 'eye-off' : 'eye'} 
              size={20} 
              color={theme.secondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[fieldKey] && <Text style={styles.errorText}>{errors[fieldKey]}</Text>}
    </View>
  );
  
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
            <TouchableOpacity 
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SignIn')}
            >
              <Ionicons name="chevron-back" size={24} color={theme.primary} />
            </TouchableOpacity>
            
            <Text style={[styles.title, { color: theme.text, fontSize: titleSize }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.secondary, fontSize: subtitleSize }]}>
              Join Globalix and discover premium properties
            </Text>
          </View>

          {/* Form Section */}
          <View style={[styles.formSection, { paddingHorizontal: horizontalPadding }]}>
            
            {/* Name Fields Row */}
            <View style={styles.nameRow}>
              <View style={[styles.halfInput, styles.inputWrapper]}>
                <Text style={[styles.label, { color: theme.text }]}>First Name</Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: theme.card, 
                    borderColor: errors.firstName ? '#FF6B6B' : theme.border,
                    borderWidth: errors.firstName ? 1.5 : 1
                  }
                ]}>
                  <Ionicons name="person" size={20} color={theme.secondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="First"
                    placeholderTextColor={theme.secondary}
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={!loading}
                  />
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              <View style={[styles.halfInput, styles.inputWrapper]}>
                <Text style={[styles.label, { color: theme.text }]}>Last Name</Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: theme.card, 
                    borderColor: errors.lastName ? '#FF6B6B' : theme.border,
                    borderWidth: errors.lastName ? 1.5 : 1
                  }
                ]}>
                  <Ionicons name="person-outline" size={20} color={theme.secondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Last"
                    placeholderTextColor={theme.secondary}
                    value={lastName}
                    onChangeText={setLastName}
                    editable={!loading}
                  />
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

            {/* Email Input */}
            {renderInput(
              'Email',
              email,
              setEmail,
              'mail',
              'email',
              'Enter your email',
              false
            )}

            {/* Password Input */}
            {renderInput(
              'Password',
              password,
              setPassword,
              'lock-closed',
              'password',
              'Enter password (min 8 chars)',
              true,
              true,
              () => setShowPassword(!showPassword),
              !showPassword
            )}

            {/* Confirm Password Input */}
            {renderInput(
              'Confirm Password',
              confirmPassword,
              setConfirmPassword,
              'lock-closed',
              'confirmPassword',
              'Confirm password',
              true,
              true,
              () => setShowConfirmPassword(!showConfirmPassword),
              !showConfirmPassword
            )}

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.secondary }]}>Or continue with</Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>

            {/* Social Sign Up */}
            <View style={[styles.socialContainer, { paddingHorizontal: horizontalPadding }]}>
              <TouchableOpacity 
                style={[styles.socialButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                activeOpacity={0.7}
                onPress={handleAppleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Ionicons name="logo-apple" size={24} color={theme.text} />
                )}
              </TouchableOpacity>
            </View>

            {/* Terms & Conditions */}
            <Pressable 
              style={styles.termsContainer}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              <View style={[
                styles.checkbox,
                { 
                  backgroundColor: agreeToTerms ? theme.primary : 'transparent',
                  borderColor: errors.terms ? '#FF6B6B' : theme.border
                }
              ]}>
                {agreeToTerms && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.termsText, { color: theme.secondary }]}>
                  I agree to the{' '}
                  <Text style={[styles.termsLink, { color: theme.primary }]}>
                    Terms and Conditions
                  </Text>
                  {' '}and{' '}
                  <Text style={[styles.termsLink, { color: theme.primary }]}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </Pressable>
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, { backgroundColor: theme.primary, height: buttonHeight }]}
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={[styles.signInText, { color: theme.secondary }]}>Already have an account? </Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SignIn')}
            >
              <Text style={[styles.signInLink, { color: theme.primary }]}>Sign In</Text>
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
  formSection: { gap: 20 },
  nameRow: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
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
  termsContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  checkbox: { 
    width: 24, 
    height: 24, 
    borderRadius: 8, 
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  termsText: { fontSize: 13, fontWeight: '500', lineHeight: 20 },
  termsLink: { fontWeight: '700' },
  signUpButton: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 }
    })
  },
  signUpButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontWeight: '600' },
  socialContainer: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginBottom: 16 },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  signInContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  signInText: { fontSize: 14, fontWeight: '500' },
  signInLink: { fontSize: 14, fontWeight: '800' }
});
