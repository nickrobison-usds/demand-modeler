import { MapView } from "../app/AppStore";

export function isMapView(payload: unknown): payload is MapView {
  return payload && "zoom" in (payload as MapView);
}

// export function isCases(payload: unknown): payload is Case[] {
//   return (
//     payload && payload instanceof Array && "Confirmed" in (payload[0] as Case[])
//   );
// }
