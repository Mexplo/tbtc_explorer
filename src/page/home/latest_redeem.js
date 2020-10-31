import React from 'react';
import moment from 'moment';
import { Table, Button } from 'antd';
import { Link } from 'react-router-dom';
import { addressFormatter } from '../../utils/index';
import { gql, useQuery } from '@apollo/client';

const REDEMPTION_QUERY = gql`
  {
    deposits(
      orderBy: redemptionStartedAt,
      orderDirection: desc,
      first: 10,
      where: { redemptionStartedAt_not: null }
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

export default function LatestRedeem() {
  const { loading, error, data } = useQuery(REDEMPTION_QUERY);

  if (error) return <p>Error :(</p>;
  let redeems = data && data.deposits || [];
  console.log('redeems', redeems)

  return <div>
    <h1>Latest Redeem</h1>
    <Table
      size="small"
      loading={loading}
      pagination={false}
      rowKey={item => item.transactionIndex}
      rowClassName={(record, index) => {
        return index % 2 === 0 ? 'row__white' : 'row__ccc';
      }}
      columns={[
        {
          title: '#',
          render() {
            return <span className="icon__deposit">R</span>;
          }
        },
        {
          title: 'Time',
          render(item) {
            return moment(+item.redemptionStartedAt * 1000).fromNow();
          }
        },
        {
          title: 'User',
          render(item) {
            return <Link to={`/user/${item.tdtToken.owner}`}>
              { addressFormatter(item.tdtToken.owner, false) }
            </Link>
          }
        },
        {
          title: 'Contract address',
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
            return <div className="lotSize">{ item.lotSizeSatoshis / 1e8 } <i>BTC</i></div>
          }
        },
      ]}
      dataSource={redeems}
    />

    <Link to="/redeem">
      <Button
        block
        className="list__btn"
      >
        View all Redeem
      </Button>
    </Link>
  </div>;
}