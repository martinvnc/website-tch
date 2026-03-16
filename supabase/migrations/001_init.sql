-- ============================================================
-- TENNIS CLUB HALLUIN — Schéma SQL complet
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- ========================
-- 1. TABLES
-- ========================

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  nom text,
  prenom text,
  telephone text,
  classement_fft text,
  niveau text CHECK (niveau IN ('debutant','intermediaire','confirme','competiteur')),
  role text CHECK (role IN ('visitor','member','parent','coach','directrice','admin')) DEFAULT 'member',
  adhesion_expire date,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- PROFILS ENFANTS
CREATE TABLE IF NOT EXISTS profils_enfants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  prenom text,
  nom text,
  date_naissance date,
  niveau text,
  avatar_url text,
  actif bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- CODES D'ACCÈS
CREATE TABLE IF NOT EXISTS codes_acces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  actif bool DEFAULT true,
  usage_count int DEFAULT 0,
  created_by uuid REFERENCES profiles,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- TERRAINS
CREATE TABLE IF NOT EXISTS terrains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  surface text,
  type text CHECK (type IN ('indoor','outdoor')),
  actif bool DEFAULT true,
  tarif_heure decimal(8,2) DEFAULT 0,
  horaire_ouverture time DEFAULT '08:00',
  horaire_fermeture time DEFAULT '22:00',
  ordre int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RÉSERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  terrain_id uuid NOT NULL REFERENCES terrains ON DELETE CASCADE,
  user_id uuid REFERENCES profiles,
  enfant_id uuid REFERENCES profils_enfants,
  partenaire_user_id uuid REFERENCES profiles,
  partenaire_enfant_id uuid REFERENCES profils_enfants,
  date date NOT NULL,
  heure_debut time NOT NULL,
  heure_fin time NOT NULL,
  statut text CHECK (statut IN ('confirmed','cancelled')) DEFAULT 'confirmed',
  prix decimal(8,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  CONSTRAINT chk_joueur1 CHECK (user_id IS NOT NULL OR enfant_id IS NOT NULL),
  CONSTRAINT chk_partenaire CHECK (partenaire_user_id IS NOT NULL OR partenaire_enfant_id IS NOT NULL)
);

-- RÉSERVATIONS GROUPÉES ADMIN
CREATE TABLE IF NOT EXISTS reservations_groupees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  terrain_id uuid NOT NULL REFERENCES terrains ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES profiles,
  date_debut date NOT NULL,
  date_fin date,
  heure_debut time NOT NULL,
  heure_fin time NOT NULL,
  motif text CHECK (motif IN ('entrainement','interclub','cours_indiv','cours_collectif','evenement','maintenance','autre')),
  motif_libre text,
  couleur_hex text DEFAULT '#dbeafe',
  note_interne text,
  recurrence text CHECK (recurrence IN ('none','weekly','biweekly','custom')) DEFAULT 'none',
  recurrence_fin date,
  created_at timestamptz DEFAULT now()
);

-- NEWS
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  categorie text CHECK (categorie IN ('tournoi','stage','soiree','club')),
  date_publication date DEFAULT CURRENT_DATE,
  image_url text,
  texte text,
  cta_label text,
  cta_url text,
  published bool DEFAULT true,
  created_by uuid REFERENCES profiles,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RÉSULTATS
CREATE TABLE IF NOT EXISTS resultats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text,
  equipe_tch text NOT NULL,
  equipe_adversaire text NOT NULL,
  score_tch int,
  score_adv int,
  resultat text CHECK (resultat IN ('win','loss','draw')),
  date date,
  competition text,
  image_url text,
  created_by uuid REFERENCES profiles,
  created_at timestamptz DEFAULT now()
);

-- TICKER HOME
CREATE TABLE IF NOT EXISTS ticker_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  texte text NOT NULL,
  actif bool DEFAULT true,
  ordre int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- SPONSORS
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  logo_url text,
  site_url text,
  ordre int DEFAULT 0,
  actif bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- TIMELINE
CREATE TABLE IF NOT EXISTS timeline_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annee int NOT NULL,
  titre text NOT NULL,
  description text,
  ordre int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- COMITÉ
CREATE TABLE IF NOT EXISTS comite_membres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  role text NOT NULL,
  photo_url text,
  ordre int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- GALERIE
CREATE TABLE IF NOT EXISTS galerie_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  ordre int DEFAULT 0,
  actif bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- GROUPES D'ENTRAÎNEMENT
CREATE TABLE IF NOT EXISTS groupes_entrainement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  couleur_hex text DEFAULT '#4c7650',
  coach_id uuid NOT NULL REFERENCES profiles,
  actif bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- MEMBRES DES GROUPES
