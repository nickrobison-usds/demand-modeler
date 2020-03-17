import React, {useState} from "react";
import {MapView} from "../app/AppStore";
import ReactMapGL from "react-map-gl";

const EpiMap: React.FunctionComponent = () => {

    const [mapView, setMapView] = useState<MapView>({
        width: 400,
        height: 400,
        latitude: 37.7577,
        longitude: -122.4376,
        zoom: 8
    });

    return (
        <ReactMapGL {...mapView} onViewportChange={setMapView}/>
    )
};

export default EpiMap