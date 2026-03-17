-- Retirer la contrainte CHECK sur la colonne categorie pour permettre des catégories personnalisées
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_categorie_check;
