import { useEffect } from "react";

export const useWindowEvent = <
  K extends keyof WindowEventMap
>(
  event: K,
  listener: (event: WindowEventMap[K]) => any,
  deps?: any[]
) => {
  useEffect(() => {
    addEventListener(event, listener);

    return () => {
      removeEventListener(event, listener);
    };
  }, deps);
};