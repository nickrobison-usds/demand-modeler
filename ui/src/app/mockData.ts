import { CovidDateData, County, State } from "./AppStore";
// MOCK this file can be removed

const testStates = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii"
];

const makeStateData = (day: number): State[] => {
  return testStates.map((name, i) => {
    return {
      ID: `${i}`,
      State: name,
      Confirmed: Math.round(Math.random() * 1000),
      Dead: Math.round(Math.random() * 100),
      CountyIDs: new Array(11).fill(1).map((_, j) => `${i}|${j}`),
      Reported: new Date(`3/${day}/2020`)
    } as any;
  });
};

const makeCountyData = (day: number): County[] => {
  let counties: County[] = [];
  testStates.forEach((state, i) => {
    new Array(11).fill(1).forEach((_, j) => {
      counties.push({
        ID: `${i}|${j}`,
        County: `${state.slice(0, 2).toUpperCase()}-${j}`,
        State: `${state}`,
        Confirmed: Math.round(Math.random() * 400),
        Dead: Math.round(Math.random() * 30),
        Reported: new Date(`3/${day}/2020`),
      } as any);
    });
  });
  return counties;
};

function buildStateMap(): { [key: string]: State[] } {
  const testStateData = [
    {
      ID: "01",
      State: "New York",
      Confirmed: 1204,
      Dead: 80,
      CountyIDs: ["01|02"],
      Reported: new Date("3/15/2020")
    } as any,
    ...makeStateData(14),
    ...makeStateData(15),
    ...makeStateData(16)
  ];

  let states: { [key: string]: State[] } = {};

  testStateData.forEach(state => {
    if (!states[state.ID]) {
      states[state.ID] = [];
    }

    states[state.ID].push(state as any);
  });

  return states;
}

function buildCountyMap(): { [key: string]: County[] } {
  const testCountyData = [
    {
      ID: "01|02",
      County: "Westchester",
      State: "New York",
      Confirmed: 180,
      Dead: 3,
      Reported: new Date("3/15/2020")
    } as any,
    ...makeCountyData(14),
    ...makeCountyData(15),
    ...makeCountyData(16)
  ];

  let counties: { [key: string]: County[] } = {};

  testCountyData.forEach(county => {
    if (!counties[county.ID]) {
      counties[county.ID] = [];
    }

    counties[county.ID].push(county as any);
  });

  return counties;
}

export const mockCovidTimeSeries: CovidDateData = {
  states: buildStateMap(),
  counties: buildCountyMap()
};
