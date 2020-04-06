import pptxgen from "pptxgenjs";
import {
  addLineChartWithLegend
} from "./Templates/InteriorSlides/LineChartWithTitle";
import { State } from "../../../app/AppStore";
import * as FipUtils from "../../../utils/fips";
import { lineColors } from "../../../utils/reportHelpers";

const getStateLineData = (states: State[][]) => {
    return states
      .reduce((acc, stateSeries) => {
        const state: ChartData = {
          name: FipUtils.getStateAbr(stateSeries[0].ID),
          labels: [],
          values: []
        };
        stateSeries.forEach(el => {
          state.labels.push(
            el.Reported.getMonth() + 1 + "/" + el.Reported.getDate()
          );
          state.values.push(el.Confirmed / (FipUtils.getPopulation(el.ID) / 100000));
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

export const addStateLineGraphs= (ppt: pptxgen, states: {[fips: string]: State[]}) => {
  const allStates = getStateLineData(Object.values(states));
  addLineChartWithLegend(
    ppt,
    "Cumulative cases per 100,000: All States",
    allStates,
    lineColors,
    "Confirmed cases per 100,000"
  );

  const allStatesWithoutNY = getStateLineData(Object.values(states)).filter(el => !["NY"].includes(el.name));
  addLineChartWithLegend(
    ppt,
    `Cumulative cases per 100,000: All States Without NY`,
    allStatesWithoutNY,
    lineColors,
    "Confirmed cases per 100,000"
  );

  const top12States = getStateLineData(
    Object.values(states)
  ).splice(0, 12);
  addLineChartWithLegend(
    ppt,
    `Cumulative cases per 100,000: Top 12 States`,
    top12States,
    lineColors,
    "Confirmed cases per 100,000"
  );

  const States0to12WithoutNY = getStateLineData(
    Object.values(states)
  )
    .filter(el => !["NY"].includes(el.name))
    .splice(0, 12);
  addLineChartWithLegend(
    ppt,
    `Cumulative cases per 100,000: Top States 1-12 Without NY`,
    States0to12WithoutNY,
    lineColors,
    "Confirmed cases per 100,000"
  );

  const States12to24WithoutNY = getStateLineData(
    Object.values(states)
  )
    .filter(el => !["NY"].includes(el.name))
    .splice(12, 12);
  const States12to24NJ = getStateLineData(
    Object.values(states)
  ).filter(el => ["NJ"].includes(el.name));
  addLineChartWithLegend(
    ppt,
    `Cumulative cases per 100,000: Top 13-24 States Without NY With NJ`,
    [...States12to24NJ, ...States12to24WithoutNY],
    lineColors,
    "Confirmed cases per 100,000"
  );

  const States24to36ithoutNY = getStateLineData(
    Object.values(states)
  )
    .filter(el => !["NY"].includes(el.name))
    .splice(24, 12);
  const States24to36NJ = getStateLineData(
    Object.values(states)
  ).filter(el => ["NJ"].includes(el.name));
  addLineChartWithLegend(
    ppt,
    `Cumulative cases per 100,000: Top 25-36 States Without NY With NJ`,
    [...States24to36NJ, ...States24to36ithoutNY],
    lineColors,
    "Confirmed cases per 100,000"
  );

  const States24to51ithoutNY = getStateLineData(
    Object.values(states)
  )
    .filter(el => !["NY"].includes(el.name))
    .splice(36, 15);
  const States24to51NJ = getStateLineData(
    Object.values(states)
  ).filter(el => ["NJ"].includes(el.name));
  addLineChartWithLegend(
    ppt,
    `Cumulative cases per 100,000: Top 37-51 States Without NY With NJ`,
    [...States24to51NJ, ...States24to51ithoutNY],
    lineColors,
    "Confirmed cases per 100,000"
  );

  const exceptionStates = ["NY", "NJ", "CT", "WA", "CA"];
  const exceptionStatesData = getStateLineData(
    Object.values(states)
  ).filter(el => exceptionStates.includes(el.name));

  addLineChartWithLegend(
    ppt,
    `Cumulative cases per 100,000: ${exceptionStates.join(", ")}`,
    exceptionStatesData,
    lineColors,
    "Confirmed cases per 100,000"
  );

  // // Non-exception states
  const nonExceptionStatesData = getStateLineData(
    Object.values(states)
  ).filter(el => !exceptionStates.includes(el.name));
  addLineChartWithLegend(
    ppt,
    `Cumulative cases per 100,000: states except ${exceptionStates.join(
      ", "
    )}`,
    nonExceptionStatesData,
    lineColors,
    "Confirmed cases per 100,000"
  );
}
