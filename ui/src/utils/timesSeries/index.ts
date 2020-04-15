import { CovidDateData, State, County } from "../../app/AppStore";
import {getStateAbr} from "../fips";

// Returns an array with a single element per unique state
export const getStates = (timeseries: CovidDateData): State[] => {
  const stateMap: { [ID: string]: State } = {};
  Object.keys(timeseries.states)
    .flatMap(k => timeseries.states[k])
    .forEach(s => (stateMap[s.ID] = s));
  return Object.values(stateMap);
};

// Returns an array with a single element per unique county in the given state
export const getCountiesForState = (
  timeseries: CovidDateData,
  stateId: string
): County[] => {
  const countyMap: { [ID: string]: State } = {};
  Object.keys(timeseries.counties)
    .flatMap(k => timeseries.counties[k])
    .filter(c => c.ID.substring(0, 2) === stateId.substring(0, 2))
    .forEach(s => (countyMap[s.ID] = s));
  return Object.values(countyMap);
};

// Flat array of all state data
export const getStateData = (timeSeries: CovidDateData): State[] => {
  return Object.keys(timeSeries.states).flatMap(k => timeSeries.states[k]);
};

// Flat array of all county data
export const getCountyData = (timeSeries: CovidDateData): County[] => {
  return Object.keys(timeSeries.counties).flatMap(k => timeSeries.counties[k]);
};

// Flat array of all county data for a given State
export const getCountyDataForState = (
  timeSeries: CovidDateData,
  stateId: string
): County[] => {
  return getCountyData(timeSeries).filter(c => getStateAbr(c.ID) === getStateAbr(stateId));
};

export const getEnd = (timeSeries: CovidDateData): Date => {
  let end: Date | undefined;
  getCountyData(timeSeries).forEach(c => {
    if (!end) {
      end = c.Reported;
      return;
    }
    if(c.Reported.getTime() > end.getTime()) {
      end = c.Reported;
    }
  });
  return end || new Date();
}