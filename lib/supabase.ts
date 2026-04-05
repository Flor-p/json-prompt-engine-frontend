import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Preset {
  id?: string;
  name: string;
  model: string;
  tab: 'image' | 'video';
  data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface HistoryEntry {
  id?: string;
  model: string;
  tab: 'image' | 'video';
  data: Record<string, any>;
  output: string;
  created_at?: string;
}

export async function savePreset(preset: Preset): Promise<Preset | null> {
  const { data, error } = await supabase
    .from('presets')
    .insert([{
      name: preset.name,
      model: preset.model,
      tab: preset.tab,
      data: preset.data,
      updated_at: new Date().toISOString()
    }])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving preset:', error);
    return null;
  }

  return data;
}

export async function loadPresets(): Promise<Preset[]> {
  const { data, error } = await supabase
    .from('presets')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error loading presets:', error);
    return [];
  }

  return data || [];
}

export async function deletePreset(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('presets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting preset:', error);
    return false;
  }

  return true;
}

export async function saveToHistory(entry: HistoryEntry): Promise<HistoryEntry | null> {
  const { data, error } = await supabase
    .from('history')
    .insert([{
      model: entry.model,
      tab: entry.tab,
      data: entry.data,
      output: entry.output
    }])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving to history:', error);
    return null;
  }

  const { data: allHistory } = await supabase
    .from('history')
    .select('id')
    .order('created_at', { ascending: false });

  if (allHistory && allHistory.length > 20) {
    const idsToDelete = allHistory.slice(20).map(h => h.id);
    await supabase.from('history').delete().in('id', idsToDelete);
  }

  return data;
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error loading history:', error);
    return [];
  }

  return data || [];
}

export async function clearHistory(): Promise<boolean> {
  const { error } = await supabase
    .from('history')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error clearing history:', error);
    return false;
  }

  return true;
}
