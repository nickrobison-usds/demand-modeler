import pptxgen from "pptxgenjs";
import { CovidDateData } from "../../../../app/AppStore";
import { CSBAOrderedByStat, CBSAOrderedByPopulation } from "./Utils";
import { addLineChartWithLegend } from "../Templates/InteriorSlides/LineChartWithTitle";
import { cbsaCodes } from "./cbsaCodes";
import { colors, accumulateNYCData } from "./Top25CBSALineGraph";
import { isSameDay } from "../../../../utils/DateUtils";

const getChartData = (
  counties: CovidDateData["counties"],
  exclude: string[]
) => {
  const today = new Date();

  const byPopulation = CBSAOrderedByPopulation(
    counties,
    "Confirmed",
    1000,
    500000,
    exclude
  );

  const lineColors: { [s: string]: string } = {};
  const lineData = byPopulation.reduce((acc, id, i) => {
    const { name, fips } = cbsaCodes[id];
    lineColors[name] = colors[i % (colors.length - 1)];
    const state: ChartData = {
      name,
      labels: [],
      values: [],
    };

    Object.values(counties)[0].forEach((c, index) => {
      let confirmed = 0;
      // let population = 0;
      fips.forEach((fip) => {
        if (counties[fip] !== undefined && counties[fip][index] !== undefined) {
          if (
            fip === "36061" &&
            !isSameDay(counties[fip][index].Reported, today)
          ) {
            const nyc_combined = ["36061", "36005", "36081", "36047", "36085"];
            confirmed += accumulateNYCData(
              counties,
              nyc_combined,
              index,
              "Confirmed"
            );
            // nyc_combined.forEach(f => {population += fipsUtils.getPopulation(f)})
          } else {
            confirmed += counties[fip][index].Confirmed;
            // population += fipsUtils.getPopulation(fip)
          }
        }
      });
      state.labels.push(c.Reported.getMonth() + 1 + "/" + c.Reported.getDate());
      // state.values.push(confirmed/ (population / 100000));
      state.values.push(confirmed);
    });

    // The first day is only used to calculate diffs. Remove it.
    state.labels.reverse().shift();
    state.values.reverse().shift();
    state.labels.reverse();
    state.values.reverse();
    acc.push(state);
    return acc;
  }, [] as ChartData[]);
  return {
    lineData,
    lineColors,
  };
};

export const addCBSAPopulationOver500k = (
  ppt: pptxgen,
  counties: CovidDateData["counties"]
) => {
  const top25 = CSBAOrderedByStat(counties, "Confirmed", 25, []);
  // Exclude top 25
  const withoutTop25 = () => getChartData(counties, top25);
  // All together
  const allTogether = withoutTop25();
  addLineChartWithLegend(
    ppt,
    `Cumulative cases: Most Populous CBSA, Excluding Top 25 CBSA`,
    allTogether.lineData,
    allTogether.lineColors,
    "Confirmed cases",
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
      `Cumulative cases: Most Populous CBSA, Excluding Top 25 CBSA ${start +
        1} - ${Math.min(end, chartData.lineData.length)}`,
      chartData.lineData.slice(start, end),
      chartData.lineColors,
      "Confirmed cases"
    );
  }
};
