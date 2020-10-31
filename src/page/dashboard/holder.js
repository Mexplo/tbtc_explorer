import React from 'react';
import moment from 'moment';
import { Table, Button } from 'antd';
import { Link } from 'react-router-dom';
import { addressFormatter } from '../../utils/index';
import { gql, useQuery } from '@apollo/client';
import { LoadingOutlined } from '@ant-design/icons';
import LineChart from '../../components/Chart/Line';
import Utils from '../../utils';
import PieChart from '../../components/Chart/Pie';

const HOLDER_QUERY = gql`
  {
    tokenHolders (
      orderBy: tokenBalanceRaw,
      orderDirection: desc,
      first: 100
    ) {
      id,
      tokenBalanceRaw
    }
  }
`;

export default function Holder() {
  const { loading, error, data } = useQuery(HOLDER_QUERY, {
    client: Utils.tbtcGraphClient
  });
  if (error) return <p>Error :(</p>;
  let holders = data && data.tokenHolders || [];
  let chartData = [];
  let totalSupply = 0;

  if (holders && holders.length) {
    chartData = holders.map(item => {
      totalSupply += parseFloat(item.tokenBalanceRaw / 1e18);
      return {
        ...item,
        id: addressFormatter(item.id, false),
        balance: +parseFloat(item.tokenBalanceRaw / 1e18).toFixed(2),
      };
    });
  }

  if (chartData && chartData.length) {
    return <div className="dashboard__box">
      <PieChart data={chartData} totalSupply={totalSupply.toFixed(2)} />
    </div>;
  } else {
    return <div className="dashboard__box"></div>;
  }
}
