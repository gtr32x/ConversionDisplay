import logo from './logo.svg';
import './App.css';
import React, { Component } from "react"

const tokens = [
  "ETH",
  "BTC",
  "MATIC",
  "SOL"
];

function CurrencyInput(props) {
  return (
    <div className="CurrencyInput">
      <input className="CurrencyAmount" type="text" value={props.val} onChange={(e) => props.updateFn(e.target.value)} />
      <a className={"CurrencySelector " + (props.selectFn ? "clickable" : "")} onClick={(e) => props.selectFn ? props.selectFn() : ""}>{props.currency}</a>
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
      amt_usd: 100,
      amt_token: 0,
      last_updated_val: 1,
      last_updated_amt: 100,
      timer_is_set: false,
      show_token_selector: false
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

  updateToken(amt) {
    if (!amt) amt = this.state.amt_token;
    this.setState({amt_token: amt});

    if (this.state.rates_ready){
      const token_amt = Math.round(amt / this.getRatesForToken(this.state.token) * 10000) / 10000;
      this.setState({amt_usd: token_amt}, () => {
        this.updateSummary();
      });
    }

    this.state.last_updated_amt = amt;
    this.state.last_updated_val = 2;
  }

  updateUSD(amt) {
    if (!amt) amt = this.state.amt_usd;
    this.setState({amt_usd: amt});

    if (this.state.rates_ready){
      const token_amt = Math.round(amt * this.getRatesForToken(this.state.token) * 10000) / 10000;
      this.setState({amt_token: token_amt}, () => {
        this.updateSummary();
      });
    }

    this.state.last_updated_amt = amt;
    this.state.last_updated_val = 1;
  }

  openSelector() {
    this.setState({show_token_selector: true})
  }

  selectToken(event) {
    const token = event.target.getAttribute('data-token');
    this.state.token = token;
    this.setState({token: token, show_token_selector: false}, () => {
      this.updateUSD();
    });
  }

  updateSummary() {
    let str = "You get " + this.state.amt_token + " " + this.state.token + " for $" + this.state.amt_usd + " USD";
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
          this.updateUSD(this.state.last_updated_amt);
        }else{
          this.updateToken(this.state.last_updated_amt);
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
          this.updateUSD();
        }else{
          this.updateToken();
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
      this.loopCB = setInterval(() => this.pullDataCB(), 30000);

      // Offset CoinGecko api call by 10 seconds so we interleave API data processing
      setTimeout(() => {
        // this.loopCG = setInterval(() => this.pullDataCG(), 30000);
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
    const selectors = tokens.map((t) => <a className="TokenOption" onClick={this.selectToken.bind(this)} key={t} data-token={t}>{t}</a>);

    return (
      <div className="ConversionDisplay">
        <h2>Currency Conversion</h2>
        <p>I want to spend</p>
        <CurrencyInput currency="USD" val={this.state.amt_usd} updateFn={this.updateUSD.bind(this)} />
        <p>I want to buy</p>
        <CurrencyInput currency={this.state.token} val={this.state.amt_token} updateFn={this.updateToken.bind(this)} selectFn={this.openSelector.bind(this)} />
        <p>Summary</p>
        <p className="ConversionSummary">{this.state.summary}</p>

        <div id="TokenSelector" style={this.state.show_token_selector ? {} : { display: 'none' }}>
          <h3>Choose a token</h3>
          {selectors}
        </div>
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
