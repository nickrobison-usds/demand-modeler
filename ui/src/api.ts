import URI from "urijs";
import Axios from "axios";
import { County, State } from "./app/AppStore";
import { formatDate } from "./utils/DateUtils";

const HOST = process.env.REACT_APP_API_URI;
type GeoData = GeoJSON.Polygon; // GeoJSON.MultiPolygon;

export interface StateIDs {
  [name: string]: number;
}

export interface CountyIDs {
  [name: string]: string;
}

export interface GeoResponse {
  ID: string;
  Geo: GeoData;
}

interface StateResponse {
  ID: string;
  State: string;
  Reported: string;
  NewConfirmed: number;
  Confirmed: number;
  Dead: number;
  NewDead: number;
}

interface CountyResponse {
  ID: string;
  County: string;
  State: string;
  Reported: string;
  NewConfirmed: number;
  Confirmed: number;
  Dead: number;
  NewDead: number;
}

export async function getCountyCases(
  id: string,
  start?: Date,
  end?: Date
): Promise<County[]> {
  const url = new URL(`${HOST}/api/county/${id}`);
  if (start) {
    url.searchParams.append("start", formatDate(start));
  }
  if (end) {
    url.searchParams.append("end", formatDate(end));
  }

  const resp = await Axios.get<CountyResponse[]>(url.href);
  return resp.data.map(
    (c: CountyResponse): County => {
      return {
        ...c,
        Reported: new Date(c.Reported)
      };
    }
  );
}

export async function getTopCountyCases(
    limit: number = 10,
    start?: Date,
    end?: Date
): Promise<{[key: string]: County}> {
  const url = new URL(`${HOST}/api/county`);
  if (start) {
    url.searchParams.append("start", formatDate(start));
  }
  if (end) {
    url.searchParams.append("end", formatDate(end));
  }
  url.searchParams.append("limit", limit.toString());

  let counties: {[key: string]: County} = {};

  const resp = await Axios.get<CountyResponse[]>(url.href);
  resp.data.map(
      (s: CountyResponse): County => {
        return {
          ...s,
          Reported: new Date(s.Reported)
        };
      }
  )
      .forEach(county => {
        counties[county.ID] = county;
      });

  return counties;
}

export async function getCountyGeo(
  id: string,
  start?: Date,
  end?: Date
): Promise<GeoResponse> {
  const url = new URL(`${HOST}/api/county/${id}/geo`);
  const resp = await Axios.get<GeoResponse>(url.href);
  return resp.data;
}

export async function getStateCases(
  id: string,
  start?: Date,
  end?: Date
): Promise<State[]> {
  const url = new URL(`${HOST}/api/state/${id}`);
  if (start) {
    url.searchParams.append("start", formatDate(start));
  }
  if (end) {
    url.searchParams.append("end", formatDate(end));
  }

  const resp = await Axios.get<StateResponse[]>(url.href);
  return resp.data.map(
    (s: StateResponse): State => {
      return {
        ...s,
        Reported: new Date(s.Reported)
      };
    }
  );
}

export async function getTopStateCases(
    limit: number = 10,
    start?: Date,
    end?: Date
): Promise<{[key:string]: State}> {
  const url = new URL(`${HOST}/api/state`);
  if (start) {
    url.searchParams.append("start", formatDate(start));
  }
  if (end) {
    url.searchParams.append("end", formatDate(end));
  }
  url.searchParams.append("limit", limit.toString());

  let states: {[key: string]: State} = {};

  const resp = await Axios.get<StateResponse[]>(url.href);
  resp.data.map(
      (s: StateResponse): State => {
        return {
          ...s,
          Reported: new Date(s.Reported)
        };
      }
  )
      .forEach(state => {
        states[state.ID] = state;
      });

  return states;
}

export async function getStateGeo(
  id: string,
  start?: Date,
  end?: Date
): Promise<GeoResponse> {
  const url = new URL(`${HOST}/api/state/${id}/geo`);
  if (start) {
    url.searchParams.append("start", formatDate(start));
  }
  if (end) {
    url.searchParams.append("end", formatDate(end));
  }
  const resp = await Axios.get<GeoResponse>(url.href);
  return resp.data;
}

export async function getStateIDs(): Promise<string[]> {
  const url = URI(`${HOST}/api/state/id`);
  const resp = await Axios.get<StateIDs>(url.readable());
  return Object.values(resp.data).map(id => (id < 10 ? `0${id}` : `${id}`));
}

export async function getCountyIDs(): Promise<string[]> {
  const url = URI(`${HOST}/api/county/id`);
  const resp = await Axios.get<CountyIDs>(url.readable());
  return Object.values(resp.data);
}

export async function getStateCounties(id: string): Promise<string[]> {
  const url = URI(`${HOST}/api/state/${id}/counties`);
  const resp = await Axios.get<CountyIDs>(url.readable());
  return Object.values(resp.data);
}
