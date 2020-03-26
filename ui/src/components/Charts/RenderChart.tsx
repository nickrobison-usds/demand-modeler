import React, { useState } from "react";
import Modal from "react-modal";
import { ResponsiveContainer } from "recharts";

Modal.setAppElement("#root");

type Props = {
  reportView?: boolean;
  title?: string;
};

export const RenderChart: React.FC<Props> = props => {
  const [open, setOpen] = useState(false);

  if (props.reportView) {
    return (
      <>
        <h3>{props.title}</h3>
        {props.children}
      </>
    );
  }

  const Container = open ? Modal : React.Fragment;

  return (
    <Container isOpen={open} className="chart-modal">
      <h3>{props.title}</h3>
      <ResponsiveContainer height={open ? 500 : 200} width="100%">
        {props.children}
      </ResponsiveContainer>
      <button
        className="usa-button usa-button--outline"
        style={{ float: "right" }}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {open ? "Collapse" : "Expand"}
      </button>
    </Container>
  );
};
