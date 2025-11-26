# 📖 API Documentation

Complete reference for the Incremental Clicker Game codebase.

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
| `upgrades` | `UpgradeTier[]` | Array of all upgrade tiers |

### Methods

#### `click(): void`

Awards +1 resource for manual click.

**Example**:
```typescript
gameEngine.click();
// resources += 1
```

---

#### `getUpgradeCost(upgradeId: string): number`

Calculate the cost of the next upgrade purchase.

**Parameters**:
- `upgradeId`: Unique identifier of the upgrade

**Returns**: Cost in resources, or 0 if upgrade not found

**Formula**: `baseCost × (multiplier ^ quantity)`

**Example**:
```typescript
const cost = gameEngine.getUpgradeCost('autoClicker');
// With baseCost=10, multiplier=1.15, quantity=5
// Returns: 20
```

---

#### `canAffordUpgrade(upgradeId: string): boolean`

Check if player has enough resources for an upgrade.

**Parameters**:
- `upgradeId`: Unique identifier of the upgrade

**Returns**: `true` if affordable, `false` otherwise

**Example**:
```typescript
if (gameEngine.canAffordUpgrade('factory')) {
  // Player can buy factory
}
```

---

#### `purchaseUpgrade(upgradeId: string): boolean`

Attempt to purchase an upgrade.

**Parameters**:
- `upgradeId`: Unique identifier of the upgrade

**Returns**: `true` if successful, `false` if insufficient resources

**Side Effects**:
- Deducts resources
- Increments upgrade quantity
- Updates production rate

**Example**:
```typescript
const success = gameEngine.purchaseUpgrade('autoClicker');
if (success) {
  console.log('Purchase successful!');
}
```

---

#### `update(): void`

Update game state based on elapsed time. Should be called every frame.

**Side Effects**:
- Adds resources based on production rate
- Updates internal timestamp

**Example**:
```typescript
// In game loop
function gameLoop() {
  gameEngine.update();
  requestAnimationFrame(gameLoop);
}
```

---

#### `getState(): GameState`

Get current game state with computed properties.

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

### Hook: `useGame()`

Access game context from any component.

**Returns**: `GameContextType`

**Throws**: Error if used outside `GameProvider`

**Example**:
```typescript
function MyComponent() {
  const { resources, click } = useGame();
  return <button onClick={click}>Resources: {resources}</button>;
}
```

### Context Value

| Property | Type | Description |
|----------|------|-------------|
| `gameEngine` | `GameEngine` | Direct engine access |
| `resources` | `number` | Current resources |
| `productionRate` | `number` | Resources per second |
| `upgrades` | `UpgradeInfo[]` | Upgrade list with computed data |
| `click` | `() => void` | Manual click handler |
| `purchaseUpgrade` | `(id: string) => boolean` | Purchase upgrade |
| `resetGame` | `() => void` | Reset with confirmation |

---

## Components

### ClickButton

**File**: `src/components/ClickButton.tsx`

Main click button for manual resource production.

**Props**: None

**Features**:
- Awards +1 resource per click
- Visual hover and click feedback
- Responsive sizing
- Touch-friendly

**Example**:
```tsx
<ClickButton />
```

---

### ResourceDisplay

**File**: `src/components/ResourceDisplay.tsx`

Display current resources and production rate.

**Props**: None

**Features**:
- Auto-formats large numbers
- Shows resources and production rate
- Responsive text sizing

**Example**:
```tsx
<ResourceDisplay />
```

---

### UpgradeList

**File**: `src/components/UpgradeList.tsx`

Grid of purchasable upgrades.

**Props**: None

**Features**:
- Shows all available upgrades
- Visual affordability indicators
- Displays cost, quantity, and production
- Responsive grid layout

**Example**:
```tsx
<UpgradeList />
```

---

### GameControls

**File**: `src/components/GameControls.tsx`

Settings dropdown menu.

