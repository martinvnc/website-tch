-- Add category, sets and format columns to resultats table
ALTER TABLE resultats
  ADD COLUMN IF NOT EXISTS categorie text NOT NULL DEFAULT 'interclub',
  ADD COLUMN IF NOT EXISTS sets jsonb,
  ADD COLUMN IF NOT EXISTS format text;

-- sets JSON structure: [{tch: number, adv: number}, ...] (2 or 3 elements)
-- format values: '2sets_supertb'
