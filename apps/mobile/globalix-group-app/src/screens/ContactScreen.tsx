/**
 * ContactScreen.tsx
 * Property inquiry contact form for users to reach out to agents
 * Features: Form submission, WhatsApp integration, property reference
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

// 2. Third party & context
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { contactsApi } from '../services/apiClient';

// ===== CONSTANTS & DATA =====
const WHATSAPP_NUMBER = '+1234567890';
const DEFAULT_PROPERTY = 'General Inquiry';

// ===== INTERFACES & TYPES =====
interface ContactScreenProps {
  navigation: any;
  route: any;
}

// ===== MAIN COMPONENT =====
export const ContactScreen: React.FC<ContactScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme, isDark } = useTheme();
  const propertyTitle = route.params?.title || DEFAULT_PROPERTY;
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: `I am interested in ${propertyTitle}. Please share more details.`,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert('Missing Info', 'Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await contactsApi.create({
        name: form.name,
        email: form.email,
        message: form.message,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to send inquiry');
      }

      Alert.alert('Inquiry Sent', 'Your message has been sent to our team.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Send Failed', error.message || 'Unable to send your inquiry.');
    } finally {
      setLoading(false);
    }
  }, [form, navigation]);

  // ===== RENDER =====
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ===== HEADER ===== */}
          <TouchableOpacity
            style={styles.closeHeader}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="close-circle"
              size={32}
              color={isDark ? theme.secondary : '#666'}
            />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            Contact Globalix Agent
          </Text>
          <Text style={[styles.subTitle, { color: theme.secondary }]}>
            Inquiry for: {propertyTitle}
          </Text>

          {/* ===== FORM SECTION ===== */}
          <View style={styles.form}>
            {/* Full Name */}
            <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="John Doe"
              placeholderTextColor={isDark ? '#555' : '#999'}
              value={form.name}
              onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
            />

            {/* Email */}
            <Text style={[styles.label, { color: theme.text }]}>
              Email Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="john@example.com"
              keyboardType="email-address"
              placeholderTextColor={isDark ? '#555' : '#999'}
              value={form.email}
              onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
            />

            {/* Message */}
            <Text style={[styles.label, { color: theme.text }]}>Message</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="I am interested in this property..."
              multiline
              numberOfLines={4}
              placeholderTextColor={isDark ? '#555' : '#999'}
              value={form.message}
              onChangeText={(text) => setForm((prev) => ({ ...prev, message: text }))}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>{loading ? 'Sending...' : 'Send Inquiry'}</Text>
            </TouchableOpacity>
          </View>

          {/* ===== QUICK ACTIONS SECTION ===== */}
          <View style={[styles.quickActions, { borderTopColor: theme.border }]}>
            <Text style={[styles.sectionHeader, { color: theme.text }]}>
              Quick Connect
            </Text>
            <TouchableOpacity style={styles.whatsappBtn}>
              <Ionicons
                name="logo-whatsapp"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.whatsappText}>Chat on WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  content: { padding: 25 },

  // Header
  closeHeader: { alignSelf: 'flex-end', marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subTitle: { fontSize: 15, fontWeight: '500', marginTop: 5, marginBottom: 35 },

  // Form section
  form: { gap: 18 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: -8, marginLeft: 5 },
  input: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  textArea: { height: 120, textAlignVertical: 'top' },

  // Buttons
  sendButton: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#004aad',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Quick actions
  quickActions: { marginTop: 40, borderTopWidth: 1, paddingTop: 30 },
  sectionHeader: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  whatsappBtn: {
    backgroundColor: '#25D366',
    padding: 18,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});