**Props**: None

**Features**:
- Reset game functionality
- Click-outside-to-close
- Confirmation dialogs

**Example**:
```tsx
<GameControls />
```

---

## Utilities

**File**: `src/utils/gameUtils.ts`

### `formatNumber(num: number, decimals?: number): string`

Format number with automatic notation switching.

**Parameters**:
- `num`: Number to format
- `decimals`: Decimal places (default: 2)

**Returns**: Formatted string

**Example**:
```typescript
formatNumber(123.456)    // "123.46"
formatNumber(1234567)    // "1.23e+6"
```

---

### `formatNumberWithSuffix(num: number, decimals?: number): string`

Format number with suffix notation (K, M, B, etc.).

**Parameters**:
- `num`: Number to format
- `decimals`: Decimal places (default: 2)

**Returns**: Formatted string with suffix

**Example**:
```typescript
formatNumberWithSuffix(1234)      // "1.23K"
formatNumberWithSuffix(1234567)   // "1.23M"
```

---

### `calculateUpgradeCost(baseCost: number, multiplier: number, quantity: number): number`

Calculate upgrade cost at given quantity.

**Parameters**:
- `baseCost`: Initial cost
- `multiplier`: Cost multiplier per purchase
- `quantity`: Current quantity owned

**Returns**: Cost for next purchase

**Example**:
```typescript
calculateUpgradeCost(10, 1.15, 5)  // 20
```

---

### `calculateTotalProduction(upgrades: Array<{productionRate: number, quantity: number}>): number`

Calculate total production from upgrades.

**Parameters**:
- `upgrades`: Array of upgrades with rate and quantity

**Returns**: Total production per second

**Example**:
```typescript
const total = calculateTotalProduction([
  { productionRate: 1, quantity: 5 },
  { productionRate: 5, quantity: 2 }
]);
// Returns: 15
```

---

### `timeUntilAffordable(currentResources: number, cost: number, productionRate: number): number | null`

Calculate time until upgrade is affordable.

**Parameters**:
- `currentResources`: Current resource count
- `cost`: Upgrade cost
- `productionRate`: Current production per second

**Returns**: Seconds until affordable, or null

**Example**:
```typescript
timeUntilAffordable(50, 100, 10)  // 5 (seconds)
```

---

### `formatTime(seconds: number): string`

Format seconds into human-readable time.

**Parameters**:
- `seconds`: Number of seconds

**Returns**: Formatted time string

**Example**:
```typescript
formatTime(65)    // "1m 5s"
formatTime(3665)  // "1h 1m 5s"
```

---

## Types

**File**: `src/types/game.types.ts`

### `UpgradeTier`

Upgrade configuration and state.

```typescript
interface UpgradeTier {
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

## Constants

**File**: `src/constants/gameConstants.ts`

### Game Configuration

| Constant | Value | Description |
|----------|-------|-------------|
| `AUTO_SAVE_INTERVAL` | `5000` | Auto-save interval (ms) |
| `SAVE_KEY` | `'incrementalClickerSave'` | localStorage key |
| `BASE_CLICK_POWER` | `1` | Resources per click |
| `DEFAULT_COST_MULTIPLIER` | `1.15` | Default cost scaling |
| `SCIENTIFIC_NOTATION_THRESHOLD` | `1000` | When to use scientific notation |

### Breakpoints

| Constant | Value | Description |
|----------|-------|-------------|
| `BREAKPOINTS.MOBILE` | `320` | Mobile breakpoint (px) |
| `BREAKPOINTS.TABLET` | `768` | Tablet breakpoint (px) |
| `BREAKPOINTS.DESKTOP` | `1024` | Desktop breakpoint (px) |
| `BREAKPOINTS.WIDE` | `1440` | Wide screen breakpoint (px) |

### Upgrade Tiers

Predefined upgrade configurations in `UPGRADE_TIERS` object.

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

