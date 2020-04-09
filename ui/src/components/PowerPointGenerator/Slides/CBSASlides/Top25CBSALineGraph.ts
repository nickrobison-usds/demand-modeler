import pptxgen from "pptxgenjs";
import { County } from "../../../../app/AppStore";
import { addLineChartWithLegend } from "../Templates/InteriorSlides/LineChartWithTitle";
import { cbsaCodes } from "./cbsaCodes";
import { CSBAOrderedByStat } from "./Utils";
import { isSameDay } from "../../../../utils/DateUtils";
// import * as fipsUtils from "../../../../utils/fips";

export const colors = [
  "69ABDD",
  "EF8D3D",
  "B3B3B3",
  "FFD122",
  "326AB6",
  "81BB54",
  "206391",
  "9E4D00",
  "646464",
  "987900",
  "2D4B75",
  "4D6D2B",
  "8CBFE3",
  "F8A869",
  "C7C7C7",
  "FEDD4A",
  "7094CC",
  "A0D175",
  "3B87C8",
  "D0670A",
  "8A8A8A",
  "D2A900",
  "3D63A5",
  "588732",
  "AED4ED",
  "FFC497",
];

const getChartData = (
  counties: { [fip: string]: County[] },
  exclude: string[]
) => {
  const today = new Date();
  const top25 = CSBAOrderedByStat(counties, "Confirmed", 25, exclude);
  const lineColors: { [s: string]: string } = {};
  const lineData = top25.reduce((acc, id, i) => {
    const { name, fips } = cbsaCodes[id];
    lineColors[name] = colors[i + exclude.length];
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
            confirmed += counties[fip][index].Confirmed;
            // population += fipsUtils.getPopulation(fip)
        }
      });
      state.labels.push(c.Reported.getMonth() + 1 + "/" + c.Reported.getDate());
      // state.values.push(confirmed/ (population / 100000));
      state.values.push(confirmed);
    });


    // The first day is only used to calculate diffs. Remove it.
    state.labels.reverse().shift();
    state.values.reverse().shift();
    acc.push(state);
    return acc;
  }, [] as ChartData[]);
  return {
    lineData,
    lineColors,
  };
};

export const addCBSATop25 = (
  ppt: pptxgen,
  counties: { [fip: string]: County[] }
) => {
  // with NY
  const withNY = getChartData(counties, []);
  addLineChartWithLegend(
    ppt,
    `Cumulative cases: Top 25 CBSA`,
    withNY.lineData,
    withNY.lineColors,
    "Confirmed cases"
  );

  // without NY
  const withoutNY = getChartData(counties, ["35620"]);
  addLineChartWithLegend(
    ppt,
    `Cumulative cases: Top 25 CBSA without NYC`,
    withoutNY.lineData,
    withoutNY.lineColors,
    "Confirmed cases"
  );
};
