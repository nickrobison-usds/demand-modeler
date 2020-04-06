import React, { useContext, useEffect, useState } from "react";
import {
  AppContext,
  County,
  State,
  initialState,
  Metric
} from "../../app/AppStore";
import ReactMapGL, {
  Layer,
  Source,
  ViewportProps,
  PointerEvent,
  Popup
} from "react-map-gl";
import cbsaGeoData from "./cb_2013_us_cbsa_5m.geo.json";
import "./CountyMap.css";
import UsaSelect from "../Forms/USASelect";
import {cbsaCodes} from "../PowerPointGenerator/Slides/CBSASlides/cbsaCodes";

type GeoLevel = "state" | "county" | "cbsa"
type DataType = "Total" | "New";

const legendLookup = (metric: Metric): { [key in DataType]: string } => {
  const type = metric === "confirmed" ? "confirmed cases" : "Deaths";
  return {
    Total: type,
    New: `Percent increase in ${type}`,
  };
};

interface LegendRegion {

end: number;
scale: number[];

}

interface LegendScales {
  Total: LegendRegion;
  New: LegendRegion;
}

// make this dynammic
// maybe exclude NY
const defaultScale = [0, 0.001, 0.01999999999, 0.02, 0.05, 0.1, 0.5, 1];
const defaultLegend: LegendScales = {
  Total: {
    end: 50000,
    scale: defaultScale

  },
  New: {
      end: 100,
      scale: defaultScale
  },

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

export interface CountyMapProps {
  dataType?: DataType;
  title?: string;
}

const CountyMap: React.FunctionComponent<CountyMapProps> = props => {
  const [cbsaData, setCBSAData] = useState<GeoJSON.FeatureCollection>(
    cbsaGeoData as any
  );
  const [dataType, setDataType] = useState<DataType>(
    props.dataType ? props.dataType : "Total"
  );
  const [viewport, setViewport] = useState(
    initialState.mapView as ViewportProps
  );
  const [hoverInfo, setHoverInfo] = useState<{ [k: string]: any } | null>();
  const [legendScales, setLegendScales] = useState<LegendScales>(defaultLegend);

  const {
    state,
    state: { lastWeekCovidTimeSeries }
  } = useContext(AppContext);

  const selectedMetric =
    state.selection.metric === "confirmed" ? "Confirmed" : "Dead";

  const getDateLayer = () => {
    const x = legendScales[dataType];
    return [
      [x.scale[0], "#DEE4E8"],
      [x.scale[1], "#DEE4E8"],//FDE296"],
      [x.scale[2], "#DEE4E8"],//ECAC53"],
      [x.scale[3], "#E58445"],
      [x.scale[4], "#E16742"],
      [x.scale[5], "#BC2D49"],
      [x.scale[6], "#8C114A"],
      [x.scale[7], "#650F56"]
    ];
  };

  const formatData = (): GeoJSON.Feature[] => {
    const geoData = cbsaData;
    const timeSeriesData =state.lastWeekCovidTimeSeries.counties;
    console.log(timeSeriesData)
    let min = 0;
    let max = 0;
    const formatedGeoJSON = geoData.features.map(f => {
      let metric = 0;
      let Name = "";
      if (f.properties) {
        Name = f.properties["name"];
        const id = f.properties["cbsafp"];
        const {fips} = cbsaCodes[id];
        fips.forEach(fip => {
          const region = timeSeriesData[fip];
        //   console.log(Name, fips, region)

          if (region && region.length > 0) {
            region.sort(compare);
            if (dataType === "Total") {
              metric += region[0][selectedMetric];
            }
            // } if (dataType === "New") {
            //   if (region.length > 1) {
            //       const prev = region[1][selectedMetric];
            //       const now = region[0][selectedMetric];
            //       const change = now - prev;
            //       metric = round((change / prev) * 100);
            //   } else {
            //     metric = 0;
            //   }
            // } 
            if (metric < min) {
              min = metric;
            } else if (metric > max) {
              max = metric;
            }
          }
        });
      }
      return {
        ...f,
        properties: {
          ...f.properties,
          metric: metric,
          name: Name
        }
      };
    });

    if (dataType === "Total") {
      const newLegend = { ...legendScales };
        max = 50000;
      newLegend.Total.scale = Array.from(defaultScale, e =>
        round(e * max)
      );

      setLegendScales(newLegend);
    }  if (dataType === "New") {
      const newLegend = { ...legendScales };
      newLegend.New.scale = [0, 5, 10, 25, 50, 100, 200, 400];
      setLegendScales(newLegend);
    } 
    return formatedGeoJSON;
  };

  useEffect(() => {
    setCBSAData({
      type: "FeatureCollection",
      features: formatData()
    });
    // eslint-disable-next-line
  }, [lastWeekCovidTimeSeries, dataType, selectedMetric]);

  const onHover = (event: PointerEvent) => {
    let name = "";
    let hoverInfo = null;

    const feature = event.features && event.features[0];
    if (feature) {
      hoverInfo = {
        lngLat: event.lngLat,
        feature: feature.properties
      };
      name = feature.properties.name;
      if (!name) {
        setHoverInfo(null);
      } else {
        setHoverInfo(hoverInfo);
      }
    }
  };

  const renderPopup = () => {
    if (hoverInfo) {
      let name = hoverInfo.feature.name;
    //   let name = hoverInfo.feature.cbsafp;

      const label: { [d in DataType]: string } = {
        Total: selectedMetric,
        New: "Percent increase",
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
              {label[dataType]}: {hoverInfo.feature.metric}
              {dataType === "New" && "%"}
            </p>
          </div>
        </Popup>
      );
    }
    return null;
  };

  const mapHeight = { height: 760 };
  const legend = getDateLayer();
  return (
    <div id="map-container">
      <ReactMapGL
        {...viewport}
        minZoom={2}
        width={window.innerWidth * 0.9}
        {...mapHeight}
        mapboxApiAccessToken={
          "pk.eyJ1IjoidGltYmVzdHVzZHMiLCJhIjoiY2s4MWtuMXpxMHN3dDNsbnF4Y205eWN2MCJ9.kpKyCbPit97l0vIG1gz5wQ"
        }
        mapStyle="mapbox://styles/timbestusds/ck81pfrzj0t1d1ip5owm9rlu8"
        onViewportChange={v => {
          setViewport({ ...v, pitch: 0, bearing: 0 });
        }}
        onHover={onHover}
        getCursor={({ isDragging }) => {
          if (isDragging) return "grabbing";
          return hoverInfo ? "pointer" : "grab";
        }}
      >
        {state.mapView.zoom > 0 ? (
          <>
            <Source
              id="data"
              type="geojson"
              data={cbsaData}
            >
              <Layer
                {...{
                  id: "data",
                  type: "fill",
                  paint: {
                    "fill-color": {
                      property: "metric",
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
        <p style={{ margin: "10px 0" }}>
          {props.title
            ? props.title
            : legendLookup(state.selection.metric)[dataType]}
        </p>
        {legend.map(k => (
          <span
            key={k[0]}
            style={{
              marginRight: "10px",
              whiteSpace: "nowrap"
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "20px" ,
                height: "20px" ,
                backgroundColor: String(k[1]) as string,
                marginRight: "5px"
              }}
            ></span>
            <span style={{ fontSize:  "20px"  }}>
              {k[0]}+
            </span>
          </span>
        ))}
      </div>
      {
        <UsaSelect
          options={[
            { text: "Total", value: "Total" },
            { text: "Percent increase", value: "New" }
          ]}
          placeholder={"Total"}
          name="selectDataType"
          selected={dataType}
          onChange={setDataType}
          label="Map data type "
        />
      }
    </div>
  );
};

export default CountyMap;
