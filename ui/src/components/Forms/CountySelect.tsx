import React, { useContext } from "react";
import { ActionType, AppContext, County } from "../../app/AppStore";
import UsaSelect from "../Forms/USASelect";
import { getContiesForState } from "../../utils/utils";

interface Option {
  text: string;
  value: string | undefined;
}

const DEFAULT_TEXT = "All Counties";
const USATotal: React.FunctionComponent<{}> = props => {
  const {
    dispatch,
    state: {
      covidTimeSeries,
      selection: { date, state, county }
    }
  } = useContext(AppContext);

  if (state === undefined) {
    return null;
  }

  const counties = getContiesForState(covidTimeSeries, date, state);
  const options: Option[] = [
    {
      text: DEFAULT_TEXT,
      value: undefined
    }
  ];
  if (counties) {
    Object.values(counties).forEach((c: County) => {
      options.push({
        text: c.County,
        value: c.ID
      });
    });
  }

  const onUpdate = (countyID: string | undefined) => {
    dispatch({ type: ActionType.UPDATE_SELECTED_COUNTY, payload: countyID });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <UsaSelect
        options={options}
        placeholder={DEFAULT_TEXT}
        name="countySelect"
        selected={county}
        onChange={onUpdate}
        label="County: "
      />
    </div>
  );
};

export default USATotal;
