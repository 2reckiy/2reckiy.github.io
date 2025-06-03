import { useState } from 'react'
import './App.css'
import { GameSnake } from './components/game-snake/game-snake'
import { AudioProvider } from './providers/audio-provider'
import { GameCatcher } from './components/game-catcher/game-catcher'

export const App = () => {
  const [game, setGame] = useState("catcher");

  return (
    <div className="app-container">
      <AudioProvider>
        { game === "snake" && <GameSnake /> }
        { game === "catcher" && <GameCatcher /> }
      </AudioProvider>
      <footer className="footer">
        <span>Made with ❤️ by me</span>
      </footer>
    </div>
  )
}
