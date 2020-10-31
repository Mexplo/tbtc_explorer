import React from 'react';
import moment from 'moment';
import { Table, Button } from 'antd';
import { Link } from 'react-router-dom';
import { addressFormatter } from '../../utils/index';
import { gql, useQuery } from '@apollo/client';

const USER_QUERY = gql`
  {
    users(first: 1000) {
      id,
      address,
      numDepositsCreated,
      numDepositsRedeemed,
      numDepositsUnfunded,
      numOwnDepositsRedeemed
    }
  }
`;

export default function ActionStatistics() {
  const { loading, error, data } = useQuery(USER_QUERY);
  if (error) {
    console.error(error);
    return <p>Error :(</p>
  };
  let users = data && data.users || [];

  return <div>
    <Table
      size="small"
      pagination={true}
      loading={loading}
      rowKey={item => item.id}
      rowClassName={(record, index) => {
        return index % 2 === 0 ? 'row__white' : 'row__ccc';
      }}
      columns={[
        {
          title: 'User',
          render(item) {
            return (
              <Link to={`/user/${item.address}`}>
                { addressFormatter(item.address, false) }
              </Link>
            )
          }
        },
        {
          title: 'DepositCreated',
          render(item) {
            return <div>{item.numDepositsCreated}</div>;
          }
        },
        {
          title: 'DepositsUnfunded',
          render(item) {
            return <div>{item.numDepositsUnfunded}</div>;
          }
        },
        {
          title: 'OwnDepositsRedeemed',
          render(item) {
            return <div>{item.numOwnDepositsRedeemed}</div>;
          }
        },
        {
          title: 'DepositsRedeemed',
          render(item) {
            return <div>{item.numDepositsRedeemed}</div>;
          }
        },
      ]}
      dataSource={users}
    />
  </div>;
}
