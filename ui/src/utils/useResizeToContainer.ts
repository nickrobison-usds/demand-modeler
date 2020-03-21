import { useEffect, useState } from "react";

export const useResizeToContainer = (
  containerSelector: string,
  defaultWidth: number = 1000
) => {
  const [width, setWidth] = useState(defaultWidth);
  useEffect(() => {
    // TODO: should use react refs for this
    const resize = () => {
      const container = document.querySelector(containerSelector);
      if (container) {
        setWidth(container.clientWidth);
      }
    };
    window.addEventListener("resize", resize);
    // Initial resize
    resize();
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);
  return width;
};
