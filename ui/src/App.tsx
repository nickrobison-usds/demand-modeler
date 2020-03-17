import React from 'react';
import './App.scss';
import Header from "./components/Header/Header";

function App() {
    return (
        <div className="App">
            <Header title="Demand Modeller" titleRoute="/"/>
            <div>
                Ready to do some modelling
            </div>
        </div>
    );
}

export default App;
