# 📖 API Documentation (Idle Webz)

Complete reference for the Idle Webz codebase.

## Table of Contents

- [GameEngine](#gameengine)
- [GameContext](#gamecontext)
- [Components](#components)
- [Utilities](#utilities)
- [Types](#types)
- [Constants](#constants)

---

## GameEngine

**File**: `src/game/GameEngine.ts`

Core game logic class. Framework-agnostic and fully testable.

### Constructor

```typescript
new GameEngine()
```

Creates a new game engine instance with initial state.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `resources` | `number` | Current resource count |
| `productionRate` | `number` | Resources produced per second |
| `producers` | `ProducerTier[]` | Array of producer tiers |
| `autoBuyEnabled` | `boolean` | Whether auto-buy is enabled |

### Methods

#### `click(): void`

Awards resources for manual click based on click power level.

---

#### `typeChar(char: string): void`

Record a typed character and award typing rewards and word bonuses.

---

#### `purchaseProducer(id: string): boolean`

Attempt to purchase a producer; returns true if successful.

---

#### `purchaseUpgrade(upgradeId: string): boolean`

Purchase a one-time upgrade (Typing, Auto-Buy, Challenges).

---

#### `purchaseClickPowerUpgrade(): boolean`

Purchase a repeatable click power upgrade (cost doubles each level).

---

#### `purchaseAutoBuySpeedUpgrade(): boolean`

Purchase auto-buy speed (reduces interval by 2s per level, min 2s).

---

#### `toggleAutoBuy(): void`

Enable/disable auto-buy.

---

#### `toggleChallenges(): void`

Enable/disable auto challenges when unlocked.

---

#### `triggerChallenge(): boolean`

Start a challenge manually when available.

---

#### `getState(): GameState`

Get current game state with computed properties for UI.

**Returns**: Object with resources, production rate, and upgrade info

**Example**:
```typescript
const state = gameEngine.getState();
// {
//   resources: 150.5,
//   productionRate: 5,
//   upgrades: [...]
// }
```

---

#### `save(): SaveData`

Serialize game state for saving.

**Returns**: Minimal save data object

**Example**:
```typescript
const saveData = gameEngine.save();
localStorage.setItem('save', JSON.stringify(saveData));
```

---

#### `load(saveData: SaveData): void`

Load game state from saved data.

**Parameters**:
- `saveData`: Previously saved game state

**Example**:
```typescript
const saveData = JSON.parse(localStorage.getItem('save'));
gameEngine.load(saveData);
```

---

#### `reset(): void`

Reset all game progress to initial state.

**Side Effects**:
- Sets resources to 0
- Sets production rate to 0
- Resets all upgrade quantities
- Updates timestamp

**Example**:
```typescript
gameEngine.reset();
```

---

## GameContext

**File**: `src/context/GameContext.tsx`

React Context providing game state and actions to components.

- Provides resources, production rate, producers, and upgrades
- Exposes actions: click, purchaseProducer, purchaseUpgrade, toggleAutoBuy, etc.

---

## Components

- `ResourceDisplay` – shows resources and production rate with format toggle
- `ClickButton` – manual click action with cheat indicator
- `AutoBuy` – toggle and status (speed upgrades in Upgrades tab)
- `TypingPanel` – typing input, streaks, optional challenges
- `ProducerList` – producer cards, next unlock hint
- `Upgrades` – one-time unlocks and repeatable upgrades

---

## Utilities

**File**: `src/utils/gameUtils.ts`

- `formatNumberUnified` – unified formatting (scientific/suffix) with persisted mode
- `formatNumberAdaptive`, `formatNumberWithSuffix` – helpers
- `formatTime` – human-readable time (e.g., auto-buy next purchase)

---

## Constants

**File**: `src/constants/gameConstants.ts`

- `UPGRADES` – one-time upgrades (Typing: 3000, Auto-Buy: 5000, Challenges: 20000)
- `PRODUCER_TIERS` – producer definitions and unlock thresholds
- `TYPING_CONFIG` – typing rewards and challenge settings

---

## Types

**File**: `src/types/game.types.ts`

### `ProducerTier`

Producer configuration and state.

```typescript
interface ProducerTier {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  productionRate: number;
  quantity: number;
}
```

---

### `UpgradeInfo`

Extended upgrade with computed properties.

```typescript
interface UpgradeInfo extends UpgradeTier {
  cost: number;
  canAfford: boolean;
}
```

---

### `GameState`

Complete game state snapshot.

```typescript
interface GameState {
  resources: number;
  productionRate: number;
  upgrades: UpgradeInfo[];
}
```

---

### `SaveData`

Serializable save data.

```typescript
interface SaveData {
  resources: number;
  upgrades: Array<{
    id: string;
    quantity: number;
  }>;
  lastUpdate: number;
}
```

---

## Usage Examples

### Basic Integration

```tsx
import { GameProvider, useGame } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  );
}

function GameUI() {
  const { resources, click } = useGame();
  return <button onClick={click}>{resources}</button>;
}
```

### Custom Component

```tsx
function CustomUpgrade() {
  const { upgrades, purchaseUpgrade } = useGame();
  const factory = upgrades.find(u => u.id === 'factory');
  
  return (
    <button 
      onClick={() => purchaseUpgrade('factory')}
      disabled={!factory?.canAfford}
    >
      Buy Factory: {factory?.cost}
    </button>
  );
}
```

### Direct Engine Access

```tsx
function AdvancedStats() {
  const { gameEngine } = useGame();
  
  const totalUpgrades = gameEngine.upgrades.reduce(
    (sum, u) => sum + u.quantity, 0
  );
  
  return <div>Total Upgrades: {totalUpgrades}</div>;
}
```
