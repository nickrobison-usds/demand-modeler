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

export const formatNum = (labelValue: number) => {
  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e+9

       ? parseFloat(String(Math.abs(Number(labelValue)) / 1.0e+9)).toFixed(1) + "B"
       // Six Zeroes for Millions
       : Math.abs(Number(labelValue)) >= 1.0e+6

       ? parseFloat(String(Math.abs(Number(labelValue)) / 1.0e+6)).toFixed(1) + "M"
       // Three Zeroes for Thousands
       : Math.abs(Number(labelValue)) >= 1.0e+3

       ? parseFloat(String(Math.abs(Number(labelValue)) / 1.0e+3)).toFixed(0) + "K"

       : Math.abs(Number(labelValue));

   }

export const getLastUpdated = (timeSeries: CovidDateData): Date | undefined => {
  let lastUpdated: Date | undefined = undefined;
  Object.values(timeSeries.states)
    .flat()
    .forEach(({ Reported }) => {
      if (!lastUpdated || Reported > lastUpdated) {
        lastUpdated = Reported;
      }
    });
  return lastUpdated;
}

export const getMostRecentStateUpdates = (timeSeries: CovidDateData) => {
  console.log(timeSeries.states,"aaa")

  const stateData = Object.keys(timeSeries.states).flatMap(
    k => timeSeries.states[k]
  );
  console.log(stateData,"abs")
}