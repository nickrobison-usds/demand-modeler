import React, {createContext, Dispatch, FunctionComponent, Reducer, useReducer} from "react";

export interface Case {
    ID: string;
    County: string;
    State: string;
    Confirmed: number;
}

export enum ActionType {
    FETCH_CASES = "FETCH_CASES"
}

export interface MapView {
    width: number,
    height: number,
    latitude: number,
    longitude: number,
    zoom: number
}

export interface AppState {
    cases: Case[];
    mapView: MapView
}

export interface Action {
    type: ActionType;
    payload?: unknown;
}

export interface AppContextType {
    state: AppState;
    dispatch: Dispatch<Action>;
}

export const initialState: AppState = {
    cases: [],
    mapView: {
        width: 400,
        height: 400,
        latitude: 37.7577,
        longitude: -122.4376,
        zoom: 8
    }
};

export const AppContext = createContext({} as AppContextType);

const reducer: Reducer<AppState, Action> = (state, action) => {
    const {payload} = action;

    switch (action.type) {
        case ActionType.FETCH_CASES:
            console.log("Fetching");
            return {
                ...state,
                cases: [...state.cases, {
                    ID: "hello",
                    County: "Test",
                    State: "S",
                    Confirmed: 1
                }]
            }
    }
};

export const AppStoreProvider: FunctionComponent<{
    initialState?: AppState;
}> = props => {

    const [state, dispatch] = useReducer(
        reducer,
        props.initialState || initialState);


    return (
        <AppContext.Provider value={{state, dispatch}}>
            {props.children}
        </AppContext.Provider>
    );
};

export default {
    AppContext,
    AppStoreProvider,
};
