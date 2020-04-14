import pptxgen from "pptxgenjs";
import {
  addLineChartWithLegend
} from "./Templates/InteriorSlides/LineChartWithTitle";
import { State } from "../../../app/AppStore";
import * as FipUtils from "../../../utils/fips";
import { lineColors } from "../../../utils/reportHelpers";
import { addBlankSlideWithTitle } from "./Templates/InteriorSlides/BlankWithTitle";

const getStateLineData = (
  states: State[][],
  perPopulation?: number
  ) => {
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
          const value = perPopulation ? el.Confirmed / (FipUtils.getPopulation(el.ID) / perPopulation) : el.Confirmed;
          state.values.push(value);
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

export const addStateLineGraphs = (
  ppt: pptxgen,
  states: {[fips: string]: State[]},
  perPopulation?: number
  ) => {
    const perPopString = perPopulation ? ` per ${perPopulation.toLocaleString()}` : "";
    addBlankSlideWithTitle(ppt, `States: Cumlative Cases${perPopString}`);

    const allStates = getStateLineData(Object.values(states));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases${perPopString}: All States`,
      allStates,
      lineColors,
      `Confirmed cases${perPopString}`
    );
  
    const allStatesWithoutNY = getStateLineData(Object.values(states)).filter(el => !["NY"].includes(el.name));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases${perPopString}: All States Without NY`,
      allStatesWithoutNY,
      lineColors,
      `Confirmed cases${perPopString}`
    );
  
    const top12States = getStateLineData(
      Object.values(states)
    ).splice(0, 12);
    addLineChartWithLegend(
      ppt,
      `Cumulative cases${perPopString}: Top 12 States`,
      top12States,
      lineColors,
      `Confirmed cases${perPopString}`
    );
  
    const States0to12WithoutNY = getStateLineData(
      Object.values(states)
    )
      .filter(el => !["NY"].includes(el.name))
      .splice(0, 12);
    addLineChartWithLegend(
      ppt,
      `Cumulative cases${perPopString}: Top States 1-12 Without NY`,
      States0to12WithoutNY,
      lineColors,
      `Confirmed cases${perPopString}`
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
      `Cumulative cases${perPopString}: Top 13-24 States Without NY With NJ`,
      [...States12to24NJ, ...States12to24WithoutNY],
      lineColors,
      `Confirmed cases${perPopString}`
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
      `Cumulative cases${perPopString}: Top 25-36 States Without NY With NJ`,
      [...States24to36NJ, ...States24to36ithoutNY],
      lineColors,
      `Confirmed cases${perPopString}`
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
      `Cumulative cases${perPopString}: Top 37-51 States Without NY With NJ`,
      [...States24to51NJ, ...States24to51ithoutNY],
      lineColors,
      `Confirmed cases${perPopString}`
    );
  
    const exceptionStates = ["NY", "NJ", "CT", "WA", "CA"];
    const exceptionStatesData = getStateLineData(
      Object.values(states)
    ).filter(el => exceptionStates.includes(el.name));
  
    addLineChartWithLegend(
      ppt,
      `Cumulative cases${perPopString}: ${exceptionStates.join(", ")}`,
      exceptionStatesData,
      lineColors,
      `Confirmed cases${perPopString}`
    );
  
    // // Non-exception states
    const nonExceptionStatesData = getStateLineData(
      Object.values(states)
    ).filter(el => !exceptionStates.includes(el.name));
    addLineChartWithLegend(
      ppt,
      `Cumulative cases${perPopString}: states except ${exceptionStates.join(
        ", "
      )}`,
      nonExceptionStatesData,
      lineColors,
      `Confirmed cases${perPopString}`
    );
};