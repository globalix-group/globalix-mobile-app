/**
 * InquireScreen.tsx
 * Vehicle inquiry form for users to submit property inquiries
 * Features: Vehicle summary, form submission, validation, alerts
 */

// ===== IMPORTS (3 groups with blank lines between) =====
// 1. React & RN core
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  KeyboardTypeOptions,
} from 'react-native';

// 2. Third party & context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { contactsApi } from '../services/apiClient';

// ===== INTERFACES & TYPES =====
interface InquireScreenProps {
  route: any;
  navigation: any;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface InputFieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  theme: any;
}

interface VehicleItem {
  name: string;
  image: string;
  price: string;
}

// ===== HELPER COMPONENTS =====
const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
  theme,
}) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.label, { color: theme.secondary }]}>{label}</Text>
    <View
      style={[
        styles.inputContainer,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={theme.primary}
        style={styles.inputIcon}
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          { color: theme.text },
          multiline && {
            height: 100,
            paddingTop: 12,
            textAlignVertical: 'top',
          },
        ]}
      />
    </View>
  </View>
);

// ===== MAIN COMPONENT =====
export const InquireScreen: React.FC<InquireScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme, isDark } = useTheme();
  const { item } = (route.params || {}) as { item?: VehicleItem };

  // ===== STATE =====
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    message: `I am interested in the ${item?.name || 'this vehicle'}. Please provide more details regarding availability.`,
  });
  const [loading, setLoading] = useState(false);

  // ===== HANDLERS =====
  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Missing Info', 'Please provide at least your name and email.');
      return;
    }

    setLoading(true);
    try {
      const response = await contactsApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to send inquiry');
      }

      Alert.alert(
        'Inquiry Sent',
        `Thank you, ${form.name}. A Globalix agent will contact you shortly regarding the ${item?.name}.`,
        [{ text: 'Great', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Send Failed', error.message || 'Unable to send your inquiry.');
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDER =====
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===== HEADER ===== */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Inquire Now
            </Text>
          </View>

          {/* ===== VEHICLE SUMMARY CARD ===== */}
          {item && (
            <View
              style={[
                styles.carSummary,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.summaryImage}
              />
              <View style={styles.summaryInfo}>
                <Text style={[styles.summaryName, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text
                  style={[styles.summaryPrice, { color: theme.primary }]}
                >
                  {item.price}
                </Text>
              </View>
            </View>
          )}

          {/* ===== FORM SECTION ===== */}
          <View style={styles.form}>
            <InputField
              label="Full Name"
              icon="person-outline"
              placeholder="John Doe"
              value={form.name}
              theme={theme}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
            <InputField
              label="Email Address"
              icon="mail-outline"
              placeholder="john@example.com"
              keyboardType="email-address"
              value={form.email}
              theme={theme}
              onChangeText={(t) => setForm({ ...form, email: t })}
            />
            <InputField
              label="Phone Number"
              icon="call-outline"
              placeholder="+1 (555) 000-0000"
              keyboardType="phone-pad"
              value={form.phone}
              theme={theme}
              onChangeText={(t) => setForm({ ...form, phone: t })}
            />
            <InputField
              label="Message"
              icon="chatbubble-outline"
              placeholder="Tell us more..."
              multiline={true}
              value={form.message}
              theme={theme}
              onChangeText={(t) => setForm({ ...form, message: t })}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitBtnText}>Send Inquiry</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
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
  scrollContent: { padding: 20 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: '800', marginLeft: 15 },

  // Vehicle summary
  carSummary: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 30,
  },
  summaryImage: { width: 80, height: 60, borderRadius: 12 },
  summaryInfo: { marginLeft: 15 },
  summaryName: { fontSize: 16, fontWeight: '700' },
  summaryPrice: { fontSize: 14, fontWeight: '600', marginTop: 2 },

  // Form section
  form: { gap: 20 },

  // Input field
  inputWrapper: { gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, fontSize: 15, fontWeight: '500' },

  // Submit button
  submitBtn: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
    shadowColor: '#004aad',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});