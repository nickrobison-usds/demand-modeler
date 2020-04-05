import pptxgen from "pptxgenjs";
import * as styles from "../../../Styles";
import { lineChartConfig } from "./LineChartWithTitle";
import { addBlankSlideWithTitle } from "./BlankWithTitle";

export type StackedBarData = {
  name: string;
  labels: string[];
  values: number[];
};

export const addStackedBarChartWithTitle = (
    ppt: pptxgen,
    title: string,
    barData: StackedBarData[],
    axisTitle: string,
    barColors: string[],
    showLegend: boolean
) => {
  const slide = addBlankSlideWithTitle(ppt, title)

  if (showLegend) {
    const bars = [...barData].reverse()
    bars.forEach((el, i) => {
      const color = barColors[i % barColors.length];
      slide.addShape(ppt.ShapeType.rect, {
        w: 0.18,
        h: 0.09,
        x: 8.6,
        y: 1.41 + 0.14 * Math.floor(i),
        fill: { color }
      });
      slide.addText(el.name, {
        x: 8.8,
        y: 1.3 + 0.14 * Math.floor(i),
        fontSize: 8
      });
    });
    slide.addShape(ppt.ShapeType.line, {
      x: 8.84,
      y: 1.38,
      w: 0,
      h: 0.14 * Math.floor(barData.length),
      line: styles.AXIS_COLOR,
      lineSize: 1
    });
  }

  slide.addChart(ppt.ChartType.bar, barData, {
    ...lineChartConfig(),
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
    dataLabelFormatCode: "0;;;"
  });
}