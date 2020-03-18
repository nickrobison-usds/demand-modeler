import URI from "urijs";
import Axios from "axios";
import { County, State, CovidDateData } from "./app/AppStore";
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

interface StateResponse {
  ID: string;
  State: string;
  Confirmed: number;
  NewConfirmed: number;
  Dead: number;
  NewDead: number;
  Reported: string;
}

interface CountyResponse extends StateResponse {
  County: string;
}

export async function getCountyCases(
  id: string,
  start?: Date,
  end?: Date
): Promise<County> {
  const url = new URL(`${HOST}/api/county/${id}`);
  if (start) {
    url.searchParams.append("start", formatDate(start));
  }
  if (end) {
    url.searchParams.append("end", formatDate(end));
  }

  const resp = await Axios.get<County>(url.href);
  return resp.data;
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
): Promise<CovidDateData> {
  const url = new URL(`${HOST}/api/state/${id}`);
  if (start) {
    url.searchParams.append("start", formatDate(start));
  }
  if (end) {
    url.searchParams.append("end", formatDate(end));
  }

  const resp = await Axios.get<StateResponse[]>(url.href);
  const covidData: CovidDateData = resp.data.reduce((acc, el) => {
    const { Reported, ...rest } = el;
    if (!acc[Reported]) acc[Reported] = { states: {}, counties: {} };
    acc[Reported].states[rest.ID] = rest;
    return acc;
  }, {} as CovidDateData);

  return covidData;
}

export async function getStateGeo(
  id: string,
  start?: Date,
  end?: Date
): Promise<GeoResponse> {
  const url = new URL(`${HOST}/api/state/${id}/geo`);
  const resp = await Axios.get<GeoResponse>(url.href);
  return resp.data;
}

export async function getStateCounties(id: string): Promise<CountyIDs> {
  const url = URI(`${HOST}/api/state/${id}/counties`);
  const resp = await Axios.get<CountyIDs>(url.readable());
  return resp.data;
}
