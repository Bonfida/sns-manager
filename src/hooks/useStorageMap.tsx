// Adapted from https://usehooks-ts.com/react-hook/use-map

import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { storageState } from "../atoms/cart";

export type MapOrEntries<K, V> = Map<K, V> | [K, V][];

// Public interface
export interface Actions<K, V> {
  set: (key: K, value: V) => void;
  setAll: (entries: MapOrEntries<K, V>) => void;
  remove: (key: K) => void;
  reset: Map<K, V>["clear"];
}

// We hide some setters from the returned map to disable autocompletion
type Return<K, V> = [
  Omit<Map<K, V>, "set" | "clear" | "delete">,
  Actions<K, V>
];

export function useStorageMap(): Return<string, number> {
  const [map, setMap] = useRecoilState(storageState);

  const actions: Actions<string, number> = {
    set: useCallback((key, value) => {
      setMap((prev) => {
        const copy = new Map(prev);
        copy.set(key, value);
        return copy;
      });
    }, []),

    setAll: useCallback((entries) => {
      setMap(() => new Map(entries));
    }, []),

    remove: useCallback((key) => {
      setMap((prev) => {
        const copy = new Map(prev);
        copy.delete(key);
        return copy;
      });
    }, []),

    reset: useCallback(() => {
      setMap(() => new Map());
    }, []),
  };

  return [map, actions];
}
