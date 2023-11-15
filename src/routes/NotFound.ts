import { Component } from "../core";

export default class NotFound extends Component{
  render() {
    this.el.innerHTML = `<h1>Sorry, page not found.</h1>`
  }
}