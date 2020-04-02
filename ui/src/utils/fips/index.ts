import { names } from "./names";
import { population } from "./population";
import { stateFullNames } from "./stateFullNames";

export const getStateAbr = (fips: string) => {
  return names[fips].State;
}

export const getStateName = (fips: string) => {
  return stateFullNames[getStateAbr(fips)];
}

export const getCountyName = (fips: string) => {
  return names[fips].County;
}

export const getPopulation = (fips: string) => {
  return population[fips];
}