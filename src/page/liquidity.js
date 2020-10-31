import React from 'react';
import Service from '../Service';
import numeral from 'numeral';

class LiquidityPool extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sushiTbtcWbtc: {},
      uniTbtcWeth: {},
      uniTbtcWbtc: {},
      balancerTbtcWbtc: [],
      balancerTbtcWeth: [],
      curveReserve: [],
      uniWethUSDT: {},
    }
  }

  async componentDidMount() {
    this.getCurveBalance();
    this.getSushiTbtcWbtc();
    this.getUniTbtcWeth();
    this.getUniTbtcWbtc();
    this.getBalancerTbtcWbtc();
    this.getBalancerTbtcWeth();
    this.getUniWethUSDT();
  }

  getUniWethUSDT = async () => {
    this.setState({ uniWethUSDT: await Service.uniswap.getReservesOfWethUSDT() });
  }

  getSushiTbtcWbtc = async () => {
    this.setState({ sushiTbtcWbtc: await Service.sushi.getReserves() });
  }

  getUniTbtcWeth = async () => {
    this.setState({ uniTbtcWeth: await Service.uniswap.getReservesOfTbtcWeth() });
  }

  getUniTbtcWbtc = async () => {
    this.setState({ uniTbtcWbtc: await Service.uniswap.getReservesOfTbtcWbtc() });
  }

  getBalancerTbtcWbtc = async () => {
    this.setState({ balancerTbtcWbtc: await Service.balancer.getReservesOfTbtcWbtc() });
  }

  getBalancerTbtcWeth = async () => {
    this.setState({ balancerTbtcWeth: await Service.balancer.getReservesOfTbtcWeth() });
  }

  getCurveBalance = async () => {
    this.setState({ curveReserve: await Service.curve.getReserves() });
  }

  render() {
    let { sushiTbtcWbtc, uniTbtcWeth, uniTbtcWbtc, balancerTbtcWbtc, balancerTbtcWeth, curveReserve, uniWethUSDT } = this.state;
    let numberToFixed = n => {
      return parseFloat(n).toFixed(5);
    };

    let tbtcPrice = 0;
    // get tBTC price
    if (uniWethUSDT && uniWethUSDT.reserve0 && uniWethUSDT.reserve1 && uniTbtcWeth && uniTbtcWeth.reserve0 && uniTbtcWeth.reserve1) {
      let ethPrice = (uniWethUSDT.reserve1 / 1e6) / (uniWethUSDT.reserve0 / 1e18);
      let btcETHPrice = (uniTbtcWeth.reserve1 / uniTbtcWeth.reserve0);

      tbtcPrice = btcETHPrice * ethPrice;
    }

    let tbtcSupplay = 0;

    if (
      curveReserve && curveReserve.length &&
      balancerTbtcWbtc && balancerTbtcWbtc.length &&
      balancerTbtcWeth && balancerTbtcWeth.length &&
      sushiTbtcWbtc.reserve0
    ) {
      tbtcSupplay = (curveReserve[0].balance / 1e18
        + sushiTbtcWbtc.reserve1 / 1e18
        + uniTbtcWeth.reserve0 / 1e18
        + uniTbtcWbtc.reserve1 / 1e18
        + balancerTbtcWbtc[1].balance / 1e18
        + balancerTbtcWeth[1].balance / 1e18
      );
    }

    let formatDollar = dollar => {
      if (!dollar) return 0;
      return '$' + numeral(dollar).format('0,0.00');
    }

    return (
      <div>
        <section className="liquidity__overview">
          <div className="liquidity__box">
            <section>
              <img src="/liquidity.svg" />
            </section>

            <div>
              <span>Total Liquidity (tBTC)</span>
              <label>{ !tbtcSupplay ? '...' : numeral(tbtcSupplay).format('0,0.00000') }</label>
            </div>
          </div>

          <div className="liquidity__box">
            <section>
              <img src="/dollar.svg" />
            </section>

            <div>
              <span>Total Liquidity (USDT)</span>
              <label>${ (!tbtcPrice || !tbtcSupplay) ? '...' : numeral(tbtcPrice * tbtcSupplay).format('0,0') }</label>
            </div>
          </div>

          <div className="liquidity__box">
            <section className="tbtc">
              <img src="/tbtc.png" />
            </section>

            <div>
              <span>tBTC</span>
              <label>${ !tbtcPrice ? '...' : numeral(tbtcPrice).format('0,0.00') }</label>
            </div>
          </div>
        </section>

        <h1 className="liquidity">tBTC Liquidity Info in DeFi</h1>
        <br/>

        <div className="liquidity">
          <section className="liquidity__box">
            <div className="title">
              <div className="blue"><img src="/curv.png" /></div>
              <h2>
                <a href="https://www.curve.fi/tbtc/deposit" target="_blank">Curve</a>
                <span>↗</span>
                <i>{ (tbtcPrice && curveReserve.length) ? formatDollar(tbtcPrice * 2 * curveReserve[1].balance / 1e18) : '...' }</i>
              </h2>
            </div>
            {curveReserve.map(token => (
              <div>
                <div>
                <label>{ token.balance ? numberToFixed(token.balance / Math.pow(10, token.decimals)) : '...' }</label>
                {token.symbol === 'crvRenWSBTC' ? 'sBTC' : token.symbol}
                </div>
              </div>
            ))}
          </section>

          <section className="liquidity__box">
            <div className="title">
              <div>🍣</div>
              <h2>
                <a href="https://exchange.sushiswapclassic.org/#/add/0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" target="_blank">SushiSwap</a>
                <span>↗</span>
                <i>{ (tbtcPrice && sushiTbtcWbtc.reserve1) ? formatDollar(tbtcPrice * 2 * sushiTbtcWbtc.reserve1 / 1e18) : '...' }</i>
              </h2>
            </div>

            <div><label>{ sushiTbtcWbtc.reserve1 ? numberToFixed(sushiTbtcWbtc.reserve1 / 1e18) : '...' }</label>{sushiTbtcWbtc.reserve1Symbol}</div>

            <div><label>{ sushiTbtcWbtc.reserve0 ? numberToFixed(sushiTbtcWbtc.reserve0 / 1e8) : '...' }</label>{sushiTbtcWbtc.reserve0Symbol}</div>
          </section>

          <section className="liquidity__box">
            <div className="title">
              <div><img src="/uniswap.jpeg" /></div>
              <h2>
                <a href="https://info.uniswap.org/pair/0x854056Fd40C1B52037166285B2e54Fee774d33f6" target="_blank">Uniswap</a>
                <span>↗</span>
                <i>{ (tbtcPrice && uniTbtcWeth.reserve0) ? formatDollar(tbtcPrice * 2 * uniTbtcWeth.reserve0 / 1e18) : '...' }</i>
              </h2>
            </div>
            <div><label>{ uniTbtcWeth.reserve1 ? numberToFixed(uniTbtcWeth.reserve1 / 1e18) : '...' }</label>{uniTbtcWeth.reserve1Symbol}</div>
            <div><label>{ uniTbtcWeth.reserve0 ? numberToFixed(uniTbtcWeth.reserve0 / 1e18) : '...' }</label>{uniTbtcWeth.reserve0Symbol}</div>
          </section>

          <section className="liquidity__box">
            <div className="title">
              <div><img src="/uniswap.jpeg" /></div>
              <h2>
                <a href="https://info.uniswap.org/pair/0x8a1643D77621d171df97Df4fc86051F54F7EBA90" target="_blank">Uniswap</a>
                <span>↗</span>
                <i>{ (tbtcPrice && uniTbtcWbtc.reserve0) ? formatDollar(tbtcPrice * 2 * uniTbtcWbtc.reserve0 / 1e8) : '...' }</i>
              </h2>
            </div>

            <div><label>{uniTbtcWbtc.reserve1 ? numberToFixed(uniTbtcWbtc.reserve1 / 1e18) : '...'}</label>{uniTbtcWbtc.reserve1Symbol}</div>
            <div><label>{uniTbtcWbtc.reserve0 ? numberToFixed(uniTbtcWbtc.reserve0 / 1e8) : '...'}</label>{uniTbtcWbtc.reserve0Symbol}</div>
          </section>

          <section className="liquidity__box">
            <div className="title">
              <div className="black"><img src="/balancer.svg" /></div>
              <h2>
                <a href="https://pools.balancer.exchange/#/pool/0x17996cbddd23c2a912de8477c37d43a1b79770b8/" target="_blank">Balancer</a>
                <span>↗</span>
                <i>{ (tbtcPrice && balancerTbtcWbtc.length) ? formatDollar(tbtcPrice * 2 * balancerTbtcWbtc[1].balance / 1e18) : '...' }</i>
              </h2>
            </div>
            {balancerTbtcWbtc.map(token => (
              <div>
                <div><label>{ token.balance ? numberToFixed(token.balance / Math.pow(10, token.decimals)) : '...' }</label>{token.symbol}</div>
              </div>
            ))}
          </section>

          <section className="liquidity__box">
            <div className="title">
              <div className="black"><img src="/balancer.svg" /></div>
              <h2>
                <a href="https://pools.balancer.exchange/#/pool/0xb98db2fb641751462fd78c6db2a5c6edb50864d4/" target="_blank">Balancer</a>
                <span>↗</span>
                <i>{ (tbtcPrice && balancerTbtcWeth.length) ? formatDollar(tbtcPrice * 2 * balancerTbtcWeth[0].balance / 1e18) : '...' }</i>
              </h2>
            </div>
            {balancerTbtcWeth.map(token => (
              <div>
                <div><label>{ token.balance ? numberToFixed(token.balance / Math.pow(10, token.decimals)) : '...' }</label>{token.symbol}</div>
              </div>
            ))}
          </section>
        </div>
      </div>
    );
  }
}

export default LiquidityPool;
