import { Case } from "./app/AppStore";
import URI from "urijs";
import Axios from "axios";

const HOST = process.env.REACT_APP_API_URI;
type GeoData = GeoJSON.Polygon; // GeoJSON.MultiPolygon;

export interface CountyIDs {
  IDs: string[];
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

}

// /api/county/:id?start=2020-12-1?&end=2020-12-17 // Empty values are everything before/after
// /api/state/:id?start=2020-12-1?&end=2020-12-17 // Aggregated report


export async function getCountyCases(id: string, start?: Date, end?: Date): Promise<GeoData> {
  const url = new URL(`${HOST}/api/county/${id}`);
  if (start) {
    url.searchParams.append("start", formatDate(start));
  }
  if (end) {
    url.searchParams.append("end", formatDate(end));
  }

  const resp = await Axios.get<GeoJSON.Polygon>(url.href);
  return resp.data;
}


export async function getStateCases(id: string, start?: Date, end?: Date): Promise<GeoData> {
  const url = new URL(`${HOST}/api/state/${id}`);
  if (start) {
    url.searchParams.append("start", formatDate(start));
  }
  if (end) {
    url.searchParams.append("end", formatDate(end));
  }

  const resp = await Axios.get<GeoJSON.Polygon>(url.href);
  return resp.data;
}

export async function getStateGeo(id: string): Promise<GeoData> {
  const url = URI(`${HOST}/api/state/${id}/geo`);
  const resp = await Axios.get<GeoJSON.Polygon>(url.readable());
  return resp.data;
}

export async function getStateCounties(id: string): Promise<CountyIDs> {
  const url = URI(`${HOST}/api/state/${id}/counties`);
  const resp = await Axios.get<CountyIDs>(url.readable());
  return resp.data;
}

export async function getCountGeo(id: string): Promise<GeoData> {
  const url = URI(`${HOST}/api/county/${id}/geo`);
  const resp = await Axios.get<GeoJSON.Polygon>(url.readable());
  return resp.data;
}