CREATE TABLE IF NOT EXISTS groupe_membres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id uuid NOT NULL REFERENCES groupes_entrainement ON DELETE CASCADE,
  user_id uuid REFERENCES profiles,
  enfant_id uuid REFERENCES profils_enfants,
  date_ajout timestamptz DEFAULT now(),
  actif bool DEFAULT true,
  CONSTRAINT chk_membre CHECK (user_id IS NOT NULL OR enfant_id IS NOT NULL)
);

-- SÉANCES
CREATE TABLE IF NOT EXISTS seances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  groupe_id uuid NOT NULL REFERENCES groupes_entrainement ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES profiles,
  date date NOT NULL,
  heure_debut time NOT NULL,
  duree_minutes int DEFAULT 60,
  type text CHECK (type IN ('regulier','special','amical','tournoi_interne','reunion','autre')),
  lieu text,
  note text,
  recurrence text CHECK (recurrence IN ('none','weekly','biweekly','custom')) DEFAULT 'none',
  recurrence_fin date,
  statut text CHECK (statut IN ('planifiee','annulee','terminee')) DEFAULT 'planifiee',
  created_at timestamptz DEFAULT now()
);

-- PRÉSENCES
CREATE TABLE IF NOT EXISTS presences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seance_id uuid NOT NULL REFERENCES seances ON DELETE CASCADE,
  user_id uuid REFERENCES profiles,
  enfant_id uuid REFERENCES profils_enfants,
  reponse text CHECK (reponse IN ('present','absent','peut_etre','en_attente')) DEFAULT 'en_attente',
  reponse_reelle text CHECK (reponse_reelle IN ('present','absent','non_renseigne')) DEFAULT 'non_renseigne',
  repondu_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT chk_presence_membre CHECK (user_id IS NOT NULL OR enfant_id IS NOT NULL)
);

-- TICKETS CONTACT
CREATE TABLE IF NOT EXISTS contact_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text UNIQUE NOT NULL,
  prenom text,
  nom text,
  email text NOT NULL,
  telephone text,
  objet text CHECK (objet IN ('information','adhesion','reservation','cours','tournois','partenariat','autre')),
  message text NOT NULL,
  piece_jointe_url text,
  statut text CHECK (statut IN ('nouveau','en_cours','attente','resolu','archive')) DEFAULT 'nouveau',
  priorite text CHECK (priorite IN ('basse','normale','haute','urgente')) DEFAULT 'normale',
  assigne_a uuid REFERENCES profiles,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RÉPONSES TICKETS
CREATE TABLE IF NOT EXISTS ticket_reponses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES contact_tickets ON DELETE CASCADE,
  auteur_id uuid NOT NULL REFERENCES profiles,
  contenu text NOT NULL,
  est_note_interne bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- CONFIG SITE
CREATE TABLE IF NOT EXISTS site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cle text UNIQUE NOT NULL,
  valeur text,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles
);

-- ========================
-- 2. INDEX DE PERFORMANCE
-- ========================

CREATE INDEX IF NOT EXISTS idx_res_user_date ON reservations(user_id, date) WHERE statut='confirmed';
CREATE INDEX IF NOT EXISTS idx_res_enfant_date ON reservations(enfant_id, date) WHERE statut='confirmed';
CREATE INDEX IF NOT EXISTS idx_res_part_user_date ON reservations(partenaire_user_id, date) WHERE statut='confirmed';
CREATE INDEX IF NOT EXISTS idx_res_terrain_date ON reservations(terrain_id, date);
CREATE INDEX IF NOT EXISTS idx_tickets_statut ON contact_tickets(statut, created_at DESC);

-- ========================
-- 3. RLS (Row Level Security)
-- ========================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profils_enfants ENABLE ROW LEVEL SECURITY;
ALTER TABLE codes_acces ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrains ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations_groupees ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticker_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comite_membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE galerie_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE groupes_entrainement ENABLE ROW LEVEL SECURITY;
ALTER TABLE groupe_membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE seances ENABLE ROW LEVEL SECURITY;
ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_reponses ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by authenticated" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles are insertable via trigger" ON profiles FOR INSERT WITH CHECK (true);

-- Profils enfants: parent can CRUD their own
CREATE POLICY "Parents can view own children" ON profils_enfants FOR SELECT TO authenticated USING (parent_id = auth.uid());
CREATE POLICY "Parents can insert children" ON profils_enfants FOR INSERT TO authenticated WITH CHECK (parent_id = auth.uid());
CREATE POLICY "Parents can update own children" ON profils_enfants FOR UPDATE TO authenticated USING (parent_id = auth.uid());
CREATE POLICY "Parents can delete own children" ON profils_enfants FOR DELETE TO authenticated USING (parent_id = auth.uid());
-- Coach/admin can view all children
CREATE POLICY "Coach/admin can view all children" ON profils_enfants FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach','admin')));

