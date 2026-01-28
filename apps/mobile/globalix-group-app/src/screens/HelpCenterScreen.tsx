import React, { useState } from 'react';
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

const FAQS = [
  {
    id: '1',
    question: 'How do I list a property?',
    answer: 'To list a property on Globalix, go to your profile, tap "Add Listing", fill in the property details, upload photos, and set your pricing. Your listing will be reviewed within 24 hours.'
  },
  {
    id: '2',
    question: 'How do I contact a seller?',
    answer: 'Navigate to any property or vehicle listing and tap "Contact Globalix Agent" or "Inquire". Our team will get back to you within 24 hours with more information.'
  },
  {
    id: '3',
    question: 'What payment methods do you accept?',
    answer: 'We accept credit cards (Visa, Mastercard), bank transfers, and digital wallets. All transactions are secure and verified through our payment partners.'
  },
  {
    id: '4',
    question: 'How is my information kept secure?',
    answer: 'We use industry-standard encryption and security protocols. Your personal and financial information is protected and never shared with third parties without consent.'
  },
  {
    id: '5',
    question: 'Can I change my listing after posting?',
    answer: 'Yes! You can edit your listings anytime from your profile. Changes will be reflected immediately on the platform.'
  },
  {
    id: '6',
    question: 'Is there a fee to list properties or vehicles?',
    answer: 'Listing is free! We only charge a commission when a transaction is completed. Check our pricing page for detailed fee information.'
  }
];

export const HelpCenterScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const FAQItem = ({ item }: any) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={[styles.faqItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.faqQuestion, { color: theme.text, flex: 1 }]}>
            {item.question}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.primary}
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={[styles.faqContent, { borderTopColor: theme.border }]}>
            <Text style={[styles.faqAnswer, { color: theme.secondary }]}>
              {item.answer}
            </Text>
          </View>
        )}
      </View>
    );
  };

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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Help Intro */}
        <View style={[styles.introCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="help-circle" size={40} color={theme.primary} />
          <Text style={[styles.introTitle, { color: theme.text }]}>
            Frequently Asked Questions
          </Text>
          <Text style={[styles.introText, { color: theme.secondary }]}>
            Find answers to common questions about using Globalix
          </Text>
        </View>

        {/* Contact Support Card */}
        <View style={[styles.contactCard, { backgroundColor: theme.primary }]}>
          <View>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactText}>Reach out to our support team</Text>
          </View>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Ionicons name="mail" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={[styles.faqsContainer, { paddingHorizontal: width * 0.05 }]}>
          {FAQS.map((faq) => (
            <FAQItem key={faq.id} item={faq} />
          ))}
        </View>

        {/* Resources Section */}
        <View style={[styles.resourcesContainer, { paddingHorizontal: width * 0.05 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Resources</Text>
          
          <TouchableOpacity
            style={[styles.resourceItem, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.resourceIcon, { backgroundColor: `${theme.primary}20` }]}>
              <Ionicons name="book" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resourceTitle, { color: theme.text }]}>User Guide</Text>
              <Text style={[styles.resourceDesc, { color: theme.secondary }]}>
                Learn how to use Globalix
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resourceItem, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.resourceIcon, { backgroundColor: `${theme.primary}20` }]}>
              <Ionicons name="bug" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resourceTitle, { color: theme.text }]}>Report a Bug</Text>
              <Text style={[styles.resourceDesc, { color: theme.secondary }]}>
                Help us improve the app
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resourceItem, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.resourceIcon, { backgroundColor: `${theme.primary}20` }]}>
              <Ionicons name="megaphone" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resourceTitle, { color: theme.text }]}>Feedback</Text>
              <Text style={[styles.resourceDesc, { color: theme.secondary }]}>
                Share your suggestions with us
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.secondary} />
          </TouchableOpacity>
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
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 3 }
    })
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  faqContent: {
    borderTopWidth: 1,
    padding: 16,
  },
  faqAnswer: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  resourcesContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  resourceDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
});
