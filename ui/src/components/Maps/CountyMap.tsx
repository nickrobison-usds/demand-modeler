import React, { useContext, useEffect, useState } from "react";
import { ActionType, AppContext, County, State } from "../../app/AppStore";
import ReactMapGL, { Layer, Source } from "react-map-gl";
import countyGeoData from "./geojson-counties-fips.json";
import stateGeoData from "./state.geo.json";
import { stateAbbreviation } from "../../utils/stateAbbreviation";
import UsaSelect from "../Forms/USASelect";

type Display = "state" | "county";
type DataType = "Total" | "New" | "Increase";
const SHOW_COUNTY_ON_ZOOM = 4;

const legend = [
  [0, "#FEEFB3"],
  [1, "#F3CB7C"],
  [6, "#ECAC53"],
  [11, "#E58445"],
  [51, "#E16742"],
  [101, "#BC2D49"],
  [201, "#8C114A"],
  [501, "#650F56"]
];

const dataLayer = {
  id: "data",
  type: "fill",
  paint: {
    "fill-color": {
      property: "confirmed",
      stops: legend
    },
    "fill-opacity": 0.8,
    "fill-outline-color": "white"
  }
};

const compare = (a: County | State, b: County | State) => {
  if (a.Reported > b.Reported) {
    return -1;
  }
  if (a.Reported < b.Reported) {
    return 1;
  }
  return 0;
};

interface Props {}

const CountyMap: React.FunctionComponent<Props> = props => {
  const [countyData, setCountyData] = useState<GeoJSON.FeatureCollection>(
    countyGeoData as any
  );
  const [stateData, setStateData] = useState<GeoJSON.FeatureCollection>(
    stateGeoData as any
  );
  const [display, setDisplay] = useState<Display>("state");
  const [dateType, setDataType] = useState<DataType>("Total");

  const {
    dispatch,
    state,
    state: { covidTimeSeries }
  } = useContext(AppContext);

  const AddCountyData = (): GeoJSON.Feature[] => {
    return countyData.features.map(f => {
      let Confirmed = 0;
      let Name = "";
      if (f.properties) {
        Name = f.properties["NAME"];
        const ID = `${f.properties["STATE"]}${f.properties["COUNTY"]}`;
        const parsedID = parseInt(`${ID}`);
        if (typeof parsedID === "number") {
          const c = state.covidTimeSeries.counties[ID];
          if (c) {
            c.sort(compare);
            if (dateType === "Total") {
              Confirmed = c[0].Confirmed;
            } else if (dateType === "Increase") {
              Confirmed = c[0].NewConfirmed;
            } else {
              Confirmed = (c[0].NewConfirmed / c[0].Confirmed) % 100;
            }
            Name = `${c[0].County}, ${stateAbbreviation[c[0].State]}`;
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
      if (f.properties) {
        Name = f.properties["NAME10"];
        const ID = f.properties["STATEFP10"];
        const parsedID = parseInt(`${ID}`);
        if (typeof parsedID === "number") {
          const s = state.covidTimeSeries.states[ID];
          if (s) {
            s.sort(compare);
            if (dateType === "Total") {
              Confirmed = s[0].Confirmed;
            } else if (dateType === "Increase") {
              Confirmed = s[0].NewConfirmed;
            } else {
              Confirmed = (s[0].NewConfirmed / s[0].Confirmed) % 100;
            }
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
    });
    // eslint-disable-next-line
  }, [covidTimeSeries, dateType]);

  // TODO: change width on window resize
  const width = window.innerWidth * 0.9;
  return (
    <div style={{ margin: "0 auto", width: width }}>
      <UsaSelect
        options={[
          { text: "Total", value: "Total" },
          { text: "New", value: "New" },
          { text: "Increase", value: "Increase" }
        ]}
        placeholder={"Total"}
        name="selectDataType"
        selected={dateType}
        onChange={setDataType}
        label="Map Data Type: "
      />
      <ReactMapGL
        {...state.mapView}
        mapboxApiAccessToken={
          "pk.eyJ1IjoidGltYmVzdHVzZHMiLCJhIjoiY2s4MWtuMXpxMHN3dDNsbnF4Y205eWN2MCJ9.kpKyCbPit97l0vIG1gz5wQ"
        }
        mapStyle="mapbox://styles/timbestusds/ck81pfrzj0t1d1ip5owm9rlu8"
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
        {state.mapView.zoom > 0 ? (
          <Source
            id="data"
            type="geojson"
            data={display === "state" ? stateData : countyData}
          >
            <Layer {...dataLayer} />
          </Source>
        ) : null}
      </ReactMapGL>
      <div>
        <p>Legend</p>
        {legend.map(k => (
          <span
            key={k[0]}
            style={{
              marginRight: "5px"
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                backgroundColor: String(k[1]) as string,
                marginRight: "5px"
              }}
            ></span>
            {k[0]}+
          </span>
        ))}
      </div>
    </div>
  );
};

export default CountyMap;
