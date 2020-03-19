import URI from "urijs";
import Axios from "axios";
import { County, State } from "./app/AppStore";
import { formatDate } from "./utils/DateUtils";

const HOST = process.env.REACT_APP_API_URI;
type GeoData = GeoJSON.Polygon; // GeoJSON.MultiPolygon;

export interface CountyIDs {
  IDs: string[];
}

export interface GeoResponse {
  ID: string;
  Geo: GeoData;
}

interface StateResopnse {
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
  return resp.data.map((c: CountyResponse): County => {
    return {
      ...c,
      Reported: new Date(c.Reported),
    }
  });
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

  const resp = await Axios.get<StateResopnse[]>(url.href);
  return resp.data.map((s: StateResopnse): State => {
    return {
      ...s,
      Reported: new Date(s.Reported),
    }
  });
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

export async function getStateCounties(id: string): Promise<CountyIDs> {
  const url = URI(`${HOST}/api/state/${id}/counties`);
  const resp = await Axios.get<CountyIDs>(url.readable());
  return resp.data;
}
