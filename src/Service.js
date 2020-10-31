import BigNumber from 'bignumber.js';
import Utils from './utils';

let fromBlock = 0;
let cache = {
  state: {},
  lotSize: {},
};

let common = {
  getDepositEvent: async params => {
    return await Utils.contracts.TBTCSystemContract.getPastEvents("Created", params, (error, result) => {
      if (error) console.log("Couldn't get Created event of TBTCSystem.");
    })
  },
  getTdtTransferEvent: async params => {
    return await Utils.contracts.TBTCDepositTokenContract.getPastEvents("Transfer", params, (error, result) => {
      if (error) console.log("Couldn't get MintTdt event of TdtToken.");
    })
  },
  getTbtcTransferEvent: async params => {
    return await Utils.contracts.TBTCTokenContract.getPastEvents("Transfer", params, (error, result) => {
      if (error) console.log("Couldn't get MintTbtc event of TbtcToken.");
    })
  },
  getRedemptionRequestedEvent: async params => {
    return await Utils.contracts.TBTCSystemContract.getPastEvents("RedemptionRequested", params, (error, result) => {
      if (error) console.log("Couldn't get RedemptionRequested event of TBTCSystem.");
    })
  },
  getPublicKeyPublished: async (addr, params) => {
    let contract = Utils.contracts.BondedECDSAKeepContract;
    contract.options.address = addr;
    return await contract.getPastEvents("PublicKeyPublished", params, (error, result) => {
      if (error) console.log("Couldn't get PublicKeyPublished event of Keep.");
    })
  },
  getRegisteredPubkeyEvent: async params => {
    return await Utils.contracts.TBTCSystemContract.getPastEvents("RegisteredPubkey", params, (error, result) => {
      if (error) console.log("Couldn't get RegisteredPubkey event of TBTCSystem.");
    })
  },
  getFundedEvent: async params => {
    return await Utils.contracts.TBTCSystemContract.getPastEvents("Funded", params, (error, result) => {
      if (error) console.log("Couldn't get Funded event of TBTCSystem.");
    })
  },
  getGotRedemptionSignatureEvent: async params => {
    return await Utils.contracts.TBTCSystemContract.getPastEvents("GotRedemptionSignature", params, (error, result) => {
        if (error) console.log("Couldn't get GotRedemptionSignature event of TBTCSystem.");
    });
  },
  getRedeemedEvent: async params => {
    return await Utils.contracts.TBTCSystemContract.getPastEvents("Redeemed", params, (error, result) => {
        if (error) console.log("Couldn't get Redeemed event of TBTCSystem.");
    });
  },
  getReservesOfPair: async contract => {
    let reserve0Addr = await contract.methods.token0().call();
    let reserve1Addr = await contract.methods.token1().call();

    let reserve0Contract = Utils.contracts.newErc20Detail();
    reserve0Contract.options.address = reserve0Addr;
    let reserve0Symbol = await reserve0Contract.methods.symbol().call();
    let reserve0Decimals = await reserve0Contract.methods.decimals().call();

    let reserve1Contract = Utils.contracts.newErc20Detail();
    reserve1Contract.options.address = reserve1Addr;
    let reserve1Symbol = await reserve1Contract.methods.symbol().call();
    let reserve1Decimals = await reserve1Contract.methods.decimals().call();

    let reserves = await contract.methods.getReserves().call();
    return {
      reserve0: reserves._reserve0,
      reserve0Symbol,
      reserve0Decimals,
      reserve1: reserves._reserve1,
      reserve1Symbol,
      reserve1Decimals,
    }
  },

  getReservesOfBPool: async contract => {
    let result = [];

    let tokens = await contract.methods.getCurrentTokens().call();
    for(let i=0; i < tokens.length; i++) {
      let tokenContract = Utils.contracts.newErc20Detail();
      tokenContract.options.address = tokens[i];
      result.push({
        symbol: await tokenContract.methods.symbol().call(),
        decimals: await tokenContract.methods.decimals().call(),
        balance: await contract.methods.getBalance(tokens[i]).call(),
      });
    }

    return result;
  }
}

