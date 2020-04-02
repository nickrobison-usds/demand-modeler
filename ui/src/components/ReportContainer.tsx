import React from "react";
import pptxgen from "pptxgenjs";
import { CovidDateData, State } from "../app/AppStore";
import * as _ from "lodash";
import * as PowerPointUtils from "../utils/PowerPointUtils";
import { stateAbbreviation } from "../utils/fips/stateAbbreviation";
import * as fips from "../utils/fips";
import { lineColors } from "../utils/reportHelpers";

export interface ReportContainerProps {
  states: State[];
  weeklyTimeSeries: CovidDateData;
  historicalTimeSeries: CovidDateData;
}

export const addTitleSlide = (ppt: pptxgen) => {
  const titleSlide = ppt.addSlide();
  titleSlide.addText("COVID-19 county-level case data", {
    fontFace: "Calibri (Headings)",
    bold: true,
    color: ppt.SchemeColor.text2,
    x: 1.8,
    y: 2.26,
    fontSize: 40,
    h: 0.38,
    w: 8.2
  });
  titleSlide.addText("Data as of (today)", {
    fontSize: 20,
    x: 1.8,
    y: 2.75
  });
  titleSlide.addShape(ppt.ShapeType.line, {
    color: "#FF0000",
    height: 3.17,
    width: 0.03,
    rotate: 45,
    x: 0.31,
    y: 1.25,
    h: 2.84,
    w: 2.85
  });
};

export const addTopTenStates = (
  ppt: pptxgen,
  states: State[],
  timeSeries: CovidDateData
) => {
  // Do the state things
  const s = ppt.addSlide();

  const names = states.map(s => s.ID);
  console.debug(
    "States",
    states.map(s => s.ID)
  );
  console.debug("Names", names);

  // Can we create a chart?

  // Split by state ID
  // const topStates =
  // .
  // filter(s => names.has(s.ID));

  // console.debug("Tops: ", topStates);
  const ts = states.map(s => s.ID).flatMap(i => timeSeries.states[i]);
  console.debug("top states");

  const grouped = _.chain(ts)
    .sortBy(["Reported"])
    .groupBy("Reported")
    .value();

  // const grouped = _.chain(fil)
  //     .sortBy(["Reported"])
  //     .groupBy(["Reported"])
  //     .value();
  console.debug("Grouped", grouped);

  const groupedEntries = Object.entries(grouped);
  const dataCombined = PowerPointUtils.buildClusteredStack(
    // The date labels
    groupedEntries.map(entry => entry[0]),
    ["Confirmed", "Deaths"],
    groupedEntries.length > 0 ? groupedEntries[0][1].map(e => e.State) : [],
    [
      groupedEntries.map(entry => entry[1].map(e => e.Confirmed)),
      groupedEntries.map(entry => entry[1].map(e => e.Dead))
    ]
  );

  console.debug("Data Combined:", dataCombined);

  PowerPointUtils.addClusteredStackedChart(ppt, s, dataCombined, {
    x: 1,
    y: 1,
    w: 8,
    h: 4
  });
};

