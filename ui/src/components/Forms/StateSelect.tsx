import React, { useContext } from "react";
import { ActionType, AppContext, State } from "../../app/AppStore";
import UsaSelect from "../Forms/USASelect";

interface Option {
  text: string;
  value: string | undefined;
}

const DEFAULT_TEXT = "All States";
const USATotal: React.FunctionComponent<{}> = props => {
  const { dispatch, state } = useContext(AppContext);

  const states = state.covidTimeSeries[state.selection.date].states;
  const options: Option[] = [
    {
      text: DEFAULT_TEXT,
      value: undefined
    }
  ];
  Object.values(states).forEach((s: State) => {
    options.push({
      text: s.Name,
      value: s.ID
    });
  });

  const onUpdate = (stateID: string | undefined) => {
    dispatch({ type: ActionType.UPDATE_SELECTED_STATE, payload: stateID });
  };

  return (
    <div style={{ display: "flex", textAlign: "center" }}>
      <UsaSelect
        options={options}
        placeholder={DEFAULT_TEXT}
        name="stateSelect"
        selected={state.selection.state}
        onChange={onUpdate}
        label="State: "
      />
    </div>
  );
};

export default USATotal;
