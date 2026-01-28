# Globalix Clean Code Standards - Index

Welcome to the Globalix React Native application! This folder contains comprehensive documentation for the unified clean code standards, consistent code structure, and development best practices.

---

## 📚 Documentation Files

### 1. **QUICK_REFERENCE.md** ⭐ START HERE
A one-page quick reference for developers who want the essentials:
- File structure template
- Naming conventions
- Import organization rules
- Common patterns
- Pre-commit checklist

**When to use**: Daily development, code review, quick lookup

---

### 2. **CODE_STANDARDS.md** 📖 COMPREHENSIVE GUIDE
Complete 400+ line guide covering everything:
- Detailed file structure with examples
- All naming conventions
- Import organization with examples
- Component structure rules
- TypeScript best practices
- Styling rules (platform-specific, responsive, dark mode)
- Documentation standards
- 10 common mistakes to avoid
- Version control checklist
- Refactoring checklist

**When to use**: Creating new files, refactoring existing code, onboarding

---

### 3. **REFACTORING_SUMMARY.md** 📋 WHAT WAS DONE
Complete summary of the code refactoring work:
- Overview of all changes made
- File structure standardization
- Import organization improvements
- TypeScript error fixes (with details)
- Component pattern improvements
- Style organization details
- Documentation created
- Benefits to codebase
- Compliance checklist
- Statistics (before/after)

**When to use**: Understanding what changed, verification, project overview

---

## 🎯 Quick Start

### For New Developers
1. Read **QUICK_REFERENCE.md** (5 minutes)
2. Reference **CODE_STANDARDS.md** (bookmark it)
3. Open existing code and follow the patterns

### For Code Reviews
1. Use pre-commit checklist from **QUICK_REFERENCE.md**
2. Reference **CODE_STANDARDS.md** for specific rules
3. Verify `npx tsc --noEmit` passes

### For Refactoring
1. Read refactoring checklist in **CODE_STANDARDS.md**
2. Follow file structure from **CODE_STANDARDS.md**
3. Use **QUICK_REFERENCE.md** for common patterns

---

## 🏗️ File Structure Overview

Every file in the project should follow this structure:

```
┌─ File Header (JSDoc with description)
├─ Imports (3 organized groups)
├─ Constants & Data (ALL data at top)
├─ Interfaces & Types (Full TypeScript)
├─ Helper Components (Before main)
├─ Main Component (Exported with React.FC)
│  ├─ // ===== STATE =====
│  ├─ // ===== RESPONSIVE SIZING =====
│  ├─ // ===== MEMOIZED VALUES =====
│  ├─ // ===== HANDLERS =====
│  └─ // ===== RENDER =====
└─ Styles (Grouped by purpose, platform-aware)
```

---

## ✅ Code Quality Standards

### TypeScript
- ✅ **0 TypeScript errors** - Full type coverage
- ✅ **Proper interfaces** - All props typed
- ✅ **No `any` types** - Specific typing used
- ✅ **Type inference** - Leverages TypeScript capabilities

### Organization
- ✅ **Consistent structure** - Same pattern everywhere
- ✅ **Organized imports** - 3 groups, alphabetized
- ✅ **Grouped state** - Related state together
- ✅ **Documented code** - JSDoc on files and functions

### Styling
- ✅ **Theme aware** - Uses theme colors, no hard-coded
- ✅ **Platform specific** - Uses `Platform.select()`
- ✅ **Responsive** - Adapts to screen size
- ✅ **Dark mode** - Works in all themes

### Performance
- ✅ **Memoization** - `useMemo` for expensive calcs
- ✅ **Callbacks** - `useCallback` for handlers
- ✅ **Optimization** - Prevents unnecessary renders

---

## 🛠️ Common Development Tasks

### Creating a New Screen

1. Use template from CODE_STANDARDS.md page 2
2. Follow file structure exactly
3. Define interfaces for props
4. Organize imports in 3 groups
5. Group state, responsive sizing, handlers
6. Use theme for colors
7. Use Platform.select() for platform differences
8. Run `npx tsc --noEmit` to verify

### Adding a New Component

1. Create in `src/components/ComponentName.tsx`
2. Follow same structure as screens
3. Define TypeScript interface for props
4. Use React.FC<Props> export pattern
5. Add JSDoc header comment
6. Use theme for styling
7. Test with different screen sizes

### Refactoring Existing Code

1. Follow refactoring checklist in CODE_STANDARDS.md
2. Maintain all functionality
3. Apply unified structure
4. Add missing interfaces
5. Organize imports
6. Group related code
7. Run `npx tsc --noEmit`
8. Test all features still work

### Fixing Code

1. Check CODE_STANDARDS.md for the rule
2. Reference QUICK_REFERENCE.md for patterns
3. Follow the "correct" example
4. Avoid patterns marked "❌ WRONG"
5. Run type check after changes

---

## 📍 File Locations

| Type | Location |
|------|----------|
| **Screens** | `src/screens/` |
| **Components** | `src/components/` |
| **Theme/Context** | `src/theme/` |
| **Main App** | `App.tsx` |
| **Standards Docs** | Root of `globalix-group-app/` |
| **Config Files** | `app.json`, `tsconfig.json` |

---

## 🔍 Documentation Index by Topic

