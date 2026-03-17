-- Créer le bucket storage pour les images des news
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- Politique : tout le monde peut lire les images
CREATE POLICY "Public read news images" ON storage.objects FOR SELECT
  USING (bucket_id = 'news-images');

-- Politique : les admins peuvent upload/delete
CREATE POLICY "Admin upload news images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'news-images'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin delete news images" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'news-images'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
