import React, { useContext } from "react";
import { ActionType, AppContext } from "../../app/AppStore";
import UsaSelect from "../Forms/USASelect";
import * as fips from "../../utils/fips";
import * as timesSeries from "../../utils/timesSeries";

interface Option {
  text: string;
  value: string | undefined;
}

const DEFAULT_TEXT = "All states";
const StateSelect: React.FunctionComponent<{}> = props => {
  const { dispatch, state } = useContext(AppContext);

  const defaultOption: Option = {
    text: DEFAULT_TEXT,
    value: undefined
  };

  const states = timesSeries.getStates(state.lastWeekCovidTimeSeries);
  const options: Option[] = states.map(s => {
    return {
      text: fips.getStateName(s.ID),
      value: s.ID
    }
  });
  options.sort((a, b) => (a.text > b.text ? 1 : -1));
  options.unshift(defaultOption);

  const onUpdate = (stateID: string | undefined) => {
    dispatch({ type: ActionType.UPDATE_SELECTED_STATE, payload: stateID });
    dispatch({ type: ActionType.UPDATE_SELECTED_COUNTY, payload: undefined });
  };

  return (
    <div className="navigation-select">
      <UsaSelect
        options={options}
        placeholder={DEFAULT_TEXT}
        name="stateSelect"
        selected={state.selection.state}
        onChange={onUpdate}
        label="State"
      />
    </div>
  );
};

export default StateSelect;
