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
      <input className="CurrencyAmount" type="text" value={props.val} onChange={(e) => props.updateFn(e.target.value)} />
      <a className="CurrencySelector">{props.currency}</a>
    </div>
  );
}

class ConversionDisplay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rates: {},
      rates_ready: false,
      pair: ['USD', 'ETH'],
      token: 'ETH',
      val1: 100,
      val2: 0,
      last_updated_val: 1,
      last_updated_amt: 100
    }
  }

  updateVal1(val) {
    this.setState({val1: val});

    if (this.state.rates_ready){
      const token_amt = Math.round(val * this.state.rates[this.state.token] * 10000) / 10000;
      this.setState({val2: token_amt});
    }

    this.updateSummary();
    this.state.last_updated_amt = val;
    this.state.last_updated_val = 1;
  }

  updateVal2(val) {
    this.setState({val2: val});

    if (this.state.rates_ready){
      const token_amt = Math.round(val / this.state.rates[this.state.token] * 10000) / 10000;
      this.setState({val1: token_amt});
    }

    this.updateSummary();
    this.state.last_updated_amt = val;
    this.state.last_updated_val = 2;
  }

  updateSummary() {
    let str = "You get " + this.state.val2 + " " + this.state.token + " for $" + this.state.val1 + " USD";
    this.setState({summary: str});
  }

  pullData() {
    fetch("https://api.coinbase.com/v2/exchange-rates?currency=USD")
      .then((res) => res.json())
      .then((json) => {
        this.state.rates = json.data.rates;
        this.state.rates_ready = true;

        if (this.state.last_updated_val == 1){
          this.updateVal1(this.state.last_updated_amt);
        }else{
          this.updateVal2(this.state.last_updated_amt);
        }
      });
  }

  componentDidMount() {
    this.pullData();
    // this.loop = setInterval(() => this.pullData(), 30000);
  }

  componentWillUnmount() {
    clearInterval(this.loop);
  }

  render() {
    return (
      <div className="ConversionDisplay">
        <h2>Currency Conversion</h2>
        <p>I want to spend</p>
        <CurrencyInput currency="USD" val={this.state.val1} updateFn={this.updateVal1.bind(this)} />
        <p>I want to buy</p>
        <CurrencyInput currency={this.state.token} val={this.state.val2} updateFn={this.updateVal2.bind(this)} />
        <p>Summary</p>
        <p>{this.state.summary}</p>
      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <ConversionDisplay />
    </div>
  );
}

export default App;
