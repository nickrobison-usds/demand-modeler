import React, { useContext, useEffect, useState } from "react";
import {
  ActionType,
  AppContext,
  County,
  State,
  initialState
} from "../../app/AppStore";
import ReactMapGL, {
  Layer,
  Source,
  ViewportProps,
  PointerEvent,
  Popup
} from "react-map-gl";
import countyGeoData from "./geojson-counties-fips.json";
import stateGeoData from "./state.geo.json";
import { stateAbbreviation } from "../../utils/stateAbbreviation";
import UsaSelect from "../Forms/USASelect";
import { useResizeToContainer } from "../../utils/useResizeToContainer";
import "./CountyMap.css";

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

const round = (num: number, decimals: number = 1) =>
  Math.round(num * 10 ** decimals) / 10 ** decimals;

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
  const [viewport, setViewport] = useState(
    initialState.mapView as ViewportProps
  );
  const [hoverInfo, setHoverInfo] = useState<{ [k: string]: any } | null>();

  const mapWidth = useResizeToContainer("#map-container");

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
              Confirmed = round((c[0].NewConfirmed / c[0].Confirmed) * 100);
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
        Name = f.properties["NAME"];
        const ID = f.properties["STATE"];
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
              Confirmed = round((s[0].NewConfirmed / s[0].Confirmed) * 100);
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

  const onHover = (event: PointerEvent) => {
    let name = "";
    let hoverInfo = null;

    const feature = event.features && event.features[0];
    if (feature) {
      hoverInfo = {
        lngLat: event.lngLat,
        feature: feature.properties
      };
      name = feature.properties.NAME;
      if (!name) {
        setHoverInfo(null);
      } else {
        setHoverInfo(hoverInfo);
      }
    }
  };

  const renderPopup = () => {
    if (hoverInfo) {
      let name = hoverInfo.feature.NAME;
      console.log(hoverInfo.feature);
      if (hoverInfo.feature.COUNTY) {
        const stateName =
          state.covidTimeSeries.states[hoverInfo.feature.STATE][0].State;
        name = `${name}, ${stateAbbreviation[stateName]}`;
      }

      const label: { [d in DataType]: string } = {
        Total: "Confirmed",
        New: "Percent Increase",
        Increase: "Increase"
      };

      return (
        <Popup
          longitude={hoverInfo.lngLat[0]}
          latitude={hoverInfo.lngLat[1]}
          closeButton={false}
        >
          <div className="hover-info">
            <h5>{name}</h5>
            <p>
              {label[dateType]}: {hoverInfo.feature.confirmed}
              {dateType === "New" && "%"}
            </p>
          </div>
        </Popup>
      );
    }
    return null;
  };

  return (
    <div id="map-container" style={{ margin: "0 1em" }}>
      <UsaSelect
        options={[
          { text: "Total", value: "Total" },
          { text: "Percent Increase", value: "New" },
          { text: "Increase", value: "Increase" }
        ]}
        placeholder={"Total"}
        name="selectDataType"
        selected={dateType}
        onChange={setDataType}
        label="Map Data Type: "
      />
      <ReactMapGL
        {...viewport}
        width={mapWidth}
        mapboxApiAccessToken={
          "pk.eyJ1IjoidGltYmVzdHVzZHMiLCJhIjoiY2s4MWtuMXpxMHN3dDNsbnF4Y205eWN2MCJ9.kpKyCbPit97l0vIG1gz5wQ"
        }
        mapStyle="mapbox://styles/timbestusds/ck81pfrzj0t1d1ip5owm9rlu8"
        onViewportChange={v => {
          if (v.zoom > SHOW_COUNTY_ON_ZOOM && display === "state") {
            setDisplay("county");
          }
          if (v.zoom < SHOW_COUNTY_ON_ZOOM && display === "county") {
            setDisplay("state");
          }
          setViewport(v);
        }}
        onHover={onHover}
        getCursor={({ isDragging }) => {
          if (isDragging) return "grabbing";
          return hoverInfo ? "pointer" : "grab";
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
          <>
            <Source
              id="data"
              type="geojson"
              data={display === "state" ? stateData : countyData}
            >
              <Layer {...dataLayer} />
            </Source>
            {hoverInfo && renderPopup()}
          </>
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
