import React, { useContext } from "react";
import { ActionType, AppContext, Metric } from "../../app/AppStore";
import UsaSelect from "../Forms/USASelect";

interface Option {
  text: string;
  value: Metric;
}

const DEFAULT_TEXT = "Confirmed Cases";
export const MetricSelect: React.FunctionComponent<{}> = props => {
  const { dispatch, state } = useContext(AppContext);

  const defaultOption: Option = {
    text: DEFAULT_TEXT,
    value: "confirmed"
  };

  const options: Option[] = [
    defaultOption,
    {
      text: "Deaths",
      value: "dead"
    }
  ];

  const onUpdate = (metric: Metric) => {
    dispatch({ type: ActionType.UPDATE_SELECTED_METRIC, payload: metric });
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
        name="metricSelect"
        selected={state.selection.metric}
        onChange={onUpdate}
        label="Metric: "
      />
    </div>
  );
};
