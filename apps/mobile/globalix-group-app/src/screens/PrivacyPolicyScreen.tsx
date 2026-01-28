import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const POLICY_SECTIONS = [
  {
    id: '1',
    title: 'Introduction',
    content: 'Globalix Group ("we", "us", "our") operates the Globalix mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.'
  },
  {
    id: '2',
    title: 'Information Collection and Use',
    content: 'We collect several different types of information for various purposes to provide and improve our Service to you.\n\nTypes of Data Collected:\n\n• Personal Data: While using our Service, we may ask you to provide us with certain personally identifiable information ("Personal Data") including but not limited to your email address, name, phone number, and payment information.\n\n• Usage Data: We may also collect information on how the Service is accessed and used ("Usage Data"), including the device type, browser type, pages visited, and the time and date of your visits.'
  },
  {
    id: '3',
    title: 'Use of Data',
    content: 'Globalix Group uses the collected data for various purposes including:\n\n• To provide and maintain the Service\n• To notify you about changes to our Service\n• To allow you to participate in interactive features of our Service\n• To provide customer care and support\n• To gather analysis or valuable information so that we can improve the Service\n• To monitor the usage of our Service'
  },
  {
    id: '4',
    title: 'Security of Data',
    content: 'The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.'
  },
  {
    id: '5',
    title: 'Changes to This Privacy Policy',
    content: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the bottom of this Privacy Policy.\n\nYou are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.'
  },
  {
    id: '6',
    title: 'Contact Us',
    content: 'If you have any questions about this Privacy Policy, please contact us at:\n\nGlobalix Group\nEmail: emmadivine214@gmail.com\nPhone: +1 (365) 384-5983\nAddress: Hamilton, Ontario, Canada'
  }
];

export const PrivacyPolicyScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const SectionItem = ({ section }: any) => (
    <View style={[styles.sectionItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        {section.title}
      </Text>
      <Text style={[styles.sectionContent, { color: theme.secondary }]}>
        {section.content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: width * 0.05 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Policy Intro */}
        <View style={[styles.introCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="shield-checkmark" size={40} color={theme.primary} />
          <Text style={[styles.introTitle, { color: theme.text }]}>
            Your Privacy Matters
          </Text>
          <Text style={[styles.introText, { color: theme.secondary }]}>
            Last updated: January 2026
          </Text>
        </View>

        {/* Policy Sections */}
        <View style={[styles.sectionsContainer, { paddingHorizontal: width * 0.05 }]}>
          {POLICY_SECTIONS.map((section) => (
            <SectionItem key={section.id} section={section} />
          ))}
        </View>

        {/* Bottom Info */}
        <View style={[styles.infoBox, { backgroundColor: theme.primary, marginHorizontal: width * 0.05, marginBottom: 20 }]}>
          <Ionicons name="information-circle" size={20} color="#FFF" />
          <Text style={styles.infoText}>
            By using Globalix, you agree to this Privacy Policy. If you do not agree, please do not use our Service.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 }
    })
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  sectionItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 }
    })
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  sectionContent: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 }
    })
  },
  infoText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
});
