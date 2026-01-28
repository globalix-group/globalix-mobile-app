/**
 * DocsScreen.tsx
 * Immigration documentation and resources for Canada (Study, Work, PR)
 * Features: IRCC materials, PDFs, live meeting integration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface Document {
  id: string;
  title: string;
  description: string;
  type: 'study' | 'work' | 'pr' | 'general';
  url?: string;
  icon: string;
}

interface MeetingInfo {
  title: string;
  date: string;
  time: string;
  platform: string;
  link: string;
}

export const DocsScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'study' | 'work' | 'pr'>('all');

  // Document categories
  const categories = [
    { id: 'all', label: 'All', icon: 'document-text' },
    { id: 'study', label: 'Study', icon: 'school' },
    { id: 'work', label: 'Work', icon: 'briefcase' },
    { id: 'pr', label: 'PR', icon: 'home' },
  ];

  // Sample documents (these would be dynamically loaded from backend)
  const documents: Document[] = [
    {
      id: '1',
      title: 'Study Permit Guide',
      description: 'Complete guide for international students applying for study permits',
      type: 'study',
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html',
      icon: 'school',
    },
    {
      id: '2',
      title: 'Work Permit Requirements',
      description: 'Updated requirements and process for work permits in Canada',
      type: 'work',
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html',
      icon: 'briefcase',
    },
    {
      id: '3',
      title: 'Express Entry Guide',
      description: 'Step-by-step guide to permanent residency through Express Entry',
      type: 'pr',
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html',
      icon: 'home',
    },
    {
      id: '4',
      title: 'Provincial Nominee Program',
      description: 'Information about PNP pathways to permanent residency',
      type: 'pr',
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html',
      icon: 'map',
    },
    {
      id: '5',
      title: 'Post-Graduation Work Permit',
      description: 'PGWP eligibility and application process for graduates',
      type: 'work',
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation.html',
      icon: 'document',
    },
    {
      id: '6',
      title: 'Travel Documents Checklist',
      description: 'Essential documents needed for traveling to Canada',
      type: 'general',
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html',
      icon: 'airplane',
    },
  ];

  // Upcoming live meetings
  const meetings: MeetingInfo[] = [
    {
      title: 'Study Permit Q&A Session',
      date: 'Feb 15, 2026',
      time: '3:00 PM EST',
      platform: 'Zoom',
      link: 'https://zoom.us/j/meeting-id', // Replace with actual meeting link
    },
    {
      title: 'Express Entry Workshop',
      date: 'Feb 20, 2026',
      time: '5:00 PM EST',
      platform: 'Google Meet',
      link: 'https://meet.google.com/meeting-id', // Replace with actual meeting link
    },
  ];

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === selectedCategory);

  const handleOpenDocument = async (url?: string) => {
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    }
  };

  const handleJoinMeeting = async (link: string) => {
    const supported = await Linking.canOpenURL(link);
    if (supported) {
      await Linking.openURL(link);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Immigration Docs
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Study, Work & PR Resources
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filters */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category.id 
                      ? theme.primary 
                      : isDark ? '#2C2C2C' : '#F5F5F5',
                  },
                ]}
                onPress={() => setSelectedCategory(category.id as any)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={18}
                  color={selectedCategory === category.id ? '#FFF' : theme.text}
                />
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: selectedCategory === category.id ? '#FFF' : theme.text,
                    },
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* IRCC Official Resources */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Official IRCC Resources
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Updated materials from Immigration, Refugees and Citizenship Canada
          </Text>
        </View>

        {/* Documents List */}
        <View style={styles.documentsContainer}>
          {filteredDocuments.map(doc => (
            <TouchableOpacity
              key={doc.id}
              style={[
                styles.documentCard,
                {
                  backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                  borderColor: isDark ? '#333' : '#E0E0E0',
                },
              ]}
              onPress={() => handleOpenDocument(doc.url)}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
                <Ionicons name={doc.icon as any} size={24} color={theme.primary} />
              </View>
              <View style={styles.documentContent}>
                <Text style={[styles.documentTitle, { color: theme.text }]}>
                  {doc.title}
                </Text>
                <Text style={[styles.documentDescription, { color: theme.textSecondary }]}>
                  {doc.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Live Meetings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="videocam" size={24} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Live Meetings
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Join our live sessions with immigration consultants
          </Text>
        </View>

        {/* Meetings List */}
        <View style={styles.meetingsContainer}>
          {meetings.map((meeting, index) => (
            <View
              key={index}
              style={[
                styles.meetingCard,
                {
                  backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                  borderColor: isDark ? '#333' : '#E0E0E0',
                },
              ]}
            >
              <View style={styles.meetingHeader}>
                <View style={[styles.liveBadge, { backgroundColor: theme.accent }]}>
                  <Text style={styles.liveBadgeText}>Upcoming</Text>
                </View>
                <Text style={[styles.meetingPlatform, { color: theme.textSecondary }]}>
                  {meeting.platform}
                </Text>
              </View>
              <Text style={[styles.meetingTitle, { color: theme.text }]}>
                {meeting.title}
              </Text>
              <View style={styles.meetingInfo}>
                <View style={styles.meetingInfoRow}>
                  <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.meetingInfoText, { color: theme.textSecondary }]}>
                    {meeting.date}
                  </Text>
                </View>
                <View style={styles.meetingInfoRow}>
                  <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.meetingInfoText, { color: theme.textSecondary }]}>
                    {meeting.time}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.joinButton, { backgroundColor: theme.primary }]}
                onPress={() => handleJoinMeeting(meeting.link)}
              >
                <Ionicons name="videocam" size={20} color="#FFF" />
                <Text style={styles.joinButtonText}>Join Meeting</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Contact Support */}
        <View
          style={[
            styles.supportCard,
            {
              backgroundColor: isDark ? '#1C1C1C' : '#F8F9FA',
              borderColor: isDark ? '#333' : '#E0E0E0',
            },
          ]}
        >
          <Ionicons name="help-circle" size={32} color={theme.primary} />
          <Text style={[styles.supportTitle, { color: theme.text }]}>
            Need Help?
          </Text>
          <Text style={[styles.supportText, { color: theme.textSecondary }]}>
            Our immigration consultants are here to assist you
          </Text>
          <TouchableOpacity
            style={[styles.supportButton, { borderColor: theme.primary }]}
          >
            <Text style={[styles.supportButtonText, { color: theme.primary }]}>
              Contact Support
            </Text>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  documentsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentContent: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  meetingsContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  meetingCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  liveBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  meetingPlatform: {
    fontSize: 12,
    fontWeight: '500',
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  meetingInfo: {
    gap: 8,
    marginBottom: 16,
  },
  meetingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingInfoText: {
    fontSize: 14,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  supportCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  supportButton: {
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
