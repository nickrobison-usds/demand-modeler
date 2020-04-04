import React from "react";
import pptxgen from "pptxgenjs";
import { CovidDateData, State } from "../app/AppStore";
import * as _ from "lodash";
import * as PowerPointUtils from "./PowerPointGenerator/Utils";
import * as fips from "../utils/fips";
import { lineColors, metroAreas } from "../utils/reportHelpers";
import { isSameDay, monthDayCommaYear} from "../utils/DateUtils"
import { addTitleSlide } from "./PowerPointGenerator/Slides/template/TitleSlides/TitleSlide";
import { addLineChartWithLegend, LineData, lineChartConfig } from "./PowerPointGenerator/Slides/template/InteriorSlides/LineChartWithTitle";
import { addBlankSlideWithTitle } from "./PowerPointGenerator/Slides/template/InteriorSlides/BlankWithTitle";
import * as styles from "./PowerPointGenerator/Styles";

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

  const names = states.map((s) => s.ID);
  console.debug(
    "States",
    states.map((s) => s.ID)
  );
  console.debug("Names", names);

  // Can we create a chart?

  // Split by state ID
  // const topStates =
  // .
  // filter(s => names.has(s.ID));

  // console.debug("Tops: ", topStates);
  const ts = states.map((s) => s.ID).flatMap((i) => timeSeries.states[i]);
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
    groupedEntries.map((entry) => entry[0]),
    ["Confirmed", "Deaths"],
    groupedEntries.length > 0 ? groupedEntries[0][1].map(e => fips.getStateName(e.ID)) : [],
    [
      groupedEntries.map((entry) => entry[1].map((e) => e.Confirmed)),
      groupedEntries.map((entry) => entry[1].map((e) => e.Dead)),
    ]
  );

  console.debug("Data Combined:", dataCombined);

  PowerPointUtils.addClusteredStackedChart(ppt, s, dataCombined, {
    x: 1,
    y: 1,
    w: 8,
    h: 4,
  });
};

