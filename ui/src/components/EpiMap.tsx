import React, { useContext, useEffect, useState } from "react";
import { ActionType, AppContext } from "../app/AppStore";
import ReactMapGL, { Layer, Source } from "react-map-gl";
import { range } from "d3-array";
import { scaleQuantile } from "d3-scale";

const dataLayer = {
  id: "data",
  type: "fill",
  paint: {
    "fill-color": {
      property: "percentile",
      stops: [
        [0, "#FFF9E5"],
        [1, "#FEEFB3"],
        [2, "#F3CB7C"],
        [3, "#ECAC53"],
        [4, "#E58445"],
        [5, "#E16742"],
        [6, "#BC2D49"],
        [7, "#fdae61"],
        [8, "#8C114A"],
      ]
    },
    "fill-opacity": 0.8,
    "fill-outline-color": "white"
  }
};

function updatePercentiles(
  featureCollection: GeoJSON.FeatureCollection,
  accessor: (f: GeoJSON.Feature) => number
): GeoJSON.FeatureCollection {
  const { features } = featureCollection;
  const scale = scaleQuantile()
    .domain(features.map(accessor))
    .range(range(10));
  return {
    type: "FeatureCollection",
    features: features.map(f => {
      const value = accessor(f);
      const properties = {
        ...f.properties,
        value,
        percentile: scale(value)
      };
      return { ...f, properties };
    })
  };
}

interface Props {
  stat: "confirmed" | "dead";
}

const EpiMap: React.FunctionComponent<Props> = props => {
  const [data, setData] = useState<GeoJSON.FeatureCollection>({
    type: "FeatureCollection",
    features: []
  });

  const {
    dispatch,
    state,
    state: { covidTimeSeries, selection }
  } = useContext(AppContext);

  // const transformFeatures = (): GeoJSON.Feature[] => {
  //   const states =
  //     selection.state === undefined
  //       ? Object.values(covidTimeSeries[selection.date].states)
  //       : getContiesForState(covidTimeSeries, selection.date, selection.state);
  //   return states.map(value => {
  //     return {
  //       type: "Feature",
  //       geometry: value.Geo as any, // TODO: add check to see if Geo is loaded
  //       properties: {
  //         confirmed: value.Confirmed,
  //         dead: value.Dead,
  //         name: `${value.Name}`,
  //         id: `${value.ID}`
  //       }
  //     };
  //   });
  // };

  const accessor = (f: GeoJSON.Feature): number => {
    if (props.stat === "confirmed") {
      return f.properties?.confirmed;
    } else {
      return f.properties?.dead;
    }
  };

  useEffect(() => {
    // const newData: GeoJSON.FeatureCollection = {
    //   type: "FeatureCollection",
    //   features: transformFeatures()
    // };
    // setData(updatePercentiles(newData, accessor));
  // eslint-disable-next-line
  }, [covidTimeSeries, selection]);

  return (
    <ReactMapGL
      {...state.mapView}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      onViewportChange={v => {
        v.width = 400; //window.innerWidth;
        dispatch({ type: ActionType.UPDATE_MAPVIEW, payload: v });
      }}
      onClick={e => {
        const { features } = e;
        const clickedState = (features || []).find(
          feature => feature.properties?.id
        );
        if (clickedState) {
          dispatch({
            type: state.selection.state
              ? ActionType.UPDATE_SELECTED_COUNTY
              : ActionType.UPDATE_SELECTED_STATE,
            payload: clickedState.properties.id
          });
        }
      }}
    >
      <Source id="data" type="geojson" data={data}>
        <Layer {...dataLayer} />
      </Source>
    </ReactMapGL>
  );
};

export default EpiMap;
