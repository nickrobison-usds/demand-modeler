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
  Popup,
  WebMercatorViewport,
  FlyToInterpolator
} from "react-map-gl";
import countyGeoData from "./geojson-counties-fips.json";
import stateGeoData from "./state.geo.json";
import { stateAbbreviation } from "../../utils/stateAbbreviation";
import { useResizeToContainer } from "../../utils/useResizeToContainer";
import bbox from "@turf/bbox";
import { easeCubic } from "d3";
import "./CountyMap.css";
import UsaSelect from "../Forms/USASelect";

type DataType = "Total" | "New" | "Increase";

const legendLookup: { [key in DataType]: string } = {
  Total: "Confirmed Cases",
  New: "Percent Increase in Confirmed Cases",
  Increase: "Increase in Confirmed Cases"
};

const ALASKA_COORDS = [
  -173.14944218750094,
  70.47019617187733,
  -136.10250208333454,
  59.29933020239282
];

const countyLegend = [
  [0, "#DEE4E8"],
  [1, "#F3CB7C"],
  [6, "#ECAC53"],
  [11, "#E58445"],
  [51, "#E16742"],
  [101, "#BC2D49"],
  [201, "#8C114A"],
  [501, "#650F56"]
];

const stateLegend = [
  [0, "#DEE4E8"],
  [1, "#F3CB7C"],
  [10, "#ECAC53"],
  [50, "#E58445"],
  [100, "#E16742"],
  [1000, "#BC2D49"],
  [5000, "#8C114A"],
  [10000, "#650F56"]
];

