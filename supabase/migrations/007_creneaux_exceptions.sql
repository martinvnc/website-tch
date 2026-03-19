-- Exceptions pour créneaux récurrents (vacances, maladie, etc.)
CREATE TABLE IF NOT EXISTS creneaux_exceptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creneau_id uuid NOT NULL REFERENCES creneaux(id) ON DELETE CASCADE,
  date_annulee date NOT NULL,
  raison text, -- optionnel : "vacances", "maladie", etc.
  created_at timestamptz DEFAULT now(),
  UNIQUE(creneau_id, date_annulee)
);

-- RLS
ALTER TABLE creneaux_exceptions ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire
CREATE POLICY "creneaux_exceptions_read" ON creneaux_exceptions FOR SELECT USING (true);

-- Seuls les admins peuvent modifier
CREATE POLICY "creneaux_exceptions_admin_all" ON creneaux_exceptions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Index
CREATE INDEX IF NOT EXISTS idx_creneaux_exceptions_creneau ON creneaux_exceptions(creneau_id);
CREATE INDEX IF NOT EXISTS idx_creneaux_exceptions_date ON creneaux_exceptions(date_annulee);
