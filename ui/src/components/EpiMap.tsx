import React, {useContext} from "react";
import AppStore from "../app/AppStore";
import ReactMapGL from "react-map-gl";

const EpiMap: React.FunctionComponent = () => {

    const {dispatch, state} = useContext(AppStore.AppContext);

    return (
        <ReactMapGL {...state.mapView}
            // We'll need to rotate this once we have a better method of storing this value
                    mapboxApiAccessToken="pk.eyJ1Ijoibmlja3JvYmlzb24tdXNkcyIsImEiOiJjazd2djdpenkwZmxxM2ZwNWV0NHJpMWVvIn0.ccAlySc6edOpNYfHci-6Aw"/>
    )
};

export default EpiMap