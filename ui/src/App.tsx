import React from 'react';
import './App.scss';
import Header from "./components/Header/Header";
import {AppStoreProvider} from "./app/AppStore";
import CaseTable from "./components/CaseTable";
import EpiMap from "./components/EpiMap";

function App() {

    return (
        <AppStoreProvider>
            <div className="App">
                <Header title="Demand Modeller" titleRoute="/"/>
                <EpiMap/>
                <CaseTable/>
            </div>
        </AppStoreProvider>
    );
}

export default App;
