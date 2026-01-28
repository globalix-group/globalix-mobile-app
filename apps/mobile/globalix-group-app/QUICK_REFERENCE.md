# Quick Reference - Code Standards

A one-page quick reference for the unified code standards of the Globalix app.

---

## File Structure at a Glance

```typescript
/**
 * FileName.tsx
 * Brief description
 */

// IMPORTS (3 groups, blank lines between)
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ... } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

import { ComponentName } from '../components/ComponentName';

// CONSTANTS & DATA
const MY_CONSTANT = 'value';
const DATA = [...];

// INTERFACES & TYPES
interface ComponentProps { }

// HELPER COMPONENTS
const HelperComponent: React.FC<Props> = ({ }) => (...);

// MAIN COMPONENT
export const ComponentName: React.FC<Props> = ({ }) => {
  // ===== STATE =====
  const [state, setState] = useState();

  // ===== RESPONSIVE SIZING =====
  const isTablet = width > 600;

  // ===== MEMOIZED VALUES =====
  const computed = useMemo(() => {...}, [deps]);

  // ===== HANDLERS =====
  const handleAction = useCallback(() => {...}, [deps]);

  // ===== RENDER =====
  return (...);
};

// STYLES
const styles = StyleSheet.create({ ... });
```

---

## Naming Quick Reference

| Type | Format | Example |
|------|--------|---------|
| **Screens** | `NameScreen.tsx` | `HomeScreen.tsx` |
| **Components** | `ComponentName.tsx` | `GlobalixHeader.tsx` |
| **Utilities** | `featureName.ts` | `helpers.ts` |
| **Constants** | `UPPER_SNAKE_CASE` | `PROPERTY_DATA` |
| **Variables** | `camelCase` | `firstName` |
| **Booleans** | `is/has + Name` | `isTablet`, `hasError` |
| **Handlers** | `handle + Action` | `handlePress` |
| **Style Groups** | `prefix + Name` | `cardContainer` |

---

## Import Rules (STRICT)

```typescript
// ✅ CORRECT ORDER
import React, { useState } from 'react';
import { View, Text } from 'react-native';
                                           // blank line
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
                                           // blank line
import { GlobalixHeader } from '../components/GlobalixHeader';

// ❌ WRONG - Mixed order
import { GlobalixHeader } from '../components/GlobalixHeader';
import { useTheme } from '../theme/ThemeContext';
import React from 'react';
```

---

## State Organization

```typescript
// ✅ CORRECT - All state together
const [category, setCategory] = useState('All');
const [search, setSearch] = useState('');
const [items, setItems] = useState([]);

// ❌ WRONG - Scattered state
const [category, setCategory] = useState('All');
// ... 20 lines of code ...
const [search, setSearch] = useState('');
// ... more code ...
const [items, setItems] = useState([]);
```

---

## Responsive Sizing

```typescript
// ✅ CORRECT - Dedicated section
const { width, height } = useWindowDimensions();

const isTablet = width > 600;
const padding = width * 0.05;
const cardWidth = isTablet ? width * 0.75 : width * 0.85;

// ❌ WRONG - Scattered throughout
const padding = useWindowDimensions().width * 0.05;
// ... later ...
const width = useWindowDimensions().width;
const size = width > 600 ? 26 : 22;
```

---

## Memoization Rules

```typescript
// ✅ CORRECT - Memoize expensive operations
const filtered = useMemo(
  () => items.filter(item => item.type === selected),
  [items, selected]
);

const handlePress = useCallback(() => {
  navigation.navigate('Next');
}, [navigation]);

// ❌ WRONG - No memoization
const filtered = items.filter(item => item.type === selected);

const handlePress = () => {
  navigation.navigate('Next');
};
```

---

## TypeScript Rules

```typescript
// ✅ CORRECT - Full typing
interface Props {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  theme: any;
}

export const Component: React.FC<Props> = ({ title, onPress, icon, theme }) => {
  const [state, setState] = useState<string>('');
  return (...);
};

// ❌ WRONG - No typing
export const Component = (props: any) => {
  const [state, setState] = useState();
  return (...);
};
```

---

## Platform Styling

