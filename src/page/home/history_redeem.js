import React from 'react';
import moment from 'moment';
import { Table, Button } from 'antd';
import { Link } from 'react-router-dom';
import { addressFormatter } from '../../utils/index';
import { gql, useQuery } from '@apollo/client';
import { LoadingOutlined } from '@ant-design/icons';
import LineChart from '../../components/Chart/Line';
import Utils from '../../utils';

const DEPOSITS_QUERY = gql`
  query Deposit($startAt: Int!, $stopAt: Int!) {
    deposits(
      orderBy: createdAt,
      orderDirection: desc,
      first: 500,
      where: { redemptionStartedAt_gt: $startAt, redemptionStartedAt_lt: $stopAt, redemptionStartedAt_not: null }
    ) {
      id,
      redemptionStartedAt
    }
  }
`;

function fetchDeposits(startAt, stopAt, history) {
  return new Promise((resolve, reject) => {
    Utils.apolloClient.query({
      query: DEPOSITS_QUERY,
      variables: { startAt, stopAt }
    })
    .then(res => {
      if(res.loading) return;
      let deposits = res.data && res.data.deposits || [];
      history.push({ timestamp: stopAt, count: deposits.length });
      resolve();
    })
    .catch(e => reject(e));;
  });
}

export default class HistoryRedeem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: []
    }
  }

  async componentDidMount() {
    let now = moment();
    let history = [];
    let promises = [];
    [0, 1, 2, 3, 4, 5, 6].map(() => {
      let stopAt = now.unix();
      let startAt = now.add(-1, 'days').unix();
      promises.push(fetchDeposits(startAt, stopAt, history));
    });
    await Promise.all(promises).catch(console.error);

    this.setState({ history });
  }

  render() {
    let { history } = this.state;
    let loadingComponent = <div className="chart"><LoadingOutlined style={{fontSize: '28px', color: '#ccc'}} /></div>;
    return (
      <div>
        <h1>Deposit History</h1>
        {
          history.length ? <LineChart data={history} /> : loadingComponent
        }
      </div>
    );
  }
}