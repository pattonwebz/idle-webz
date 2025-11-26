# 🤝 Contributing Guide

Thank you for your interest in contributing to the Incremental Clicker Game! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Keep discussions professional

## 🚀 Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/untitled.git
   cd untitled
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Verify everything works**
   - Open http://localhost:5173
   - Click the button, buy upgrades
   - Check browser console for errors

## 💻 Development Workflow

### Branch Strategy

Create a new branch for each feature or fix:

```bash
# Feature branch
git checkout -b feature/add-sound-effects

# Bug fix branch
git checkout -b fix/upgrade-cost-calculation

# Documentation branch
git checkout -b docs/update-readme
```

### Development Process

1. **Make your changes**
2. **Test thoroughly**
3. **Check for errors**
   ```bash
   npm run lint
   npm run build
   ```
4. **Commit with clear messages**
5. **Push to your fork**
6. **Open a Pull Request**

## 🎨 Code Style

### TypeScript

```typescript
// ✅ Good: Explicit types, clear naming
interface UpgradeConfig {
  id: string;
  baseCost: number;
  productionRate: number;
}

function calculateUpgradeCost(upgrade: UpgradeConfig, quantity: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(1.15, quantity));
}

// ❌ Avoid: Any types, unclear naming
function calc(u: any, q: any) {
  return u.b * Math.pow(1.15, q);
}
```

### React Components

```typescript
// ✅ Good: Functional component with clear props
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}

export const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, label }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// ❌ Avoid: Unclear component structure
export const Button = (props: any) => <button {...props} />;
```

### Naming Conventions

- **Components**: PascalCase (`UpgradeList`, `GameControls`)
- **Files**: PascalCase for components (`UpgradeList.tsx`)
- **Variables/Functions**: camelCase (`productionRate`, `purchaseUpgrade`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_UPGRADES`, `AUTO_SAVE_INTERVAL`)
- **CSS Classes**: kebab-case (`upgrade-card`, `click-button`)

### File Organization

```typescript
// Order of imports
import React from 'react';           // 1. External libraries
import { useGame } from '../context'; // 2. Internal modules
import './Component.css';            // 3. Styles

// Order within component file
// 1. Interfaces/Types
// 2. Component definition
// 3. Helper functions (if small)
// 4. Export
```

### Comments

```typescript
/**
 * Calculates the cost of the next upgrade purchase.
 * Uses exponential scaling: baseCost × (multiplier ^ quantity)
 * 
 * @param upgradeId - The unique identifier of the upgrade
 * @returns The cost in resources, or 0 if upgrade not found
 */
getUpgradeCost(upgradeId: string): number {
  const upgrade = this.upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return 0;
  
  // Apply exponential cost scaling
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.quantity));
}
```

## 📁 Project Structure

```
src/
├── components/          # React UI components
│   ├── [Component]/
│   │   ├── index.tsx   # Component logic
│   │   └── styles.css  # Component styles
├── context/            # React Context providers
├── game/               # Core game logic (framework-agnostic)
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── constants/          # Configuration and constants
```

## 🔧 Making Changes

### Adding a New Component

1. Create component file: `src/components/MyComponent.tsx`
2. Create styles: `src/components/MyComponent.css`
3. Export from component
4. Import and use in parent component

```typescript
// src/components/MyComponent.tsx
import React from 'react';
import './MyComponent.css';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className="my-component">
      <h2>{title}</h2>
    </div>
  );
};
```

### Adding a New Feature

1. **Plan the change**
   - What problem does it solve?
   - How will it work?
   - What components need changes?

2. **Update types** (if needed)
   ```typescript
   // src/game/GameEngine.ts
   interface UpgradeTier {
     // ...existing properties
     newFeature?: boolean; // Add with optional first
   }
   ```

3. **Implement core logic**
   - Add to GameEngine if it's game logic
   - Keep it pure and testable

4. **Update UI components**
   - Modify existing or create new components
   - Update styles

5. **Test thoroughly**
   - Manual testing
   - Check edge cases
   - Test on different screen sizes

### Adding Game Balance Changes

Edit `src/game/GameEngine.ts`:

```typescript
// Before
baseCost: 10,
costMultiplier: 1.15,
productionRate: 1,

// After (with comment explaining why)
baseCost: 15,           // Increased to slow early game
costMultiplier: 1.12,   // Reduced scaling for better long-term balance
productionRate: 1,
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Click button produces resources
- [ ] Resources accumulate properly
- [ ] Upgrades can be purchased when affordable
- [ ] Production rate updates correctly
- [ ] Save/load persists state
- [ ] Reset clears all progress
- [ ] UI is responsive on mobile
- [ ] No console errors

### Browser Testing

Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)
- Mobile browsers

### Performance Testing

- Check FPS (should be ~60fps)
- Monitor memory usage
- Test with many upgrades purchased
- Verify smooth animations

## 📝 Submitting Changes

### Commit Messages

Follow conventional commits format:

```bash
# Feature
git commit -m "feat: add sound effects for clicks and purchases"

# Bug fix
git commit -m "fix: correct upgrade cost calculation overflow"

# Documentation
git commit -m "docs: update architecture documentation"

# Refactor
git commit -m "refactor: extract number formatting to utility"

# Style
git commit -m "style: improve responsive layout for tablets"
```

### Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/your-feature
   ```

3. **Open Pull Request**
   - Clear title describing the change
   - Description of what changed and why
   - Reference any related issues
   - Include screenshots for UI changes

4. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation
   - [ ] Refactoring
   
   ## Testing
   - [ ] Tested manually
   - [ ] No console errors
   - [ ] Responsive design verified
   
   ## Screenshots (if applicable)
   [Add screenshots here]
   ```

## 🐛 Reporting Bugs

When reporting bugs, include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS
- Console errors (if any)
- Screenshots (if helpful)

## 💡 Suggesting Features

See [docs/suggestions.md](./suggestions.md) for existing ideas.

For new suggestions:
- Describe the feature
- Explain the benefit
- Consider implementation complexity
- Note any potential issues

## 🙋 Getting Help

- Check existing documentation
- Review similar code in the project
- Ask questions in issues/discussions
- Be specific about what you need help with

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [MDN Web Docs](https://developer.mozilla.org)

## ✨ Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor list

Thank you for contributing! 🎉

