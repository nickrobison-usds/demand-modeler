import React from "react";
import pptxgen from "pptxgenjs";
import { CovidDateData, State } from "../app/AppStore";
import * as _ from "lodash";
import * as PowerPointUtils from "./PowerPointGenerator/Utils";
import * as fips from "../utils/fips";
import { lineColors } from "../utils/reportHelpers";
import { monthDayCommaYear, yearMonthDayDot } from "../utils/DateUtils";
import { addTitleSlide } from "./PowerPointGenerator/Slides/Templates/TitleSlides/TitleSlide";
import {
  addLineChartWithLegend
} from "./PowerPointGenerator/Slides/Templates/InteriorSlides/LineChartWithTitle";
import {addCBSAStackedBarSlides} from "./PowerPointGenerator/Slides/CBSASlides/CBSAStackedBars";
import {addCBSATop25} from "./PowerPointGenerator/Slides/CBSASlides/Top25CBSALineGraph";

export interface ReportContainerProps {
  states: State[];
  weeklyTimeSeries: CovidDateData;
  historicalTimeSeries: CovidDateData;
}

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
    groupedEntries.length > 0
      ? groupedEntries[0][1].map(e => fips.getStateName(e.ID))
      : [],
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

const getStateLineData = (states: State[][]) => {
  return states
    .reduce((acc, stateSeries) => {
      const state: ChartData = {
        name: fips.getStateAbr(stateSeries[0].ID),
        labels: [],
        values: []
      };
      stateSeries.forEach(el => {
        state.labels.push(
          el.Reported.getMonth() + 1 + "/" + el.Reported.getDate()
        );
        state.values.push(el.Confirmed / (fips.getPopulation(el.ID) / 100000));
      });
      // The first day is only used to calculate diffs. Remove it.
      state.labels.shift();
      state.values.shift();
      acc.push(state);
      return acc;
    }, [] as ChartData[])
    .sort((a, b) => {
      return b.values[b.values.length - 1] - a.values[a.values.length - 1];
    });
};

export const ReportContainer: React.FC<ReportContainerProps> = props => {
  const exportPowerPoint = async () => {
    // noinspection JSPotentiallyInvalidConstructorUsage
    const ppt = new pptxgen();
    ppt.layout = "LAYOUT_16x9";
    ppt.company = "United States Digital Service";
    // Generate the title slide
    addTitleSlide(
      ppt,
      "Case Data by State and Metropolitan Area",
      `Data as of ${monthDayCommaYear(new Date())}`,
      `Source of case & mortality data: Conference of State Bank Supervisors and USAFacts.org, as of ${monthDayCommaYear(
        new Date()
      )}`,
      `Data sourced from state health departments and news reports; reporting may be incomplete and delayed`
    );
    // addTopTenStates(ppt, props.states, props.weeklyTimeSeries)

    // Line chart
    const allStates = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    );
    addLineChartWithLegend(
      ppt,
      "Cumulative cases per 100,000: All States",
      allStates,
      lineColors
    );

    const allStatesWithoutNY = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    ).filter(el => !["NY"].includes(el.name));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: All States Without NY`,
      allStatesWithoutNY,
      lineColors
    );

    const top12States = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    ).splice(0, 12);
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: Top 12 States`,
      top12States,
      lineColors
    );

    const States0to12WithoutNY = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    )
      .filter(el => !["NY"].includes(el.name))
      .splice(0, 12);
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: Top States 1-12 Without NY`,
      States0to12WithoutNY,
      lineColors
    );

    const States12to24WithoutNY = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    )
      .filter(el => !["NY"].includes(el.name))
      .splice(12, 12);
    const States12to24NJ = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    ).filter(el => ["NJ"].includes(el.name));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: Top 13-24 States Without NY With NJ`,
      [...States12to24NJ, ...States12to24WithoutNY],
      lineColors
    );

    const States24to36ithoutNY = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    )
      .filter(el => !["NY"].includes(el.name))
      .splice(24, 12);
    const States24to36NJ = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    ).filter(el => ["NJ"].includes(el.name));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: Top 25-36 States Without NY With NJ`,
      [...States24to36NJ, ...States24to36ithoutNY],
      lineColors
    );

    const States24to51ithoutNY = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    )
      .filter(el => !["NY"].includes(el.name))
      .splice(36, 15);
    const States24to51NJ = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    ).filter(el => ["NJ"].includes(el.name));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: Top 37-51 States Without NY With NJ`,
      [...States24to51NJ, ...States24to51ithoutNY],
      lineColors
    );

    const exceptionStates = ["NY", "NJ", "CT", "WA", "CA"];
    const exceptionStatesData = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    ).filter(el => exceptionStates.includes(el.name));

    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: ${exceptionStates.join(", ")}`,
      exceptionStatesData,
      lineColors
    );

    // // Non-exception states
    const nonExceptionStatesData = getStateLineData(
      Object.values(props.historicalTimeSeries.states)
    ).filter(el => !exceptionStates.includes(el.name));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: states except ${exceptionStates.join(
        ", "
      )}`,
      nonExceptionStatesData,
      lineColors
    );

    const counties = props.historicalTimeSeries.counties;
    addCBSATop25(ppt, counties);
    addCBSAStackedBarSlides(ppt, counties);

    console.debug("Writing PPTX");
    const done = await ppt.writeFile(`${yearMonthDayDot(new Date())} State line graphs and metropolitan areas.pptx`);
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
