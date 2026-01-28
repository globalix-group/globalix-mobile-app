# 🎯 Globalix App - Clean Code Standards & Structure Guide

## Overview
This document defines the unified clean code standards and file structure patterns used across the Globalix mobile application. All screens and components follow this structure to ensure consistency, maintainability, and code quality.

---

## 📋 Unified File Structure

Every screen and component file should follow this exact structure:

### 1. **File Header (JSDoc Comment)**
```tsx
/**
 * FileName.tsx
 * One-line description of what the screen/component does
 * Optional: Key features or main responsibilities
 */
```

### 2. **Imports (3 Groups with Blank Lines)**

**Group 1: React & React Native Core**
```tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  // ... other RN imports alphabetically
} from 'react-native';
```

**Group 2: Third-Party & Context (alphabetically)**
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { useTheme } from '../theme/ThemeContext';
```

**Group 3: Local Components & Utilities**
```tsx
import { GlobalixHeader } from '../components/GlobalixHeader';
import { CustomComponent } from '../components/CustomComponent';
```

### 3. **Constants & Data Section**
```tsx
/* ============================================================================
   CONSTANTS & DATA
   ============================================================================ */

const PROPERTY_DATA = [{ /* ... */ }];
const CATEGORIES = ['Villas', 'Penthouses', 'Estates'];
const DEFAULT_ZOOM = 16;
```

**Naming Convention for Constants:**
- Use `UPPER_SNAKE_CASE` for all constants
- Group related constants together
- Add comments for non-obvious values

### 4. **Interfaces & Types Section**
```tsx
/* ============================================================================
   INTERFACES & TYPES
   ============================================================================ */

interface ScreenNameProps {
  navigation: any;
}

interface ComponentProps {
  title: string;
  onPress: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
}
```

**Interface Naming:**
- Suffix screen props with `ScreenProps`
- Suffix component props with `Props` or descriptive name
- Define all interfaces before components

### 5. **Helper Components Section** (if applicable)
```tsx
/* ============================================================================
   HELPER COMPONENTS
   ============================================================================ */

interface PropertyCardProps {
  item: typeof PROPERTY_DATA[0];
  navigation: any;
  theme: any;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ item, navigation, theme }) => (
  // Component JSX
);
```

### 6. **Main Component Section**
```tsx
/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

export const ScreenName: React.FC<ScreenNameProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  // ===== STATE =====
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ===== RESPONSIVE SIZING =====
  const isTablet = width > 600;
  const cardWidth = isTablet ? width * 0.6 : width * 0.85;
  const padding = width * 0.05;

  // ===== MEMOIZED VALUES =====
  const filteredData = useMemo(() => {
    return DATA.filter(item => item.category === selectedItem);
  }, [selectedItem]);

  // ===== HANDLERS =====
  const handleItemPress = useCallback((id: string) => {
    setSelectedItem(id);
  }, []);

  // ===== RENDER =====
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* JSX content */}
    </SafeAreaView>
  );
};
```

### 7. **Styles Section**
```tsx
/* ============================================================================
   STYLES
   ============================================================================ */

const styles = StyleSheet.create({
  // Layout group
  container: { flex: 1 },
  scrollContent: { paddingBottom: 150 },

  // Header/Section group
  sectionHeader: { marginVertical: 12 },
  sectionTitle: { fontWeight: '800', fontSize: 24 },

  // Card group
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  cardImage: { width: '100%', height: 200 },
  cardInfo: { padding: 16 },

  // Empty state group
  emptyContainer: { alignItems: 'center', marginVertical: 40 },
  emptyText: { marginTop: 12, fontWeight: '600' },
});
```

---

## 🎨 Style Organization Rules

### Grouping Related Styles
Group styles by component or logical section:
```tsx
const styles = StyleSheet.create({
  // Layout
  container: {},
  scrollContent: {},

  // Header
  header: {},
  title: {},

  // Cards
  card: {},
  cardImage: {},
  cardInfo: {},

  // Buttons
  button: {},
  buttonText: {},

  // Empty States
  emptyContainer: {},
  emptyText: {},
});
```

### Naming Conventions for Styles
- Use descriptive, hierarchical names
- Prefix styles with component type when appropriate
- Keep names lowercase with underscores
- Examples: `cardImage`, `sectionHeader`, `emptyContainer`

### Platform-Specific Styles
```tsx
featuredCard: {
  borderRadius: 28,
  borderWidth: 1,
  overflow: 'hidden',
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 5 },
  }),
}
```

### Theme Integration
All colors should come from theme context:
```tsx
<Text style={[styles.title, { color: theme.text }]}>Title</Text>
<View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
```

---

## 📱 Responsive Design Standards

### Always Include Responsive Sizing
```tsx
const { width, height } = useWindowDimensions();

