import React, { useContext, useEffect, useState } from "react";
import { ActionType, AppContext } from "../app/AppStore";
import ReactMapGL, { Layer, Source, PointerEvent } from "react-map-gl";
import { range } from "d3-array";
import { scaleQuantile } from "d3-scale";

const dataLayer = {
  id: "data",
  type: "fill",
  paint: {
    "fill-color": {
      property: "percentile",
      stops: [
        [0, "#3288bd"],
        [1, "#66c2a5"],
        [2, "#abdda4"],
        [3, "#e6f598"],
        [4, "#ffffbf"],
        [5, "#fee08b"],
        [6, "#fdae61"],
        [7, "#f46d43"],
        [8, "#d53e4f"]
      ]
    },
    "fill-opacity": 0.8,
    "fill-outline-color": "white"
  }
};

const labels = {
  id: "county-name",
  type: "symbol",
  source: "data",
  layout: {
    "text-field": "{name}\n",
    // "text-font": ["Droid Sans Regular"],
    "text-size": 12
    // 'symbol-placement': 'point'
  },
  paint: {
    "text-color": "black"
  }
  // paint: {
  //     "text-color": ["case",
  //         ["boolean", ["feature-state", "hover"], false],
  //         'rgba(255,0,0,0.75)',
  //         'rgba(0,0,0,0.75)'
  //     ],
  //     "text-halo-color": ["case",
  //         ["boolean", ["feature-state", "hover"], false],
  //         'rgba(255,255,0,0.75)',
  //         'rgba(255,255,255,0.75)'
  //     ],
  //     "text-halo-width": 2,
  //     "text-halo-blur": 0,
  // }
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

const EpiMap: React.FunctionComponent = () => {
  const [data, setData] = useState<GeoJSON.FeatureCollection>({
    type: "FeatureCollection",
    features: []
  });

  const {
    dispatch,
    state,
    state: { cases }
  } = useContext(AppContext);

  const transformFeatures = (): GeoJSON.Feature[] => {
    console.debug("Updating cases");
    return cases.map(value => {
      return {
        type: "Feature",
        geometry: value.Geo,
        properties: {
          cases: value.Confirmed,
          name: `${value.County}, ${value.State}`
        }
      };
    });
  };

  const accessor = (f: GeoJSON.Feature): number => {
    return f.properties?.cases;
  };

  const onHover = (event: PointerEvent) => {
    const { features } = event;
    const hoveredFeature =
      features && features.find(f => f.layer.id === "data");
    console.log("Hovered over: ", hoveredFeature);
  };

  useEffect(() => {
    console.debug("Effect cases: ", cases);
    console.debug("Calling effect handler");
    const newData: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: transformFeatures()
    };
    setData(updatePercentiles(newData, accessor));
    console.debug("JSON: ", data);
  }, [cases]);

  return (
    <ReactMapGL
      {...state.mapView}
      // We'll need to rotate this once we have a better method of storing this value
      mapboxApiAccessToken="pk.eyJ1Ijoibmlja3JvYmlzb24tdXNkcyIsImEiOiJjazd2djdpenkwZmxxM2ZwNWV0NHJpMWVvIn0.ccAlySc6edOpNYfHci-6Aw"
      onViewportChange={v => {
        dispatch({ type: ActionType.UPDATE_MAPVIEW, payload: v });
      }}
      onHover={e => onHover(e)}
    >
      <Source id="data" type="geojson" data={data}>
        <Layer {...dataLayer} />
        <Layer {...labels} />
      </Source>
    </ReactMapGL>
  );
};

export default EpiMap;
