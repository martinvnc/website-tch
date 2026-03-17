"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  Users, Calendar, MessageSquare, Key, Newspaper, BarChart3,
  GraduationCap, Loader2, Plus, X, ChevronDown, Eye, Trash2, ToggleLeft, ToggleRight,
  Bold, Italic, Underline, Upload, ImageIcon, Pencil,
} from "lucide-react";
import { parseImageUrls } from "@/lib/utils";

type Stats = {
  membres: number;
  reservations: number;
  ticketsNouveaux: number;
  seances: number;
};

type Code = {
  id: string;
  code: string;
  actif: boolean;
  usage_count: number;
  created_at: string;
  expires_at: string | null;
};

type Ticket = {
  id: string;
  numero: string;
  prenom: string | null;
  nom: string | null;
  email: string;
  objet: string;
  message: string | null;
  statut: string;
  created_at: string;
};

type RecentReservation = {
  id: string;
  date: string;
  heure_debut: string;
  terrains: { nom: string } | null;
  profiles: { prenom: string; nom: string } | null;
};

type NewsItem = {
  id: string;
  titre: string;
  texte: string | null;
  categorie: string;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  published: boolean;
  date_publication: string;
};

type Props = {
  stats: Stats;
  codes: Code[];
  recentTickets: Ticket[];
  recentReservations: RecentReservation[];
  news: NewsItem[];
};

const adminTabs = [
  { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={16} /> },
  { id: "tickets", label: "Tickets", icon: <MessageSquare size={16} /> },
  { id: "codes", label: "Codes accès", icon: <Key size={16} /> },
  { id: "news", label: "News", icon: <Newspaper size={16} /> },
];

const statutColors: Record<string, string> = {
  nouveau: "bg-blue-100 text-blue-700",
  en_cours: "bg-yellow-100 text-yellow-700",
  attente: "bg-orange-100 text-orange-700",
  resolu: "bg-green-100 text-green-700",
  archive: "bg-gray-100 text-gray-500",
};

const statutLabels: Record<string, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  attente: "En attente",
  resolu: "Résolu",
  archive: "Archivé",
};

const initialNewsCategories = [
  { value: "club", label: "Club" },
  { value: "tournoi", label: "Tournoi" },
  { value: "soiree", label: "Soirée" },
  { value: "stage", label: "Stage" },
];

