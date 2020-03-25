import React from "react";
import "./Navigation.scss";

interface Props {
  header?: string;
}

const Nav: React.StatelessComponent<Props> = props => {
  return (
    <nav className="test" style={{ minWidth: "100px" }}>
      <strong>COVID-19 United States data</strong><br />
      Updated: 03/23/20 04:59 PM EST

      {props.children}
    </nav>
  );
};

export default Nav;
