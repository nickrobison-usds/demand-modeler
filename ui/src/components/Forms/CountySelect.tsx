import React, { useContext } from "react";
import { ActionType, AppContext, County } from "../../app/AppStore";
import UsaSelect from "../Forms/USASelect";

interface Option {
    text: string;
    value: string | undefined;
  }

const DEFAULT_TEXT = "All Counties";
const USATotal: React.FunctionComponent<{}> = props => {
  const { dispatch, state } = useContext(AppContext);

  const counties = state.covidTimeSeries[state.selection.date].counties;
  const options: Option[] = [
    {
      text: DEFAULT_TEXT,
      value: undefined
    }
  ];
  Object.values(counties).forEach((c: County) => {
    options.push({
      text: c.Name,
      value: c.ID
    });
  });

  const onUpdate = (countyID: string | undefined) => {
    dispatch({ type: ActionType.UPDATE_SELECTED_COUNTY, payload: countyID });
  };

  if (state.selection.state === undefined) {
    return null;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <UsaSelect
        options={options}
        placeholder={DEFAULT_TEXT}
        name="countySelect"
        selected={state.selection.county}
        onChange={onUpdate}
        label="County: "
      />
    </div>
  );
};

export default USATotal;
