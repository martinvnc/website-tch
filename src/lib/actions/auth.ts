"use server";

import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const prenom = formData.get("prenom") as string;
  const nom = formData.get("nom") as string;
  const codeAcces = (formData.get("codeAcces") as string)?.trim();
  const acceptCgu = formData.get("acceptCgu");

  if (!email || !password || !prenom || !nom || !codeAcces) {
    return { error: "Tous les champs sont obligatoires." };
  }

  if (!acceptCgu) {
    return { error: "Vous devez accepter les CGU et la politique de confidentialité." };
  }

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const serviceClient = createServiceRoleClient();

  const devCode = process.env.NEXT_PUBLIC_DEV_ACCESS_CODE;
  let codeValid = false;

  if (devCode && codeAcces.toUpperCase() === devCode.toUpperCase()) {
    codeValid = true;
  } else {
    const { data: codeData } = await serviceClient
      .from("codes_acces")
      .select("id, actif, expires_at, usage_count")
      .ilike("code", codeAcces)
      .single();

    if (!codeData || !codeData.actif) {
      return {
        error: "Code d'accès invalide. Contactez le club à contact@tch.fr",
      };
    }

    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return { error: "Ce code d'accès a expiré. Contactez le club." };
    }

    codeValid = true;

    try {
      const currentCount = codeData.usage_count ?? 0;
      await serviceClient
        .from("codes_acces")
        .update({ usage_count: currentCount + 1 })
        .eq("id", codeData.id);
    } catch {
      // silently ignore
    }
  }

  if (!codeValid) {
    return { error: "Code d'accès invalide." };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        prenom,
        nom,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Un compte existe déjà avec cet email." };
    }
    return { error: error.message };
  }

  return {
    success:
      "Compte créé avec succès ! Vérifiez votre email pour confirmer votre inscription.",
  };
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  redirect(redirectTo || "/mon-compte");
}

export async function signOut() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
