import { names } from "./names";
import { population } from "./population";
import { stateFullNames } from "./stateFullNames";

export const getStateAbr = (fips: string) => {
  if (names[fips] === undefined) {
    console.error("no name for", fips);
    return "Unknown";
  }
  return names[fips].State;
};

export const getStateName = (fips: string) => {
  return stateFullNames[getStateAbr(fips)];
};

export const getCountyName = (fips: string) => {
  if (names[fips] === undefined) {
    console.error("fips name not found", fips);
    return "Unknown";
  }
  return names[fips].County;
};

export const getPopulation = (fips: string) => {
  return population[fips];
};

export const isState = (fips: string) => {
  return fips.substring(2, 5) === '000';
}
