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

const EXCLUDE_PERCENT_INCREASE_CASES_BELOW = 20;
const ALASKA_COORDS = [
  -173.14944218750094,
  70.47019617187733,
  -136.10250208333454,
  59.29933020239282
];

interface LegendRegion {
  state: {
    end: number;
    scale: number[];
  }
  county: {
    end: number;
    scale: number[];
  }
}


interface LegendScales {
  Total: LegendRegion;
  New: LegendRegion;
  Increase: LegendRegion;
}

// make this dynammic
// maybe exclude NY
const defaultScale = [0, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1];
const defaultLegend: LegendScales = {
  Total: {
    state: {
      end: 15000,
      scale: defaultScale
    },
    county: {
      end: 9000,
      scale: defaultScale
    }
  },
  New: {
    state: {
      end: 100,
      scale: defaultScale
    },
    county: {
      end: 100,
      scale: defaultScale
    }
  },
  Increase: {
    state: {
      end: 5000,
      scale: defaultScale
    },
    county: {
      end: 3000,
      scale: defaultScale
    }
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
  const [dataType, setDataType] = useState<DataType>("New");
  const [viewport, setViewport] = useState(
    initialState.mapView as ViewportProps
  );
  const [hoverInfo, setHoverInfo] = useState<{ [k: string]: any } | null>();
  const [legendScales, setLegendScales] = useState<LegendScales>(defaultLegend);

  const mapWidth = useResizeToContainer("#map-container");

  const {
    dispatch,
    state,
    state: { covidTimeSeries }
  } = useContext(AppContext);

  const getDateLayer = (level: "state" | "county") => {
    const x = legendScales[dataType][level];
    return [
      [x.scale[0], "#DEE4E8"],
      [x.scale[1], "#F3CB7C"],
      [x.scale[2], "#ECAC53"],
      [x.scale[3], "#E58445"],
      [x.scale[4], "#E16742"],
      [x.scale[5], "#BC2D49"],
      [x.scale[6], "#8C114A"],
      [x.scale[7], "#650F56"]
    ];
  };

  const formatData = (level: "state" | "county"): GeoJSON.Feature[] => {
    const geoData = level === "state" ? stateData : countyData;
    const timeSeriesDate = level === "state" ? state.covidTimeSeries.states : state.covidTimeSeries.counties;
    let min = 0;
    let max = 0;
    const formatedGeoJSON = geoData.features.map(f => {
      let Confirmed = 0;
      let Name = "";
      if (f.properties) {
        Name = f.properties["NAME"];
        const ID = level === "state" ? f.properties["STATE"] : `${f.properties["STATE"]}${f.properties["COUNTY"]}`;
        const parsedID = parseInt(`${ID}`);
        if (typeof parsedID === "number") {
          const region = timeSeriesDate[ID];
          if (region) {
            region.sort(compare);
            if (dataType === "Total") {
              Confirmed = region[0].Confirmed;
            } else if (dataType === "Increase") {
              Confirmed = region.length > 1 ? region[1].Confirmed : 0;
            } else {
              if (region.length > 1) {
                if (region[0].Confirmed < EXCLUDE_PERCENT_INCREASE_CASES_BELOW) {
                  Confirmed = 0;
                } else {
                  const prev = region[1].Confirmed;
                  const now = region[0].Confirmed;
                  const change = now - prev;
                  Confirmed = round((change/ prev) * 100);
                }
              } else {
                Confirmed = 0;
              }
            }
            if (Confirmed < min) {
              min = Confirmed;
            } else if (Confirmed > max) {
              max = Confirmed;
            }
            Name = level === "state" ? region[0].State : `${(region[0] as County).County}, ${stateAbbreviation[region[0].State]}`;
            if ((Confirmed > 100 || Confirmed < -100) && dataType === "New") {
              console.log(Name, Confirmed, region[1].Confirmed, region[0].Confirmed, region[0].Confirmed - region[1].Confirmed);
            }
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


    if (dataType === "Total") {
      const newLegend = {...legendScales};
      newLegend.Total[level].scale = Array.from(defaultScale, e => round(e * max));

      setLegendScales(newLegend);
    } else if (dataType === "Increase") {
      const newLegend = {...legendScales};
      newLegend.Increase[level].scale = Array.from(defaultScale, e => round(e * max));
      console.log(level, "Increase", max, newLegend.Increase[level].scale)

      setLegendScales(newLegend);
    } else {
      const newLegend = {...legendScales};
      newLegend.New[level].scale = [0, 5, 10, 25, 50, 100, 200, 400];
      console.log(level, "New", max, newLegend.New[level].scale)

      setLegendScales(newLegend);
    }

    console.log(min, max)
    return formatedGeoJSON;
  }

  useEffect(() => {
    setCountyData({
      type: "FeatureCollection",
      features: formatData("county")
    });
    setStateData({
      type: "FeatureCollection",
      features: formatData("state")
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
  const legend = getDateLayer(
    viewport.zoom < SHOW_COUNTY_ON_ZOOM ? "state" : "county"
  );
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
              <Layer
                {...{
                  id: "data",
                  type: "fill",
                  paint: {
                    "fill-color": {
                      property: "confirmed",
                      stops: legend
                    } as any,
                    "fill-opacity": 0.8,
                    "fill-outline-color": "white"
                  }
                }}
              />
            </Source>
            {hoverInfo && renderPopup()}
          </>
        ) : null}
      </ReactMapGL>
      <div>
        <p style={{ margin: "10px 0" }}>{legendLookup[dataType]}</p>
        {(legend).map((k) => (
          <span
            key={k[0]}
            style={{
              marginRight: props.reportView ? "10px" : "5px"
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
