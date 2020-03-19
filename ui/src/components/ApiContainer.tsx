import React, { useContext, useEffect, useState } from "react";
import { AppContext, ActionType, CovidDateData } from "../app/AppStore";
import {
  getStateCases,
  getStateIDs,
  getCountyIDs,
  getCountyCases
} from "../api";

const fetchStateCases = async (stateID: string) => await getStateCases(stateID);
const fetchCountyCases = async (countyID: string) =>
  await getCountyCases(countyID);
const fetchStateIDs = async () => await getStateIDs();
const fetchCountyIDs = async () => await getCountyIDs();

const loadData = async () => {
  const loadStateData = async () => {
    const stateIDs = await fetchStateIDs();
    const chunkedStateData = await Promise.all(
      stateIDs.map(id => fetchStateCases(id))
    );
    return chunkedStateData.flat();
  };
  const loadCountyData = async () => {
    const countyIDs = await fetchCountyIDs();
    const chunkedCountyData = await Promise.all(
      countyIDs.map(id => fetchCountyCases(id))
    );
    return chunkedCountyData.flat();
  };
  return await Promise.all([await loadStateData(), await loadCountyData()]);
};

/*
Curently loads all data on app mount in the following order:
1a. Load all states ids using the states/id endpoint
1b. Load all county ids using the counties/id endpoint
2a. Load each state data individually
2b. Load each county data individually
3. Dispatch state and country arrays to the store
*/

export const ApiContainer: React.FC = props => {
  const [isLoading, setIsLoading] = useState(true);
  const { dispatch } = useContext(AppContext);

  useEffect(() => {
    (async () => {
      const [states, counties] = await loadData();
      const CovidDateData: CovidDateData = { states, counties };
      dispatch({ type: ActionType.LOAD_DATA, payload: CovidDateData });
      setIsLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  return isLoading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}
    >
      <h3>Loading...</h3>
    </div>
  ) : (
    <>{props.children}</>
  );
};
