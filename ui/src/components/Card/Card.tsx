import React from "react";
import "./Card.scss";

interface Props {
  header?: string;
}

const Card: React.StatelessComponent<Props> = props => {
  return (
    <div className="card desktop:grid-col-6 tablet:col-12">
      {props.header ? (
        <h6 className="usa-heading-alt" style={{ margin: "0 0 1rem 0" }}>
          {props.header}
        </h6>
      ) : null}

      {props.children}
    </div>
  );
};

export default Card;