export default {
  deposit: {
    all: async fromBlock => {
      return await common.getDepositEvent({ fromBlock });
    },

    getByWallet: async wallet => {
      let depositAddrList = [];
      let tdtMintEventList = await common.getTdtTransferEvent({
        fromBlock,
        filter: { from: '0x0000000000000000000000000000000000000000', to: wallet }
      });
      tdtMintEventList.map(tdtMintEvent => {
        let addr = Utils.tokenIdToAddress(tdtMintEvent.returnValues.tokenId);
        depositAddrList.push(addr);
      });

      if(depositAddrList.length == 0) {
        return [];
      }
      return await common.getDepositEvent({
        fromBlock,
        filter: { _depositContractAddress: depositAddrList }
      });
    },

    getState: async addrList => {
      let result = {};
      await Promise.all(addrList.map(async addr => {
        let depositContract = Utils.contracts.DepositContract;
        depositContract.options.address = addr;
        let state = cache.state[addr] = !!cache.state[addr] ?
          cache.state[addr] :
          await depositContract.methods.currentState().call()
        ;

        result[addr] = { state, stateDesc: Utils.getStateDesc(state) };
      }));

      return result;
    },

    getLotSizeTbtc: async addrList => {
      let result = {};
      await Promise.all(addrList.map(async addr => {
        let depositContract = Utils.contracts.DepositContract;
        depositContract.options.address = addr;
        result[addr] = cache.lotSize[addr] = !!cache.lotSize[addr] ?
          cache.lotSize[addr] :
          await depositContract.methods.lotSizeTbtc().call()
        ;
      }));

      return result;
    },

    getCreator: async () => {
      let result = {};
      let events = await common.getTdtTransferEvent({
        fromBlock,
        filter: { from: '0x0000000000000000000000000000000000000000' }
      });
      events.map(event => {
        let depositAddr = Utils.tokenIdToAddress(event.returnValues.tokenId);
        result[depositAddr] = event.returnValues.to;
      })

      return result;
    },

    ownerOf: async addr => await Utils.contracts.TBTCDepositTokenContract.methods.ownerOf(addr).call(),

    getCollateralizationPercentage: async addr => {
      let depositContract = Utils.contracts.DepositContract;
      depositContract.options.address = addr;

      return await depositContract.methods.collateralizationPercentage().call();
    },

    getHistory: async () => {
      let toBlock = await Utils.web3.eth.getBlockNumber();
      let fromBlock = toBlock - 5000 * 7;
      let depositEventList = await common.getDepositEvent({ fromBlock, toBlock });

      let data = {};
      depositEventList.map(event => {
        let key = Math.floor((toBlock - event.blockNumber) / 5000);
        data[key] = !data[key] ? 1 : data[key] + 1;
      });

      let blockTimestamp = {};
      await Promise.all([0, 1, 2, 3, 4, 5, 6].map(async key => {
        let blockNumber = toBlock - key * 5000;
        let blockInfo = await Utils.web3.eth.getBlock(blockNumber);
        blockTimestamp[key] = blockInfo.timestamp;
      }));

      let result = [];
      Object.keys(data).map(key => {
        result.push({ key, count: data[key], timestamp: blockTimestamp[key] });
      });

      return result;
    },

  },

  redeem: {
    all: async fromBlock => {
      return await common.getRedemptionRequestedEvent({ fromBlock });
    },

    getByWallet: async wallet => {
      return await common.getRedemptionRequestedEvent({ fromBlock, filter: { _requester: wallet } });
    },

    getHistory: async () => {
      let toBlock = await Utils.web3.eth.getBlockNumber();
      let fromBlock = toBlock - 5000 * 7;
      let requestEventList = await common.getRedemptionRequestedEvent({ fromBlock, toBlock });

      let data = {};
      requestEventList.map(event => {
        let key = Math.floor((toBlock - event.blockNumber) / 5000);
        data[key] = !data[key] ? 1 : data[key] + 1;
      });

      let blockTimestamp = {};
      await Promise.all([0, 1, 2, 3, 4, 5, 6].map(async key => {
        let blockNumber = toBlock - key * 5000;
        let blockInfo = await Utils.web3.eth.getBlock(blockNumber);
        blockTimestamp[key] = blockInfo.timestamp;
      }));

      let result = [];
      Object.keys(data).map(key => {
        result.push({ key, count: data[key], timestamp: blockTimestamp[key] });
      });

      return result;
    },
  },

  // deposit or redeem detail
  item: {
    mintLogs: async addr => {
      let result = {};

      await Promise.all([
        // 1. ceated
        (async () => {
          let created = await common.getDepositEvent({ fromBlock, filter: { _depositContractAddress: addr } });
          result.created = created.length > 0 ? created[0] : null;
        })(),
        // 2. registeredPubkey
        (async () => {
          let registeredPubkey = await common.getDepositEvent({ fromBlock, filter: { _depositContractAddress: addr } });
          result.registeredPubkey = registeredPubkey.length > 0 ? registeredPubkey[0] : null;
        })(),
        // 3. funded
        (async () => {
          let funded = await common.getFundedEvent({ fromBlock, filter: { _depositContractAddress: addr } });
          result.funded = funded.length > 0 ? funded[0] : null;
        })(),
        // 4. TODO: switch TDT to TBTC
      ]);

      return result;
    },
    redeemLogs: async addr => {
      let result = {};
      await Promise.all([
        // 1. RedemptionRequested
        (async () => {
          let request = await common.getRedemptionRequestedEvent({ fromBlock, filter: { _depositContractAddress: addr } })
          result.request = request.length > 0 ? request[0] : null;
        })(),
        // 2. GotRedemptionSignature
        (async () => {
          let signature = await common.getGotRedemptionSignatureEvent({ fromBlock, filter: { _depositContractAddress: addr } })
          result.signature = signature.length > 0 ? signature[0] : null;
        })(),
        // 3. Redeemed
        (async () => {
          let redeemed = await common.getRedeemedEvent({ fromBlock, filter: { _depositContractAddress: addr } });
          result.redeemed = redeemed.length > 0 ? redeemed[0] : null;
        })(),
      ])

      return result
    }
  },

  tbtc: {
    balance: async addr => await Utils.contracts.TBTCTokenContract.methods.balanceOf(addr).call(),
    maxSupply: async () => await Utils.contracts.VendingMachineContract.methods.getMaxSupply().call(),
    currentSupply: async () => await Utils.contracts.TBTCTokenContract.methods.totalSupply().call(),
    totalMinted: async () => {
      let events = await common.getTbtcTransferEvent({ fromBlock, filter: { from: '0x0000000000000000000000000000000000000000' } });
      let result = new BigNumber(0);
      events.map(event => {
        result = result.plus(event.returnValues.value)
      });

      return result.toFixed();
    },
    mintUserCount: async () => {
      let events = await common.getTdtTransferEvent({ fromBlock, filter: { to: Utils.contracts.VendingMachineContract._address } });
      let result = 0, filter = {};
      events.map(event => {
        let userAddr = event.returnValues.from;
        if(!!filter[userAddr]) return;
        filter[userAddr] = true;
        result++;
      });

      return result;
    },
  },

  tdt: {
    balance: async addr => {
      return await Utils.contracts.TBTCDepositTokenContract.methods.balanceOf(addr).call();
    }
  },

  frt: {
    balance: async addr => {
      return await Utils.contracts.FrtContract.methods.balanceOf(addr).call();
    }
  },

  keep: {
    baseInfo: async addr => {
      let events = await Utils.contracts.BondedECDSAKeepFactoryContract.getPastEvents("BondedECDSAKeepCreated", {
        fromBlock,
        filter: { keepAddress: addr }
      }, (error, result) => {
          if (error) console.log("Couldn't get Redeemed event of TBTCSystem.");
      });
      if(!events || events.length.length == 0) {
        return null;
      }

      // get status
      let contract = Utils.contracts.BondedECDSAKeepContract;
      contract.options.address = addr;
      let status = 'terminated';
      if(await contract.methods.isActive()) {
        status = 'active';
      } else if (await contract.methods.isClosed()) {
        status = 'closed';
      }

      let { application, honestThreshold, keepAddress, members, owner } = events[0].returnValues;

      return {
        application,
        honestThreshold,
        keepAddress,
        members,
        owner,
        status,
        publicKey: await contract.methods.publicKey().call(),
      }
    },
    bondList: async keepAddr => {
      return await Utils.contracts.KeepBondingContract.getPastEvents("BondCreated", {
        fromBlock,
        filter: { holder: keepAddr }
      }, (error, result) => {
          if (error) console.log("Couldn't get Redeemed event of TBTCSystem.");
      });
    },
  },

  governance: {
    getCollateralizationThresholds: async () => {
      let contract = Utils.contracts.TBTCSystemContract;
      let result = {};
      await Promise.all([
        (async () => {
          result.initial = await contract.methods.getInitialCollateralizedPercent().call();
        })(),
        (async () => {
          result.undercollaterized = await contract.methods.getUndercollateralizedThresholdPercent().call();
        })(),
        (async () => {
          result.severelyUndercollateralized = await contract.methods.getSeverelyUndercollateralizedThresholdPercent().call();
        })(),
      ]);

      return result;
    }
  },

  tx: {
    getByHash: async txHash => {
      return await Utils.web3.eth.getTransaction(txHash);
    }
  },

  sushi: {
    getReserves: async () => {
      return common.getReservesOfPair(Utils.contracts.SushiswapV2Pair);
    }
  },

  uniswap: {
    getReservesOfTbtcWeth: async () => {
      return common.getReservesOfPair(Utils.contracts.UniswapV2PairTbtcWeth);
    },
    getReservesOfTbtcWbtc: async () => {
      return common.getReservesOfPair(Utils.contracts.UniswapV2PairTbtcWbtc);
    },
    getReservesOfWethUSDT: async () => {
      return common.getReservesOfPair(Utils.contracts.UniswapV2PairWethUSDT);
    }
  },

  balancer: {
    getReservesOfTbtcWbtc: async () => {
      return common.getReservesOfBPool(Utils.contracts.BalancerPoolTbtcWbtc);
    },
    getReservesOfTbtcWeth: async () => {
      return common.getReservesOfBPool(Utils.contracts.BalancerPoolTbtcWeth);
    }
  },

  curve: {
    getReserves: async () => {
      let result = [];
      let contract = Utils.contracts.CurveTbtcPool;

      for(let i=0; i < 2; i++) {
        let tokenAddr = await contract.methods.coins(`0x${i}`).call();
        let tokenContract = Utils.contracts.newErc20Detail();
        tokenContract.options.address = tokenAddr;
        result.push({
          symbol: await tokenContract.methods.symbol().call(),
          decimals: await tokenContract.methods.decimals().call(),
          balance: await contract.methods.balances(`0x${i}`).call(),
        });
      }

      return result;
    }
  }
}