```typescript
// ✅ CORRECT - Use Platform.select()
card: {
  borderRadius: 12,
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

// ❌ WRONG - No platform handling
card: {
  borderRadius: 12,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  elevation: 4, // Doesn't work right on iOS
}
```

---

## Dark Mode Styling

```typescript
// ✅ CORRECT - Always use theme
<View style={[styles.container, { backgroundColor: theme.background }]} />
<Text style={[styles.title, { color: theme.text }]} />

// ❌ WRONG - Hard-coded colors
<View style={{backgroundColor: '#FFF'}} />
<Text style={{color: '#000'}} />
```

---

## Style Organization

```typescript
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  scrollContent: { paddingBottom: 150 },

  // Sections
  sectionHeader: { marginVertical: 12 },
  sectionTitle: { fontWeight: '800' },

  // Cards
  cardContainer: { borderRadius: 12 },
  cardText: { fontSize: 14 },

  // Empty State
  emptyContainer: { alignItems: 'center' },
  emptyText: { fontSize: 16 },
});
```

---

## Component Props Pattern

```typescript
// ✅ CORRECT - Interface for all props
interface MyComponentProps {
  title: string;
  onPress: () => void;
  theme: any;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onPress, 
  theme 
}) => {
  return (...);
};

// ❌ WRONG - No interface, poor typing
export const MyComponent = ({ title, onPress, theme }: any) => {
  return (...);
};
```

---

## Section Comments

```typescript
// Use for major sections
/* ============================================================================
   SECTION NAME
   ============================================================================ */

// Use for subsections within component
// ===== SUBSECTION =====
```

---

## Documentation Style

```typescript
/**
 * FileName.tsx
 * One-line description of what this does
 * Optional: Key features or responsibilities
 */

/**
 * functionName
 * Brief description
 *
 * @param param1 - Description
 * @returns Description of return
 */
const functionName = (param1: string): boolean => {
  // ...
};
```

---

## Common Mistakes (Avoid!)

1. ❌ Scattered imports
2. ❌ No TypeScript interfaces  
3. ❌ State scattered throughout
4. ❌ Responsive calcs in JSX
5. ❌ Hard-coded colors
6. ❌ Functions recreated every render
7. ❌ Platform-specific bugs
8. ❌ Complex JSX not extracted
9. ❌ Magic numbers (no constants)
10. ❌ Missing error handling

---

## Pre-Commit Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] Follows file structure template
- [ ] Imports organized in 3 groups
- [ ] All props have interfaces
- [ ] State grouped at top
- [ ] Responsive sizing in section
- [ ] Uses useMemo/useCallback
- [ ] Platform.select() for styles
- [ ] Uses theme (no hard-coded colors)
- [ ] No commented-out code
- [ ] No console.log() statements
- [ ] Features tested and working

---

## Resource Links

- Full Standards: `CODE_STANDARDS.md`
- Refactoring Summary: `REFACTORING_SUMMARY.md`
- Theme: `src/theme/ThemeContext.tsx`
- Components: `src/components/`
- Screens: `src/screens/`

---

## When to Use What

| Need | Use | Example |
|------|-----|---------|
| **Expensive Calculation** | `useMemo` | `filteredItems` |
| **Pass Callback to Child** | `useCallback` | `handlePress` |
| **Get Device Dimension** | `useWindowDimensions` | `width`, `height` |
| **iOS/Android Differences** | `Platform.select()` | Shadows, elevation |
| **Theme Colors** | `theme` from context | `theme.primary` |
| **Component Prop Types** | `interface Props` | All component props |
| **Section Divider** | `/* ===== ... =====*/` | Between sections |
| **Icon Type** | `keyof typeof Ionicons.glyphMap` | Icon props |

---

## Quick Commands

```bash
# Check TypeScript
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/screens/HomeScreen.tsx

# View this quick reference
cat QUICK_REFERENCE.md

# View full standards
cat CODE_STANDARDS.md

# View refactoring summary
cat REFACTORING_SUMMARY.md
```

---

**Remember**: Consistency > Perfection. Follow the patterns shown here and in CODE_STANDARDS.md to maintain a clean, professional codebase.

**Last Updated**: January 26, 2026
