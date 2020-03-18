import React, { useContext } from "react";
import { ActionType, AppContext, County } from "../../app/AppStore";
import UsaSelect from "../Forms/USASelect";

interface Option {
  text: string;
  value: string | undefined;
}

const DEFAULT_TEXT = "All Counties";
const USATotal: React.FunctionComponent<{}> = _ => {
  const {
    dispatch,
    state: {
      covidTimeSeries,
      selection: { state, county }
    }
  } = useContext(AppContext);

  if (state === undefined) {
    return null;
  }

  const options: Option[] = [
    {
      text: DEFAULT_TEXT,
      value: undefined
    }
  ];
  const countyMap: {[ID: string]: Option} = {};
  covidTimeSeries.counties.forEach((c) => {
    countyMap[c.ID] = {
      text: c.State,
      value: c.ID
    }
  });
  Object.values(countyMap).forEach((o: Option) => options.push(o));
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
