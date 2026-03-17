-- Fix: ajouter politique SELECT explicite pour les admins sur la table news
-- La politique FOR ALL ne couvre pas toujours SELECT correctement
DROP POLICY IF EXISTS "Admin can read all news" ON news;
CREATE POLICY "Admin can read all news" ON news FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Idem pour les autres tables admin
DROP POLICY IF EXISTS "Admin can read all tickets" ON contact_tickets;
CREATE POLICY "Admin can read all tickets" ON contact_tickets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admin can read all codes" ON codes_acces;
CREATE POLICY "Admin can read all codes" ON codes_acces FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
