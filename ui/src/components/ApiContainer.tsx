import React, { useContext, useEffect } from "react";
import { AppContext } from "../app/AppStore";
import { getStateCases } from "../api";

const allStates = ["01", "02", "03"];

export const ApiContainer: React.FC = props => {
  const { dispatch } = useContext(AppContext);

  useEffect(() => {
    const fetchStates = async () => {
      const response = await Promise.all(
        allStates.map(async state => await getStateCases(state))
      );
      console.log(response);
    };
    fetchStates();
  }, []);

  return <>{props.children}</>;
};
