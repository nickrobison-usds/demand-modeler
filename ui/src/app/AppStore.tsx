import React, {
  createContext,
  Dispatch,
  FunctionComponent,
  Reducer,
  useReducer
} from "react";
import * as TypeGuards from "../utils/guards";
import * as DateUtils from "../utils/DateUtils";
import L from "leaflet";
import mapboxgl from "mapbox-gl";

export interface CovidStats {
  NewConfirmed: number;
  Confirmed: number;
  Dead: number;
  NewDead: number;
}

export enum ActionType {
  UPDATE_SELECTED_STATE = "UPDATE_SELECTED_STATE",
  UPDATE_SELECTED_COUNTY = "UPDATE_SELECTED_COUNTY",
  UPDATE_MAPVIEW = "UPDATE_MAP",
  LOAD_DATA = "LOAD_DATA"
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
  County: string;
  State: string;
  Geo?: GeoJSON.Polygon; //GeoJSON.MultiPolygon;
  Reported: Date;
}

export interface State extends CovidStats {
  ID: string;
  State: string;
  Geo?: GeoJSON.Polygon; //GeoJSON.MultiPolygon;
  CountyIDs?: string[];
  Reported: Date;
}

export interface CovidDateData {
  states: { [key: string]: State[] };
  counties: { [key: string]: County[] };
}

export interface GraphMetaData {
  maxConfirmedCounty: number;
  maxConfirmedState: number;
}

// TODO: seperate Geo data from time series data
export interface AppState {
  selection: {
    date: string;
    state?: string;
    county?: string;
  };
  graphMetaData?: GraphMetaData;
  covidTimeSeries: CovidDateData;
  mapView: MapView;
}
const DEFAULT_LAT = 40.8136;
const DEFAULT_LNG = -99.0762;
const DEFAULT_ZOOM = 2;
export const initialState: AppState = {
  selection: {
    date: DateUtils.formatDate(new Date())
  },
  covidTimeSeries: {
    states: {},
    counties: {}
  },
  mapView: {
    width: 400,
    height: 400,
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    zoom: DEFAULT_ZOOM
  }
};

export const AppContext = createContext({} as AppContextType);
export const EXCLUDED_STATES = ["New York"];
const setCovidData = (state: AppState, { payload }: Action): AppState => {
  if (TypeGuards.isCovidData(payload)) {
    const stateData = Object.keys(payload.states).flatMap(
      k => payload.states[k]
    );
    const countyData = Object.keys(payload.counties).flatMap(
      k => payload.counties[k]
    );
    let maxConfirmedCounty = 0;
    let maxConfirmedState = 0;
    countyData.forEach(e => {
      if (
        maxConfirmedCounty < e.Confirmed &&
        !EXCLUDED_STATES.includes(e.State)
      ) {
        maxConfirmedCounty = e.Confirmed;
      }
    });
    stateData.forEach(e => {
      if (
        maxConfirmedState < e.Confirmed &&
        !EXCLUDED_STATES.includes(e.State)
      ) {
        maxConfirmedState = e.Confirmed;
      }
    });

    // consolidate all states records with ID = 99
    const realStateId: { [name: string]: string } = {};
    stateData.forEach(e => {
      if (e.ID !== "99") {
        realStateId[e.State] = e.ID;
      }
    });

    return {
      ...state,
      covidTimeSeries: payload,
      graphMetaData: {
        maxConfirmedCounty,
        maxConfirmedState
      }
    };
  }
  return state;
};

const updateMapView = (state: AppState, { payload }: Action): AppState => {
  if (TypeGuards.isMapView(payload)) {
    return {
      ...state,
      mapView: payload
    };
  }

  return state;
};

const updateSelectedState = (
  state: AppState,
  { payload }: Action
): AppState => {
  const selection = Object.assign({}, state.selection);
  const id = payload as string | undefined;
  selection.state = id;
  let lat = DEFAULT_LAT;
  let lng = DEFAULT_LNG;
  let zoom = DEFAULT_ZOOM;
  if (id !== undefined) {
    // It's fine to pull a single value out of the array because the boundary doesn't change
    const s = state.covidTimeSeries.states[id][0];
    if (s && s.Geo) {
      var polygon = s.Geo.coordinates;
      var fit = new L.Polygon(polygon as any).getBounds();
      const southWest = new mapboxgl.LngLat(
        fit.getSouthWest()["lat"],
        fit.getSouthWest()["lng"]
      );
      const northEast = new mapboxgl.LngLat(
        fit.getNorthEast()["lat"],
        fit.getNorthEast()["lng"]
      );
      const center = new mapboxgl.LngLatBounds(
        southWest,
        northEast
      ).getCenter();
      lat = center.lat;
      lng = center.lng;
      zoom = 4;
    }
  } else {
    selection.county = undefined;
  }
  const mapView = Object.assign({}, state.mapView);
  mapView.latitude = lat;
  mapView.longitude = lng;
  mapView.zoom = zoom;

  return {
    ...state,
    selection,
    mapView
  };
};

const updateSelectedCounty = (
  state: AppState,
  { payload }: Action
): AppState => {
  const selection = Object.assign({}, state.selection);
  const id = payload as string | undefined;
  selection.county = id;
  let lat = DEFAULT_LAT;
  let lng = DEFAULT_LNG;
  let zoom = DEFAULT_ZOOM;
  if (id !== undefined) {
    const c = state.covidTimeSeries.counties[id][0];
    if (c && c.Geo) {
      var polygon = c.Geo.coordinates;
      var fit = new L.Polygon(polygon as any).getBounds();
      const southWest = new mapboxgl.LngLat(
        fit.getSouthWest()["lat"],
        fit.getSouthWest()["lng"]
      );
      const northEast = new mapboxgl.LngLat(
        fit.getNorthEast()["lat"],
        fit.getNorthEast()["lng"]
      );
      const center = new mapboxgl.LngLatBounds(
        southWest,
        northEast
      ).getCenter();
      lat = center.lat;
      lng = center.lng;
      zoom = 6;
    }
  }
  const mapView = Object.assign({}, state.mapView);
  mapView.latitude = lat;
  mapView.longitude = lng;
  mapView.zoom = zoom;

  return {
    ...state,
    selection,
    mapView
  };
};

const reducer: Reducer<AppState, Action> = (state, action) => {
  switch (action.type) {
    case ActionType.UPDATE_SELECTED_STATE:
      return updateSelectedState(state, action);
    case ActionType.UPDATE_SELECTED_COUNTY:
      return updateSelectedCounty(state, action);
    case ActionType.UPDATE_MAPVIEW:
      return updateMapView(state, action);
    case ActionType.LOAD_DATA:
      return setCovidData(state, action);
    default:
      return state;
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
