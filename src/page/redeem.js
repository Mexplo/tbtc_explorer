import React from 'react';
import { Table, Button, Tag } from 'antd';
import { Link } from 'react-router-dom';
import Utils from '../utils';
import Service from '../Service';
import moment from 'moment';
import { addressFormatter, txFormatter } from '../utils/index';
import { LoadingOutlined } from '@ant-design/icons';
import { gql } from '@apollo/client';

const fromBlock = '10700000';

class RedemptionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      pageSize: 200,
      redeems: []
    }
  }

  async componentDidMount() {
    this.getDataWithManager();
  }

  getDataWithManager = async () => {
    let { page, pageSize } = this.state;
    if(page < 0) return;
    try {
      let data = await this.getData(page, pageSize);
      if(!!data && data.length > 0) {
        let redeems = this.state.redeems.concat(data);
        console.log('redeems: ', redeems)
        this.setState({ redeems, page: page + 1 });
      } else {
        this.setState({ page: -1 }); // stop fetch
      }
    } catch(e) {
      console.error(e)
    }
  }

  getData = (page, pageSize) => {
    return new Promise((resolve, reject) => {
      let self = this;
      let skip = page * pageSize;
      Utils.apolloClient.query({
        query: DEPOSITS_QUERY,
        variables: { first: pageSize, skip: skip }
      })
      .then(res => {
        if(res.loading) return;
        let deposits = res.data && res.data.deposits || [];
        resolve(deposits)
      });
    })
  }

  onChange = async (newPage, newPageSize) => {
    let { page, pageSize } = this.state;
    if(newPage * newPageSize >= page * pageSize / 2) {
      this.getDataWithManager();
    }
  }

  render() {
    let { redeems } = this.state;
    return (
      <div>
        <div className="explorer">
          <h1>Redemption List</h1>

          <Table
            size="small"
            bordered
            loading={!redeems.length}
            columns={[
              {
                title: 'Time',
                render(item) {
                  return <span className="wallet">{ moment(+item.redemptionStartedAt * 1000).fromNow() }</span>;
                }
              },
              {
                title: 'Requester',
                render(item) {
                  return <Link to={`/user/${item.tdtToken.owner}`}>
                    { addressFormatter(item.tdtToken.owner, false) }
                  </Link>
                }
              },
              {
                title: 'Contract',
                render(item) {
                  return <Link to={`/detail/${item.contractAddress}`}>
                    { addressFormatter(item.contractAddress, false) }
                  </Link>
                }
              },
              {
                title: 'LotSize',
                align: 'right',
                render(item) {
                  return <div>{ item.lotSizeSatoshis / 1e8 } <i>BTC</i></div>
                }
              },
//              {
//                title: 'Request Fee',
//                align: 'right',
//                render(redemption) {
//                  return <div>{ redemption.returnValues._requestedFee / 1e8 } <i>BTC</i></div>
//                }
//              },
              {
              title: 'State',
                align: 'right',
                render(item) {
                  let color = '#87d068';
                  if (item.currentState.indexOf('FAILED') >= 0) {
                    color = '#f50';
                  } else if (item.currentState === 'REDEEMED') {
                    color  = '#87d068';
                  } else {
                    color = 'orange';
                  }

                  return <Tag color={color}>{ item.currentState }</Tag>;
                }
              },
            ]}
            rowKey={item => item.id}
            dataSource={redeems}
            pagination={{
              pageSize: 15,
              onChange: this.onChange,
            }}
          />
        </div>
      </div>
    );
  }
}

const DEPOSITS_QUERY = gql`
  query Deposit($first: Int!, $skip: Int!) {
    deposits(
      orderBy: redemptionStartedAt,
      orderDirection: desc,
      where: { redemptionStartedAt_not: null },
      first: $first,
      skip: $skip
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


export default RedemptionList;
