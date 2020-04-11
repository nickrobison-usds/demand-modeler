export const getMaxValue = (chartData: ChartData[][]) => {
  return chartData.reduce((acc, barChart) => {
    const dailyTotals: number[] = [];
    barChart.forEach(el => {
      el.values.forEach((val, i) => {
        dailyTotals[i] = (dailyTotals[i] || 0) + val;
      });
    });
    const max = Math.max(...dailyTotals);
    return acc > max ? acc : max;
  }, 0);

};

export const getMaxValueOne = (chartData: ChartData[]) => {
  const dailyTotals: number[] = [];
  chartData.forEach(el => {
    el.values.forEach((val, i) => {
      dailyTotals[i] = val;
    });
  });
  const max=  Math.max(...dailyTotals);
  const scale = 18;
  return max * scale;
};
