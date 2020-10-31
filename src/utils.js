import Web3 from 'web3';
import { ApolloClient, InMemoryCache } from '@apollo/client';

const DepositFactoryJSON = require("@keep-network/tbtc/artifacts/DepositFactory.json");
const TBTCSystemJSON = require("@keep-network/tbtc/artifacts/TBTCSystem.json");
const TBTCTokenJson = require("@keep-network/tbtc/artifacts/TBTCToken.json");
const TBTCDepositTokenJson = require("@keep-network/tbtc/artifacts/TBTCDepositToken.json");
const VendingMachineJson = require("@keep-network/tbtc/artifacts/VendingMachine.json");
const DepositJson = require("@keep-network/tbtc/artifacts/Deposit.json");
const BondedECDSAKeepJson = require("@keep-network/keep-ecdsa/artifacts/BondedECDSAKeep.json");
const BondedECDSAKeepFactoryJson = require("@keep-network/keep-ecdsa/artifacts/BondedECDSAKeepFactory.json");
const KeepBondingJson = require("@keep-network/keep-ecdsa/artifacts/KeepBonding.json");
const FeeRebateTokenJson = require("@keep-network/tbtc/artifacts/FeeRebateToken.json");
const UniswapV2PairJson = require('@uniswap/v2-core/build/UniswapV2Pair');
const ERC20DetailedJson = require('@openzeppelin/contracts/build/contracts/ERC20Detailed.json');
const BPoolJson = require('./abi/BPool.json');
const CurveTbtcPoolAbi = require('./abi/CurveTbtcPool.json');

const web3 = new Web3("https://mainnet.infura.io/v3/fae6a8d70b074a21898e735c568a80cf");
const contracts = {
  DepositContract: new web3.eth.Contract(DepositJson.abi),
  DepositFactoryContract: new web3.eth.Contract(DepositFactoryJSON.abi, "0x87effef56c7ff13e2463b5d4dce81be2340faf8b"),
  TBTCSystemContract: new web3.eth.Contract(TBTCSystemJSON.abi, "0xe20A5C79b39bC8C363f0f49ADcFa82C2a01ab64a"),
  TBTCTokenContract: new web3.eth.Contract(TBTCTokenJson.abi, "0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa"),
  TBTCDepositTokenContract: new web3.eth.Contract(TBTCDepositTokenJson.abi, "0x10B66Bd1e3b5a936B7f8Dbc5976004311037Cdf0"),
  VendingMachineContract: new web3.eth.Contract(VendingMachineJson.abi, "0x526c08e5532a9308b3fb33b7968ef78a5005d2ac"),
  BondedECDSAKeepContract: new web3.eth.Contract(BondedECDSAKeepJson.abi),
  BondedECDSAKeepFactoryContract: new web3.eth.Contract(BondedECDSAKeepFactoryJson.abi, "0xA7d9E842EFB252389d613dA88EDa3731512e40bD"),
  KeepBondingContract: new web3.eth.Contract(KeepBondingJson.abi, "0x27321f84704a599aB740281E285cc4463d89A3D5"),
  FrtContract: new web3.eth.Contract(FeeRebateTokenJson.abi, "0xaf3fff06b75f99352d8c2a3c4bef1339a2f94789"),
  UniswapV2PairTbtcWeth: new web3.eth.Contract(UniswapV2PairJson.abi, "0x854056Fd40C1B52037166285B2e54Fee774d33f6"),
  UniswapV2PairTbtcWbtc: new web3.eth.Contract(UniswapV2PairJson.abi, "0x8a1643D77621d171df97Df4fc86051F54F7EBA90"),
  SushiswapV2Pair: new web3.eth.Contract(UniswapV2PairJson.abi, "0x2dbc7dd86c6cd87b525bd54ea73ebeebbc307f68"),
  newErc20Detail: () => new web3.eth.Contract(ERC20DetailedJson.abi),
  BalancerPoolTbtcWbtc: new web3.eth.Contract(BPoolJson.abi, "0x17996cbddd23c2a912de8477c37d43a1b79770b8"),
  BalancerPoolTbtcWeth: new web3.eth.Contract(BPoolJson.abi, "0xb98db2fb641751462fd78c6db2a5c6edb50864d4"),
  CurveTbtcPool: new web3.eth.Contract(CurveTbtcPoolAbi, "0xC25099792E9349C7DD09759744ea681C7de2cb66"),

  UniswapV2PairWethUSDT: new web3.eth.Contract(UniswapV2PairJson.abi, "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852"),
}

const stateDesc = {
  // DOES NOT EXIST YET
  0: 'START',
  // FUNDING FLOW
  1: 'AWAITING_SIGNER_SETUP',
  2: 'AWAITING_BTC_FUNDING_PROOF',
  // FAILED SETUP
  3: 'FAILED_SETUP',
  // ACTIVE
  4: 'ACTIVE',  // includes courtesy call
  // REDEMPTION FLOW
  5: 'AWAITING_WITHDRAWAL_SIGNATURE',
  6: 'AWAITING_WITHDRAWAL_PROOF',
  7: 'REDEEMED',
  // SIGNER LIQUIDATION FLOW
  8: 'COURTESY_CALL',
  9: 'FRAUD_LIQUIDATION_IN_PROGRESS',
  10: 'LIQUIDATION_IN_PROGRESS',
  11: 'LIQUIDATE',
}

export default {
  apolloClient: new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/miracle2k/all-the-keeps',
    cache: new InMemoryCache(),
  }),
  tbtcGraphClient: new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/suntzu93/tbtc',
    cache: new InMemoryCache(),
  }),
  web3,
  contracts,
  tokenIdToAddress: tokenId => {
    let address = web3.utils.toHex(tokenId)
    if(address.length == 41) {
      address = '0x0'.concat(address.slice(2));
    }

    return address;
  },
  addressToTokenId: addr => new web3.utils.BN(addr).toString(),
  getStateDesc: stateId => stateDesc[stateId],
  mintStatusForList: (state) => {
    if(['4', '5', '6', '7'].indexOf(state) != -1) {
      return 'COMPLETED'
    }
    return stateDesc[state];
  },
  mintStatus: (state, isFunded) => {
    if(isFunded) {
      return 'COMPLETED';
    }
    if(state == 3) {
      return 'FAILED';
    }
    if([9, 10, 11].indexOf(state) != -1) {
      return 'LIQUIDATE';
    }
    return 'PROCESSING';
  },
  redeemStatus: (state, isStarted, isRedeemed) => {
    if(!isStarted) {
      return 'NOT_START';
    }
    if(isRedeemed) {
      return 'COMPLETED';
    }
    if(isStarted && [9, 10, 11].indexOf(state) != -1) {
      return 'LIQUIDATE';
    }
    return 'PROCESSING';
  },
  time: {
    blockToTimestamp: block => {
      let startTimestamp = 1601470793;
      let startBlock = 10963898;
      return startTimestamp + (block - startBlock) * 13.7;
    }
  },
  calMintStep: mintLogs => {
    if(!!mintLogs.FundedEvent) {
      return 2;
    }
    if(!!mintLogs.RegisteredPubKeyEvent) {
      return 1;
    }
    if(!!mintLogs.CreatedEvent) {
      return 0;
    }
    return -1;
  },
  calRedeemStep: redeemLogs => {
    if(!!redeemLogs.RedeemedEvent) {
      return 2;
    }
    if(!!redeemLogs.GotRedemptionSignatureEvent) {
      return 1;
    }
    if(!!redeemLogs.RedemptionRequestedEvent) {
      return 0;
    }
    return -1;
  },
}
