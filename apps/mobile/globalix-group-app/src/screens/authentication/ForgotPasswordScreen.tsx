import React, { useState, useCallback } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { authApi } from '../../services/apiClient';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  
  // Responsive sizing
  const titleSize = width > 600 ? 36 : 28;
  const subtitleSize = width > 600 ? 18 : 16;
  const inputHeight = 56;
  const buttonHeight = 56;
  const horizontalPadding = width * 0.06;
  
  const validateForm = useCallback(() => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email]);
  
  const handleSendReset = useCallback(async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      if (!response.success) {
        throw new Error(response.error || 'Failed to send reset email');
      }
      setSent(true);
    } catch (error) {
      setErrors({ email: 'Failed to send reset email. Try again.' });
    } finally {
      setLoading(false);
    }
  }, [validateForm]);
  
  if (sent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.successSection, { paddingHorizontal: horizontalPadding }]}>
            <TouchableOpacity 
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SignIn')}
            >
              <Ionicons name="chevron-back" size={24} color={theme.primary} />
            </TouchableOpacity>

            <View style={[styles.successIcon, { backgroundColor: theme.card }]}>
              <Ionicons name="checkmark-circle" size={80} color={theme.primary} />
            </View>

            <Text style={[styles.successTitle, { color: theme.text, fontSize: titleSize }]}>
              Check Your Email
            </Text>
            
            <Text style={[styles.successText, { color: theme.secondary }]}>
              We've sent a password reset link to{'\n'}
              <Text style={{ fontWeight: '700', color: theme.text }}>{email}</Text>
            </Text>

            <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="information-circle" size={20} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.secondary }]}>
                The reset link will expire in 24 hours. If you don't see the email, check your spam folder.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.backToSignInButton, { backgroundColor: theme.primary }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('SignIn')}
            >
              <Text style={styles.backToSignInButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
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
            
            <Text style={[styles.title, { color: theme.text, fontSize: titleSize }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: theme.secondary, fontSize: subtitleSize }]}>
              Enter your email to receive a password reset link
            </Text>
          </View>

          {/* Form Section */}
          <View style={[styles.formSection, { paddingHorizontal: horizontalPadding }]}>
            
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
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

            {/* Send Reset Link Button */}
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: theme.primary, height: buttonHeight }]}
              activeOpacity={0.85}
              onPress={handleSendReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>Send Reset Link</Text>
              )}
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
  scrollContent: { paddingBottom: 50, flexGrow: 1 },
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
  sendButton: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 }
    })
  },
  sendButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  successSection: { paddingVertical: 40, flex: 1, justifyContent: 'center' },
  successIcon: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginVertical: 40,
    alignSelf: 'center'
  },
  successTitle: { fontWeight: '900', marginBottom: 16, textAlign: 'center', letterSpacing: 0.3 },
  successText: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 32, fontWeight: '500' },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 40
  },
  infoText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 20 },
  backToSignInButton: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 }
    })
  },
  backToSignInButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});
