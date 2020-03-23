import { CovidDateData } from "../app/AppStore";
import { stateAbbreviation } from "./stateAbbreviation";

export const getYMaxFromMaxCases = (maxCases: number): number =>
  Math.ceil(maxCases / 50) * 50;

export const getSelectedLocationName = (
  state: string | undefined,
  county: string | undefined,
  timeSeries: CovidDateData
): string | null => {
  if (state && !county) {
    const stateName = timeSeries.states[state][0].State;
    return stateName;
  }
  if (county) {
    const countyData = timeSeries.counties[county];
    if (!countyData) {
      return null;
    }
    const stateName = stateAbbreviation[timeSeries.counties[county][0].State];
    const countyName = timeSeries.counties[county][0].County;
    return `${countyName}, ${stateName}`;
  }

  return "the US";
};
