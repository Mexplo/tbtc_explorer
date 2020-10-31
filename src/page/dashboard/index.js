import React from 'react';
import Utils from '../../utils';
import ActionStatistic from './action_statistic';
import Holder from './holder';
import Minter from './minter';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <div className="dashboard">
        <h2>Total Minted User</h2>
        <Minter />
        <br/>
        <br/>

        <h2>tBTC Holders</h2>
        <Holder />
      </div>
    );
  }
}

export default Dashboard;
