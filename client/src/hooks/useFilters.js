import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Custom hook to sync filters with URL search params.
 * Returns [filters, setFilter, resetFilters]
 */
export function useFilters(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const getFiltersFromParams = useCallback(() => {
    const filters = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const val = searchParams.get(key);
      if (val !== null && val !== "") {
        filters[key] = val;
      }
    }
    return filters;
  }, [searchParams]);

  const [filters, setFiltersState] = useState(getFiltersFromParams);

  useEffect(() => {
    setFiltersState(getFiltersFromParams());
  }, [searchParams]);

  const setFilter = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (value === "" || value === null || value === undefined) {
            params.delete(key);
          } else {
            params.set(key, value);
          }
          // Reset page when changing filters
          if (key !== "page") {
            params.delete("page");
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return [filters, setFilter, resetFilters];
}
