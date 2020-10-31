import React from 'react';
import uuid from 'uuid/v4';
import { Chart } from '@antv/g2';
import { addressFormatter } from '../../utils/index';

export default class PieChart extends React.Component {
  componentWillMount() {
    this.uuid = uuid();
  }

  renderChart = data => {
    let totalSupply = this.props.totalSupply;
    let chartData = [];
    if (data && data.length) {
      chartData = data.splice(0, 20)
    }

    const chart = new Chart({
      container: this.uuid,
      autoFit: true,
      height: 500,
    });

    chart.coordinate('theta', {
      radius: 0.75,
      innerRadius: 0.6,
    });

    chart.data(chartData);

    chart.tooltip({
      showTitle: false,
      showMarkers: false,
    });

    chart
      .annotation()
      .text({
        position: ['50%', '50%'],
        content: 'Total Supply',
        style: {
          fontSize: 14,
          fill: '#8c8c8c',
          textAlign: 'center',
        },
        offsetY: -20,
      })
      .text({
        position: ['50%', '50%'],
        content: totalSupply,
        style: {
          fontSize: 20,
          fill: '#8c8c8c',
          textAlign: 'center',
        },
        offsetY: 20,
      });

    chart
      .interval()
      .position('balance')
      .color('id')
      .label('id*balance', {
        layout: { type: 'pie-spider' },
        labelHeight: 20,
        content: (obj) => `${obj.id} (${obj.balance})`,
        labelLine: {
          style: {
            lineWidth: 0.5,
          },
        },
      })
      .adjust('stack');

    chart.interaction('element-active');

    chart.render();
  }

  componentDidMount() {
    this.renderChart(this.props.data);
  }

  render() {
    return <div className="dashboard__chart" id={this.uuid}></div>;
  }
}
