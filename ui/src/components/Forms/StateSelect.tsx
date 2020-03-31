import React, { useContext } from "react";
import { ActionType, AppContext } from "../../app/AppStore";
import UsaSelect from "../Forms/USASelect";

interface Option {
  text: string;
  value: string | undefined;
}

const DEFAULT_TEXT = "All states";
const USATotal: React.FunctionComponent<{}> = props => {
  const { dispatch, state } = useContext(AppContext);

  const defaultOption: Option = {
    text: DEFAULT_TEXT,
    value: undefined
  };

  const options: Option[] = [];

  const stateMap: { [ID: string]: Option } = {};
  Object.keys(state.covidTimeSeries.states)
    .flatMap(k => state.covidTimeSeries.states[k])
    .forEach(s => {
      stateMap[s.ID] = {
        text: s.State,
        value: s.ID
      };
    });
  Object.values(stateMap).forEach((o: Option) => options.push(o));

  const onUpdate = (stateID: string | undefined) => {
    dispatch({ type: ActionType.UPDATE_SELECTED_STATE, payload: stateID });
    dispatch({ type: ActionType.UPDATE_SELECTED_COUNTY, payload: undefined });
  };

  options.sort((a, b) => (a.text > b.text ? 1 : -1));
  options.unshift(defaultOption);

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

export default USATotal;
