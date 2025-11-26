# 🏗️ Architecture Documentation

## Overview

This incremental clicker game follows a clean architecture pattern with clear separation between UI components, state management, and game logic.

## System Architecture

```
┌─────────────────────────────────────────────┐
│              User Interface                  │
│  (React Components + CSS)                    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           GameContext (Provider)             │
│  - Manages React state                       │
│  - Handles component communication           │
│  - Orchestrates game loop                    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            GameEngine (Core Logic)           │
│  - Pure game state management                │
│  - Business logic & calculations             │
│  - Save/Load functionality                   │
└──────────────────────────────────────────────┘
```

## Core Components

### 1. GameEngine (`src/game/GameEngine.ts`)

**Purpose**: Pure TypeScript class containing all game logic and state.

**Responsibilities**:
- Maintain game state (resources, upgrades, production rate)
- Handle resource calculations and production
- Manage upgrade purchases and cost calculations
- Provide save/load serialization
- Update game state based on delta time

**Key Methods**:
```typescript
class GameEngine {
  click(): void                          // Handle manual resource production
  purchaseUpgrade(id: string): boolean   // Attempt upgrade purchase
  update(): void                         // Update game state (called each frame)
  getState(): GameState                  // Get current state for UI
  save(): SaveData                       // Serialize state
  load(data: SaveData): void             // Deserialize state
  reset(): void                          // Reset all progress
}
```

**Design Decisions**:
- ✅ Framework-agnostic: No React dependencies
- ✅ Testable: Pure functions and methods
- ✅ Single Responsibility: Only handles game logic
- ✅ Immutable-friendly: State updates are explicit

### 2. GameContext (`src/context/GameContext.tsx`)

**Purpose**: Bridge between React UI and GameEngine.

**Responsibilities**:
- Create and manage GameEngine instance
- Provide game state to components via Context
- Orchestrate game loop using `requestAnimationFrame`
- Handle auto-save to localStorage
- Expose game actions to components

**Key Features**:
```typescript
interface GameContextType {
  gameEngine: GameEngine      // Direct engine access
  resources: number           // Current resources
  productionRate: number      // Resources per second
  upgrades: UpgradeInfo[]     // Upgrade list with affordability
  click: () => void           // Manual click handler
  purchaseUpgrade: (id) => boolean
  resetGame: () => void       // Reset with confirmation
}
```

**Lifecycle Management**:
1. **Mount**: Load saved game from localStorage
2. **Game Loop**: RAF-based updates at ~60fps
3. **Auto-Save**: Persist state every 5 seconds
4. **Unmount**: Cleanup RAF and intervals

### 3. UI Components

#### ResourceDisplay
- Shows current resources and production rate
- Number formatting (decimal or scientific notation)
- Real-time updates

#### ClickButton
- Main interaction button
- Visual feedback on click
- Shows click power (+1)

#### UpgradeList
- Grid of upgrade cards
- Visual affordability indicators
- Purchase button with cost display
- Shows quantity owned and current production

#### GameControls
- Settings dropdown menu
- Reset functionality with confirmation

## Data Flow

### Resource Production Flow
```
1. GameEngine.update() called by RAF
   ↓
2. Calculate production: rate × deltaTime
   ↓
3. Add to resources
   ↓
4. GameContext updates React state
   ↓
5. Components re-render with new values
```

### Upgrade Purchase Flow
```
1. User clicks "Buy" button
   ↓
2. UpgradeList calls purchaseUpgrade(id)
   ↓
3. GameContext forwards to GameEngine
   ↓
4. GameEngine validates affordability
   ↓
5. If valid: deduct cost, increment quantity
   ↓
6. Recalculate production rate
   ↓
7. Return success/failure
   ↓
8. GameContext updates state on success
   ↓
9. UI reflects new state
```

## State Management

### Game State Structure
```typescript
{
  resources: number,           // Current resource count
  productionRate: number,      // Total resources/second
  upgrades: UpgradeTier[]      // Array of upgrade definitions
}
```

### Upgrade Tier Structure
```typescript
{
  id: string,                  // Unique identifier
  name: string,                // Display name
  description: string,         // User-facing description
  baseCost: number,            // Initial cost
  costMultiplier: number,      // Cost scaling (1.15)
  productionRate: number,      // Resources/sec per unit
  quantity: number             // Amount owned
}
```

### Save Data Structure
```typescript
{
  resources: number,
  upgrades: Array<{
    id: string,
    quantity: number
  }>,
  lastUpdate: number          // Timestamp
}
```

## Performance Considerations

### Game Loop Optimization
- Uses `requestAnimationFrame` for smooth 60fps updates
- Delta time calculation prevents speed variations
- Minimal state updates to reduce re-renders

### React Optimization Opportunities
- Consider `React.memo` for upgrade cards
- Use `useCallback` for event handlers
- Implement virtualization for large upgrade lists

### Memory Management
- Single GameEngine instance (ref, not state)
- Cleanup RAF and intervals on unmount
- Efficient number formatting with thresholds

## Scalability

### Adding New Upgrade Tiers
1. Add to `upgrades` array in GameEngine constructor
2. No UI changes needed (automatically rendered)

### Adding New Resources
Would require:
- Expanding GameEngine state
- New ResourceDisplay variants
- Updated save/load logic
- Type definition updates

### Adding Prestige System
Recommended approach:
- Add `PrestigeEngine` class
- Extend save data structure
- New context or extend GameContext
- UI components for prestige shop

## Testing Strategy

### Unit Tests (Recommended)
- `GameEngine` methods (pure functions)
- Cost calculations
- Production rate calculations
- Save/load serialization

### Integration Tests
- Context provider behavior
- Component interactions
- Save/load with localStorage

### E2E Tests
- Full gameplay flow
- Purchase interactions
- Reset functionality

## File Organization

```
src/
├── components/              # React UI components
│   ├── ClickButton.tsx
│   ├── ClickButton.css
│   ├── ResourceDisplay.tsx
│   ├── ResourceDisplay.css
│   ├── UpgradeList.tsx
│   ├── UpgradeList.css
│   ├── GameControls.tsx
│   └── GameControls.css
├── context/                # State management
│   └── GameContext.tsx
├── game/                   # Core logic
│   └── GameEngine.ts
├── hooks/                  # Custom React hooks (empty)
├── types/                  # TypeScript definitions (to add)
├── utils/                  # Helper functions (to add)
├── assets/                 # Images and static files
├── App.tsx                 # Root component
├── App.css                 # Global styles
├── main.tsx                # Entry point
└── index.css               # Reset and base styles
```

## Dependencies

### Production
- `react`: UI framework
- `react-dom`: DOM renderer

### Development
- `typescript`: Type checking
- `vite`: Build tool & dev server
- `@vitejs/plugin-react`: React support for Vite
- `eslint`: Code linting

## Browser Compatibility

- Modern browsers (ES2020+)
- localStorage support required
- requestAnimationFrame support required

## Future Architecture Improvements

1. **Type Definitions**: Move interfaces to `src/types/`
2. **Utility Functions**: Extract formatNumber to `src/utils/`
3. **Custom Hooks**: Create `useGameLoop`, `useAutoSave`
4. **Constants**: Centralize magic numbers
5. **Configuration**: Game balance in separate config file
6. **Service Layer**: Abstract localStorage operations

## Design Principles

1. **Separation of Concerns**: UI, state, and logic are separate
2. **Single Responsibility**: Each class/component has one purpose
3. **Testability**: Pure functions and isolated logic
4. **Type Safety**: Full TypeScript coverage
5. **Performance**: Efficient updates and rendering
6. **Maintainability**: Clear structure and documentation

