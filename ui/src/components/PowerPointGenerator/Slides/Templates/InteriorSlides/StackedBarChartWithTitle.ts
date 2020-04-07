import pptxgen from "pptxgenjs";
import * as styles from "../../../Styles";
import { lineChartConfig } from "./LineChartWithTitle";
import { addBlankSlideWithTitle } from "./BlankWithTitle";

export const addStackedBarChartWithTitle = (
  ppt: pptxgen,
  title: string,
  barData: ChartData[],
  axisTitle: string,
  barColors: string[],
  showLegend: boolean
) => {
  const slide = addBlankSlideWithTitle(ppt, title);

  if (showLegend) {
    const bars = [...barData].reverse();
    const colors = [...barColors];
    bars.forEach((el, i) => {
      const color = colors[(barData.length - 1 - i) % colors.length];
      slide.addShape(ppt.ShapeType.rect, {
        w: 0.18,
        h: 0.09,
        x: 8.6,
        y: 1.41 + 0.14 * Math.floor(i),
        fill: { color },
      });
      slide.addText(el.name, {
        x: 8.8,
        y: 1.3 + 0.14 * Math.floor(i),
        fontSize: 8,
      });
    });
    slide.addShape(ppt.ShapeType.line, {
      x: 8.84,
      y: 1.38,
      w: 0,
      h: 0.14 * Math.floor(barData.length),
      line: styles.AXIS_COLOR,
      lineSize: 1,
    });
  }

  slide.addChart(ppt.ChartType.bar, barData, {
    ...lineChartConfig("Confirmed cases per 100,000"),
    barGrouping: "stacked",
    valAxisTitle: axisTitle,
    w: showLegend ? 7.95 : 9,
    showLabel: true,
    showValue: false,
    barGapWidthPct: 10,
    dataLabelFontFace: styles.BODY_FONT_FACE,
    dataLabelColor: "EEEEEE",
    chartColors: barColors,
    legendFontFace: styles.BODY_FONT_FACE,
    valGridLine: { style: "solid", color: styles.AXIS_COLOR },
    dataLabelFormatCode: "0;;;",
  });
};

export const addMultiStackedBarChartWithTitle = (
  ppt: pptxgen,
  title: string,
  barData: ChartData[][],
  axisTitle: string,
  barColors: string[],
  showLegend: boolean
) => {
  if (barData.length === 1) {
    return addStackedBarChartWithTitle(
      ppt,
      title,
      barData[0],
      axisTitle,
      barColors,
      true
    );
  }

  const slide = addBlankSlideWithTitle(ppt, title);

  // Max value of all chart values for appropriate scale
  const maxValue = barData.reduce((acc, barChart) => {
    const dailyTotals: number[] = [];
    barChart.forEach((el) => {
      el.values.forEach((val, i) => {
        dailyTotals[i] = (dailyTotals[i] || 0) + val;
      });
    });
    const max = Math.max(...dailyTotals);
    return acc > max ? acc : max;
  }, 0);

  const scale = maxValue < 100 ? 10 : 100;

  barData.forEach((chartData, j) => {
    const barWidth = (showLegend ? 9.5 : 10.5) / barData.length;
    const barX = barWidth * j + (j === 0 ? 0 : 0.1);

    slide.addChart(ppt.ChartType.bar, chartData, {
      ...lineChartConfig("Confirmed cases per 100,000"),
      barGrouping: "stacked",
      valAxisTitle: axisTitle,
      x: barX,
      w: barWidth,
      showLabel: true,
      showValue: false,
      barGapWidthPct: 10,
      dataLabelFontFace: styles.BODY_FONT_FACE,
      dataLabelColor: "EEEEEE",
      chartColors: barColors,
      legendFontFace: styles.BODY_FONT_FACE,
      valGridLine: { style: "solid", color: styles.AXIS_COLOR },
      dataLabelFormatCode: "0;;;",
      valAxisMaxVal: Math.ceil(maxValue / scale) * scale,
      valAxisMinVal: 0,
    });

    if (showLegend) {
      const bars = [...chartData].reverse();
      const colors = [...barColors].slice(0, chartData.length);
      bars.forEach((el, i) => {
        const color = colors[(chartData.length - 1 - i) % colors.length];
        slide.addShape(ppt.ShapeType.rect, {
          w: 0.18,
          h: 0.09,
          x: barX + 0.8,
          y: 1.41 + 0.14 * Math.floor(i),
          fill: { color },
        });
        slide.addText(el.name, {
          x: barX + 0.95,
          y: 1.3 + 0.14 * Math.floor(i),
          fontSize: 8,
        });
      });
    }
  });
};
