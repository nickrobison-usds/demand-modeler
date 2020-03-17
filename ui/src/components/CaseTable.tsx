import React, {useContext} from "react";
import AppStore, {ActionType} from "../app/AppStore";


const CaseTable: React.FunctionComponent = () => {

    const { dispatch, state } = useContext(AppStore.AppContext);

    const handleClick = () => {
        dispatch({type: ActionType.FETCH_CASES});
    };

    return (
        <div>Ready to model
            <button onClick={e => handleClick()}>Do it</button>
        </div>

    )
};

export default CaseTable;