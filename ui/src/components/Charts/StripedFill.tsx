import React from "react";

type Props = any;

export const StripedFill: React.FC<Props> = props => {
  const { x: oX, y: oY, width: oWidth, height: oHeight, fill } = props;

  let x = oX;
  let y = oHeight < 0 ? oY + oHeight : oY;
  let width = oWidth;
  let height = Math.abs(oHeight);

  return (
    <>
      <pattern
        id="pattern-stripe"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect
          width="4"
          height="8"
          transform="translate(0,0)"
          fill="white"
        ></rect>
      </pattern>
      <mask id="mask-stripe">
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#pattern-stripe)"
        />
      </mask>
      <rect
        fill={fill}
        mask="url(#mask-stripe)"
        x={x}
        y={y}
        width={width}
        height={height}
      />
    </>
  );
};
