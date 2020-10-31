import React from 'react';
import Utils from '../utils';
import { Table, Radio } from 'antd';
import Service from '../Service';
import { Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { gql } from '@apollo/client';

const DepositJSON = require("@keep-network/tbtc/artifacts/Deposit.json");

const fromBlock = '0';

class AvailableTokenIdList extends React.Component {
  constructor(props) {
    super(props);
    // tokenEntryEventList = tokenUsedList + tokenAvailableList
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
        console.log('tbt: ', deposits)
        resolve(deposits)
      })
      .catch(e => reject(e));
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
      <div>
        <div className="info">
          <h3>What is TDT?</h3>
          <div>The tBTC Deposit Token, commonly referenced as the TDT, is an ERC721 non-fungible token whose ownership reflects the ownership of its corresponding deposit. Each deposit has one TDT, and vice versa. Owning a TDT is equivalent to owning its corresponding deposit. TDTs can be transferred freely. tBTC's VendingMachine contract takes ownership of TDTs and in exchange returns fungible TBTC tokens whose value is backed 1-to-1 by the corresponding deposit's BTC.</div>
          <br />
          <div>In short, you will need it when you need to redeem BTC</div>
        </div>

        <Divider />

        <div className="explorer">
          <h3>Available TDT(For Redeem BTC)</h3>
          <br/>

          <Table
            loading={!deposits.length}
            dataSource={deposits}
            rowKey={item => item.id}
            size="small"
            pagination={{
              pageSize: 15,
              onChange: this.onChange,
            }}
            columns={[
              {
                title: 'ID',
                render(item) {
                  return <div>{ item.contractAddress }</div>;
                }
              },
              {
                title: 'Lot Size',
                align: 'right',
                render(item) {
                  return <div>{ item.lotSizeSatoshis / 1e8 } <i>BTC</i></div>
                },
                sorter: (a, b) => {
                  let aValue = a.lotSizeSatoshis / 1e8;
                  let bValue = b.lotSizeSatoshis / 1e8;
                  return aValue - bValue;
                }
              }
            ]}
          />
        </div>
      </div>
    );
  }
}

const DEPOSITS_QUERY = gql`
  query Deposit($first: Int!, $skip: Int!) {
    deposits(
      orderBy: createdAt,
      orderDirection: desc,
      where: { currentState: "ACTIVE" },
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


export default AvailableTokenIdList;
