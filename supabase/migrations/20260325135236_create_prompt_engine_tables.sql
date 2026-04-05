/*
  # Prompt Engine Database Schema

  1. New Tables
    - `presets`
      - `id` (uuid, primary key)
      - `name` (text, preset name)
      - `model` (text, model identifier)
      - `tab` (text, 'image' or 'video')
      - `data` (jsonb, the prompt configuration)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `history`
      - `id` (uuid, primary key)
      - `model` (text, model identifier)
      - `tab` (text, 'image' or 'video')
      - `data` (jsonb, the prompt configuration)
      - `output` (text, the formatted output)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Allow public access for read/write (frontend-only app)
*/

CREATE TABLE IF NOT EXISTS presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  model text NOT NULL,
  tab text NOT NULL CHECK (tab IN ('image', 'video')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  tab text NOT NULL CHECK (tab IN ('image', 'video')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  output text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to presets"
  ON presets FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to presets"
  ON presets FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to presets"
  ON presets FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from presets"
  ON presets FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to history"
  ON history FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to history"
  ON history FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public delete from history"
  ON history FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_presets_model ON presets(model);
CREATE INDEX IF NOT EXISTS idx_presets_tab ON presets(tab);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_model ON history(model);
