import React, { useContext } from "react";
import { ActionType, AppContext } from "../../app/AppStore";
import UsaSelect from "../Forms/USASelect";

interface Option {
  text: string;
  value: string | undefined;
}

const DEFAULT_TEXT = "All counties";
const USATotal: React.FunctionComponent<{}> = () => {
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

  const stateName = covidTimeSeries.states[state][0].State;

  const defaultOption: Option = {
    text: DEFAULT_TEXT,
    value: undefined
  };

  const options: Option[] = [];

  const countyMap: { [ID: string]: Option } = {};
  Object.keys(covidTimeSeries.counties)
    .flatMap(k => covidTimeSeries.counties[k])
    .filter(c => c.State === stateName)
    .forEach(c => {
      countyMap[c.ID] = {
        text: c.County,
        value: c.ID
      };
    });
  Object.values(countyMap).forEach((o: Option) => options.push(o));
  const onUpdate = (countyID: string | undefined) => {
    dispatch({ type: ActionType.UPDATE_SELECTED_COUNTY, payload: countyID });
  };

  options.sort((a, b) => (a.text > b.text ? 1 : -1));
  options.unshift(defaultOption);

  return (
    <div className="navigation-select">
      <UsaSelect
        options={options}
        placeholder={DEFAULT_TEXT}
        name="countySelect"
        selected={county}
        onChange={onUpdate}
        label="County"
      />
    </div>
  );
};

export default USATotal;
