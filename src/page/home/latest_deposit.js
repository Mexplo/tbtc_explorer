import React from 'react';
import moment from 'moment';
import { Table, Button } from 'antd';
import { Link } from 'react-router-dom';
import { addressFormatter } from '../../utils/index';
import { gql, useQuery } from '@apollo/client';

const DEPOSITS_QUERY = gql`
  {
    deposits(
      orderBy: createdAt,
      orderDirection: desc,
      first: 10
    ) {
      id,
      contractAddress,
      lotSizeSatoshis,
      currentState,
      keepAddress,
      updatedAt,
      createdAt,
      redemptionStartedAt,
      currentStateTimesOutAt
      tdtToken {
        owner
      }
    }
  }
`;

export default function LatestDeposit() {
  const { loading, error, data } = useQuery(DEPOSITS_QUERY);
  if (error) return <p>Error :(</p>;

  let deposits = data && data.deposits || [];

  return <div>
    <h1>Latest Deposit</h1>
    <Table
      size="small"
      pagination={false}
      loading={loading}
      rowKey={item => item.transactionIndex}
      rowClassName={(record, index) => {
        return index % 2 === 0 ? 'row__white' : 'row__ccc';
      }}
      columns={[
        {
          title: '#',
          render() {
            return <span className="icon__deposit">D</span>;
          }
        },
        {
          title: 'Time',
          render(item) {
            return moment(+item.createdAt * 1000).fromNow();
          }
        },
        {
          title: 'User',
          render(item) {
            return (
              <Link to={`/user/${item.tdtToken.owner}`}>
                { addressFormatter(item.tdtToken.owner, false) }
              </Link>
            )
          }
        },
        {
          title: 'Contract Address',
          render(item) {
            return <Link to={`/detail/${item.contractAddress}`}>
              { addressFormatter(item.contractAddress, false) }
            </Link>;
          }
        },
        {
          title: 'Lot Size',
          align: 'right',
          render(item) {
            return <div className="lotSize">{ item.lotSizeSatoshis / 1e8 } <i>BTC</i></div>;
          }
        },
      ]}
      dataSource={deposits}
    />
      
    <Link to="/deposit">
      <Button
        block
        className="list__btn"
      >
        View all Deposits
      </Button>
    </Link>
  </div>;
}