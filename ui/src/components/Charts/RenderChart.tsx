import React from "react";
import { ResponsiveContainer } from "recharts";

type Props = {
  reportView?: boolean;
};

export const RenderChart: React.FC<Props> = props => {
  if (props.reportView) {
    return <>{props.children}</>;
  }
  return (
    <ResponsiveContainer height={200} width={"100%"}>
      {props.children}
    </ResponsiveContainer>
  );
};
