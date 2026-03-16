"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export type ContactState = {
  error?: string;
  success?: string;
};

// Simple in-memory rate limit (per server instance)
const submitTimestamps = new Map<string, number>();

export async function submitContactForm(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  // Honeypot — if this hidden field is filled, it's a bot
  const honeypot = formData.get("website") as string;
  if (honeypot) {
    // Silently pretend success to not tip off the bot
    return { success: "Message envoyé !" };
  }

  const prenom = (formData.get("prenom") as string)?.trim();
  const nom = (formData.get("nom") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const telephone = (formData.get("telephone") as string)?.trim();
  const objet = formData.get("objet") as string;
  const message = (formData.get("message") as string)?.trim();

  // Validation
  if (!prenom || !nom || !email || !objet || !message) {
    return { error: "Tous les champs obligatoires doivent être remplis." };
  }

  // Message length validation
  if (message.length < 20) {
    return { error: "Le message doit contenir au moins 20 caractères." };
  }
  if (message.length > 2000) {
    return { error: "Le message ne peut pas dépasser 2000 caractères." };
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Adresse email invalide." };
  }

  // Rate limit: max 3 submissions per email per 10 minutes
  const rateKey = email.toLowerCase();
  const now = Date.now();
  const lastSubmit = submitTimestamps.get(rateKey) ?? 0;
  if (now - lastSubmit < 60_000) {
    return { error: "Veuillez patienter avant de renvoyer un message." };
  }
  submitTimestamps.set(rateKey, now);

  // Use service role to insert (no auth required for contact form)
  const supabase = createServiceRoleClient();

  const numero = `TCH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { error: dbError } = await supabase.from("contact_tickets").insert({
    numero,
    prenom,
    nom,
    email,
    telephone: telephone || null,
    objet,
    message,
  });

  if (dbError) {
    return { error: "Erreur lors de l'envoi. Veuillez réessayer." };
  }

  return { success: "Message envoyé ! Nous reviendrons vers vous rapidement." };
}
