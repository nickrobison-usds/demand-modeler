import React, {
  createContext,
  Dispatch,
  FunctionComponent,
  Reducer,
  useReducer
} from "react";
import * as TypeGuards from "../utils/guards";
import * as DateUtils from "../utils/DateUtils";
import {mockCovidTimeSeries} from "./mockData";

interface CovidStats {
  Confirmed: number;
  Dead: number;
}

export enum ActionType {
  UPDATE_CASES = "UPDATE_CASES",
  UPDATE_MAPVIEW = "UPDATE_MAP"
}

export interface MapView {
  width: number;
  height: number;
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface Action {
  type: ActionType;
  payload?: unknown;
}

export interface AppContextType {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export interface County extends CovidStats {
  ID: string;
  Name: string;
  Geo?: GeoJSON.Polygon; //GeoJSON.MultiPolygon;
}

export interface State extends CovidStats {
  ID: string;
  Name: string;
  Geo?: GeoJSON.Polygon; //GeoJSON.MultiPolygon;
  CountyIDs?: string[];
}

export interface CovidDateData {
  [date: string]: {
    states: { [stateID: string]: State };
    counties: { [countyID: string]: County };
  }
}

export interface AppState {
  selection: {
    date: string;
    state?: string;
    county?: string;
  }
  covidTimeSeries:  CovidDateData;
  mapView: MapView;
}

export const initialState: AppState = {
  selection: {
    date: DateUtils.formatDate(new Date()),
  },
  covidTimeSeries: mockCovidTimeSeries,
  mapView: {
    width: 400,
    height: 400,
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 2
  }
};

export const AppContext = createContext({} as AppContextType);

const updateMapView = (state: AppState, { payload }: Action): AppState => {
  if (TypeGuards.isMapView(payload)) {
    return {
      ...state,
      mapView: payload
    };
  }

  return state;
};

const updateCases = (state: AppState, { payload }: Action): AppState => {
  console.debug("Updating cases: ", payload);
  // TODO
  // if (TypeGuards.isCases(payload)) {
  //   console.debug("To update");
  //   return {
  //     ...state,
  //     // cases: payload
  //   };
  // }
  return state;
};

const reducer: Reducer<AppState, Action> = (state, action) => {
  switch (action.type) {
    case ActionType.UPDATE_CASES:
      return updateCases(state, action);
    case ActionType.UPDATE_MAPVIEW:
      console.log("Changing");
      return updateMapView(state, action);
  }
};

export const AppStoreProvider: FunctionComponent<{
  initialState?: AppState;
}> = props => {
  const [state, dispatch] = useReducer(
    reducer,
    props.initialState || initialState
  );

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {props.children}
    </AppContext.Provider>
  );
};

export default {
  AppContext,
  AppStoreProvider
};
