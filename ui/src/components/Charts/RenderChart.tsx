import React from "react";
import { ResponsiveContainer } from "recharts";

type Props = {
  reportView?: boolean;
  dashboardHeight?: number | string;
};

export const RenderChart: React.FC<Props> = props => {
  if (props.reportView) {
    return <>{props.children}</>;
  }
  return (
    <ResponsiveContainer height={props.dashboardHeight || 400} width="100%">
      {props.children}
    </ResponsiveContainer>
  );
};
