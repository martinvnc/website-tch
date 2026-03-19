-- Types de créneaux (entraînement, cours particulier, interclub, tournoi, stage, etc.)
CREATE TABLE IF NOT EXISTS creneaux_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL,
  couleur text NOT NULL DEFAULT '#4c7650',
  created_at timestamptz DEFAULT now()
);

-- Créneaux placés sur le planning
CREATE TABLE IF NOT EXISTS creneaux (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type_id uuid NOT NULL REFERENCES creneaux_types(id) ON DELETE CASCADE,
  terrain_id uuid NOT NULL REFERENCES terrains(id) ON DELETE CASCADE,
  jour_semaine int NOT NULL CHECK (jour_semaine BETWEEN 0 AND 6), -- 0=Lundi, 6=Dimanche
  heure_debut text NOT NULL,
  heure_fin text NOT NULL,
  recurrent boolean NOT NULL DEFAULT true,
  date_specifique date, -- si non récurrent, date précise
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE creneaux_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE creneaux ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire
CREATE POLICY "creneaux_types_read" ON creneaux_types FOR SELECT USING (true);
CREATE POLICY "creneaux_read" ON creneaux FOR SELECT USING (true);

-- Seuls les admins peuvent modifier
CREATE POLICY "creneaux_types_admin_all" ON creneaux_types FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "creneaux_admin_all" ON creneaux FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Index
CREATE INDEX IF NOT EXISTS idx_creneaux_terrain ON creneaux(terrain_id);
CREATE INDEX IF NOT EXISTS idx_creneaux_type ON creneaux(type_id);
CREATE INDEX IF NOT EXISTS idx_creneaux_jour ON creneaux(jour_semaine);
