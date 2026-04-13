const API_URL = 'https://json-prompt-engine-backend-production.up.railway.app';

// ===== PROMPTS =====
export const apiGetPrompts = async () => {
  const res = await fetch(`${API_URL}/api/prompts`);
  if (!res.ok) throw new Error('Failed to fetch prompts');
  return res.json();
};

export const apiSavePrompt = async (data: {
  model: string;
  tab: 'image' | 'video';
  data: Record<string, any>;
  output: string;
}) => {
  const res = await fetch(`${API_URL}/api/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save prompt');
  return res.json();
};

export const apiDeletePrompt = async (id: string) => {
  const res = await fetch(`${API_URL}/api/prompts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete prompt');
  return res.json();
};

export const apiClearPrompts = async () => {
  const res = await fetch(`${API_URL}/api/prompts`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear prompts');
  return res.json();
};

// ===== PRESETS =====
export const apiGetPresets = async () => {
  const res = await fetch(`${API_URL}/api/presets`);
  if (!res.ok) throw new Error('Failed to fetch presets');
  return res.json();
};

export const apiSavePreset = async (data: {
  name: string;
  model: string;
  tab: 'image' | 'video';
  data: Record<string, any>;
}) => {
  const res = await fetch(`${API_URL}/api/presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save preset');
  return res.json();
};

export const apiDeletePreset = async (id: string) => {
  const res = await fetch(`${API_URL}/api/presets/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete preset');
  return res.json();
};