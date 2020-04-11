import pptxgen from "pptxgenjs";
import { CovidDateData } from "../../../../app/AppStore";
import {
  CSBAOrderedByStat,
  CBSAOrderedByPopulation,
  getCSBATotalPerPopulation
} from "./Utils";
import { addLineChartWithLegend } from "../Templates/InteriorSlides/LineChartWithTitle";
import {getMaxValueOne} from "../Templates/InteriorSlides/Utils";
import { cbsaCodes } from "./cbsaCodes";
import { colors } from "./Top25CBSALineGraph";
import * as fipsUtils from "../../../../utils/fips";
import { addBlankSlideWithTitle } from "../Templates/InteriorSlides/BlankWithTitle";

const getChartData = (
  counties: CovidDateData["counties"],
  exclude: string[]
) => {
  const byPopulation = CBSAOrderedByPopulation(
    counties,
    "Confirmed",
    1000,
    500000,
    exclude
  );

  // order by confirmed cases
  const byConfirmedCases = byPopulation.sort(
    (a, b) =>
      getCSBATotalPerPopulation(counties, b, "Confirmed") -
      getCSBATotalPerPopulation(counties, a, "Confirmed")
  );

  const lineColors: { [s: string]: string } = {};
  const lineData = byConfirmedCases.reduce((acc, id, i) => {
    const { name, fips } = cbsaCodes[id];
    lineColors[name] = colors[i % (colors.length - 1)];
    const state: ChartData = {
      name,
      labels: [],
      values: []
    };

    Object.values(counties)[1].forEach((c, index) => {
      let confirmed = 0;
      let population = 0;
      fips.forEach(fip => {
        if (counties[fip] !== undefined && counties[fip][index] !== undefined) {
          confirmed += counties[fip][index].Confirmed;
          population += fipsUtils.getPopulation(fip);
        }
      });
      state.labels.push(c.Reported.getMonth() + 1 + "/" + c.Reported.getDate());
      state.values.push(confirmed / (population / 100000));
      // state.values.push(confirmed);
    });

    // The first day is only used to calculate diffs. Remove it.
    state.labels.reverse();
    state.values.reverse();
    acc.push(state);
    return acc;
  }, [] as ChartData[]);
  return {
    lineData,
    lineColors
  };
};

export const addCBSAPopulationOver500k = (
  ppt: pptxgen,
  counties: CovidDateData["counties"]
) => {
  addBlankSlideWithTitle(ppt, "CBSA's > 500k people excluding top 25 by confirmed cases");

  const top25 = CSBAOrderedByStat(counties, "Confirmed", 25, []);
  // Exclude top 25
  const withoutTop25 = () => getChartData(counties, top25);
  // All together
  const allTogether = withoutTop25();
  const maxValue = getMaxValueOne(allTogether.lineData)
  addLineChartWithLegend(
    ppt,
    `Cumulative cases: CBSA's > 500k people, Excluding Top 25 CBSA`,
    allTogether.lineData,
    allTogether.lineColors,
    "Confirmed cases per 100,000",
    maxValue,
    25
  );

  // 25 at a time
  const numberOfCharts = Math.ceil(allTogether.lineData.length / 25);
  for (let i = 0; i < numberOfCharts; i++) {
    const start = i * 25;
    const end = (i + 1) * 25;
    const chartData = withoutTop25();
    addLineChartWithLegend(
      ppt,
      `Cumulative cases: CBSA's > 500k people, Excluding Top 25 CBSA ${start +
        1} - ${Math.min(end, chartData.lineData.length)}`,
      chartData.lineData.slice(start, end),
      chartData.lineColors,
      "Confirmed cases per 100,000",
      maxValue
    );
  }
};