-- Codes accès: only admin
CREATE POLICY "Admin can manage codes" ON codes_acces FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
-- Service role for registration check (via server action)
CREATE POLICY "Service role full access codes" ON codes_acces FOR SELECT TO service_role USING (true);

-- Terrains: public read
CREATE POLICY "Terrains are viewable by everyone" ON terrains FOR SELECT USING (true);
CREATE POLICY "Admin can manage terrains" ON terrains FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Réservations: authenticated read, own create/update
CREATE POLICY "Reservations viewable by authenticated" ON reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can create reservations" ON reservations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can cancel own reservations" ON reservations FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can manage all reservations" ON reservations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Réservations groupées: admin only
CREATE POLICY "Admin can manage grouped reservations" ON reservations_groupees FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Grouped reservations viewable by authenticated" ON reservations_groupees FOR SELECT TO authenticated USING (true);

-- News: public read
CREATE POLICY "News viewable by everyone" ON news FOR SELECT USING (published = true);
CREATE POLICY "Admin can manage news" ON news FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Résultats: public read
CREATE POLICY "Results viewable by everyone" ON resultats FOR SELECT USING (true);
CREATE POLICY "Admin can manage results" ON resultats FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Ticker: public read
CREATE POLICY "Ticker viewable by everyone" ON ticker_items FOR SELECT USING (actif = true);
CREATE POLICY "Admin can manage ticker" ON ticker_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Sponsors: public read
CREATE POLICY "Sponsors viewable by everyone" ON sponsors FOR SELECT USING (actif = true);
CREATE POLICY "Admin can manage sponsors" ON sponsors FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Timeline: public read
CREATE POLICY "Timeline viewable by everyone" ON timeline_items FOR SELECT USING (true);
CREATE POLICY "Admin can manage timeline" ON timeline_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Comité: public read
CREATE POLICY "Comite viewable by everyone" ON comite_membres FOR SELECT USING (true);
CREATE POLICY "Admin can manage comite" ON comite_membres FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Galerie: public read
CREATE POLICY "Galerie viewable by everyone" ON galerie_photos FOR SELECT USING (actif = true);
CREATE POLICY "Admin can manage galerie" ON galerie_photos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Groupes: coach can manage own, members can view their groups
CREATE POLICY "Groups viewable by authenticated" ON groupes_entrainement FOR SELECT TO authenticated USING (true);
CREATE POLICY "Coach can manage own groups" ON groupes_entrainement FOR ALL TO authenticated
  USING (coach_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Groupe membres
CREATE POLICY "Group members viewable by authenticated" ON groupe_membres FOR SELECT TO authenticated USING (true);
CREATE POLICY "Coach/admin can manage group members" ON groupe_membres FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM groupes_entrainement g
    WHERE g.id = groupe_id AND (g.coach_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  ));

-- Séances
CREATE POLICY "Sessions viewable by authenticated" ON seances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Coach can manage own sessions" ON seances FOR ALL TO authenticated
  USING (coach_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Présences
CREATE POLICY "Presences viewable by authenticated" ON presences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can update own presence" ON presences FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Coach/admin can manage presences" ON presences FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach','admin')));

-- Contact tickets
CREATE POLICY "Tickets insertable by everyone" ON contact_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin/directrice can view tickets" ON contact_tickets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','directrice')));
CREATE POLICY "Admin can manage tickets" ON contact_tickets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Ticket réponses
CREATE POLICY "Ticket replies viewable by admin/directrice" ON ticket_reponses FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','directrice')));
CREATE POLICY "Admin/directrice can create replies" ON ticket_reponses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','directrice')));

-- Site config
CREATE POLICY "Config viewable by authenticated" ON site_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage config" ON site_config FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ========================
-- 4. TRIGGERS
-- ========================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, prenom, nom)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================
-- 5. SEED DATA
-- ========================

-- Terrains
INSERT INTO terrains (nom, surface, type, ordre) VALUES
  ('Court 1', 'Dur', 'indoor', 1),
  ('Court 2', 'Résine', 'indoor', 2),
  ('Court 3', 'Résine', 'indoor', 3),
  ('Court 4', 'Béton poreux', 'outdoor', 4),
  ('Court 5', 'Béton poreux', 'outdoor', 5),
  ('Court 6', 'Béton poreux', 'outdoor', 6)
ON CONFLICT DO NOTHING;

