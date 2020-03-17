import React from "react";
import "./Card.scss";

interface Props {
  header: string
}

const Card: React.StatelessComponent<Props> = (props) => {
  console.log(props.children)
  return (
    <div className="card" style={{minWidth: "100px"}}>
      <h6 className="usa-heading-alt" style={{margin: "0 0 5px 0"}}>{props.header}</h6>
      {props.children}
    </div>
  );
}

export default Card;
