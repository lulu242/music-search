import App from "./App"
import router from './src/routes/index'

const root = document.querySelector('#root')
root?.append(new App().el)

router()