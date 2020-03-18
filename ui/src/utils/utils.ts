import { State } from "../app/AppStore";

export const getYMaxFromMaxCases = (maxCases: number): number =>
  Math.ceil(maxCases / 50) * 50;
