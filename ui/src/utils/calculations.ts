import { AppState, County, State } from "../app/AppStore";

type GrandTotal = {
  [d: string]: {
    Confirmed: number;
    NewConfirmed: number;
    Dead: number;
    NewDead: number;
  };
};

const getSelectedStateName = (state: AppState) => {
  if (state.selection.state === undefined) {
    return null;
  }
  return state.covidTimeSeries.states[state.selection.state][0].State;
};

export const getTopCounties = (
  appState: AppState,
  stat: "confirmed" | "dead",
  numberOfCounties = 10
): County[][] => {
  const stateName = getSelectedStateName(appState);
  let counties = Object.values(appState.covidTimeSeries.counties).reduce(
    (acc, el) => [...acc, ...el],
    []
  );
  // If a state is selected, limit to that state
  if (stateName) {
    counties = counties.filter(({ State }) => State === stateName);
  }
  // Get latest date for sorting purposes
  const latestDate = counties.reduce(
    (acc, el) => (el.Reported > acc ? el.Reported : acc),
    counties[0].Reported
  );
  // Prevent possible duplicates and sort
  const seenCounties = new Set<string>();
  const newestCounties = counties
    .filter(county => {
      if (
        county.Reported.toLocaleDateString() !==
          latestDate.toLocaleDateString() ||
        seenCounties.has(county.ID)
      ) {
        return false;
      }
      seenCounties.add(county.ID);
      return true;
    })
    .sort((a, b) => {
      const metric = stat === "confirmed" ? "Confirmed" : "Dead";
      return b[metric] > a[metric] ? 1 : -1;
    });
  const topCounties = newestCounties
    .slice(0, numberOfCounties)
    .map(county => appState.covidTimeSeries.counties[county.ID]);

  return topCounties;
};

export const getTopStates = (
  appState: AppState,
  stat: "confirmed" | "dead",
  numberOfCounties = 10
): State[][] => {
  let states = Object.values(appState.covidTimeSeries.states).reduce(
    (acc, el) => [...acc, ...el],
    []
  );
  // Get latest date for sorting purposes
  const latestDate = states.reduce(
    (acc, el) => (el.Reported > acc ? el.Reported : acc),
    states[0].Reported
  );
  // Prevent possible duplicates and sort
  const seenStates = new Set<string>();
  const newestStateData = states
    .filter(state => {
      if (
        state.Reported.toLocaleDateString() !==
          latestDate.toLocaleDateString() ||
        seenStates.has(state.ID)
      ) {
        return false;
      }
      seenStates.add(state.ID);
      return true;
    })
    .sort((a, b) => {
      const metric = stat === "confirmed" ? "Confirmed" : "Dead";
      return b[metric] > a[metric] ? 1 : -1;
    });
  const topStates = newestStateData
    .slice(0, numberOfCounties)
    .map(state => appState.covidTimeSeries.states[state.ID]);

  return topStates;
};

export const getCountyGrandTotal = (appState: AppState): GrandTotal => {
  let counties = Object.values(appState.covidTimeSeries.counties).reduce(
    (acc, el) => [...acc, ...el],
    []
  );

  if (appState.selection.county) {
    counties = counties.filter(
      county => county.ID === appState.selection.county
    );
  } else if (appState.selection.state) {
    const selectedState = getSelectedStateName(appState);
    counties = counties.filter(county => county.State === selectedState);
  }

  const byDate = counties.reduce((acc, el) => {
    const key = el.Reported.toLocaleDateString();
    if (!acc[key]) {
      acc[key] = {
        Confirmed: 0,
        NewConfirmed: 0,
        Dead: 0,
        NewDead: 0
      };
    }
    acc[key] = {
      Confirmed: acc[key].Confirmed + el.Confirmed,
      NewConfirmed: acc[key].NewConfirmed + el.NewConfirmed,
      Dead: acc[key].Dead + el.Dead,
      NewDead: acc[key].NewDead + el.NewDead
    };
    return acc;
  }, {} as GrandTotal);

  return byDate;
};
