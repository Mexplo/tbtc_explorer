import React from 'react';
import Web3 from 'web3';
import Home from './page/home/';
import Deposit from './page/deposit';
import Redeem from './page/redeem';
import Detail from './page/detail';
import User from './page/user';
import TDT from './page/tdt';
import LiquidityPool from './page/liquidity';
import Dashboard from './page/dashboard/';
import styles from './style/index.css';
import Utils from './utils';
import 'antd/dist/antd.css';
import { message, Badge } from 'antd';
import { ApolloProvider } from '@apollo/client';
// import { Router, Route, Link } from 'react-router'

import { Menu, Divider, Input, Popover, Tooltip } from 'antd';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";

message.config({
  duration: 2,
  maxCount: 1,
});

const { Search } = Input;
const DepositFactoryJSON = require("@keep-network/tbtc/artifacts/DepositFactory.json");
const TBTCSystemJSON = require("@keep-network/tbtc/artifacts/TBTCSystem.json");
const TBTCTokenJson = require("@keep-network/tbtc/artifacts/TBTCToken.json");
const TBTCDepositTokenJson = require("@keep-network/tbtc/artifacts/TBTCDepositToken.json");
const VendingMachineJson = require("@keep-network/tbtc/artifacts/VendingMachine.json");

const web3 = new Web3("https://mainnet.infura.io/v3/fae6a8d70b074a21898e735c568a80cf");
const contracts = {
  DepositFactoryContract: new web3.eth.Contract(DepositFactoryJSON.abi, "0x87effef56c7ff13e2463b5d4dce81be2340faf8b"),
  TBTCSystemContract: new web3.eth.Contract(TBTCSystemJSON.abi, "0xe20A5C79b39bC8C363f0f49ADcFa82C2a01ab64a"),
  TBTCTokenContract: new web3.eth.Contract(TBTCTokenJson.abi, "0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa"),
  TBTCDepositTokenContract: new web3.eth.Contract(TBTCDepositTokenJson.abi, "0x10B66Bd1e3b5a936B7f8Dbc5976004311037Cdf0"),
  VendingMachineContract: new web3.eth.Contract(VendingMachineJson.abi, "0x526c08e5532a9308b3fb33b7968ef78a5005d2ac"),
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { route: null }
  }

  handleSearch = (addr) => {
    if(!Utils.web3.utils.isAddress(addr)) {
      message.error('Invalid address!');
    } else {
      window.location.href = `/user/${addr}`;
    }
  }

  render() {
    let { route } = this.state;

    return (
      <Router>
        <ApolloProvider client={Utils.apolloClient}>
          <div id="box" className="box">
            <div className="header">
              <section>
              <Link to="/" className="header__logo">
                <img src="/logo.svg" />
              </Link>

              <div className="header__menu">
                <Link to="/">
                  Home
                </Link>
                <Link to="/dashboard">
                  Insight
                </Link>
                <Link to="/deposit">
                  Deposit
                </Link>
                <Link to="/redeem">
                  Redeem
                </Link>
                <Link to="/tdt">
                  TDT
                </Link>
                <Tooltip
                  visible={true}
                  placement="bottom"
                  title={(
                    <div className='tooltip__content'>tBTC liquidity info in DeFi.</div>
                  )}
                >
                  <Link to="/liquidity">
                    Liquidity
                  </Link>
                </Tooltip>
              </div>
              </section>
              {
                /*
                <div className="search">
                  <Search placeholder="Input your wallet" size="large" onSearch={this.handleSearch} enterButton />
                </div>
                */
              }
            </div>

            <div className="container">
              <div className="container__right">
                <section className="container__right_box">
                  <Switch>
                    <Route exact path="/">
                      <Home />
                    </Route>
                    <Route path="/deposit">
                      <Deposit />
                    </Route>
                    <Route path="/redeem">
                      <Redeem />
                    </Route>
                    <Route path="/detail/:id" component={Detail} />
                    <Route path="/user/:id" component={User} />
                    <Route path="/tdt">
                      <TDT />
                    </Route>
                    <Route path="/liquidity" component={LiquidityPool} />
                    <Route path="/dashboard" component={Dashboard} />
                  </Switch>
                </section>
              </div>
            </div>
          </div>

          <div className="footer">
            <section>
              <label>Copyright © 2020, tBTC-Explorer Team. All rights reserved.</label>

              <a href="https://github.com/Mexplo/tbtc_explorer" target="_blank">GitHub</a>

              <Popover
                content={(
                  <div className="donations">
                    <img src="/eth.png" />
                    <p>0x5180441e8c2caDa572841c26ab7eeD0726F1097D</p>
                  </div>
                )}
              >
                <span>Donations: 0x51....1097D</span>
              </Popover>
            </section>
          </div>
        </ApolloProvider>
      </Router>
    );
  }
}

export default App;
