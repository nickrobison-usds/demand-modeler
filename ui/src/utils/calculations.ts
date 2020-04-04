import { AppState } from "../app/AppStore";
import * as fips from "./fips";

export interface Stats {
  Confirmed: number;
  Dead: number;
}

export type GrandTotal = {
  [d: string]: Stats;
};

export const getCountyGrandTotal = (appState: AppState): GrandTotal => {
  let counties = Object.values(
    appState.lastWeekCovidTimeSeries.counties
  ).reduce((acc, el) => [...acc, ...el], []);

  if (appState.selection.county) {
    counties = counties.filter(
      county => county.ID === appState.selection.county
    );
  } else if (appState.selection.state) {
    const selectedState = fips.getStateName(appState.selection.state);
    counties = counties.filter(
      county => fips.getStateName(county.ID) === selectedState
    );
  }

  const byDate = counties.reduce((acc, el) => {
    const key = el.Reported.toLocaleDateString();
    if (!acc[key]) {
      acc[key] = {
        Confirmed: 0,
        Dead: 0
      };
    }
    acc[key] = {
      Confirmed: acc[key].Confirmed + el.Confirmed,
      Dead: acc[key].Dead + el.Dead
    };
    return acc;
  }, {} as GrandTotal);

  return byDate;
};
