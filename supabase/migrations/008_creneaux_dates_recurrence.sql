-- Dates de début et fin de récurrence pour les créneaux
ALTER TABLE creneaux
  ADD COLUMN IF NOT EXISTS date_debut date,
  ADD COLUMN IF NOT EXISTS date_fin date;
