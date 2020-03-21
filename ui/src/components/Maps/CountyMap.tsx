import React, { useContext, useEffect, useState } from "react";
import { ActionType, AppContext, County, State } from "../../app/AppStore";
import ReactMapGL, { Layer, Source } from "react-map-gl";
import countyGeoData from "./geojson-counties-fips.json";
import stateGeoData from "./state.geo.json";
import { stateAbbreviation } from "../../utils/stateAbbreviation";

type Display = "state" | "county"
const SHOW_COUNTY_ON_ZOOM = 4;

const dataLayer = {
  id: "data",
  type: "fill",
  paint: {
    "fill-color": {
      property: "confirmed",
      stops: [
        [0, "#FEEFB3"],
        [1, "#F3CB7C"],
        [6, "#ECAC53"],
        [11, "#E58445"],
        [51, "#E16742"],
        [101, "#BC2D49"],
        [201, "#8C114A"],
        [501, "#650F56"],
      ]
    },
    "fill-opacity": 0.8,
    "fill-outline-color": "white"
  }
};

const compare = ( a: County | State, b: County | State ) => {
  if ( a.Reported > b.Reported ){
    return -1;
  }
  if ( a.Reported < b.Reported ){
    return 1;
  }
  return 0;
}

interface Props {}

const CountyMap: React.FunctionComponent<Props> = props => {
  const [countyData, setCountyData] = useState<GeoJSON.FeatureCollection>(countyGeoData as any);
  const [stateData, setStateData] = useState<GeoJSON.FeatureCollection>(stateGeoData as any);
  const [display, setDisplay] = useState<Display>("state");
  const {
    dispatch,
    state,
    state: { covidTimeSeries }
  } = useContext(AppContext);

  const AddCountyData = (): GeoJSON.Feature[] => {
    return countyData.features.map(f => {
      let Confirmed = 0;
      let Name = "";
      if(f.properties) {
        Name = f.properties["NAME"];
        const ID = parseInt(`${f.properties["STATE"]}${f.properties["COUNTY"]}`);
        if (typeof ID === "number") {
          const c = state.covidTimeSeries.counties[ID];
          if (c) {
            c.sort(compare);
            Confirmed = c[0].Confirmed;
            Name = `${c[0].County}, ${stateAbbreviation[c[0].State]}`
          }
        }

      }
      return {
        ...f,
        properties: {
          ...f.properties,
          confirmed: Confirmed,
          name: Name
        }
      };
    });
  };

  const AddStateData = (): GeoJSON.Feature[] => {
    return stateData.features.map(f => {
      let Confirmed = 0;
      let Name = "";
      if(f.properties) {
        Name = f.properties["NAME10"];
        const ID = parseInt(`${f.properties["STATEFP10"]}`);
        if (typeof ID === "number") {
          const s = state.covidTimeSeries.states[ID];
          if (s) {
            s.sort(compare);
            Confirmed = s[0].Confirmed;
            Name = s[0].State;
          }
        }

      }
      return {
        ...f,
        properties: {
          ...f.properties,
          confirmed: Confirmed,
          name: Name
        }
      };
    });
  };

  useEffect(() => {
    setCountyData({
      type: "FeatureCollection",
      features: AddCountyData()
    });
    setStateData({
      type: "FeatureCollection",
      features: AddStateData()
    })
  // eslint-disable-next-line
  }, [covidTimeSeries]);

  // TODO: change width on window resize
  const width = window.innerWidth * 0.9;
  return (
    <div style={{margin: "0 auto", width: width}}>
      <ReactMapGL
        {...state.mapView}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onViewportChange={v => {
          v.width = window.innerWidth * 0.9;
          setDisplay(v.zoom > SHOW_COUNTY_ON_ZOOM ? "county" : "state");
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
        {state.mapView.zoom > 0 ?
          <Source id="data" type="geojson" data={display === "state"? stateData : countyData}>
            <Layer {...dataLayer} />
          </Source> : null
        }

      </ReactMapGL>
    </div>
  );
};

export default CountyMap;