// ===== RESPONSIVE SIZING =====
const isTablet = width > 600;
const cardWidth = isTablet ? width * 0.75 : width * 0.85;
const padding = width * 0.05;
const fontSize = isTablet ? 18 : 16;
```

### Breakpoints
- **Mobile:** width < 600
- **Tablet:** width >= 600
- **Desktop:** width > 900 (handle if applicable)

### Responsive Padding
Use percentage-based padding:
```tsx
const horizontalPadding = width * 0.05;  // 5% of screen width
const cardWidth = width * 0.85;          // 85% of screen width
```

---

## 🔄 State Management Standards

### Organization Order in Component
1. **Theme & Dimensions Hook**
   ```tsx
   const { theme, isDark } = useTheme();
   const { width, height } = useWindowDimensions();
   ```

2. **State (useState)**
   ```tsx
   const [selectedItem, setSelectedItem] = useState<string | null>(null);
   const [loading, setLoading] = useState(false);
   ```

3. **Responsive Sizing**
   ```tsx
   const isTablet = width > 600;
   const cardWidth = isTablet ? width * 0.75 : width * 0.85;
   ```

4. **Memoized Values (useMemo)**
   ```tsx
   const filteredItems = useMemo(() => {
     return ITEMS.filter(item => item.type === selectedType);
   }, [selectedType]);
   ```

5. **Event Handlers (useCallback)**
   ```tsx
   const handlePress = useCallback((id: string) => {
     setSelectedItem(id);
   }, []);
   ```

6. **JSX (return statement)**

---

## ✅ Code Quality Checklist

- [ ] File has proper JSDoc header
- [ ] Imports organized in 3 groups (React/RN, Third-party, Local)
- [ ] All constants defined before component
- [ ] All interfaces/types defined before component
- [ ] Helper components defined before main component
- [ ] Main component exported as `React.FC<Props>`
- [ ] Component sections clearly marked with divider comments
- [ ] STATE section at top of component
- [ ] RESPONSIVE SIZING section includes width check
- [ ] Memoized values use useMemo
- [ ] Event handlers use useCallback with proper dependencies
- [ ] All styles grouped logically
- [ ] All colors come from theme context
- [ ] No unused imports (verify with `tsc --noEmit`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Responsive design works on mobile and tablet
- [ ] Platform-specific styles use `Platform.select()`

---

## 🔧 Common Patterns

### Input Field Component
```tsx
<View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
  <Ionicons name="mail" size={20} color={theme.secondary} />
  <TextInput
    style={[styles.input, { color: theme.text }]}
    placeholder="Placeholder text"
    placeholderTextColor={theme.secondary}
    value={value}
    onChangeText={setValue}
  />
</View>
```

### Button Component
```tsx
<TouchableOpacity
  style={[styles.button, { backgroundColor: theme.primary }]}
  activeOpacity={0.85}
  onPress={handlePress}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator color="#FFF" />
  ) : (
    <Text style={styles.buttonText}>Button Text</Text>
  )}
</TouchableOpacity>
```

### Section with Header
```tsx
<View style={styles.section}>
  <Text style={[styles.sectionTitle, { color: theme.text }]}>Section Title</Text>
  <FlatList
    data={data}
    scrollEnabled={false}
    contentContainerStyle={styles.sectionContent}
    renderItem={({ item }) => <ItemComponent item={item} />}
  />
</View>
```

### Conditional Rendering with Empty State
```tsx
{filteredItems.length > 0 ? (
  <FlatList
    data={filteredItems}
    scrollEnabled={false}
    renderItem={({ item }) => <Item item={item} />}
  />
) : (
  <View style={styles.emptyContainer}>
    <Ionicons name="inbox-outline" size={60} color={theme.border} />
    <Text style={[styles.emptyText, { color: theme.secondary }]}>No items found</Text>
  </View>
)}
```

---

## 🎯 Files Following This Standard

### ✅ Fully Refactored Screens
- `HomeScreen.tsx` - Premium properties display with category filtering
- `ProfileScreen.tsx` - User profile with preferences
- `GlobalixHeader.tsx` - Shared header component
- `SignInScreen.tsx` - Authentication entry point
- `SplashScreen.tsx` - App launch screen

### ✅ Maintains Standard Structure
- `ExploreScreen.tsx` - Interactive map exploration
- `CarsScreen.tsx` - Luxury car browsing with filtering
- `OnboardingScreen.tsx` - 4-slide feature carousel
- `HelpCenterScreen.tsx` - FAQ and support
- `PrivacyPolicyScreen.tsx` - Privacy information
- `NotificationsScreen.tsx` - Notification preferences
- And all other screens...

---

## 📚 TypeScript Best Practices

### Component Props Interface
```tsx
interface MyComponentProps {
  title: string;
  onPress: () => void;
  items: typeof DATA[0][];
  theme: any;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onPress, items, theme }) => {
  // Component code
};
```

### Avoid `any` Type
```tsx
// ❌ Bad
const handlePress = (item: any) => {}

// ✅ Good
interface Item {
  id: string;
  title: string;
}
const handlePress = (item: Item) => {}
```

### Proper Error Typing
```tsx
interface FormErrors {
  email?: string;
  password?: string;
}

const [errors, setErrors] = useState<FormErrors>({});
```

---

## 🚀 Performance Best Practices

### Use useMemo for Expensive Operations
```tsx
const filteredData = useMemo(() => {
  return largeDataSet.filter(item => item.active);
}, [largeDataSet]);
```

### Use useCallback for Event Handlers
```tsx
const handlePress = useCallback((id: string) => {
  setSelected(id);
}, []);
```

### FlatList with keyExtractor
```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  scrollEnabled={false}
  renderItem={({ item }) => <Item item={item} />}
/>
```

---

## 🔍 Verification Commands

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check specific files
npx tsc --noEmit src/screens/HomeScreen.tsx

# Format code (if prettier is configured)
npx prettier --write src/screens/
```

---

## 📝 Summary

This unified structure ensures:
- ✅ **Consistency** - All files follow the same pattern
- ✅ **Readability** - Clear sections and organization
- ✅ **Maintainability** - Easy to find and modify code
- ✅ **Scalability** - New screens follow established patterns
- ✅ **Quality** - Proper TypeScript typing and best practices
- ✅ **Performance** - useMemo and useCallback for optimization
- ✅ **Responsiveness** - Adaptive layouts for all device sizes
- ✅ **Theme Integration** - Consistent theme application

---

**Last Updated:** January 26, 2026  
**Status:** ✅ All screens refactored and verified
