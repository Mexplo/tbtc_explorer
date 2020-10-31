import React from 'react';
import Service from '../Service';
import { Button, Select, Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import '../style/index.css';
import moment from 'moment';
import Utils from '../utils';
import { addressFormatter, txFormatter } from '../utils/index';
import { LoadingOutlined } from '@ant-design/icons';
import { gql } from '@apollo/client';

const { Option } = Select;
class Deposit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      pageSize: 200,
      deposits: []
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
        let deposits = this.state.deposits.concat(data);
        this.setState({ deposits, page: page + 1 });
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
    let { deposits } = this.state;
    return (
      <div className="explorer">
        {
          /*
          <div className="explorer__search">
            <Select className="explorer__search_select">
              <Option>filter addr</Option>
            </Select>
            &nbsp;
            &nbsp;
            &nbsp;
            <Select className="explorer__search_select">
              <Option>filter status</Option>
            </Select>
          </div>
          */
        }

        <h1>Deposit List</h1>

        <Table
          size="small"
          bordered
          loading={!deposits || !deposits.length}
          columns={[
            {
              title: 'Time',
              render(deposit) {
                return moment(+deposit.createdAt * 1000).fromNow();
              }
            },
            {
              title: 'Creator',
              render(deposit) {
                return <Link to={`/user/${deposit.tdtToken.owner}`}>
                  { addressFormatter(deposit.tdtToken.owner, false) }
                </Link>
              }
            },
            {
              title: 'Contract',
              render(deposit) {
                return <Link to={`/detail/${deposit.contractAddress}`}>
                  { addressFormatter(deposit.contractAddress, false) }
                </Link>
              }
            },
            {
              title: 'Lot Size',
              align: 'right',
              render(deposit) {
                return <div>{ deposit.lotSizeSatoshis / 1e8 } <i>BTC</i></div>;
              },
              sorter: (a, b) => {
                let aValue = a.lotSizeSatoshis / 1e8;
                let bValue = b.lotSizeSatoshis / 1e8;
                return aValue - bValue;
              }
            },
            {
              title: 'State',
              align: 'right',
              render(deposit) {
                let color = '#87d068';
                if (deposit.currentState.indexOf('FAILED') >= 0) {
                  color = '#f50';
                } else if (deposit.currentState === 'ACTIVE') {
                  color  = '#87d068';
                } else {
                  color = 'orange';
                }

                return <Tag color={color}>{ deposit.currentState }</Tag>;
              }
            },
          ]}
          rowKey={item => item.id}
          dataSource={deposits}
          pagination={{
            pageSize: 15,
            pageSizeOptions: [15, 50, 100],
            onChange: this.onChange,
          }}
        />

        {
          /*
          <table>
            <thead>
              <tr>
                <th>time</th>
                <th>creator</th>
                <th>contract</th>
                <th>lotSize</th>
                <th>state</th>
              </tr>
            </thead>
            <tbody>
            {depositEventList && depositEventList.map(deposit => (
              <tr key={deposit.returnValues._depositContractAddress}>
                <td>{deposit.returnValues._timestamp}</td>
                <td>creator_todo_add</td>
                <td>{deposit.returnValues._depositContractAddress}</td>
                <td>{lotSize[deposit.returnValues._depositContractAddress]}</td>
                <td>{state[deposit.returnValues._depositContractAddress]}</td>
              </tr>
            ))}
            </tbody>
          </table>
          */
        }
      </div>
    );
  }
}

const DEPOSITS_QUERY = gql`
  query Deposit($first: Int!, $skip: Int!) {
    deposits(
      orderBy: createdAt,
      orderDirection: desc,
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

export default Deposit;
