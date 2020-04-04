import { MapView, CovidDateData } from "../app/AppStore";
import { ReactElement } from "react";
import { CountyMapProps } from "../components/Maps/CountyMap";

export function isMapView(payload: unknown): payload is MapView {
  return payload && "zoom" in (payload as MapView);
}

export function isCovidData(payload: unknown): payload is CovidDateData {
  return !!payload;
}

export function isMap(
  element: unknown
): element is ReactElement<CountyMapProps> {
  return (
    element && "reportView" in (element as ReactElement<CountyMapProps>).props
  );
}