export const ReportContainer: React.FC<ReportContainerProps> = props => {
  const exportPowerPoint = async () => {
    // noinspection JSPotentiallyInvalidConstructorUsage
    const ppt = new pptxgen();
    ppt.layout = "LAYOUT_16x9";
    ppt.company = "United States Digital Service";
    // Generate the title slide
    addTitleSlide(ppt);
    addTopTenStates(ppt, props.states, props.weeklyTimeSeries);

    const TEXT_COLOR = "0A2644";
    const TEXT_FONT_FACE = "Source Sans Pro";
    const AXIS_COLOR = "EEEEEE";

    // Titles
    const titleConf = () => ({
      fontFace: TEXT_FONT_FACE,
      color: TEXT_COLOR,
      charSpacing: 2,
      fontSize: 16,
      x: 0,
      y: 0.3,
      w: "100%",
      align: "center"
    });

    // Line chart
    const lineChartConfig = () => ({
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
      titleFontFace: TEXT_FONT_FACE,
      catAxisLabelFontFace: TEXT_FONT_FACE,
      catAxisTitleFontFace: TEXT_FONT_FACE,
      valAxisLabelFontFace: TEXT_FONT_FACE,
      valAxisTitleFontFace: TEXT_FONT_FACE,
      // Colors
      legendColor: TEXT_COLOR,
      titleColor: TEXT_COLOR,
      catAxisLabelColor: TEXT_COLOR,
      valAxisLabelColor: TEXT_COLOR,
      valAxisTitleColor: TEXT_COLOR,
      gridLineColor: AXIS_COLOR,
      axisLineColor: AXIS_COLOR,
      serAxisLabelColor: TEXT_COLOR,
      serAxisTitleColor: TEXT_COLOR,
      valAxisMajorUnit: 0
    });

    type LineData = { name: string; labels: string[]; values: number[] };

    const stateLineData = Object.values(
      props.historicalTimeSeries.states
    ).reduce((acc, stateSeries) => {
      const nameNotNull = stateSeries.find(s => s.State !== "") as State;
      const state: LineData = {
        name: stateAbbreviation[nameNotNull.State],
        labels: [],
        values: []
      };
      stateSeries.forEach(el => {
        if (el.State !== "") {
          state.labels.push(
            el.Reported.getMonth() + 1 + "/" + el.Reported.getDate()
          );
          state.values.push(el.Confirmed / (fips.getPopulation(el.ID + "000") / 100000));
        }
      });
      acc.push(state);
      return acc;
    }, [] as LineData[]);

    stateLineData.sort((a, b) => {
      return b.values[b.values.length - 1] - a.values[a.values.length - 1];
    });

    const exceptionStates = ["NY", "NJ", "CT", "WA", "CA"];
    const exceptionStateData = stateLineData.filter(el =>
      exceptionStates.includes(el.name)
    );

    const nonExceptionStateData = stateLineData.filter(
      el => !exceptionStates.includes(el.name)
    );

    const addSlideWithTitle = (ppt: pptxgen, title: string): pptxgen.ISlide => {
      return ppt
        .addSlide()
        .addText(title.toUpperCase(), titleConf())
        .addShape(ppt.ShapeType.line, {
          x: 3.75,
          y: 0.75,
          w: 2.5,
          h: 0.0,
          line: AXIS_COLOR,
          lineSize: 1.5
        });
    };

    const addLineChartWithLegend = (
      slide: pptxgen.ISlide,
      lineData: LineData[]
    ): pptxgen.ISlide => {
      const chartColors: string[] = [];
      // Skip territories not in existing slides
      const lines = [...lineData].filter(
        el => lineColors[el.name] !== undefined
      );
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
        line: AXIS_COLOR,
        lineSize: 1
      });
      slide.addShape(ppt.ShapeType.line, {
        x: 8.84,
        y: 1.38,
        w: 0,
        h: 0.14 * Math.floor(lines.length / 2),
        line: AXIS_COLOR,
        lineSize: 1
      });
      slide.addChart(ppt.ChartType.line, lines, {
        ...lineChartConfig(),
        chartColors
      });
      return slide;
    };

    // Exception states
    const exceptionStateSlide = addSlideWithTitle(
      ppt,
      `Cumulative cases per 100,000: ${exceptionStates.join(", ")}`
    );
    addLineChartWithLegend(exceptionStateSlide, exceptionStateData);
    // Non-exception states
    const nonExceptionStateSlide = addSlideWithTitle(
      ppt,
      `Cumulative cases per 100,000: states except ${exceptionStates.join(
        ", "
      )}`
    );
    addLineChartWithLegend(nonExceptionStateSlide, nonExceptionStateData);
    // All states
    const allStateSlide = addSlideWithTitle(
      ppt,
      "Cumulative cases per 100,000: All States"
    );
    addLineChartWithLegend(allStateSlide, stateLineData);

    // // Add the map
    // let map = document.getElementsByClassName("mapboxgl-map").item(0);
    //
    // console.debug("Map element: ", map);
    //
    // const url = await domtoimage.toPng(map!);
    // console.debug("Map URL: ", url);
    // const mapSlide = ppt.addSlide();
    // mapSlide.addImage({
    //     data: url,
    //     // These positioning values are hard coded based on manual viewing and aligning of the graphs.
    //     h: 5.6,
    //     w: 5.6,
    //     x: 1.9
    // });
    //
    //
    // const svgElements = document.getElementsByClassName("report-chart");
    // for (let element of svgElements[Symbol.iterator]()) {
    //
    //     const url = await domtoimage.toPng(element, {
    //         // height: 880,
    //         // width: 1242
    //     });
    //     const s = ppt.addSlide();
    //     s.addImage({
    //         data: url,
    //         // These positioning values are hard coded based on manual viewing and aligning of the graphs.
    //         h: 5.6,
    //         w: 5.6,
    //         x: 1.9
    //     });
    // }
    console.debug("Writing PPTX");
    const done = await ppt.writeFile("Sample Presentation.pptx");
    console.debug("Finished exporting: ", done);
  };
  return (
    <div>
      <button className="usa-button" onClick={exportPowerPoint}>
        Export
      </button>
      {/* <>{props.children}</> */}
      <canvas />
    </div>
  );
};