export function AdminClient({ stats, codes: initialCodes, recentTickets: initialTickets, recentReservations, news: initialNews }: Props) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [codes, setCodes] = useState(initialCodes);
  const [tickets, setTickets] = useState(initialTickets);
  const [news, setNews] = useState(initialNews);

  // Ticket detail
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Code creation
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [codeExpiry, setCodeExpiry] = useState("");
  const [creatingCode, setCreatingCode] = useState(false);
  const [togglingCode, setTogglingCode] = useState<string | null>(null);

  // News creation
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsForm, setNewsForm] = useState({ titre: "", categorie: "club", cta_label: "", cta_url: "", date_publication: new Date().toISOString().split("T")[0] });
  const [creatingNews, setCreatingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [togglingNews, setTogglingNews] = useState<string | null>(null);
  const [deletingNews, setDeletingNews] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  // Rich text editor
  const editorRef = useRef<HTMLDivElement>(null);

  // Multi-image upload
  type ImageEntry = { url: string; file?: File };
  const [newsImages, setNewsImages] = useState<ImageEntry[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic categories (all editable)
  const [newsCategories, setNewsCategories] = useState(initialNewsCategories);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Load extra categories from existing news
  useEffect(() => {
    const existingCats = new Set(news.map((n) => n.categorie));
    setNewsCategories((prev) => {
      const merged = [...prev];
      existingCats.forEach((cat) => {
        if (!merged.some((m) => m.value === cat)) {
          merged.push({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) });
        }
      });
      return merged;
    });
  }, [news]);

  const supabase = createClient();

  // --- TICKET ACTIONS ---
  async function updateTicketStatus(id: string, newStatut: string) {
    setUpdatingTicket(true);
    const { error } = await supabase
      .from("contact_tickets")
      .update({ statut: newStatut })
      .eq("id", id);
    if (!error) {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, statut: newStatut } : t)));
      if (viewingTicket?.id === id) setViewingTicket((prev) => prev ? { ...prev, statut: newStatut } : null);
    }
    setUpdatingTicket(false);
  }

  // --- CODE ACTIONS ---
  async function createCode() {
    if (!newCode.trim()) return;
    setCreatingCode(true);
    const { data, error } = await supabase
      .from("codes_acces")
      .insert({
        code: newCode.trim().toUpperCase(),
        actif: true,
        usage_count: 0,
        expires_at: codeExpiry || null,
      })
      .select()
      .single();
    if (!error && data) {
      setCodes((prev) => [data, ...prev]);
      setNewCode("");
      setCodeExpiry("");
      setShowCodeForm(false);
    }
    setCreatingCode(false);
  }

  async function toggleCode(id: string, currentState: boolean) {
    setTogglingCode(id);
    const { error } = await supabase
      .from("codes_acces")
      .update({ actif: !currentState })
      .eq("id", id);
    if (!error) {
      setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, actif: !currentState } : c)));
    }
    setTogglingCode(null);
  }

  // --- RICH TEXT HELPERS ---
  const execCommand = useCallback((command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  }, []);

  // --- IMAGE HELPERS ---
  function handleImageFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewsImages((prev) => [...prev, { url: e.target?.result as string, file }]);
      };
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleImageFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function removeImageAt(index: number) {
    setNewsImages((prev) => prev.filter((_, i) => i !== index));
  }

  // Drag-to-reorder state
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function handleThumbDragStart(idx: number) {
    dragIndexRef.current = idx;
  }

  function handleThumbDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndexRef.current === null || dragIndexRef.current === idx) return;
    setDragOverIndex(idx);
  }

  function handleThumbDrop(idx: number) {
    const from = dragIndexRef.current;
    if (from === null || from === idx) {
      dragIndexRef.current = null;
      setDragOverIndex(null);
      return;
    }
    setNewsImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  function handleThumbDragEnd() {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  }

  function clearAllImages() {
    setNewsImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // --- CATEGORY HELPERS ---
  function addCustomCategory() {
    const name = newCatName.trim();
    if (!name) return;
    const value = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    if (newsCategories.some((c) => c.value === value)) return;
    setNewsCategories((prev) => [...prev, { value, label: name }]);
    setNewsForm({ ...newsForm, categorie: value });
    setNewCatName("");
    setShowNewCatInput(false);
  }

  function removeCategory(catValue: string) {
    if (newsCategories.length <= 1) return;
    setNewsCategories((prev) => prev.filter((c) => c.value !== catValue));
    if (newsForm.categorie === catValue) {
      const remaining = newsCategories.filter((c) => c.value !== catValue);
      setNewsForm({ ...newsForm, categorie: remaining[0]?.value ?? "club" });
    }
  }

  // --- UPLOAD ALL IMAGES HELPER ---
  async function uploadAllImages(images: ImageEntry[]): Promise<string[] | null> {
    const urls: string[] = [];
    for (const img of images) {
      if (img.file) {
        const ext = img.file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(fileName, img.file, { cacheControl: "3600", upsert: false });
        if (uploadError) {
          setNewsError("Erreur upload image : " + uploadError.message);
          return null;
        }
        const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(fileName);
        urls.push(urlData.publicUrl);
      } else {
        // Already uploaded image (from edit)
        urls.push(img.url);
      }
    }
    return urls;
  }

  // --- NEWS ACTIONS ---
  async function createNewsItem() {
    if (!newsForm.titre.trim()) return;
    setCreatingNews(true);
    setNewsError(null);

    let imageUrlField: string | null = null;

    if (newsImages.length > 0) {
      setUploadingImage(true);
      const urls = await uploadAllImages(newsImages);
      setUploadingImage(false);
      if (!urls) { setCreatingNews(false); return; }
      imageUrlField = urls.length === 1 ? urls[0] : JSON.stringify(urls);
    }

    const htmlContent = editorRef.current?.innerHTML?.trim() || null;
    const cleanContent = htmlContent === "<br>" || htmlContent === "<div><br></div>" ? null : htmlContent;

    const { data, error } = await supabase
      .from("news")
      .insert({
        titre: newsForm.titre.trim(),
        texte: cleanContent,
        categorie: newsForm.categorie,
        image_url: imageUrlField,
        cta_label: newsForm.cta_label.trim() || null,
        cta_url: newsForm.cta_url.trim() || null,
        published: false,
        date_publication: newsForm.date_publication,
      })
      .select()
      .single();
    if (error) {
      setNewsError(error.message);
    } else if (data) {
      setNews((prev) => [data, ...prev]);
      setNewsForm({ titre: "", categorie: "club", cta_label: "", cta_url: "", date_publication: new Date().toISOString().split("T")[0] });
      if (editorRef.current) editorRef.current.innerHTML = "";
      clearAllImages();
      setShowNewsForm(false);
    }
    setCreatingNews(false);
  }

  async function toggleNewsPublished(id: string, currentState: boolean) {
    setTogglingNews(id);
    const { error } = await supabase
      .from("news")
      .update({ published: !currentState })
      .eq("id", id);
    if (!error) {
      setNews((prev) => prev.map((n) => (n.id === id ? { ...n, published: !currentState } : n)));
    }
    setTogglingNews(null);
  }

  async function deleteNewsItem(id: string) {
    if (!confirm("Supprimer cette actualité ?")) return;
    setDeletingNews(id);
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (!error) {
      setNews((prev) => prev.filter((n) => n.id !== id));
    }
    setDeletingNews(null);
  }

  function startEditNews(item: NewsItem) {
    setEditingNews(item);
    setNewsForm({
      titre: item.titre,
      categorie: item.categorie,
      cta_label: item.cta_label || "",
      cta_url: item.cta_url || "",
      date_publication: item.date_publication,
    });
    // Load existing images
    const existingUrls = parseImageUrls(item.image_url);
    setNewsImages(existingUrls.map((url) => ({ url })));
    setShowNewsForm(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = item.texte || "";
      }
    }, 50);
  }

  function cancelEdit() {
    setEditingNews(null);
    setNewsForm({ titre: "", categorie: "club", cta_label: "", cta_url: "", date_publication: new Date().toISOString().split("T")[0] });
    if (editorRef.current) editorRef.current.innerHTML = "";
    clearAllImages();
    setShowNewsForm(false);
  }

  async function updateNewsItem() {
    if (!editingNews || !newsForm.titre.trim()) return;
    setCreatingNews(true);
    setNewsError(null);

    let imageUrlField: string | null = null;

    if (newsImages.length > 0) {
      setUploadingImage(true);
      const urls = await uploadAllImages(newsImages);
      setUploadingImage(false);
      if (!urls) { setCreatingNews(false); return; }
      imageUrlField = urls.length === 1 ? urls[0] : JSON.stringify(urls);
    }

    const htmlContent = editorRef.current?.innerHTML?.trim() || null;
    const cleanContent = htmlContent === "<br>" || htmlContent === "<div><br></div>" ? null : htmlContent;

    const { data, error } = await supabase
      .from("news")
      .update({
        titre: newsForm.titre.trim(),
        texte: cleanContent,
        categorie: newsForm.categorie,
        image_url: imageUrlField,
        cta_label: newsForm.cta_label.trim() || null,
        cta_url: newsForm.cta_url.trim() || null,
        date_publication: newsForm.date_publication,
      })
      .eq("id", editingNews.id)
      .select()
      .single();

    if (error) {
      setNewsError(error.message);
    } else if (data) {
      setNews((prev) => prev.map((n) => (n.id === data.id ? data : n)));
      cancelEdit();
    }
    setCreatingNews(false);
  }

  return (
    <>
      <section className="bg-green-900 text-white py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-sm text-white/70 mt-1">Tableau de bord du Tennis Club Halluin</p>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 border-b mb-6 overflow-x-auto">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? "text-green-600 border-b-2 border-green-600" : "text-muted-foreground hover:text-green-900"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Membres", value: stats.membres, icon: <Users size={20} />, color: "text-green-600" },
                  { label: "Réservations", value: stats.reservations, icon: <Calendar size={20} />, color: "text-blue-600" },
                  { label: "Tickets ouverts", value: stats.ticketsNouveaux, icon: <MessageSquare size={20} />, color: "text-yellow-600" },
                  { label: "Séances planifiées", value: stats.seances, icon: <GraduationCap size={20} />, color: "text-purple-600" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`${kpi.color}`}>{kpi.icon}</span>
                    </div>
                    <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-xs font-bold text-muted-foreground mt-1">{kpi.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                    <Calendar size={16} /> Dernières réservations
                  </h3>
                  <div className="space-y-3">
                    {recentReservations.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-bold text-green-900">
                            {r.profiles?.prenom} {r.profiles?.nom}
                          </span>
                          <span className="text-muted-foreground"> · {r.terrains?.nom}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.date).toLocaleDateString("fr-FR")} {r.heure_debut.slice(0, 5)}
                        </span>
                      </div>
                    ))}
                    {recentReservations.length === 0 && (
                      <p className="text-sm text-muted-foreground">Aucune réservation récente.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                    <MessageSquare size={16} /> Derniers tickets
                  </h3>
                  <div className="space-y-3">
                    {tickets.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-bold text-green-900">{t.prenom} {t.nom}</span>
                          <span className="text-muted-foreground"> · {t.objet}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statutColors[t.statut] ?? "bg-gray-100 text-gray-500"}`}>
                          {statutLabels[t.statut] ?? t.statut}
                        </span>
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <p className="text-sm text-muted-foreground">Aucun ticket.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TICKETS */}
          {activeTab === "tickets" && (
            <div className="space-y-3">
              {viewingTicket ? (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <button
                    onClick={() => setViewingTicket(null)}
                    className="text-sm font-bold text-green-600 hover:text-green-800 mb-4 flex items-center gap-1"
                  >
                    ← Retour aux tickets
                  </button>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground">{viewingTicket.numero}</span>
                      <h3 className="text-lg font-bold text-green-900 mt-1">{viewingTicket.prenom} {viewingTicket.nom}</h3>
                      <p className="text-sm text-muted-foreground">{viewingTicket.email}</p>
                    </div>
                    <div className="relative">
                      <select
                        value={viewingTicket.statut}
                        onChange={(e) => updateTicketStatus(viewingTicket.id, e.target.value)}
                        disabled={updatingTicket}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold cursor-pointer ${statutColors[viewingTicket.statut] ?? "bg-gray-100"}`}
                      >
                        {Object.entries(statutLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Objet</p>
                      <p className="text-sm text-green-900 font-bold">{viewingTicket.objet}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Message</p>
                      <p className="text-sm text-green-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {viewingTicket.message ?? "Aucun message."}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reçu le {new Date(viewingTicket.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {tickets.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">Aucun ticket.</p>
                  ) : (
                    tickets.map((t) => (
                      <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-muted-foreground">{t.numero}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statutColors[t.statut] ?? "bg-gray-100"}`}>
                              {statutLabels[t.statut] ?? t.statut}
                            </span>
                            <button
                              onClick={() => setViewingTicket(t)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Voir le détail"
                            >
                              <Eye size={14} className="text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                        <p className="font-bold text-green-900">{t.prenom} {t.nom}</p>
                        <p className="text-sm text-muted-foreground">{t.email} · {t.objet}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(t.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )}

          {/* CODES */}
          {activeTab === "codes" && (
            <div className="space-y-3">
              <button
                onClick={() => setShowCodeForm(!showCodeForm)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors text-sm"
              >
                {showCodeForm ? <X size={16} /> : <Plus size={16} />}
                {showCodeForm ? "Annuler" : "Nouveau code"}
              </button>

              {showCodeForm && (
                <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Code</label>
                    <input
                      type="text"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="ex: TCH_SAISON_2026"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Date d&apos;expiration (optionnel)</label>
                    <input
                      type="date"
                      value={codeExpiry}
                      onChange={(e) => setCodeExpiry(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-sm"
                    />
                  </div>
                  <button
                    onClick={createCode}
                    disabled={!newCode.trim() || creatingCode}
                    className="px-5 py-2.5 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {creatingCode && <Loader2 size={14} className="animate-spin" />}
                    Créer le code
                  </button>
                </div>
              )}

              {codes.map((c) => (
                <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="font-bold text-green-900 font-mono text-lg">{c.code}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Utilisé {c.usage_count} fois
                      {c.expires_at && <> · Expire le {new Date(c.expires_at).toLocaleDateString("fr-FR")}</>}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleCode(c.id, c.actif)}
                    disabled={togglingCode === c.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      c.actif ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                  >
                    {togglingCode === c.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : c.actif ? (
                      <ToggleRight size={14} />
                    ) : (
                      <ToggleLeft size={14} />
                    )}
                    {c.actif ? "Actif" : "Inactif"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* NEWS */}
          {activeTab === "news" && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (showNewsForm) {
                    cancelEdit();
                  } else {
                    setEditingNews(null);
                    setShowNewsForm(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 btn-primary transition-colors text-sm"
              >
                {showNewsForm ? <X size={16} /> : <Plus size={16} />}
                {showNewsForm ? "Annuler" : "Nouvelle actualité"}
              </button>

              {showNewsForm && (
                <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
                  {editingNews && (
                    <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                      <Pencil size={14} /> Modifier l&apos;actualité
                    </p>
                  )}
                  {/* TITRE + DATE */}
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Titre *</label>
                      <input
                        type="text"
                        value={newsForm.titre}
                        onChange={(e) => setNewsForm({ ...newsForm, titre: e.target.value })}
                        placeholder="Titre de l&apos;actualité"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Date</label>
                      <input
                        type="date"
                        value={newsForm.date_publication}
                        onChange={(e) => setNewsForm({ ...newsForm, date_publication: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-sm"
                      />
                    </div>
                  </div>

                  {/* RICH TEXT EDITOR */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Contenu</label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-600/30 focus-within:border-green-600">
                      {/* Toolbar */}
                      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
                        <button
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); execCommand("bold"); }}
                          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                          title="Gras (Ctrl+B)"
                        >
                          <Bold size={14} className="text-gray-700" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); execCommand("italic"); }}
                          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                          title="Italique (Ctrl+I)"
                        >
                          <Italic size={14} className="text-gray-700" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); execCommand("underline"); }}
                          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                          title="Souligné (Ctrl+U)"
                        >
                          <Underline size={14} className="text-gray-700" />
                        </button>
                      </div>
                      {/* Editable area */}
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        className="min-h-[120px] px-3 py-2.5 text-sm outline-none prose prose-sm max-w-none"
                        data-placeholder="Contenu de l&apos;actualité..."
                        style={{ lineHeight: "1.6" }}
                      />
                    </div>
                    <style jsx>{`
                      [contenteditable]:empty:before {
                        content: attr(data-placeholder);
                        color: #9ca3af;
                        pointer-events: none;
                      }
                    `}</style>
                  </div>

                  {/* IMAGES UPLOAD (multi) */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                      Photos {newsImages.length > 0 && <span className="text-green-600">({newsImages.length})</span>}
                    </label>

                    {/* Thumbnails grid — drag to reorder */}
                    {newsImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        {newsImages.map((img, idx) => (
                          <div
                            key={idx}
                            draggable
                            onDragStart={() => handleThumbDragStart(idx)}
                            onDragOver={(e) => handleThumbDragOver(e, idx)}
                            onDrop={() => handleThumbDrop(idx)}
                            onDragEnd={handleThumbDragEnd}
                            className={`relative rounded-lg overflow-hidden border-2 group cursor-grab active:cursor-grabbing transition-all ${
                              dragOverIndex === idx
                                ? "border-green-500 scale-[1.03] shadow-lg"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="relative h-28">
                              <Image src={img.url} alt={`Photo ${idx + 1}`} fill className="object-cover pointer-events-none" />
                            </div>
                            {/* Order badge */}
                            <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImageAt(idx); }}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Supprimer"
                            >
                              <X size={12} />
                            </button>
                            {/* File name */}
                            {img.file && (
                              <div className="px-2 py-1 bg-gray-50 text-[10px] text-gray-500 truncate flex items-center gap-1">
                                <ImageIcon size={10} />
                                {img.file.name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Drop zone (always visible to add more) */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={() => setIsDragging(false)}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-600 hover:bg-green-50/50"
                      }`}
                    >
                      <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-green-600">Cliquez</span> ou glissez {newsImages.length > 0 ? "d\u2019autres photos" : "des photos"} ici
                      </p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — plusieurs fichiers possibles</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.length) handleImageFiles(e.target.files);
                        }}
                      />
                    </div>
                  </div>

                  {/* CATÉGORIE */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Catégorie</label>
                    <div className="flex flex-wrap gap-2">
                      {newsCategories.map((cat) => {
                        const isSelected = newsForm.categorie === cat.value;
                        return (
                          <div key={cat.value} className="relative group">
                            <button
                              type="button"
                              onClick={() => setNewsForm({ ...newsForm, categorie: cat.value })}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors pr-7 ${
                                isSelected
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {cat.label}
                            </button>
                            {newsCategories.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCategory(cat.value);
                                }}
                                className={`absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${
                                  isSelected
                                    ? "text-white/70 hover:text-white hover:bg-white/20"
                                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                                }`}
                                title="Supprimer cette catégorie"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {/* Bouton ajouter */}
                      {!showNewCatInput ? (
                        <button
                          type="button"
                          onClick={() => setShowNewCatInput(true)}
                          className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-gray-300 text-gray-500 hover:border-green-600 hover:text-green-600 transition-colors flex items-center gap-1"
                        >
                          <Plus size={12} /> Nouvelle
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addCustomCategory();
                              if (e.key === "Escape") { setShowNewCatInput(false); setNewCatName(""); }
                            }}
                            placeholder="Nom..."
                            autoFocus
                            className="w-28 px-2.5 py-1.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-sm"
                          />
                          <button
                            type="button"
                            onClick={addCustomCategory}
                            disabled={!newCatName.trim()}
                            className="p-1.5 rounded-full bg-green-600 text-white hover:bg-green-800 transition-colors disabled:opacity-50"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowNewCatInput(false); setNewCatName(""); }}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Bouton CTA — Texte</label>
                      <input
                        type="text"
                        value={newsForm.cta_label}
                        onChange={(e) => setNewsForm({ ...newsForm, cta_label: e.target.value })}
                        placeholder="ex: En savoir plus"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Bouton CTA — Lien</label>
                      <input
                        type="text"
                        value={newsForm.cta_url}
                        onChange={(e) => setNewsForm({ ...newsForm, cta_url: e.target.value })}
                        placeholder="ex: /le-club ou https://..."
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600/30 focus:border-green-600 text-sm"
                      />
                    </div>
                  </div>
                  {newsError && (
                    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{newsError}</p>
                  )}
                  <button
                    onClick={editingNews ? updateNewsItem : createNewsItem}
                    disabled={!newsForm.titre.trim() || creatingNews || uploadingImage}
                    className="px-5 py-2.5 rounded-lg font-bold bg-green-600 text-white hover:bg-green-800 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {(creatingNews || uploadingImage) && <Loader2 size={14} className="animate-spin" />}
                    {uploadingImage ? "Upload image..." : editingNews ? "Enregistrer les modifications" : "Créer (brouillon)"}
                  </button>
                </div>
              )}

              {news.length === 0 && (
                <p className="text-center text-muted-foreground py-10">Aucune actualité. Créez-en une !</p>
              )}

              {news.map((n) => (
                <div key={n.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-bold text-green-900 truncate">{n.titre}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-semibold mr-1">{n.categorie}</span>
                      {new Date(n.date_publication).toLocaleDateString("fr-FR")}
                      {n.image_url && <span className="ml-1">· 🖼️ {parseImageUrls(n.image_url).length > 1 ? `(${parseImageUrls(n.image_url).length})` : ""}</span>}
                      {n.cta_label && <span className="ml-1">· 🔗 {n.cta_label}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleNewsPublished(n.id, n.published)}
                      disabled={togglingNews === n.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        n.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {togglingNews === n.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : n.published ? (
                        <ToggleRight size={14} />
                      ) : (
                        <ToggleLeft size={14} />
                      )}
                      {n.published ? "Publié" : "Brouillon"}
                    </button>
                    <button
                      onClick={() => startEditNews(n)}
                      className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteNewsItem(n.id)}
                      disabled={deletingNews === n.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      {deletingNews === n.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
