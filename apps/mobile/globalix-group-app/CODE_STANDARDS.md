# Clean Code Standards - Globalix App

This document defines the unified code structure and standards for the Globalix React Native application. All screens, components, and utilities must follow this pattern to ensure consistency, maintainability, and scalability.

---

## File Structure Template

Every TypeScript/TSX file should follow this exact structure:

```typescript
/**
 * FileName.tsx
 * One-line description of what the screen/component does
 * Optional: List key features or main responsibilities
 */

/* ============================================================================
   IMPORTS
   ============================================================================ */

// Group 1: React & React Native Core
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';

// Group 2: Third Party & Context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// Group 3: Local Components & Utils
import { GlobalixHeader } from '../components/GlobalixHeader';
import { utilFunction } from '../utils/helpers';

/* ============================================================================
   CONSTANTS & DATA
   ============================================================================ */

const CONSTANT_NAME = 'value';
const DATA_ARRAY = [
  { id: '1', name: 'Item 1' },
  // ...
];
const CATEGORIES = ['Category1', 'Category2'];

/* ============================================================================
   INTERFACES & TYPES
   ============================================================================ */

interface ScreenNameProps {
  navigation: any;
  route?: any;
}

interface HelperComponentProps {
  title: string;
  onPress: () => void;
  theme: any;
}

interface DataItem {
  id: string;
  name: string;
}

/* ============================================================================
   HELPER COMPONENTS
   ============================================================================ */

/**
 * HelperComponent
 * Brief description of what this component does
 */
const HelperComponent: React.FC<HelperComponentProps> = ({
  title,
  onPress,
  theme,
}) => (
  <TouchableOpacity
    style={[styles.helperContainer, { backgroundColor: theme.card }]}
    onPress={onPress}
  >
    <Text style={[styles.helperText, { color: theme.text }]}>{title}</Text>
  </TouchableOpacity>
);

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

export const ScreenName: React.FC<ScreenNameProps> = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  /* ========================================================================
     STATE
     ======================================================================== */

  const [state1, setState1] = useState<string>('');
  const [state2, setState2] = useState<boolean>(false);
  const [data, setData] = useState<DataItem[]>([]);

  /* ========================================================================
     RESPONSIVE SIZING
     ======================================================================== */

  const isTablet = width > 600;
  const horizontalPadding = width * 0.05;
  const cardWidth = isTablet ? width * 0.75 : width * 0.85;
  const titleSize = isTablet ? 26 : 22;

  /* ========================================================================
     MEMOIZED VALUES
     ======================================================================== */

  const filteredData = useMemo(
    () => data.filter((item) => item.name.includes(state1)),
    [data, state1]
  );

  const computedValue = useMemo(() => {
    return width * 0.6;
  }, [width]);

  /* ========================================================================
     HANDLERS
     ======================================================================== */

  const handleAction = useCallback(() => {
    // Action logic
  }, [dependencyArray]);

  const handleNavigation = useCallback(() => {
    navigation.navigate('ScreenName');
  }, [navigation]);

  /* ========================================================================
     RENDER
     ======================================================================== */

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <GlobalixHeader subtitle="Section Title" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {/* Section Header */}
        <View style={[styles.sectionHeader, { paddingHorizontal: horizontalPadding }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: titleSize }]}>
            Title
          </Text>
        </View>

        {/* Content */}
        <View style={[styles.contentContainer, { paddingHorizontal: horizontalPadding }]}>
          {filteredData.map((item) => (
            <HelperComponent
              key={item.id}
              title={item.name}
              onPress={handleAction}
              theme={theme}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ============================================================================
   STYLES
   ============================================================================ */

const styles = StyleSheet.create({
  // Layout & Container Styles
  container: { flex: 1 },
  scrollContent: { paddingBottom: 150 },
  contentContainer: { marginVertical: 16 },

  // Section Styles
  sectionHeader: { marginVertical: 12 },
  sectionTitle: { fontWeight: '800', letterSpacing: 0.3 },

  // Component Styles (prefixed with component name)
  helperContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  helperText: { fontSize: 14, fontWeight: '600' },
});
```

