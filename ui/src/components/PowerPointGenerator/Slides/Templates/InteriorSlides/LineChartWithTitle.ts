import pptxgen from "pptxgenjs";
import * as style from "../../../Styles";
import { addBlankSlideWithTitle } from "./BlankWithTitle";

const legendXOffset = (length: number, twoColumns: boolean) => {
  if (length === 2) {
    if (twoColumns) {
      return 0.5;
    } else {
      return 1;
    }
  }
  return -0.8;
};

export const lineChartConfig = (valueLabel: string, offset?: number) => ({
  x: 0.5,
  y: 1,
  w: 7.4 + (offset ? offset : 0),
  h: 4.5,
  legendFontSize: 8,
  lineSize: 1.5,
  lineDataSymbol: "none",
  valGridLine: { style: "none" },
  serGridLine: { style: "none" },
  catGridLine: { style: "none" },
  showValAxisTitle: true,
  valAxisTitle: valueLabel.toUpperCase(),
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
  valAxisMajorUnit: 0,
});

export const addLineChartWithLegend = (
  ppt: pptxgen,
  title: string,
  lineData: ChartData[],
  lineColors: { [s: string]: string },
  valueLabel: string,
  maxYValue?: number,
  maxLegendItems: number = 100
) => {
  const slide = addBlankSlideWithTitle(ppt, title);

  const chartColors: string[] = [];
  // Skip territories not in existing slides
  // TODO: remove this
  const lines = [...lineData].filter((el) => lineColors[el.name] !== undefined);
  const numberOfLinesShown = Math.min(lines.length, maxLegendItems);

  const twoColumns = numberOfLinesShown > 25;

  let labelLength = 0;
  lines.forEach((el) => {
    if (el.name.length > labelLength) {
      labelLength = el.name.length;
    }
  });
  const offsetX = legendXOffset(labelLength, twoColumns);

  lines.forEach((el, i) => {
    const color = lineColors[el.name];
    chartColors.push(color);

    if (i < maxLegendItems) {
      slide.addShape(ppt.ShapeType.rect, {
        w: 0.18,
        h: 0.09,
        x: (twoColumns ? (i % 2 === 0 ? 8 : 8.6) : 8) + offsetX,
        y: 1.41 + 0.14 * Math.floor(i / (twoColumns ? 2 : 1)),
        fill: { color },
      });
      slide.addText(el.name, {
        x: twoColumns ? (i % 2 === 0 ? 8.2 : 8.8) : 8.2 + offsetX,
        y: 1.3 + 0.14 * Math.floor(i / (twoColumns ? 2 : 1)),
        fontSize: 8,
      });
    } else if (i === maxLegendItems) {
      slide.addText(`+${lines.length - maxLegendItems} more`, {
        x: twoColumns ? (i % 2 === 0 ? 8.2 : 8.8) : 8.2 + offsetX,
        y: 1.3 + 0.14 * Math.floor(i / (twoColumns ? 2 : 1)),
        fontSize: 8,
      });
    }
  });
  slide.addShape(ppt.ShapeType.line, {
    x: 8.23 + offsetX,
    y: 1.38,
    w: 0,
    h: 0.14 * Math.ceil(numberOfLinesShown / (twoColumns ? 2 : 1)),
    line: style.AXIS_COLOR,
    lineSize: 1,
  });
  if (twoColumns) {
    slide.addShape(ppt.ShapeType.line, {
      x: 8.84 + offsetX,
      y: 1.38,
      w: 0,
      h: 0.14 * Math.floor(numberOfLinesShown / 2),
      line: style.AXIS_COLOR,
      lineSize: 1,
    });
  }
  slide.addChart(ppt.ChartType.line, lines, {
    ...lineChartConfig(valueLabel, offsetX),
    valAxisMaxVal: maxYValue,
    valAxisMinVal: 0,
    chartColors,
  });
};
