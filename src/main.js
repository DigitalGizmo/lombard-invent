import './app.css'
import App from './App.svelte'
import AppSVG from './AppSVG.svelte'
import AppModel from './AppModel.svelte'
// import TestImg from './TestImg.svelte'

const app = new AppModel({
// const app = new AppSVG({
  target: document.getElementById('app'),
})

export default app
