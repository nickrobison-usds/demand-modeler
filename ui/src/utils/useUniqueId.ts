import { useState } from "react";

let i = 0;

export const useUniqueId = (prefix: string) => {
  const [instance, setInstance] = useState(0);
  if (!instance) {
    setInstance(++i);
  }
  return `${prefix}-${instance}`;
};
