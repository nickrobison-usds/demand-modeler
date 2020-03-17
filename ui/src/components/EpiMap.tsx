import React, {useContext, useEffect, useState} from "react";
import {ActionType, AppContext} from "../app/AppStore";
import ReactMapGL, {Layer, Source} from "react-map-gl";
import {range} from 'd3-array';
import {scaleQuantile} from 'd3-scale';

const dataLayer = {
    id: 'data',
    type: 'fill',
    paint: {
        'fill-color': {
            property: 'percentile',
            stops: [
                [0, '#3288bd'],
                [1, '#66c2a5'],
                [2, '#abdda4'],
                [3, '#e6f598'],
                [4, '#ffffbf'],
                [5, '#fee08b'],
                [6, '#fdae61'],
                [7, '#f46d43'],
                [8, '#d53e4f']
            ]
        },
        'fill-opacity': 0.8,
        'fill-outline-color': 'white'
    }
};

function updatePercentiles(featureCollection: GeoJSON.FeatureCollection, accessor: ((f: GeoJSON.Feature) => number)): GeoJSON.FeatureCollection {
    const {features} = featureCollection;
    const scale = scaleQuantile()
        .domain(features.map(accessor))
        .range(range(10));
    return {
        type: 'FeatureCollection',
        features: features.map(f => {
            const value = accessor(f);
            const properties = {
                ...f.properties,
                value,
                percentile: scale(value)
            };
            return {...f, properties};
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
        state: {cases},
    } = useContext(AppContext);

    const transformFeatures = (): GeoJSON.Feature[] => {
        console.debug("Updating cases");
        return cases.map(value => {
            return {
                type: "Feature",
                geometry: value.Geo,
                properties: {
                    cases: value.Confirmed
                }
            }
        });
    };

    const accessor = (f: GeoJSON.Feature): number => {
        return f.properties?.cases;
    };

    useEffect(() => {
        console.debug("Effect cases: ", cases);
        console.debug("Calling effect handler");
        const newData: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: transformFeatures()
        };
        setData(updatePercentiles(newData, accessor));
        console.debug("JSON: ", data);

    }, [cases]);

    return (
        <ReactMapGL {...state.mapView}
            // We'll need to rotate this once we have a better method of storing this value
                    mapboxApiAccessToken="pk.eyJ1Ijoibmlja3JvYmlzb24tdXNkcyIsImEiOiJjazd2djdpenkwZmxxM2ZwNWV0NHJpMWVvIn0.ccAlySc6edOpNYfHci-6Aw"
                    onViewportChange={v => {
                        dispatch({type: ActionType.UPDATE_MAPVIEW, payload: v});
                    }}>
            <Source id="data" type="geojson" data={data}>
                <Layer {...dataLayer}/>
            </Source>
        </ReactMapGL>
    )
};

export default EpiMap