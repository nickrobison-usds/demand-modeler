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
    barColors: string[]
) => {
  const slide = addBlankSlideWithTitle(ppt, title)

  slide.addChart(ppt.ChartType.bar, barData, {
    ...lineChartConfig(),
    barGrouping: "stacked",
    valAxisTitle: axisTitle,
    w: 9,
    showLabel: true,
    showValue: false,
    barGapWidthPct: 10,
    dataLabelFontFace: styles.BODY_FONT_FACE,
    dataLabelColor: "EEEEEE",
    chartColors: barColors,
    showLegend: true,
    legendFontFace: styles.BODY_FONT_FACE,
    valGridLine: { style: "solid", color: styles.AXIS_COLOR },
    dataLabelFormatCode: "0;;;"
  });
}