import { useEffect, useMemo, useState } from 'react';
import { applyUsageCounts, publicLabsApps } from '@/lib/labsCatalog';
import { fetchAppUsageCounts } from '@/services/openai';

let cachedUsageCounts = null;
let inFlightUsageRequest = null;

async function loadUsageCounts() {
  if (cachedUsageCounts) return cachedUsageCounts;
  if (!inFlightUsageRequest) {
    inFlightUsageRequest = fetchAppUsageCounts()
      .then((data) => {
        cachedUsageCounts = data?.counts || {};
        return cachedUsageCounts;
      })
      .catch(() => {
        cachedUsageCounts = {};
        return cachedUsageCounts;
      })
      .finally(() => {
        inFlightUsageRequest = null;
      });
  }

  return inFlightUsageRequest;
}

export function usePublicLabsApps() {
  const [usageCounts, setUsageCounts] = useState(cachedUsageCounts || {});

  useEffect(() => {
    let isActive = true;

    loadUsageCounts().then((counts) => {
      if (isActive) {
        setUsageCounts(counts);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  return useMemo(() => applyUsageCounts(publicLabsApps, usageCounts), [usageCounts]);
}