const getStateLineData = (states: State[][]) => {
  return states.reduce((acc, stateSeries) => {
    const state: LineData = {
      name: fips.getStateAbr(stateSeries[0].ID),
      labels: [],
      values: [],
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
  }, [] as LineData[]).sort((a, b) => {
    return b.values[b.values.length - 1] - a.values[a.values.length - 1];
  });
}

export const ReportContainer: React.FC<ReportContainerProps> = (props) => {
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
      `Source of case & mortality data: Conference of State Bank Supervisors and USAFacts.org, as of ${monthDayCommaYear(new Date())}`,
      `Data sourced from state health departments and news reports; reporting may be incomplete and delayed`
    );
    // addTopTenStates(ppt, props.states, props.weeklyTimeSeries)

    // Line chart
    const allStates = getStateLineData(Object.values(props.historicalTimeSeries.states));
    addLineChartWithLegend(
      ppt,
      "Cumulative cases per 100,000: All States",
      allStates,
      lineColors
    );

    const allStatesWithoutNY = getStateLineData(Object.values(props.historicalTimeSeries.states)).filter((el) => !["NY"].includes(el.name));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: All States Without NY`,
      allStatesWithoutNY,
      lineColors
    );

    const top12States = getStateLineData(Object.values(props.historicalTimeSeries.states)).splice(0,12);
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: Top 12 States`,
      top12States,
      lineColors
    );

    const top12StatesWithoutNY = getStateLineData(Object.values(props.historicalTimeSeries.states)).filter((el) => !["NY"].includes(el.name)).splice(0,12);
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: Top 12 States Without NY`,
      top12StatesWithoutNY,
      lineColors
    );

    const exceptionStates = ["NY", "NJ", "CT", "WA", "CA"];
    const exceptionStatesData = getStateLineData(Object.values(props.historicalTimeSeries.states)).filter((el) => exceptionStates.includes(el.name));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: ${exceptionStates.join(
        ", "
      )}`,
      exceptionStatesData,
      lineColors
    );

    // // Non-exception states
    const nonExceptionStatesData = getStateLineData(Object.values(props.historicalTimeSeries.states)).filter((el) => !exceptionStates.includes(el.name));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases per 100,000: states except ${exceptionStates.join(
        ", "
      )}`,
      nonExceptionStatesData,
      lineColors
    );

    // Metro areas (stacked)
    type StackedBarData = {
      name: string;
      labels: string[];
      values: number[];
    };

    let dataLabelFontSize = 7;

    const accumulateNYCData = (counties: string[], index: number, attribute: "Dead" | "Confirmed") => {
      let total = 0;
      counties.forEach(fip => {
        const entry = props.historicalTimeSeries.counties[fip][index];
        if (entry) {
          total += props.historicalTimeSeries.counties[fip][index][attribute]
        }
      });
      return total;
    }

    const getConfirmedColors = (length: number): string[] => {
      switch (length) {
        default:
        case 6:
          return ["160004", "52000F", "910A0A", "B8051A", "DE0029", "EF8094"].reverse();
        case 5:
          return ["160004", "52000F", "910A0A", "DE0029", "EF8094"].reverse();
        case 3:
          return ["DE0029", "910A0A", "52000F"];
        case 2:
          return ["DE0029", "910A0A"];
        case 1:
          return ["910A0A"];
      }
    }

    const getDeadColors = (length: number): string[] => {
      switch (length) {
        default:
        case 6:
          return ["032E41", "285266", "4D768A", "729BAF", "97BFD3", "DEF1FC"].reverse();
        case 5:
          return ["032E41", "315B6F", "60899D", "8EB6CA", "BCE3F8"].reverse();
        case 3:
          return ["BCE3F8", "33689A", "032E41"];
        case 2:
          return ["BCE3F8", "33689A"];
        case 1:
          return ["33689A"];
      }
    }

    const addCountySlide = (
      ppt: pptxgen,
      metroArea: string,
      counties: string[],
      stat: Stat,
      daily = false
    ): pptxgen.ISlide => {
      let firstCounty: string = "";

      const countyData = [...counties]
        .reverse()
        .map((fips) => {
          if (fips === "36061") {
            const nyc_combined = ["36061", "36005", "36081","36047", "36085"];
            return props.historicalTimeSeries.counties[fips].map((county, index) => {
              var today = new Date();
              if (isSameDay(county.Reported, today)) {
                return county;
              }
              return {
                ...county,
                Dead: accumulateNYCData(nyc_combined, index, "Dead"),
                Confirmed: accumulateNYCData(nyc_combined, index, "Confirmed"),
              }
            });
          } else {
            return props.historicalTimeSeries.counties[fips]
          }
        })
        .reduce((acc, county) => {
          if (!firstCounty) {
            firstCounty = `${fips.getCountyName(county[0].ID)} County`;
          }

          const data: StackedBarData = {
            name: fips.getCountyName(county[0].ID) + ", " + fips.getStateAbr(county[0].ID),
            labels: [],
            values: [],
          };

          // Data comes in in reverse chronological order
          const orderedCounties = [...county].reverse();

          orderedCounties.forEach((el, i) => {
            data.labels.push(
              el.Reported.getMonth() + 1 + "/" + el.Reported.getDate()
            );
            let value = el[stat === "confirmed" ? "Confirmed" : "Dead"];
            if (daily && orderedCounties[i - 1]) {
              value = Math.max(
                value -
                  orderedCounties[i - 1][
                    stat === "confirmed" ? "Confirmed" : "Dead"
                  ],
                0
              );
            }
            if (value > 9999) {
              dataLabelFontSize = 5;
            }
            data.values.push(value);
          });
          // The first day is only used to calculate diffs. Remove it.
          data.labels.shift();
          data.values.shift();
          acc.push(data);
          return acc;
        }, [] as StackedBarData[]);

      const confirmedColors = getConfirmedColors(counties.length);
      const deadColors = getDeadColors(counties.length);

      const barColors = stat === "confirmed" ? confirmedColors : deadColors;

      const barChartConfig = () => {
        const config = {
        ...lineChartConfig(),
        barGrouping: "stacked",
        valAxisTitle: `Confirmed ${
          stat === "confirmed" ? "cases" : "deaths"
        }`.toUpperCase(),
        w: 9,
        showLabel: true,
        showValue: false,
        barGapWidthPct: 10,
        dataLabelFontSize,
        dataLabelFontFace: styles.BODY_FONT_FACE,
        dataLabelColor: "EEEEEE",
        chartColors: barColors,
        showLegend: counties.length > 1,
        legendFontFace: styles.BODY_FONT_FACE,
        valGridLine: { style: "solid", color: styles.AXIS_COLOR },
        dataLabelFormatCode: "0;;;",
      }
      return config;
    };

      return addBlankSlideWithTitle(
        ppt,
        `${metroArea} Metro Area${
          counties.length === 1 ? ` (${firstCounty})` : ""
        }: Confirmed ${stat === "confirmed" ? "Cases" : "Deaths"}${
          daily ? " Daily" : ""
        }`
      ).addChart(ppt.ChartType.bar, countyData, barChartConfig());
    };

    metroAreas.forEach((metroArea) => {
      const { area, fipsCodes } = metroArea;
      addCountySlide(ppt, area, fipsCodes, "confirmed");
      addCountySlide(ppt, area, fipsCodes, "confirmed", true);
      addCountySlide(ppt, area, fipsCodes, "dead");
      addCountySlide(ppt, area, fipsCodes, "dead", true);
    });

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