import pptxgen from "pptxgenjs";
import { County } from "../../../../app/AppStore";
import { addLineChartWithLegend } from "../Templates/InteriorSlides/LineChartWithTitle";
import { cbsaCodes } from "./cbsaCodes";
import { CSBAOrderedByStat } from "./Utils";
import { getPopulation } from "../../../../utils/fips";
import { addBlankSlideWithTitle } from "../Templates/InteriorSlides/BlankWithTitle";

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
  exclude: string[],
  perPopulation?: number
) => {
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

    Object.values(counties)[1].forEach((c, index) => {
      let confirmed = 0;
      let population = 0;
      fips.forEach((fip) => {
        if (counties[fip] !== undefined && counties[fip][index] !== undefined) {
          confirmed += counties[fip][index].Confirmed;
          population += getPopulation(fip);
        }
      });
      state.labels.push(c.Reported.getMonth() + 1 + "/" + c.Reported.getDate());
      const value = perPopulation
        ? confirmed / (population / perPopulation)
        : confirmed;

      state.values.push(value);
    });
    // The first day is only used to calculate diffs. Remove it.
    state.labels.shift();
    state.values.shift();
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
  counties: { [fip: string]: County[] },
  perPopulation?: number
) => {
  const perPopString = perPopulation
    ? ` per ${perPopulation.toLocaleString()}`
    : "";
  addBlankSlideWithTitle(ppt, `Cumulative Cases${perPopString}: Top 25 CBSA`);
  // with NY
  const withNY = getChartData(counties, [], perPopulation);
  addLineChartWithLegend(
    ppt,
    `Cumulative cases${perPopString}: Top 25 CBSA`,
    withNY.lineData,
    withNY.lineColors,
    `Confirmed cases${perPopString}`
  );

  // without NY
  const withoutNY = getChartData(counties, ["35620"], perPopulation);
  addLineChartWithLegend(
    ppt,
    `Cumulative cases${perPopString}: Top 25 CBSA without NYC`,
    withoutNY.lineData,
    withoutNY.lineColors,
    `Confirmed cases${perPopString}`
  );
};
