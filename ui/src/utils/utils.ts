import { CovidDateData, County } from "../app/AppStore";

export const getContiesForState = (
  data: CovidDateData,
  date: string,
  state: string
): County[] => {
  const CountyIDs = data[date].states[state].CountyIDs;
  if (CountyIDs !== undefined) {
    return CountyIDs.map((id: string) => data[date].counties[id]);
  } else {
    throw Error("CountyIDs not defiened");
  }
};

export const getYMaxFromMaxCases = (maxCases: number): number =>
  Math.ceil(maxCases / 50) * 50;
