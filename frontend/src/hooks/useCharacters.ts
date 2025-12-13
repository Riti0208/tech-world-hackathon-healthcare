import { useCallback, useEffect, useMemo, useState } from 'react';
import { prefectureNameById } from '../prefectures';

export interface Character {
  prefectureId: number;
  averageSteps: number;
  status: number;
}

export interface RankedPrefecture extends Character {
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Options {
  pollingMs?: number;
}

export function useCharacters(options: Options = {}) {
  const [data, setData] = useState<RankedPrefecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/characters`);
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const json: Character[] = await res.json();
      const enriched = json
        .map((item) => ({
          ...item,
          name: prefectureNameById[item.prefectureId] ?? `県${item.prefectureId}`,
        }))
        .sort((a, b) => b.averageSteps - a.averageSteps);
      setData(enriched);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  useEffect(() => {
    if (!options.pollingMs) return;
    const id = setInterval(() => {
      fetchCharacters();
    }, options.pollingMs);
    return () => clearInterval(id);
  }, [fetchCharacters, options.pollingMs]);

  const nationalAverage = useMemo(() => {
    if (!data.length) return 0;
    const total = data.reduce((sum, item) => sum + item.averageSteps, 0);
    return Math.round(total / data.length);
  }, [data]);

  const statusCount = useMemo(() => {
    const counts = { high: 0, mid: 0, low: 0 };
    data.forEach((item) => {
      if (item.status === 2) counts.high += 1;
      else if (item.status === 1) counts.mid += 1;
      else counts.low += 1;
    });
    return counts;
  }, [data]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchCharacters,
    nationalAverage,
    statusCount,
    top: data.slice(0, 10),
  };
}