-- News
INSERT INTO news (titre, categorie, image_url, texte, cta_label, cta_url) VALUES
  ('Soirée Fluo au TCH — Une nuit inoubliable !', 'soiree', '/assets/photos/soiree-fluo/IMG_3162.JPEG', 'Une soirée magique sous les lumières fluo avec tous les membres du club. Ambiance garantie !', 'Voir toutes les photos', NULL),
  ('Stage vacances jeunes — Les petits champions en action !', 'stage', '/assets/photos/stage-vacances/IMG_3585.JPEG', 'Nos jeunes talents ont brillé pendant le stage de vacances. Prochaine session bientôt !', 'Inscription au prochain stage', '/contact')
ON CONFLICT DO NOTHING;

-- Résultats
INSERT INTO resultats (type, equipe_tch, equipe_adversaire, score_tch, score_adv, resultat, date, competition) VALUES
  ('Interclub', 'TCH 1', 'Lille UC', 4, 2, 'win', '2026-02-15', 'Interclub Div.2'),
  ('Tournoi interne', 'M. Dupont', 'P. Martin', 6, 3, 'win', '2026-02-10', 'Tournoi interne Simple'),
  ('Interclub', 'TCH 2', 'Roubaix TC', 3, 3, 'draw', '2026-02-08', 'Interclub Div.3'),
  ('Match amical', 'Dupont/Leroy', 'Équipe adverse', 2, 4, 'loss', '2026-01-28', 'Match amical Double'),
  ('Interclub', 'TCH Vét.', 'Tourcoing TC', 5, 1, 'win', '2026-01-20', 'Vétérans Div.1'),
  ('Tournoi', 'A. Moreau', 'T. Girard', 6, 4, 'win', '2026-01-15', 'Tournoi U14')
ON CONFLICT DO NOTHING;

-- Timeline
INSERT INTO timeline_items (annee, titre, description, ordre) VALUES
  (1927, 'Fondation du club', 'Le Tennis Club Halluin voit le jour.', 1),
  (1955, 'Premier tournoi officiel', 'Le TCH organise son premier tournoi homologué.', 2),
  (1978, 'Construction des courts couverts', 'Trois courts indoor viennent compléter les installations.', 3),
  (1995, 'Rénovation complète', '6 terrains, éclairage nocturne, clubhouse modernisé.', 4),
  (2010, 'Label École de Tennis FFT', 'Le TCH obtient le label qualité de la FFT.', 5),
  (2024, 'Rénovation courts extérieurs', 'Béton poreux, éclairage LED, confort optimal.', 6),
  (2026, 'Lancement du nouveau site web', 'Réservation en ligne et gestion digitale du club.', 7)
ON CONFLICT DO NOTHING;

-- Comité
INSERT INTO comite_membres (prenom, nom, role, ordre) VALUES
  ('Jean-Pierre', 'Moreau', 'Président', 1),
  ('Marie', 'Dupont', 'Vice-présidente', 2),
  ('Luc', 'Bernard', 'Trésorier', 3),
  ('Sophie', 'Martin', 'Secrétaire', 4),
  ('Antoine', 'Leroy', 'Responsable sportif', 5),
  ('Claire', 'Petit', 'Responsable jeunes', 6),
  ('Paul', 'Girard', 'Responsable terrains', 7),
  ('Nathalie', 'Roux', 'Communication', 8)
ON CONFLICT DO NOTHING;

-- Ticker
INSERT INTO ticker_items (texte, ordre) VALUES
  ('Stage vacances de printemps — Inscriptions ouvertes', 1),
  ('Soirée fluo — Un succès inoubliable !', 2),
  ('TCH 1 bat Lille UC 4–2 en interclub', 3),
  ('Nouveaux créneaux débutants disponibles', 4),
  ('Bienvenue sur le nouveau site du TCH !', 5)
ON CONFLICT DO NOTHING;

-- Sponsors
INSERT INTO sponsors (nom, ordre) VALUES
  ('Crédit Agricole', 1),
  ('Babolat', 2),
  ('Ville d''Halluin', 3),
  ('Enedis', 4),
  ('Nord Auto', 5),
  ('Construire59', 6)
ON CONFLICT DO NOTHING;

-- Codes d'accès (dev)
INSERT INTO codes_acces (code, actif) VALUES
  ('TCH_TEST_2026', true),
  ('TCH2026', true)
ON CONFLICT DO NOTHING;

-- Config site
INSERT INTO site_config (cle, valeur, description) VALUES
  ('contact_email_destinataire', 'contact@tch.fr', 'Email de réception des messages de contact'),
  ('contact_email_cc', '', 'Email en copie des messages de contact')
ON CONFLICT DO NOTHING;
