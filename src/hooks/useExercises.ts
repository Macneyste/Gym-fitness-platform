import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/services/supabase';
import type { Category, Exercise, Muscle } from '@/types/models';
import { exercises as seed } from '@/data/exercises';

type Row = {
  id: string;
  name_so: string;
  name_en: string;
  category: Category;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment_so: string | null;
  equipment_en: string | null;
  steps_so: string[];
  steps_en: string[];
  video_url: string | null;
  timed: boolean;
};

function fromRow(r: Row): Exercise {
  const local = seed.find((e) => e.id === r.id);
  return {
    id: r.id,
    name: { so: r.name_so, en: r.name_en },
    category: r.category,
    primary: r.primary_muscles as Muscle[],
    secondary: r.secondary_muscles as Muscle[],
    equipment: { so: r.equipment_so ?? '', en: r.equipment_en ?? '' },
    steps: r.steps_so.map((so, i) => ({ so, en: r.steps_en[i] ?? so })),
    videoSeconds: local?.videoSeconds ?? 30,
    videoUrl: r.video_url ?? undefined,
    timed: r.timed,
  };
}

/**
 * Exercise catalogue: remote (Supabase) when configured, otherwise the
 * bundled seed. Exposes loading / error / retry for list states.
 */
async function fetchExercises(): Promise<{ data: Exercise[]; error: string | null }> {
  if (!supabase) return { data: seed, error: null };
  const { data: rows, error } = await supabase.from('exercises').select('*');
  // On failure keep the app usable offline with the bundled seed.
  if (error) return { data: seed, error: error.message };
  return { data: rows && rows.length ? (rows as Row[]).map(fromRow) : seed, error: null };
}

export function useExercises() {
  const [data, setData] = useState<Exercise[]>(supabase ? [] : seed);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    fetchExercises().then((res) => {
      if (!alive) return;
      setData(res.data);
      setError(res.error);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { data, loading, error, retry };
}

export function filterExercises(list: Exercise[], query: string, category: Category | 'all') {
  const q = query.trim().toLowerCase();
  return list.filter(
    (e) =>
      (category === 'all' || e.category === category) &&
      (!q || e.name.so.toLowerCase().includes(q) || e.name.en.toLowerCase().includes(q)),
  );
}
