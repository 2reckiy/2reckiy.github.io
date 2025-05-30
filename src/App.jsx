import './App.css'
import { Snake } from './components/snake/snake'

export const App = () => {

  return (
    <div className="app-container">
      <Snake />
      <footer className="footer">
        <span>Made with ❤️ by me</span>
      </footer>
    </div>
  )
}
