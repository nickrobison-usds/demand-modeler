import React from "react";
import pptxgen from "pptxgenjs";
import { CovidDateData, State } from "../app/AppStore";
import * as _ from "lodash";
import { stateAbbreviation } from "../utils/stateAbbreviation";
import { population } from "./Charts/population";
import * as PowerPointUtils from "../utils/PowerPointUtils";

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

export const addTopTenStates = (ppt: pptxgen, states: State[], timeSeries: CovidDateData) => {
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
    const ts = states
      .map(s => s.ID)
      .flatMap(i => timeSeries.states[i]);
    console.debug("top states", ts);

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

    PowerPointUtils.addClusteredStackedChart(s, dataCombined, {x: 1, y: 1, w: 8, h: 4});
};

export const ReportContainer: React.FC<ReportContainerProps> = props => {
  const exportPowerPoint = async () => {
    // noinspection JSPotentiallyInvalidConstructorUsage
    const ppt = new pptxgen();
    ppt.layout = "LAYOUT_16x9";
    ppt.company = "United States Digital Service";
    // Generate the title slide
    addTitleSlide(ppt);
    // addTopTenStates(ppt, props.states, props.weeklyTimeSeries)

    // Line chart
    const lineChartConfig = () => ({
      x: 0,
      y: 0.5,
      w: 9.5,
      h: 5,
      showLegend: true,
      legendFontSize: 8,
      lineDataSymbol: "none",
      valGridLine: { style: "none" },
      showValAxisTitle: true,
      valAxisTitle: "Confirmed cases per 100,000",
      catAxisLabelRotate: 315,
      showTitle: true,
      titleFontSize: 16
    });

    type LineData = { name: string; labels: string[]; values: number[] };

    const stateLineData = Object.values(props.historicalTimeSeries.states).reduce(
      (acc, stateSeries) => {
        const state: LineData = {
          name: stateAbbreviation[stateSeries[0].State],
          labels: [],
          values: []
        };
        stateSeries.forEach(el => {
          state.labels.push(
            el.Reported.getMonth() + 1 + "/" + el.Reported.getDate()
          );
          state.values.push(el.Confirmed / (population[el.ID + "000"]/100000));
          console.log(el.ID)
        });
        acc.push(state);
        return acc;
      },
      [] as LineData[]
    );

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

    // Exception states
    ppt.addSlide().addChart(ppt.ChartType.line, exceptionStateData, {
      ...lineChartConfig(),
      title: `CUMULATIVE CASES PER 100,000: ${exceptionStates.join(", ")}`
    });
    // Non-exception states
    ppt.addSlide().addChart(ppt.ChartType.line, nonExceptionStateData, {
      ...lineChartConfig(),
      title: `Cumulative cases per 100,000, all other states except ${exceptionStates.join(
        ", "
      )}`
    });
    // All states
    ppt.addSlide().addChart(ppt.ChartType.line, stateLineData, {
      ...lineChartConfig(),
      title: "Cumulative cases per 100,000"
    });

    addTopTenStates(ppt, props.states, props.weeklyTimeSeries);

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
