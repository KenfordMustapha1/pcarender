import React from 'react';
import ReactECharts from 'echarts-for-react';

const AreaLineChart = () => {
  const option = {
    grid: { left: 40, right: 20, top: 30, bottom: 30, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#888' } },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#888' } },
      splitLine: { lineStyle: { type: 'dashed', color: '#ccc' } },
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'line',
        smooth: true,
        areaStyle: { color: 'rgba(76, 175, 80, 0.3)' },
        lineStyle: { color: '#4caf50', width: 3 },
        symbolSize: 8,
        itemStyle: { color: '#4caf50' },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ width: '100%', height: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
};

export default AreaLineChart;