---

## Naming Conventions

### Files
- **Screens**: `ScreenNameScreen.tsx` (e.g., `HomeScreen.tsx`, `ProfileScreen.tsx`)
- **Components**: `ComponentName.tsx` (e.g., `GlobalixHeader.tsx`)
- **Utilities**: `featureName.ts` (e.g., `helpers.ts`, `validation.ts`)
- **Themes**: `ThemeContext.tsx`

### Variables & Constants
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `PROPERTY_DATA`, `CATEGORIES`)
- **Variables**: `camelCase` (e.g., `firstName`, `userData`)
- **Booleans**: Prefix with `is` or `has` (e.g., `isTablet`, `hasError`)
- **Handlers**: Prefix with `handle` (e.g., `handlePress`, `handleNavigation`)

### Styles
- **Container styles**: `container`, `wrapper`, `section`
- **Component styles**: Prefix with component/section name (e.g., `cardContainer`, `headerTitle`)
- **Variants**: Suffix with variant name (e.g., `buttonPrimary`, `textSmall`)

---

## Import Organization

Always organize imports in this exact order with blank lines between groups:

1. **React & React Native Core** - `react`, `react-native`
2. **Third Party & Context** - External packages, Context providers
3. **Local Components & Utils** - Project-specific imports

Example:
```typescript
// ✅ CORRECT
import React, { useState } from 'react';
import { View, Text } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

import { GlobalixHeader } from '../components/GlobalixHeader';

// ❌ WRONG
import { GlobalixHeader } from '../components/GlobalixHeader';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text } from 'react-native';
```

---

## Component Structure Rules

### 1. Props Interface
```typescript
// ✅ CORRECT - Always define props interface with full typing
interface MyComponentProps {
  title: string;
  onPress: () => void;
  theme: any;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onPress, theme, icon }) => {
  // ...
};

// ❌ WRONG - No interface, poor typing
export const MyComponent = ({ title, onPress, theme, icon }: any) => {
  // ...
};
```

### 2. State Organization
```typescript
// ✅ CORRECT - Group related state together
const [selectedCategory, setSelectedCategory] = useState('All');
const [searchQuery, setSearchQuery] = useState('');
const [filteredData, setFilteredData] = useState([]);

// ❌ WRONG - Scattered state
const [cat, setCat] = useState('All');
const [search, setSearch] = useState('');
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
// ... more random state
```

### 3. Responsive Sizing
```typescript
// ✅ CORRECT - Group responsive values together
const { width, height } = useWindowDimensions();

const isTablet = width > 600;
const horizontalPadding = width * 0.05;
const cardWidth = isTablet ? width * 0.75 : width * 0.85;
const titleSize = isTablet ? 26 : 22;

// ❌ WRONG - Scattered throughout component
const width = useWindowDimensions().width;
const padding = width > 600 ? 20 : 15;
// ... later in code
const size = width > 600 ? 26 : 22;
```

### 4. Use Memoization
```typescript
// ✅ CORRECT - Memoize expensive calculations
const filteredItems = useMemo(
  () => items.filter(item => item.category === selected),
  [items, selected]
);

// ✅ CORRECT - Memoize callbacks
const handlePress = useCallback(() => {
  navigation.navigate('Next');
}, [navigation]);

// ❌ WRONG - Recreate on every render
const filteredItems = items.filter(item => item.category === selected);

const handlePress = () => {
  navigation.navigate('Next');
};
```

---

## Styling Rules

### Platform Differences
```typescript
// ✅ CORRECT - Use Platform.select() for iOS/Android
card: {
  borderRadius: 12,
  overflow: 'hidden',
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 4 },
  }),
}

// ❌ WRONG - No platform-specific styling
card: {
  borderRadius: 12,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 4,
}
```

