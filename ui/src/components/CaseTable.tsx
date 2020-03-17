import React, { useContext } from "react";
import AppStore, { ActionType } from "../app/AppStore";
import { fetchCaseCounts } from "../api";

const CaseTable: React.FunctionComponent = () => {
  const { dispatch, state } = useContext(AppStore.AppContext);

  const handleClick = async (): Promise<void> => {
    console.debug("Handling click");
    dispatch({
      type: ActionType.UPDATE_MAPVIEW,
      payload: {
        width: 800,
        height: 400,
        latitude: 37.7577,
        longitude: -122.4376,
        zoom: 8
      }
    });

    const cases = await fetchCaseCounts();
    console.debug("Fetched cases: ", cases);
    dispatch({ type: ActionType.UPDATE_CASES, payload: cases });
  };

  return (
    <div>
      Ready to model
      <button onClick={e => handleClick()}>Do it</button>
    </div>
  );
};

export default CaseTable;
