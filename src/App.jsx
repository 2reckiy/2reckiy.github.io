import './App.css'
import { Snake } from './components/snake/snake'
import { AudioProvider } from './providers/audio-provider'

export const App = () => {

  return (
    <div className="app-container">
      <AudioProvider>
        <Snake />
      </AudioProvider>
      <footer className="footer">
        <span>Made with ❤️ by me</span>
      </footer>
    </div>
  )
}
