import logo from './logo.svg';
import './App.css';
import React, { Component } from "react"

const currencies = [
  "ETH",
  "USD",
  "BTC"
];

class CurrencySelector extends React.Component {
  constructor(){
    super();
  }

  render() {
    const items = currencies.map((currency) =>
      <a href="#">{currency}</a>
    );
    return (
      <div className="CurrencySelector">
        {items}
      </div>
    );
  }
}

function CurrencyInput(props) {
  return (
    <div className="CurrenyInput">
      <input type="text" />
      <CurrencySelector />
    </div>
  );
}

function ConversionDisplay(props) {
  return (
    <div className="ConversionDisplay">
      <h2>Currency Conversion</h2>
      <p>I want to spend</p>
      <input type="text" />
      <p>I want to buy</p>
      <input type="text" />
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
