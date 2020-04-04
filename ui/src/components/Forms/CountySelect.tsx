import React, { useContext } from "react";
import { ActionType, AppContext } from "../../app/AppStore";
import UsaSelect from "../Forms/USASelect";
import * as fips from "../../utils/fips";
import * as timesSeries from "../../utils/timesSeries";

interface Option {
  text: string;
  value: string | undefined;
}

const DEFAULT_TEXT = "All counties";
const CountySelect: React.FunctionComponent<{}> = () => {
  const {
    dispatch,
    state: {
      lastWeekCovidTimeSeries,
      selection: { state, county }
    }
  } = useContext(AppContext);

  if (state === undefined) {
    return null;
  }

  const defaultOption: Option = {
    text: DEFAULT_TEXT,
    value: undefined
  };

  const options: Option[] = timesSeries
    .getCountiesForState(lastWeekCovidTimeSeries, state)
    .map(c => {
      return {
        text: fips.getCountyName(c.ID),
        value: c.ID
      };
    });
  options.sort((a, b) => (a.text > b.text ? 1 : -1));
  options.unshift(defaultOption);

  const onUpdate = (countyID: string | undefined) => {
    dispatch({ type: ActionType.UPDATE_SELECTED_COUNTY, payload: countyID });
  };

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

export default CountySelect;
