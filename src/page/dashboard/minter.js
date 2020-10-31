import React from 'react';
import moment from 'moment';
import { Table, Button } from 'antd';
import { Link } from 'react-router-dom';
import { addressFormatter } from '../../utils/index';
import { gql, useQuery } from '@apollo/client';
import { LoadingOutlined } from '@ant-design/icons';
import LineChart from '../../components/Chart/Line';
import Utils from '../../utils';
import BigNumber from 'bignumber.js';
import ColumnChart from '../../components/Chart/Column';

const MINT_QUERY = gql`
  query Mint($first: Int!, $skip: Int!) {
    mints (
      orderBy: timestamp,
      orderDirection: desc,
      first: $first,
      skip: $skip
    ) {
      to,
      amount
    }
  }
`;

class Minter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      minters: []
    }
  }

  async componentDidMount() {
    // get total mints
    let mints = [],
        page = 0,
        pageSize = 800
    ;
    try {
      while(true) {
        let data = await this.getData(page, pageSize);
        mints = mints.concat(data);
        if(data && data.length >= pageSize) {
          page++;
          continue;
        }
        break;
      }
      console.log('mints: ', mints);
    } catch(e) {
      console.error(e)
    }

    // cal total count of minters
    let totalAmount = {};
    let minter_addrs = [];
    mints.map(mint => {
      if(!totalAmount[mint.to]) {
        totalAmount[mint.to] = new BigNumber(0);
        minter_addrs.push(mint.to);
      }
      let amount = new BigNumber(mint.amount);
      totalAmount[mint.to] = totalAmount[mint.to].plus(amount);
    });

    let minters = [];
    minter_addrs.map(addr => {
      minters.push({addr, amount: totalAmount[addr]})
    })
    minters = minters.sort((a, b) => b.amount.comparedTo(a.amount));
    this.setState({ minters })
  }

  getData = (page, pageSize) => {
    return new Promise((resolve, reject) => {
      let self = this;
      let skip = page * pageSize;
      Utils.tbtcGraphClient.query({
        query: MINT_QUERY,
        variables: { first: pageSize, skip: skip }
      })
      .then(res => {
        if(res.loading) return;
        let mints = res.data && res.data.mints || [];
        resolve(mints)
      })
      .catch(e => reject(e));
    })
  }

  render() {
    let { minters } = this.state;
    let chartData = minters.splice(0, 50);

    if (chartData && chartData.length) {
      chartData = chartData.map(item => {
        return {
          ...item,
          minted: parseFloat(item.amount)
        }
      });

      return <div className="dashboard__box">
        <ColumnChart data={chartData} />
      </div>;
    } else {
      return <div className="dashboard__box"></div>;
    }
  }
}

export default Minter;
