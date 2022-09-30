import logo from './logo.svg';
import './App.css';
import React, { Component } from "react"

const currencies = [
  "ETH",
  "USD",
  "BTC"
];

function CurrencyInput(props) {
  return (
    <div className="CurrenyInput">
      <input className="CurrencyAmount" type="text" />
      <a className="CurrencySelector">{props.currency}</a>
    </div>
  );
}

function ConversionDisplay(props) {
  return (
    <div className="ConversionDisplay">
      <h2>Currency Conversion</h2>
      <p>I want to spend</p>
      <CurrencyInput currency="ETH" />
      <p>I want to buy</p>
      <CurrencyInput currency="USD" />
      <p>Summary</p>
      <p>You get XX USD for XX ETH</p>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <ConversionDisplay />
    </div>
  );
}

export default App;
