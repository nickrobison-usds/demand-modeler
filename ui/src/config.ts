const DEBUG = process.env.NODE_ENV === "development";

const MAPBOX_TOKEN: string = process.env.MAPBOX_TOKEN || "Unknown";

function apihost(): string {
  if (DEBUG) {
    return "http://localhost:8080";
  }
  return "";
}

const API_URI: string = process.env.REACT_APP_MCTAPI_URI
  ? process.env.REACT_APP_MCTAPI_URI
  : `${apihost()}`;

declare global {
  interface Window {
    config: object;
  }
}

export const config = (window.config = {
  DEBUG,
  API_URI,
  MAPBOX_TOKEN
});
