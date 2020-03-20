import { AppState, County } from "../app/AppStore";

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
  let countyData = Object.values(appState.covidTimeSeries.counties).reduce(
    (acc, el) => [...acc, ...el],
    []
  );
  // If a state is selected, limit to that state
  if (stateName) {
    countyData = countyData.filter(({ State }) => State === stateName);
  }
  // Get latest date for sorting purposes
  const latestDate = countyData.reduce(
    (acc, el) => (el.Reported > acc ? el.Reported : acc),
    countyData[0].Reported
  );
  // Prevent possible duplicates and sort
  const seenCounties = new Set<string>();
  const newestCountyData = countyData
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
  const topCounties = newestCountyData
    .slice(0, numberOfCounties)
    .map(county => appState.covidTimeSeries.counties[county.ID]);

  return topCounties;
};
