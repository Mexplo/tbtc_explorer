import React from 'react';
import uuid from 'uuid/v4';
import { Chart } from '@antv/g2';
import { addressFormatter } from '../../utils/index';

export default class ColumnChart extends React.Component {
  componentWillMount() {
    this.uuid = uuid();
  }

  renderChart = data => {
    if (!data.length) {
      return;
    }
    const chart = new Chart({
      container: this.uuid,
      autoFit: true,
      height: 400,
    });

    chart.data(data);
    chart.scale({
      minted: {
        nice: true,
        min: 0,
      },
      addr: {
        formatter(value) {
          return addressFormatter(value, false);
        }
      }
    });
    chart.tooltip({
      showCrosshairs: true,
      shared: true,
    });

    chart.interval().position('addr*minted').color('#6178EF');
    chart.render();
  }

  componentDidMount() {
    this.renderChart(this.props.data);
  }

  render() {
    return <div className="dashboard__chart" id={this.uuid}></div>;
  }
}
