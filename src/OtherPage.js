import React from 'react';
import Utils from './utils';
import Service from './Service';

const fromBlock = '0';

class OtherPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}

    this.getSystemContract = this.getSystemContract.bind(this);
  }

  async getWalletData() {
    console.log('tbtc.balance()', await Service.tbtc.balance('0xf6f372dfaecc1431186598c304e91b79ce115766'));
    console.log('tdt.balance()', await Service.tdt.balance('0xf6f372dfaecc1431186598c304e91b79ce115766'));
    console.log('frt.balance()', await Service.frt.balance('0xf6f372dfaecc1431186598c304e91b79ce115766'));
    console.log('deposit.getByWallet()', await Service.deposit.getByWallet('0xf6f372dfaecc1431186598c304e91b79ce115766'));
    console.log('redeem.getByWallet()', await Service.redeem.getByWallet('0xf6f372dfaecc1431186598c304e91b79ce115766'));
  }

  async getExplorerData() {
    console.log('tbtc.maxSupply()', await Service.tbtc.maxSupply());
    console.log('tbtc.currentSupply()', await Service.tbtc.currentSupply());
    console.log('tbtc.totalMinted()', await Service.tbtc.totalMinted());
    console.log('tbtc.mintUserCount()', await Service.tbtc.mintUserCount());
    console.log('deposit.all()', await Service.deposit.all())
    console.log('deposit.getState()', await Service.deposit.getState(['0x48Df12C7cD26A3a6b7bbeC14d9FcbA54f4BE8AeD', '0x04174C847F61e127B94293EeDa786313a677807b']));
    console.log('deposit.getLotSizeTbtc()', await Service.deposit.getLotSizeTbtc(['0x48Df12C7cD26A3a6b7bbeC14d9FcbA54f4BE8AeD', '0x04174C847F61e127B94293EeDa786313a677807b']));
    console.log('deposit.getCreator()', await Service.deposit.getCreator(['0x48Df12C7cD26A3a6b7bbeC14d9FcbA54f4BE8AeD', '0x04174C847F61e127B94293EeDa786313a677807b']));
  }

  async getDetailData() {
    console.log('depoist.ownership()', await Service.deposit.ownerOf('0x48df12c7cd26a3a6b7bbec14d9fcba54f4be8aed'))
    console.log('keep.baseInfo()', await Service.keep.baseInfo('0xc6abc3b878de86a558f2eed47f4d7f9077bd2668'));
    console.log('keep.bondList()', await Service.keep.bondList('0xc6abc3b878de86a558f2eed47f4d7f9077bd2668'));
    console.log('governance.getCollateralizationThresholds()', await Service.governance.getCollateralizationThresholds());
    console.log('deposit.getCollateralizationPercentage', await Service.deposit.getCollateralizationPercentage('0x45e377b383de3fa71bd5d61fca4792ec4a81da5d'))
    console.log('item.mintLogs()', await Service.item.mintLogs('0x48df12c7cd26a3a6b7bbec14d9fcba54f4be8aed'));
    console.log('item.redeemLogs()', await Service.item.redeemLogs('0x48df12c7cd26a3a6b7bbec14d9fcba54f4be8aed'));
  }

  async getSystemContract() {
    let { contracts } = this.props;

    let masterDepositAddress = await contracts.DepositFactoryContract.methods.masterDepositAddress().call();
    let feeRebateToken = await contracts.DepositFactoryContract.methods.feeRebateToken().call();
    let tbtcSystem = await contracts.DepositFactoryContract.methods.tbtcSystem().call();
    let vendingMachineAddress = await contracts.DepositFactoryContract.methods.vendingMachineAddress().call();
    console.log(`masterDepositAddress:`, masterDepositAddress)
    console.log(`feeRebateToken:`, feeRebateToken)
    console.log(`tbtcSystem:`, tbtcSystem)
    console.log(`vendingMachineAddress:`, vendingMachineAddress)
  }

  render() {
    let { web3, contracts } = this.props;
    return (
      <div>
        OtherPage, Show Detail in Console
        <button onClick={this.getExplorerData}>explorer data</button>
        <button onClick={this.getDetailData}>detail data</button>
        <button onClick={this.getWalletData}>wallet data</button>
      </div>
    );
  }
}

export default OtherPage;
