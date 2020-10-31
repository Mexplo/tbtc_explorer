import React from 'react';
import Service from '../Service';
import { Row, Col, Button, Statistic, Table, Divider, Input } from 'antd';
import '../style/index.css';
import moment from 'moment';
import { addressFormatter, txFormatter } from '../utils/index';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Utils from '../utils';
import { LoadingOutlined } from '@ant-design/icons';

const { Search } = Input;
const fromBlock = 10959084;

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tbtcBalance: null,
      tdtBalance: null,
      frtBalance: null,

      depositList: null,
      redeemList: null,

      mintLotSize: {},
      redeemLotSize: {},
    }
  }

  async componentDidMount() {
    const wallet = this.props.match.params.id;

    this.getTbtcBalance(wallet);
    this.getTdtBalance(wallet);
    this.getFrtBalance(wallet);
    this.getDepositList(wallet);
    this.getRedeemList(wallet);

    // try {
    //   let theHeight = window.innerHeight;
    //   document.getElementById('box').style.height = `${theHeight}px`;
    // } catch(e) {
    //   console.log(e);
    // }
  }

  getTbtcBalance = async (wallet) => {
    let tbtcBalance = await Service.tbtc.balance(wallet);
    this.setState({ tbtcBalance });
  }

  getTdtBalance = async (wallet) => {
    //TODO fetch wallet from url
    let tdtBalance = await Service.tdt.balance(wallet);
    this.setState({ tdtBalance });
  }

  getFrtBalance = async (wallet) => {
    let frtBalance = await Service.frt.balance(wallet);
    this.setState({ frtBalance });
  }

  getDepositList = async (wallet) => {
    let depositList = (await Service.deposit.getByWallet(wallet)).reverse();
    this.setState({ depositList });

    let addrList = [];
    depositList.map(deposit => addrList.push(deposit.returnValues._depositContractAddress));
    this.getMintLotSize(addrList);
  }

  getRedeemList = async (wallet) => {
    let redeemList = (await Service.redeem.getByWallet(wallet)).reverse();
    this.setState({ redeemList });

    let addrList = [];
    redeemList.map(redeem => addrList.push(redeem.returnValues._depositContractAddress));
    this.getRedeemLotSize(addrList);
  }

  getMintLotSize = async addrList => {
    let mintLotSize = await Service.deposit.getLotSizeTbtc(addrList);
    this.setState({ mintLotSize });
  }

  getRedeemLotSize = async addrList => {
    let redeemLotSize = await Service.deposit.getLotSizeTbtc(addrList);
    this.setState({ redeemLotSize });
  }

  render() {
    let { tbtcBalance, tdtBalance, frtBalance, depositList, redeemList, mintLotSize, redeemLotSize } = this.state;

    return (
      <div>
        <section className="assets__user">
          <div span="5" className="assets__user_box">
            <Statistic title="TBTC Balance" prefix={!tbtcBalance && <LoadingOutlined />} value={tbtcBalance / 1e18} precision={5} />
          </div>

          <div span="5" className="assets__user_box">
            <Statistic title="TDT Count" prefix={!tdtBalance && <LoadingOutlined />} value={tdtBalance || 0} precision={0} />
          </div>

          <div span="5" className="assets__user_box">
            <Statistic title="FRT Count" prefix={!frtBalance && <LoadingOutlined />} value={frtBalance || 0} precision={0} />
          </div>
        </section>

        <Divider />

        <Row type="flex" justify="space-around">
          <Col span="11" className="list">
            <h1>Deposit List</h1>
            <Table
              size="small"
              pagination={false}
              loading={depositList === null}
              rowKey={item => item.returnValues['_timestamp']}
              columns={[
                {
                  title: 'Time',
                  render(item) {
                    return moment(+item.returnValues['_timestamp'] * 1000).fromNow();
                  }
                },
                {
                  title: 'Contract Address',
                  render(item) {
                    return <Link to={`/detail/${item.returnValues['_depositContractAddress']}`}>
                      { addressFormatter(item.returnValues['_depositContractAddress'], false) }
                    </Link>;
                  }
                },
                {
                  title: 'Lot Size',
                  align: 'right',
                  render(item) {
                    return mintLotSize[item.returnValues._depositContractAddress] ?
                      <div>{ mintLotSize[item.returnValues._depositContractAddress] / 1e18 } <i>BTC</i></div> :
                      <LoadingOutlined />
                    ;
                  }
                },
              ]}
              dataSource={depositList || []}
            />
          </Col>

          <Col span="11" className="list">
            <h1>Redeem List</h1>
            <Table
              size="small"
              loading={redeemList === null}
              pagination={false}
              rowKey={item => item.transactionIndex}
              columns={[
                {
                  title: 'Time',
                  render(item) {
                    return moment(Utils.time.blockToTimestamp(item.blockNumber) * 1000).fromNow();
                  }
                },
                {
                  title: 'Contract address',
                  render(item) {
                    return <Link to={`/detail/${item.returnValues['_depositContractAddress']}`}>
                      { addressFormatter(item.returnValues['_depositContractAddress'], false) }
                    </Link>;
                  }
                },
                {
                  title: 'Lot Size',
                  align: 'right',
                  render(item) {
                    return redeemLotSize[item.returnValues._depositContractAddress] ?
                      <div>{ redeemLotSize[item.returnValues._depositContractAddress] / 1e18 } <i>BTC</i></div> :
                      <LoadingOutlined />
                    ;
                  }
                },
              ]}
              dataSource={redeemList || []}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default User;