### Component Patterns
- File structure: CODE_STANDARDS.md, pages 2-3
- Props interfaces: CODE_STANDARDS.md, page 10
- State organization: CODE_STANDARDS.md, page 10
- Render structure: CODE_STANDARDS.md, page 3

### Import & Organization
- Import rules: CODE_STANDARDS.md, page 5
- File structure: QUICK_REFERENCE.md, top section
- Component structure: QUICK_REFERENCE.md

### Naming Conventions
- All naming rules: CODE_STANDARDS.md, page 4
- Quick reference: QUICK_REFERENCE.md, table

### Styling
- Style organization: CODE_STANDARDS.md, page 12
- Platform differences: CODE_STANDARDS.md, page 12
- Dark mode: CODE_STANDARDS.md, page 13
- Responsive design: CODE_STANDARDS.md, page 11

### TypeScript
- Best practices: CODE_STANDARDS.md, page 15
- Icon typing: QUICK_REFERENCE.md
- Interface patterns: CODE_STANDARDS.md, page 10

### Mistakes to Avoid
- 10 common mistakes: CODE_STANDARDS.md, page 14
- Quick checklist: QUICK_REFERENCE.md

---

## ✨ Key Principles

### 1. Consistency Over Everything
Follow the same patterns everywhere. This matters more than your personal preference.

### 2. Structure First
Organize your file structure before writing logic. Think about where things go.

### 3. Type Safety
Use TypeScript fully. Don't use `any`. Proper typing prevents bugs.

### 4. Responsive First
Think about different screen sizes. Use responsive sizing values.

### 5. Theme Aware
Always use theme colors. Never hard-code colors. Support dark mode.

### 6. Performance Focused
Memoize expensive operations. Use callbacks properly. Prevent unnecessary renders.

### 7. Documentation Matters
Comment complex logic. Document components. Help future developers.

### 8. Platform Conscious
Handle iOS/Android differences. Use `Platform.select()`. Test on both.

---

## 📊 Before & After Statistics

| Metric | Before | After |
|--------|--------|-------|
| TypeScript Errors | 8+ ❌ | 0 ✅ |
| Consistent Structure | Mixed ❌ | Unified ✅ |
| Documented Standards | None ❌ | Complete ✅ |
| Type Coverage | Partial ⚠️ | Full ✅ |
| Import Organization | Random ❌ | Organized ✅ |

---

## 🚀 Getting Started

### Step 1: Read Documentation
- First time: Read QUICK_REFERENCE.md (5 min)
- Save: Bookmark CODE_STANDARDS.md
- Reference: REFACTORING_SUMMARY.md for context

### Step 2: Understand the Pattern
Open any screen file and notice the structure:
- Where imports are (top)
- Where state is (after imports)
- Where styles are (bottom)

### Step 3: Follow the Pattern
When creating new code:
- Use template from CODE_STANDARDS.md
- Check QUICK_REFERENCE.md for examples
- Compare with similar existing code

### Step 4: Verify Your Code
Before committing:
- Run `npx tsc --noEmit`
- Check pre-commit checklist
- Verify file structure matches template

---

## 💡 Pro Tips

1. **Bookmark QUICK_REFERENCE.md** - You'll reference it constantly
2. **Use CODE_STANDARDS.md as template** - Copy/paste the structure
3. **Keep section comments** - They help navigation
4. **Group related code** - Easier to understand
5. **Name things clearly** - Good names explain purpose
6. **Use TypeScript fully** - It catches bugs early
7. **Test responsive design** - Works on all screen sizes
8. **Dark mode matters** - Users care about this
9. **Performance counts** - Memoize expensive ops
10. **Document complex logic** - Help future developers

---

## 🤝 Code Review Checklist

When reviewing code, check:

- [ ] File follows structure template
- [ ] Imports organized in 3 groups
- [ ] `npx tsc --noEmit` passes
- [ ] All props have interfaces
- [ ] State grouped together
- [ ] Responsive sizing in section
- [ ] Uses useMemo/useCallback
- [ ] Platform.select() for styles
- [ ] Uses theme (no hard-coded colors)
- [ ] JSDoc headers present
- [ ] No commented-out code
- [ ] Features tested and working

---

## 📞 Questions?

**For general patterns**: Check QUICK_REFERENCE.md  
**For specific rules**: Check CODE_STANDARDS.md  
**For context/background**: Check REFACTORING_SUMMARY.md  
**For code examples**: Check existing screens in src/screens/

---

## 📝 Document Versions

| Document | Version | Updated |
|----------|---------|---------|
| CODE_STANDARDS.md | 1.0 | Jan 26, 2026 |
| QUICK_REFERENCE.md | 1.0 | Jan 26, 2026 |
| REFACTORING_SUMMARY.md | 1.0 | Jan 26, 2026 |

---

## ✅ Verification

All documentation and refactoring is complete and verified:

- ✅ TypeScript: 0 errors
- ✅ Structure: Unified across all files
- ✅ Documentation: Complete and detailed
- ✅ Standards: Clear and enforced
- ✅ Examples: Included in all docs

---

**Welcome to a cleaner, more consistent, more professional codebase!**

*Start with QUICK_REFERENCE.md → Reference CODE_STANDARDS.md → Check REFACTORING_SUMMARY.md for context*

---

**Last Updated**: January 26, 2026  
**Status**: ✅ Complete
