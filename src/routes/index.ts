import { createRouter } from "../core";
import About from "./About";
import Home from "./Home";
import Music from "./Music";
import NotFound from "./NotFound";

export default createRouter([
  { path: '#/', component: Home },
  { path: '#/music', component: Music },
  { path: '#/about', component: About },
  { path: '.*', component: NotFound } // '.*' === '.{0,}'
])