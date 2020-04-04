import pptxgen from "pptxgenjs";
import * as style from "../../../Styles";
import { addBlankSlideWithTitle } from "./BlankWithTitle";

export type LineData = { name: string; labels: string[]; values: number[] };

export const lineChartConfig = () => ({
  x: 0.5,
  y: 1,
  w: 7.5,
  h: 4.5,
  legendFontSize: 8,
  lineSize: 1.5,
  lineDataSymbol: "none",
  valGridLine: { style: "none" },
  serGridLine: { style: "none" },
  catGridLine: { style: "none" },
  showValAxisTitle: true,
  valAxisTitle: "Confirmed cases per 100,000".toUpperCase(),
  catAxisLabelRotate: 270,
  showTitle: false,
  valAxisTitleFontSize: 7,
  valAxisLabelFontSize: 9,
  catAxisLabelFontSize: 9,
  // Font faces
  titleFontFace: style.BODY_FONT_FACE,
  catAxisLabelFontFace: style.BODY_FONT_FACE,
  catAxisTitleFontFace: style.BODY_FONT_FACE,
  valAxisLabelFontFace: style.BODY_FONT_FACE,
  valAxisTitleFontFace: style.BODY_FONT_FACE,
  // Colors
  legendColor: style.TEXT_COLOR,
  titleColor: style.TEXT_COLOR,
  catAxisLabelColor: style.TEXT_COLOR,
  valAxisLabelColor: style.TEXT_COLOR,
  valAxisTitleColor: style.TEXT_COLOR,
  gridLineColor: style.AXIS_COLOR,
  axisLineColor: style.AXIS_COLOR,
  serAxisLabelColor: style.TEXT_COLOR,
  serAxisTitleColor: style.TEXT_COLOR,
  valAxisMajorUnit: 0
});

export const addLineChartWithLegend = (
  ppt: pptxgen,
  title: string,
  lineData: LineData[],
  lineColors: { [s: string]: string }
) => {
  const slide = addBlankSlideWithTitle(ppt, title);

  const chartColors: string[] = [];
  // Skip territories not in existing slides
  // TODO: remove this
  const lines = [...lineData].filter(el => lineColors[el.name] !== undefined);
  lines.forEach((el, i) => {
    const color = lineColors[el.name];
    chartColors.push(color);
    slide.addShape(ppt.ShapeType.rect, {
      w: 0.18,
      h: 0.09,
      x: i % 2 === 0 ? 8 : 8.6,
      y: 1.41 + 0.14 * Math.floor(i / 2),
      fill: { color }
    });
    slide.addText(el.name, {
      x: i % 2 === 0 ? 8.2 : 8.8,
      y: 1.3 + 0.14 * Math.floor(i / 2),
      fontSize: 8
    });
  });
  slide.addShape(ppt.ShapeType.line, {
    x: 8.23,
    y: 1.38,
    w: 0,
    h: 0.14 * Math.ceil(lines.length / 2),
    line: style.AXIS_COLOR,
    lineSize: 1
  });
  slide.addShape(ppt.ShapeType.line, {
    x: 8.84,
    y: 1.38,
    w: 0,
    h: 0.14 * Math.floor(lines.length / 2),
    line: style.AXIS_COLOR,
    lineSize: 1
  });
  slide.addChart(ppt.ChartType.line, lines, {
    ...lineChartConfig(),
    chartColors
  });
};
