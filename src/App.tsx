/**
 * Root application component for Incremental Clicker Game
 */

import { useState } from 'react'
import './App.scss'
import { GameProvider } from './context/GameContext'
import { useGame } from './hooks/useGame'
import { ResourceDisplay } from './components/ResourceDisplay'
import { ClickButton } from './components/ClickButton'
import { AutoBuy } from './components/AutoBuy'
import { ProducerList } from './components/ProducerList'
import { GameControls } from './components/GameControls'
import { TypingPanel } from './components/TypingPanel'
import { Upgrades } from './components/Upgrades'

type TabType = 'producers' | 'upgrades';

/**
 * Main game content component (needs to be inside GameProvider to use useGame)
 */
function GameContent() {
  const [activeTab, setActiveTab] = useState<TabType>('producers');
  const { typingUnlocked } = useGame();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Incremental Clicker</h1>
        <GameControls />
      </header>
      <main className="app-main">
        <ResourceDisplay />

        {/* Click and Typing Section - Side by Side */}
        <div className={`interactive-section ${!typingUnlocked ? 'single-column' : ''}`}>
          <div className="click-section">
            <ClickButton />
            <AutoBuy />
          </div>
          {typingUnlocked && (
            <div className="typing-section">
              <TypingPanel />
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'producers' ? 'active' : ''}`}
            onClick={() => setActiveTab('producers')}
          >
            Producers
          </button>
          <button
            className={`tab-button ${activeTab === 'upgrades' ? 'active' : ''}`}
            onClick={() => setActiveTab('upgrades')}
          >
            Upgrades
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'producers' && <ProducerList />}
          {activeTab === 'upgrades' && <Upgrades />}
        </div>
      </main>
    </div>
  );
}

/**
 * Main application component
 * Wraps the entire app in GameProvider for state management
 */
function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App