### Responsive Styles
```typescript
// ✅ CORRECT - Calculate dimensions outside JSX
const cardWidth = isTablet ? width * 0.75 : width * 0.85;

// In render:
<View style={[styles.card, { width: cardWidth }]} />

// ❌ WRONG - Inline calculations
<View style={[styles.card, { width: isTablet ? width * 0.75 : width * 0.85 }]} />
```

### Dark Mode
```typescript
// ✅ CORRECT - Always respect theme
<View style={[styles.container, { backgroundColor: theme.background }]} />
<Text style={[styles.title, { color: theme.text }]} />

// ❌ WRONG - Hard-coded colors
<View style={{backgroundColor: '#FFF'}} />
<Text style={{color: '#000'}} />
```

---

## Section Comments

Use consistent section dividers:

```typescript
/* ============================================================================
   SECTION NAME
   ============================================================================ */

// For smaller subsections:
// ===== SUBSECTION =====
```

---

## Documentation

### File Headers
```typescript
/**
 * FileName.tsx
 * One-line description of what the screen/component does
 * Optional: List key features or main responsibilities
 */
```

### Complex Functions
```typescript
/**
 * functionName
 * Brief description of what it does
 *
 * @param param1 - Description
 * @param param2 - Description
 * @returns Description of return value
 */
const functionName = (param1: string, param2: number) => {
  // ...
};
```

---

## Common Mistakes to Avoid

1. ❌ **Mixed imports** - Don't scatter imports throughout the file
2. ❌ **No interfaces** - Always define TypeScript interfaces for props
3. ❌ **Scattered state** - Group related state together at the top
4. ❌ **Inline calculations** - Define responsive values in a dedicated section
5. ❌ **Hard-coded colors** - Always use theme values
6. ❌ **No memoization** - Memoize expensive calculations and callbacks
7. ❌ **Complex JSX** - Extract complex parts into helper components
8. ❌ **Missing prop documentation** - Document all component props
9. ❌ **No error handling** - Always handle errors gracefully
10. ❌ **Inconsistent naming** - Follow naming conventions strictly

---

## TypeScript Best Practices

```typescript
// ✅ CORRECT - Proper typing
interface Props {
  items: Item[];
  onSelect: (item: Item) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  theme: Theme;
}

export const Component: React.FC<Props> = ({ items, onSelect, icon, theme }) => {
  const [selected, setSelected] = useState<string>('');

  return (
    // ...
  );
};

// ❌ WRONG - Poor typing
export const Component = (props: any) => {
  const [selected, setSelected] = useState();

  return (
    // ...
  );
};
```

---

## Version Control Checklist

Before committing code:

- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Follows file structure template
- [ ] Consistent import organization
- [ ] All props have TypeScript interfaces
- [ ] State grouped together at top
- [ ] Responsive sizing in dedicated section
- [ ] Uses useMemo for expensive calculations
- [ ] Uses useCallback for handler functions
- [ ] Platform-specific styles use Platform.select()
- [ ] Uses theme colors (no hard-coded colors)
- [ ] Section comments with dividers
- [ ] No console.log() statements
- [ ] No commented-out code
- [ ] Component has JSDoc header comment

---

## Refactoring Checklist

When refactoring existing code:

1. ✅ Maintain all functionality
2. ✅ Update imports to organized structure
3. ✅ Extract magic numbers to constants
4. ✅ Add TypeScript interfaces for all props
5. ✅ Group state variables
6. ✅ Add responsive sizing section
7. ✅ Replace inline functions with memoized callbacks
8. ✅ Replace inline calculations with memoized values
9. ✅ Extract complex JSX to helper components
10. ✅ Verify no TypeScript errors
11. ✅ Test all features work as before
12. ✅ Add/update comments and documentation

---

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [Expo Documentation](https://docs.expo.dev/)

---

**Last Updated**: January 26, 2026
**Version**: 1.0
