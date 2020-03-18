import React from "react";
import { storiesOf } from "@storybook/react";
import { StateMixedBar } from "../components/Charts/StateMixedBar";
import {
  CovidDateData,
  AppContext,
  AppStoreProvider,
  ActionType
} from "../app/AppStore";

storiesOf("Charts", module).add("State - Mixed Bar", () => {
  const covidTimeSeries: CovidDateData = {
    "14-Mar": {
      states: {},
      counties: {
        NY: {
          State: "New York",
          County: "New York",
          ID: "NY",
          Confirmed: 111,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        },
        WC: {
          State: "New York",
          County: "Westchester",
          ID: "WC",
          Confirmed: 11,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        },
        NA: {
          State: "New York",
          County: "Nassau",
          ID: "NA",
          Confirmed: 11,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        },
        SU: {
          State: "New York",
          County: "Suffolk",
          ID: "SU",
          Confirmed: 11,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        }
      }
    },
    "15-Mar": {
      states: {},
      counties: {
        NY: {
          State: "New York",
          County: "New York",
          ID: "NY",
          Confirmed: 303,
          Dead: 2,
          NewConfirmed: 0,
          NewDead: 0
        },
        WC: {
          State: "New York",
          County: "Westchester",
          ID: "WC",
          Confirmed: 13,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        },
        NA: {
          State: "New York",
          County: "Nassau",
          ID: "NA",
          Confirmed: 100,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        },
        SU: {
          State: "New York",
          County: "Suffolk",
          ID: "SU",
          Confirmed: 22,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        }
      }
    },
    "16-Mar": {
      states: {},
      counties: {
        NY: {
          State: "New York",
          County: "New York",
          ID: "NY",
          Confirmed: 503,
          Dead: 2,
          NewConfirmed: 0,
          NewDead: 0
        },
        WC: {
          State: "New York",
          County: "Westchester",
          ID: "WC",
          Confirmed: 20,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        },
        NA: {
          State: "New York",
          County: "Nassau",
          ID: "NA",
          Confirmed: 121,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        },
        SU: {
          State: "New York",
          County: "Suffolk",
          ID: "SU",
          Confirmed: 35,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        }
      }
    },
    "17-Mar": {
      states: {},
      counties: {
        NY: {
          State: "New York",
          County: "New York",
          ID: "NY",
          Confirmed: 667,
          Dead: 2,
          NewConfirmed: 0,
          NewDead: 0
        },
        WC: {
          State: "New York",
          County: "Westchester",
          ID: "WC",
          Confirmed: 60,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        },
        NA: {
          State: "New York",
          County: "Nassau",
          ID: "NA",
          Confirmed: 333,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        },
        SU: {
          State: "New York",
          County: "Suffolk",
          ID: "SU",
          Confirmed: 59,
          Dead: 0,
          NewConfirmed: 0,
          NewDead: 0
        }
      }
    }
  };

  return (
    <AppStoreProvider>
      <AppContext.Consumer>
        {({ state, dispatch }) => {
          if (!state.selection.state) {
            dispatch({
              type: ActionType.UPDATE_SELECTED_STATE,
              payload: "3"
            });
          }

          return (
            <StateMixedBar
              state={state.selection.state || ""}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              stateCount={false}
            />
          );
        }}
      </AppContext.Consumer>
    </AppStoreProvider>
  );
});
