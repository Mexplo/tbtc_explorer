import React from 'react';
import Service from '../../Service';
import { Row, Col, Button, Statistic, Table, Divider, Input, message } from 'antd';
import '../../style/index.css';
import moment from 'moment';
import { addressFormatter, txFormatter } from '../../utils/index';
import { ArrowUpOutlined, ArrowDownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Utils from '../../utils';
import LineChart from '../../components/Chart/Line';
import { gql, useQuery } from '@apollo/client';
import LatestRedeem from './latest_redeem';
import LatestDeposit from './latest_deposit';
import HistoryDeposit from './history_deposit';
import HistoryRedeem from './history_redeem';

const { Search } = Input;
const wallet = '0xf6f372dfaecc1431186598c304e91b79ce115766';
const fromBlock = 10959084;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      totalSupply: 0,
      totalMinted: 0,
      currentSupply: 0,
      totalMintedUserCount: 0,

      depositHistory: [],
      redeemHistory: []
    }

    this.getTbtcData = this.getTbtcData.bind(this);
  }

  async componentDidMount() {
    this.getTbtcData();
  }

  async getTbtcData() {
    let result = {};
    await Promise.all([
      (async () => result.totalSupply = await Service.tbtc.maxSupply())(),
      (async () => result.currentSupply = await Service.tbtc.currentSupply())(),
      (async () => result.totalMinted = await Service.tbtc.totalMinted())(),
      (async () => result.totalMintedUserCount = await Service.tbtc.mintUserCount())(),
    ]);

    console.log(result)

    this.setState(result);
  }

  handleSearch = (addr) => {
    if(!Utils.web3.utils.isAddress(addr)) {
      message.error('Invalid address!');
    } else {
      window.location.href = `/user/${addr}`;
    }
  }

  render() {
    let {
      currentSupply,
      totalSupply,
      totalMinted,
      totalMintedUserCount,
    } = this.state;

    let loadingComponent = <div className="chart"><LoadingOutlined style={{fontSize: '28px', color: '#ccc'}} /></div>;

    return (
      <div>
        <section className="home__search">
          <h1><b>tBTC</b> Explorer</h1>
          <div className="search">
            <Search placeholder="Search for an address, a transaction" size="large" onSearch={this.handleSearch} enterButton />
          </div>

          <p>
            <b>tBTC</b>The safe way to earn with your Bitcoin.
            <Button type="link" href="https://dapp.tbtc.network/" target="_blank">Mint your first tBTC?</Button>
          </p>
        </section>

        <section className="assets">
          <div span="4" className="assets__box">
            <Statistic title="Current Supply" prefix={!currentSupply ? <LoadingOutlined /> : <ArrowUpOutlined />} value={currentSupply / 1e18} precision={5} />
          </div>

          <div className="assets__box">
            <Statistic title="Total Supply" prefix={!totalSupply && <LoadingOutlined />} value={totalSupply / 1e18} precision={5} />
          </div>

          <div span="4" className="assets__box">
            <Statistic title="Total Minted" prefix={!totalMinted && <LoadingOutlined />} value={totalMinted / 1e18} precision={5} />
          </div>

          <div span="4" className="assets__box">
            <Statistic title="Total Minted User" prefix={!totalMintedUserCount && <LoadingOutlined />} value={totalMintedUserCount} precision={0} />
          </div>

          <div span="4" className="banner">
            <span>1 tBTC = 1 BTC</span>
          </div>
        </section>

        <Row type="flex" justify="space-around">
          <Col lg={11} xs={24} className="list">
            <HistoryDeposit />
          </Col>
          <Col lg={11} xs={24} className="list">
            <HistoryRedeem />
          </Col>
          <Col lg={11} xs={24} className="list">
            <LatestDeposit />
          </Col>

          <Col lg={11} xs={24} className="list">
            <LatestRedeem />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Home;
