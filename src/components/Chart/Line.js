import React from 'react';
import uuid from 'uuid/v4';
import { Chart } from '@antv/g2';
import moment from 'moment';
import { LoadingOutlined } from '@ant-design/icons';

export default class LineChart extends React.Component {
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
      height: 170,
    });

    chart.data(data);
    chart.scale({
      count: {
        nice: true,
        min: 0,
      },
      timestamp: {
        nice: true,
        formatter(t) {
          return moment(t * 1000).format('MM-DD');
        }
      },
    });
    chart.tooltip({
      showCrosshairs: true,
      shared: true,
    });

    chart.interval().position('timestamp*count').color('#6178EF');
    // chart.line().color('#6178EF').position('timestamp*count').shape('smooth');
    // chart.point().color('#1790FF').position('timestamp*count');

    chart.render();
  }

  componentDidMount() {
    this.renderChart(this.props.data);
  }

  render() {
    return <div className="chart" id={this.uuid}></div>;
  }
}
