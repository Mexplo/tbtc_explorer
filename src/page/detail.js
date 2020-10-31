import React from 'react';
import Utils from '../utils';
import BigNumber from 'bignumber.js';
import Service from '../Service';
import { Row, Col, Card, Descriptions, Steps } from 'antd';
import moment from 'moment';
import { addressFormatter, txFormatter } from '../utils/index';
import { LoadingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../style/index.css';
import { gql } from '@apollo/client';

const DEPOSITS_QUERY = gql`
  query GetDeposit($id: ID!) {
    deposit(id: $id) {
      id,
      contractAddress,
      currentState,
      createdAt,
      keepAddress,
      lotSizeSatoshis,
      endOfTerm,
      index,

      currentStateTimesOutAt,

      tdtToken {
          id,
          tokenID,
          owner,
          minter
      }

      initialCollateralizedPercent,
      undercollateralizedThresholdPercent,
      severelyUndercollateralizedThresholdPercent,

      bondedECDSAKeep {
        id,
        keepAddress,
        totalBondAmount,
        publicKey,
        status,
        honestThreshold,
        members {
          id,
          address
        }
      },

      depositLiquidation {
        cause
      }
    }
  }
`;

const LOG_QUERY = gql`
  query GetDepositLogs($depositId: String!)
  {
    events(where: {deposit: $depositId}, orderBy: timestamp, orderDirection: desc) {
      __typename,
      id,
      transactionHash,
      submitter,
      timestamp,

      ...on RegisteredPubKeyEvent {
        signingGroupPubkeyX,
        signingGroupPubkeyY
      }

      ...on StartedLiquidationEvent {
        cause
      },

      ...on SetupFailedEvent {
        reason,
        deposit {
          bondedECDSAKeep {
            pubkeySubmissions { address },
            members { address }
          }
        }
      }
    }
  }
`

const { Step } = Steps;

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deposit: {},
      mintLogs: {},
      redeemLogs: {},
    }
  }

  async componentDidMount() {
    let deposit = await this.fetchDeposit();
    let mintLogs = {};
    let redeemLogs = {};
    let logs = (await this.fetchLogs()).data.events || [];
    logs.map(log => {
      if(['CreatedEvent', 'RegisteredPubKeyEvent', 'FundedEvent'].indexOf(log.__typename) != -1) {
        mintLogs[log.__typename] = log;
      } else {
        redeemLogs[log.__typename] = log;
      }
    });
    this.setState({ deposit, mintLogs, redeemLogs });

    return;
  }

  fetchDeposit = () => {
    let contractAddr = this.props.match.params.id;
    return new Promise((resolve, reject) => {
      Utils.apolloClient.query({
        query: DEPOSITS_QUERY,
        variables: { id: `dp-${contractAddr}` }
      })
      .then(res => {
        if(res.loading) return;
        let deposit = res.data && res.data.deposit || {};
        resolve(deposit);
      })
      .catch(e => reject(e));
    });
  }

  fetchLogs = () => {
    let contractAddr = this.props.match.params.id;
    return new Promise((resolve, reject) => {
      Utils.apolloClient.query({
        query: LOG_QUERY,
        variables: { depositId: `dp-${contractAddr}` }
      })
      .then(res => {
        if(res.loading) return;
        resolve(res);
      })
      .catch(e => reject(e));
    });
  }

  render() {
    let { deposit, mintLogs, redeemLogs } = this.state;

    let mintState = 'PROCESSING';
    if(!!mintLogs.CreatedEvent) {
      mintState = 'COMPLETED';
    }

    let redeemState = 'NOT_START';
    if(!!redeemLogs.RedemptionRequestedEvent) {
      redeemState = 'PROCESSING';
    } else if(!!redeemLogs.RedeemedEvent) {
      redeemState = 'COMPLETED';
    }

    return (
      <div>
        <Row type="flex" justify="space-between">
          <Col span="11" className="list">
            <h3>Mint Status: {mintState}</h3>

            <Steps current={Utils.calMintStep(mintLogs)} direction="vertical">
              <Step
                title="Created"
                subTitle={mintLogs.CreatedEvent && moment(mintLogs.CreatedEvent.timestamp * 1000).fromNow()}
                description={
                  <>
                    <div>Create deposit contract for minting <i><b>tBTC</b></i></div>
                    {mintLogs.CreatedEvent && <div>{addressFormatter(mintLogs.CreatedEvent.submitter)} in {txFormatter(mintLogs.CreatedEvent.transactionHash)}</div>}
                  </>
                }
              />
              <Step
                title="RegisterdPubKey"
                subTitle={mintLogs.RegisteredPubKeyEvent && moment(mintLogs.RegisteredPubKeyEvent.timestamp * 1000).fromNow()}
                description={
                  <>
                    <div>Register the public key of signer group</div>
                    {mintLogs.RegisteredPubKeyEvent && <div>{addressFormatter(mintLogs.RegisteredPubKeyEvent.submitter)} in {txFormatter(mintLogs.RegisteredPubKeyEvent.transactionHash)}</div>}
                  </>
                }
              />
              <Step
                title="Funded"
                subTitle={mintLogs.FundedEvent && moment(mintLogs.FundedEvent.timestamp * 1000).fromNow()}
                description={
                  <>
                    <div>Fund <i><b>BTC</b></i> into signer group</div>
                    {mintLogs.FundedEvent && <div>{addressFormatter(mintLogs.FundedEvent.submitter)} in {txFormatter(mintLogs.FundedEvent.transactionHash)}</div>}
                  </>
                }
              />
            </Steps>
          </Col>

          <Col span="12" className="list">
            <h3>Redeem Status: {redeemState}</h3>

            <Steps current={Utils.calRedeemStep(redeemLogs)} direction="vertical">
              <Step
                title="Created"
                subTitle={redeemLogs.RedemptionRequestedEvent && moment(redeemLogs.RedemptionRequestedEvent.timestamp * 1000).fromNow()}
                description={
                  <>
                    <div>Request from redeeming <i><b>BTC</b></i></div>
                    {redeemLogs.RedemptionRequestedEvent && <div>{addressFormatter(redeemLogs.RedemptionRequestedEvent.submitter)} in {txFormatter(redeemLogs.RedemptionRequestedEvent.transactionHash)}</div>}
                  </>
                }
              />
              <Step
                title="GotRedemptionSignature"
                subTitle={redeemLogs.GotRedemptionSignatureEvent && moment(redeemLogs.GotRedemptionSignatureEvent.timestamp * 1000).fromNow()}
                description={
                  <>
                    <div>Got the redemption signature of signer group</div>
                    {redeemLogs.GotRedemptionSignatureEvent && <div>{addressFormatter(redeemLogs.GotRedemptionSignatureEvent.submitter)} in {txFormatter(redeemLogs.GotRedemptionSignatureEvent.transactionHash)}</div>}
                  </>
                }
              />
              <Step
                title="Redeemed"
                subTitle={redeemLogs.RedeemedEvent && moment(redeemLogs.RedeemedEvent.timestamp * 1000).fromNow()}
                description={
                  <>
                    <div>Redeem <i><b>BTC</b></i> successed</div>
                    {redeemLogs.RedeemedEvent && <div>{addressFormatter(redeemLogs.RedeemedEvent)} in {txFormatter(redeemLogs.RedeemedEvent.transactionHash)}</div>}
                  </>
                }
              />
            </Steps>
          </Col>
        </Row>

        <div className="info" style={{minHeight: '400px'}}>
          <Descriptions title="Deposit&Reedem Base Info" bordered size="small">
            <Descriptions.Item span={3} label="DepositContract">{deposit.contractAddress}</Descriptions.Item>
            <Descriptions.Item span={3} label="TokenId">{deposit.contractAddress}</Descriptions.Item>
            <Descriptions.Item span={3} label="EndOfTerm">{deposit.endOfTerm && moment(+deposit.endOfTerm * 1000).fromNow()}</Descriptions.Item>
            <Descriptions.Item span={3} label="Owner">{deposit.tdtToken && <Link to={`/user/ownership`}>{deposit.tdtToken.owner}</Link> || <LoadingOutlined />}</Descriptions.Item>
            <Descriptions.Item span={3} label="Creator">{deposit.tdtToken && <Link to={`/user/ownership`}>{deposit.tdtToken.minter}</Link> || <LoadingOutlined />}</Descriptions.Item>
            <Descriptions.Item span={3} label="Lot Size">{deposit.lotSizeSatoshis / 1e8} BTC</Descriptions.Item>
            <Descriptions.Item span={3} label="Status">{deposit.currentState}</Descriptions.Item>
            <Descriptions.Item span={3} label="Time">{moment(+deposit.createdAt * 1000).fromNow()}</Descriptions.Item>
          </Descriptions>
        </div>

        <div className="info">
          <Descriptions title="Keep" bordered size="small">
            <Descriptions.Item span={3} label="KeepContract">{deposit.keepAddress}</Descriptions.Item>
            <Descriptions.Item span={3} label="Signers">{deposit.bondedECDSAKeep && deposit.bondedECDSAKeep.members && deposit.bondedECDSAKeep.members.map(member => <span style={{marginRight: '15px'}}>{addressFormatter(member.address, true)}</span>)}</Descriptions.Item>
            <Descriptions.Item span={3} label="Bond">{deposit.bondedECDSAKeep && deposit.bondedECDSAKeep.totalBondAmount / 1e18} ETH</Descriptions.Item>
            <Descriptions.Item span={3} label="Collaterialization">{deposit.initialCollateralizedPercent}%</Descriptions.Item>
            <Descriptions.Item span={3} label="Thresholds">
              {`${deposit.initialCollateralizedPercent}% / ${deposit.undercollateralizedThresholdPercent}% / ${deposit.severelyUndercollateralizedThresholdPercent}%`}
            </Descriptions.Item>
            <Descriptions.Item span={3} label="HonestThreshold">{deposit.bondedECDSAKeep && deposit.bondedECDSAKeep.honestThreshold}</Descriptions.Item>
            <Descriptions.Item span={3} label="BTC PublicKey">{deposit.bondedECDSAKeep && deposit.bondedECDSAKeep.publicKey}</Descriptions.Item>
            <Descriptions.Item span={3} label="Status">{deposit.bondedECDSAKeep && deposit.bondedECDSAKeep.status}</Descriptions.Item>
          </Descriptions>
        </div>

      </div>
    );
  }
}

export default Detail;
