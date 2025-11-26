/**
 * Root application component for Incremental Clicker Game
 */

import './App.scss'
import { GameProvider } from './context/GameContext'
import { ResourceDisplay } from './components/ResourceDisplay'
import { ClickButton } from './components/ClickButton'
import { ProducerList } from './components/ProducerList'
import { GameControls } from './components/GameControls'

/**
 * Main application component
 * Wraps the entire app in GameProvider for state management
 */
function App() {
  return (
    <GameProvider>
      <div className="app">
        <header className="app-header">
          <h1>Incremental Clicker</h1>
          <GameControls />
        </header>
        <main className="app-main">
          <ResourceDisplay />
          <ClickButton />
          <ProducerList />
        </main>
      </div>
    </GameProvider>
  )
}

export default App