const getDateLayer = (l: any[]) => {
  return {
    id: "data",
    type: "fill",
    paint: {
      "fill-color": {
        property: "confirmed",
        stops: l
      },
      "fill-opacity": 0.8,
      "fill-outline-color": "white"
    }
  };
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

interface Props {
  reportView?: boolean;
}

const CountyMap: React.FunctionComponent<Props> = props => {
  const SHOW_COUNTY_ON_ZOOM = props.reportView ? 2 : 4;
  const FILL_STATE_COUNTIES = 6;
  const [countyData, setCountyData] = useState<GeoJSON.FeatureCollection>(
    countyGeoData as any
  );
  const [stateData, setStateData] = useState<GeoJSON.FeatureCollection>(
    stateGeoData as any
  );
  const [dataType, setDataType] = useState<DataType>("Total");
  const [viewport, setViewport] = useState(
    initialState.mapView as ViewportProps
  );
  const [hoverInfo, setHoverInfo] = useState<{ [k: string]: any } | null>();

  const mapWidth = useResizeToContainer("#map-container");

  console.log(mapWidth);

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
            if (dataType === "Total") {
              Confirmed = c[0].Confirmed;
            } else if (dataType === "Increase") {
              Confirmed = c.length > 1 ? c[1].Confirmed : 0;
            } else {
              Confirmed =
                c.length > 1
                  ? round((c[1].Confirmed / c[0].Confirmed) * 100)
                  : 0;
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
            if (dataType === "Total") {
              Confirmed = s[0].Confirmed;
            } else if (dataType === "Increase") {
              Confirmed = s.length > 1 ? s[1].Confirmed : 0;
            } else {
              Confirmed =
                s.length > 1
                  ? round((s[1].Confirmed / s[0].Confirmed) * 100)
                  : 0;
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
  }, [covidTimeSeries, dataType]);

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
              {label[dataType]}: {hoverInfo.feature.confirmed}
              {dataType === "New" && "%"}
            </p>
          </div>
        </Popup>
      );
    }
    return null;
  };

  // Zoom to state on selection
  useEffect(() => {
    const selectedGeo = state.selection.county
      ? countyData.features.find(feature => {
          return (
            feature.properties?.STATE + feature.properties?.COUNTY ===
            state.selection.county
          );
        })
      : stateData.features.find(
          feature => feature.properties?.STATE === state.selection.state
        );

    setViewport(viewport => {
      let newView = {
        ...viewport,
        ...initialState.mapView,
        transitionInterpolator: new FlyToInterpolator(),
        transitionDuration: 1000,
        transitionEasing: easeCubic
      };
      if (selectedGeo) {
        const [minLng, minLat, maxLng, maxLat] =
          selectedGeo.properties?.NAME === "Alaska"
            ? ALASKA_COORDS
            : bbox(selectedGeo);
        const view = new WebMercatorViewport(viewport);
        const { latitude, longitude, zoom } = view.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat]
          ],
          {
            padding: 20
          }
        );
        newView.latitude = latitude;
        newView.longitude = longitude;
        newView.zoom = zoom;
      }
      return newView;
    });
  }, [
    state.selection.state,
    stateData.features,
    countyData.features,
    state.selection.county
  ]);

  let filteredCountyData = { ...countyData };
  if (state.selection.state) {
    filteredCountyData.features = filteredCountyData.features.filter(
      feature => {
        if (state.selection.county) {
          return (
            feature?.properties?.STATE + feature?.properties?.COUNTY ===
            state.selection.county
          );
        }

        return feature?.properties?.STATE === state.selection.state;
      }
    );
  }

  // Special zoom for report
  useEffect(() => {
    if (props.reportView) {
      setViewport(viewport => ({
        ...viewport,
        zoom: 3.5
      }));
    }
  }, [props.reportView]);

  const mapHeight = { height: props.reportView ? 800 : 350 };
  const legend =
    viewport.zoom < SHOW_COUNTY_ON_ZOOM ? stateLegend : countyLegend;
  return (
    <div id="map-container" style={{ margin: "2em 1em 0 1em" }}>
      {!props.reportView && (
        <UsaSelect
          options={[
            { text: "Total", value: "Total" },
            { text: "Percent Increase", value: "New" },
            { text: "Increase", value: "Increase" }
          ]}
          placeholder={"Total"}
          name="selectDataType"
          selected={dataType}
          onChange={setDataType}
          label="Map Data Type: "
        />
      )}
      <ReactMapGL
        {...viewport}
        minZoom={2}
        width={props.reportView ? window.innerWidth * 0.9 : mapWidth}
        {...mapHeight}
        mapboxApiAccessToken={
          "pk.eyJ1IjoidGltYmVzdHVzZHMiLCJhIjoiY2s4MWtuMXpxMHN3dDNsbnF4Y205eWN2MCJ9.kpKyCbPit97l0vIG1gz5wQ"
        }
        mapStyle="mapbox://styles/timbestusds/ck81pfrzj0t1d1ip5owm9rlu8"
        onViewportChange={v => {
          setViewport({ ...v, pitch: 0, bearing: 0 });
        }}
        onWheel={() => {
          if (viewport.zoom < SHOW_COUNTY_ON_ZOOM && state.selection.state) {
            dispatch({
              type: ActionType.UPDATE_SELECTED_STATE,
              payload: undefined
            });
          }
          if (viewport.zoom < FILL_STATE_COUNTIES && state.selection.county) {
            dispatch({
              type: ActionType.UPDATE_SELECTED_COUNTY,
              payload: undefined
            });
          }
        }}
        onHover={onHover}
        getCursor={({ isDragging }) => {
          if (isDragging) return "grabbing";
          return hoverInfo ? "pointer" : "grab";
        }}
        onClick={event => {
          const feature = event.features && event.features[0];
          if (feature) {
            const clickedState = feature.properties.STATE;
            const clickedCounty = feature.properties.COUNTY;
            if (!clickedState) {
              // Reset selections
              if (!state.selection.county) {
                dispatch({
                  type: ActionType.UPDATE_SELECTED_STATE,
                  payload: undefined
                });
              }
              dispatch({
                type: ActionType.UPDATE_SELECTED_COUNTY,
                payload: undefined
              });
            } else {
              dispatch({
                type: ActionType.UPDATE_SELECTED_STATE,
                payload: clickedState
              });
              dispatch({
                type: ActionType.UPDATE_SELECTED_COUNTY,
                payload: clickedCounty
                  ? clickedState + clickedCounty
                  : undefined
              });
            }
          }
        }}
      >
        {state.mapView.zoom > 0 ? (
          <>
            <Source
              id="data"
              type="geojson"
              data={
                viewport.zoom < SHOW_COUNTY_ON_ZOOM
                  ? stateData
                  : filteredCountyData
              }
            >
              <Layer {...getDateLayer(legend)} />
            </Source>
            {hoverInfo && renderPopup()}
          </>
        ) : null}
      </ReactMapGL>
      <div>
        <p style={{ margin: "10px 0" }}>{legendLookup[dataType]}</p>
        {legend.map(k => (
          <span
            key={k[0]}
            style={{
              marginRight: props.reportView ? "10px" : "5px",
              whiteSpace: "nowrap"
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: props.reportView ? "20px" : "10px",
                height: props.reportView ? "20px" : "10px",
                backgroundColor: String(k[1]) as string,
                marginRight: "5px"
              }}
            ></span>
            <span style={{ fontSize: props.reportView ? "20px" : undefined }}>
              {k[0]}+
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default CountyMap;
