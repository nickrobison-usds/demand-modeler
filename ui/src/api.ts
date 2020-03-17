import { Case } from "./app/AppStore";
import URI from "urijs";
import Axios from "axios";

const HOST = process.env.REACT_APP_API_URI;
type GeoData = GeoJSON.Polygon; // GeoJSON.MultiPolygon;

// /api/county/:id?start=2020-12-1?&end=2020-12-17 // Empty values are everything before/after
// /api/state/:id?start=2020-12-1?&end=2020-12-17 // Aggregated report
// /api/state/:id/counties // List of IDs

export async function fetchCaseCounts(): Promise<Case[]> {
  const url = URI(`${HOST}/api/cases`);
  const resp = await Axios.get<Case[]>(url.readable());
  return resp.data;
}

export async function getStateGeo(id: string): Promise<GeoData> {
  const url = URI(`${HOST}/api/state/${id}/geo`);
  const resp = await Axios.get<GeoJSON.Polygon>(url.readable());
  return resp.data;
}

export async function getStateCounties(id: string): Promise<GeoData> {
  const url = URI(`${HOST}/api/state/${id}/counties`);
  const resp = await Axios.get<>(url.readable());
  return resp.data;
}

export async function getCountGeo(id: string): Promise<GeoData> {
  const url = URI(`${HOST}/api/county/${id}/geo`);
  const resp = await Axios.get<GeoJSON.Polygon>(url.readable());
  return resp.data;
}

