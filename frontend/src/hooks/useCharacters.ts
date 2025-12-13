import { useCallback, useEffect, useMemo, useState } from 'react';
import { prefectureNameById } from '../prefectures';

export interface Character {
  prefectureId: number;
  averageSteps: number;
  status: number;
  imageUrl?: string;
}

export interface RankedPrefecture extends Character {
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Options {
  pollingMs?: number;
  autoFetch?: boolean;
}

export function useCharacters(options: Options = {}) {
  const { pollingMs, autoFetch = true } = options;
  const [data, setData] = useState<RankedPrefecture[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchCharacters = useCallback(async () => {
    try {
      setLoading((prev) => prev || !initialized);
      const headers: HeadersInit = {};
      if (SUPABASE_ANON_KEY) {
        headers['apikey'] = SUPABASE_ANON_KEY;
        headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
      }
      const res = await fetch(`${API_URL}/characters`, { headers });
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
      setInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  useEffect(() => {
    if (autoFetch) {
      fetchCharacters();
    }
  }, [autoFetch, fetchCharacters]);

  useEffect(() => {
    if (!pollingMs || !autoFetch) return;
    const id = setInterval(() => {
      fetchCharacters();
    }, pollingMs);
    return () => clearInterval(id);
  }, [autoFetch, fetchCharacters, pollingMs]);

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
