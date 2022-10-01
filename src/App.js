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
      rates: {
        'CB': {},
        'CG': {}
      },
      rates_last_update_ts: {
        'CB': 0,
        'CG': 0
      },
      rates_ready: false,
      pair: ['USD', 'ETH'],
      token: 'ETH',
      val1: 100,
      val2: 0,
      last_updated_val: 1,
      last_updated_amt: 100,
      timer_is_set: false
    }
  }

  getCurrentTS() {
    return Date.now() / 1000;
  }

  getRatesForToken(token) {
    if (this.state.rates_ready){
      if (this.state.rates_last_update_ts.CB >= this.getCurrentTS() - 40){
        return this.state.rates.CB[token];
      }

      if (this.state.rates_last_update_ts.CG >= this.getCurrentTS() - 40){
        return this.state.rates.CG[token];
      }
    }

    return 0;
  }

  updateToken(val) {
    this.setState({val1: val});

    if (this.state.rates_ready){
      const token_amt = Math.round(val * this.getRatesForToken(this.state.token) * 10000) / 10000;
      this.setState({val2: token_amt});
      this.updateSummary();
    }

    this.state.last_updated_amt = val;
    this.state.last_updated_val = 1;
  }

  updateUSD(val) {
    this.setState({val2: val});

    if (this.state.rates_ready){
      const token_amt = Math.round(val / this.getRatesForToken(this.state.token) * 10000) / 10000;
      this.setState({val1: token_amt});
      this.updateSummary();
    }

    this.state.last_updated_amt = val;
    this.state.last_updated_val = 2;
  }

  updateSummary() {
    let str = "You get " + this.state.val2 + " " + this.state.token + " for $" + this.state.val1 + " USD";
    this.setState({summary: str});
  }

  pullDataCB() {
    fetch("https://api.coinbase.com/v2/exchange-rates?currency=USD")
      .then((res) => res.json())
      .then((json) => {
        this.state.rates.CB = json.data.rates;
        this.state.rates_ready = true;
        this.state.rates_last_update_ts.CB = this.getCurrentTS();

        if (this.state.last_updated_val == 1){
          this.updateToken(this.state.last_updated_amt);
        }else{
          this.updateUSD(this.state.last_updated_amt);
        }

        console.log("CB updated");
      });
  }

  pullDataCG() {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd")
      .then((res) => res.json())
      .then((json) => {
        let rates = {};

        for (const i of json){
          rates[i.symbol.toUpperCase()] = 1/i.current_price;
        }

        this.state.rates.CG = rates;
        this.state.rates_ready = true;
        this.state.rates_last_update_ts.CG = this.getCurrentTS();

        if (this.state.last_updated_val == 1){
          this.updateToken(this.state.last_updated_amt);
        }else{
          this.updateUSD(this.state.last_updated_amt);
        }

        console.log("CG updated");
      });
  }

  componentDidMount() {
    // Upon component creation, call each rates API once to fetch the initial data
    // this.pullDataCG();
    this.pullDataCB();

    // Using a flag here to ensure that we will only ever set the timer once in the lifetime of this component to avoid unnecessary API calls that breach the rate limit
    if (!this.state.timer_is_set){
      this.loopCB = setInterval(() => this.pullDataCB(), 10000);

      // Offset CoinGecko api call by 10 seconds so we interleave API data processing
      setTimeout(() => {
        // this.loopCG = setInterval(() => this.pullDataCG(), 10000);
      }, 10000);

      this.state.timer_is_set = true;
    }
  }

  componentWillUnmount() {
    if (this.loopCB){
      clearInterval(this.loopCB);
    }

    if (this.loopCG){
      clearInterval(this.loopCG);
    }

    this.state.timer_is_set = false;
  }

  render() {
    return (
      <div className="ConversionDisplay">
        <h2>Currency Conversion</h2>
        <p>I want to spend</p>
        <CurrencyInput currency="USD" val={this.state.val1} updateFn={this.updateToken.bind(this)} />
        <p>I want to buy</p>
        <CurrencyInput currency={this.state.token} val={this.state.val2} updateFn={this.updateUSD.bind(this)} />
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
