-- RPC pour incrémenter le compteur d'utilisation d'un code d'accès
CREATE OR REPLACE FUNCTION increment_code_usage(code_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE codes_acces
  SET usage_count = usage_count + 1
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
