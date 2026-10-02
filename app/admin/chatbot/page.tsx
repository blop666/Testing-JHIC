"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, CalendarDays, Check, ChevronRight, Eye, FileText, ImagePlus, Link2, LoaderCircle, MessageSquare, Pencil, RotateCcw, Send, X } from "lucide-react";
import { motion } from "framer-motion";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContainer, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/linear-dialog";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generateSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";

type ContentType = "berita" | "pengumuman" | "prestasi" | "agenda";
type ResourceType = "mitra-industri" | "sarana-prasarana" | "guru" | "kategori-konten" | "kategori-guru" | "program-unggulan" | "fasilitas-vokasi" | "chatbot-knowledge";

type Target = ContentType | ResourceType;

type Draft = {
  contentType: ContentType;
  title: string;
  excerpt: string;
  body: string;
  eventDate: string | null;
  eventEndDate: string | null;
  eventLocation: string | null;
  categoryHint: string | null;
  jurusanHint: string | null;
  imageDescription: string | null;
  needsImage: boolean;
  sourceUrls: string[];
  warnings: string[];
  missingFields: string[];
  confidence: number;
  existingId?: number;
  existingPublished?: boolean;
};

type ResourceDraft = {
  resourceType: ResourceType;
  name: string;
  description: string | null;
  imageUrl: string | null;
  websiteUrl: string | null;
  position: string | null;
  bio: string | null;
  slug: string | null;
  label: string | null;
  tefaName: string | null;
  presentationSlot: "featured_large" | "standard" | "tall" | "wide" | null;
  jurusanHint: string | null;
  categoryHint: string | null;
  warnings: string[];
  missingFields: string[];
  confidence: number;
  existingId?: number;
  existingPublished?: boolean;
};

type Message = {
  id: number;
  sender: "ai" | "user";
  text?: string;
  isTyping?: boolean;
  draft?: Draft;
  resourceDraft?: ResourceDraft;
  publishedId?: number;
  sources?: Array<{ title: string; url: string }>;
  operation?: { action: "created" | "updated" | "draft" | "published" | "deleted"; label: string; title: string };
};

type PublishChoice = { messageId: number; draft: Draft };

const contentTypeLabel: Record<ContentType, string> = { berita: "Berita", pengumuman: "Pengumuman", prestasi: "Prestasi", agenda: "Agenda" };
const resourceTypeLabel: Record<ResourceType, string> = { "mitra-industri": "Mitra Industri", "sarana-prasarana": "Sarana & Prasarana", guru: "Guru & Staff", "kategori-konten": "Kategori Konten", "kategori-guru": "Kategori Guru", "program-unggulan": "Program Unggulan", "fasilitas-vokasi": "Fasilitas Praktik Vokasi", "chatbot-knowledge": "Knowledge Chatbot" };
const contentTypes: ContentType[] = ["berita", "pengumuman", "prestasi", "agenda"];
const resourceTypes: ResourceType[] = ["mitra-industri", "sarana-prasarana", "guru", "kategori-konten", "kategori-guru", "program-unggulan", "fasilitas-vokasi", "chatbot-knowledge"];

function isResourceType(target: Target): target is ResourceType {
  return resourceTypes.includes(target as ResourceType);
}

const examplePrompts = [
  "Buatkan berita tentang kegiatan PKL kelas XI SIJA yang berlangsung minggu ini.",
];

const initialMessage: Message = {
  id: 1,
  sender: "ai",
  text: "Halo! Saya asisten AI CibiOne CMS. Saya dapat membuat konten (berita, pengumuman, prestasi, agenda) atau mengelola data sekolah (mitra industri, sarana prasarana, guru, kategori). Pilih jenis di atas, lalu tulis instruksi Anda.",
};

async function request(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await fetch(url, { ...init, headers, cache: "no-store" });
  const text = await response.text();
  let result: { success?: boolean; data?: any; error?: { message?: string } } = {};
  try { result = JSON.parse(text); } catch { /* ignore */ }
  if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Permintaan gagal.");
  return result.data;
}

export default function AdminChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [target, setTarget] = useState<Target>("berita");
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  const [currentResource, setCurrentResource] = useState<ResourceDraft | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceUrls, setSourceUrls] = useState<string[]>([]);
  const [pendingSourceUrl, setPendingSourceUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [editingField, setEditingField] = useState<"title" | "excerpt" | "body" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pendingEdit, setPendingEdit] = useState(false);
  const [publishChoice, setPublishChoice] = useState<PublishChoice | null>(null);
  const [publishHighlight, setPublishHighlight] = useState(false);
  const [publishPopular, setPublishPopular] = useState(false);
  const [existingAction, setExistingAction] = useState<{ draft: Draft; action: "update" | "draft" | "delete" } | null>(null);
  const [resourceAction, setResourceAction] = useState<{ draft: ResourceDraft; action: "update" | "draft" | "publish" | "delete" } | null>(null);
  const [resourceSave, setResourceSave] = useState<{ messageId: number; draft: ResourceDraft; publish: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function addMessage(message: Omit<Message, "id">) {
    setMessages((current) => [...current, { ...message, id: Date.now() + Math.random() }]);
  }

  async function generateContent(prompt: string, baseDraft?: Draft): Promise<{ chat: true; answer: string } | { chat: false; draft: Draft; sources: Array<{ title: string; url: string }> }> {
    const payload: Record<string, unknown> = { prompt, contentType: target as ContentType, mode: baseDraft ? "edit" : "create", sourceUrls };
    if (attachedImage) payload.imageUrl = attachedImage;
    if (baseDraft) payload.baseDraft = baseDraft;
    const data = await request("/api/ai/content/generate", { method: "POST", body: JSON.stringify(payload) });
    if (data.kind === "chat") return { chat: true, answer: data.answer as string };
    const draft = { ...(data.draft as Draft), ...(baseDraft?.existingId ? { existingId: baseDraft.existingId, existingPublished: baseDraft.existingPublished, slug: (baseDraft as Draft & { slug?: string }).slug, imageUrl: (baseDraft as Draft & { imageUrl?: string | null }).imageUrl, isHighlighted: (baseDraft as Draft & { isHighlighted?: boolean }).isHighlighted, isPopularOverride: (baseDraft as Draft & { isPopularOverride?: boolean }).isPopularOverride } : {}) } as Draft;
    setCurrentDraft(draft);
    return { chat: false, draft, sources: (data.sources ?? []) as Array<{ title: string; url: string }> };
  }

  function requestedPostTitle(prompt: string) {
    const quoted = prompt.match(/[“"']([^”"']+)[”"']/);
    if (quoted) return quoted[1].trim();
    return prompt.replace(/^(tolong\s+)?(edit|ubah|hapus|delete)\s+/i, "").replace(/^(berita|pengumuman|prestasi|agenda)\s+(ini\s+)?/i, "").replace(/^(supaya|agar|menjadi|diubah menjadi|judulnya?)\s*[:,-]?\s*/i, "").trim();
  }

  async function findExistingNews(prompt: string, contentType: ContentType) {
    const q = requestedPostTitle(prompt);
    const result = await request(`/api/ai/admin/posts?q=${encodeURIComponent(q)}&type=${contentType}`) as Array<Record<string, unknown>>;
    if (result.length !== 1) return null;
    const post = result[0];
    return {
      id: Number(post.id), contentType, title: String(post.title), excerpt: String(post.excerpt ?? ""), body: String(post.body ?? ""),
      eventDate: post.eventDate ? String(post.eventDate) : null, eventEndDate: post.eventEndDate ? String(post.eventEndDate) : null, eventLocation: post.eventLocation ? String(post.eventLocation) : null,
      categoryHint: null, jurusanHint: null, imageDescription: null, needsImage: false, sourceUrls: [], warnings: [], missingFields: [], confidence: 1,
      existingId: Number(post.id), existingPublished: Boolean(post.isPublished), imageUrl: post.imageUrl ? String(post.imageUrl) : null,
      isHighlighted: Boolean(post.isHighlighted), isPopularOverride: Boolean(post.isPopularOverride), slug: String(post.slug),
    } as Draft & Record<string, unknown>;
  }

  async function saveExisting(draft: Draft, action: "update" | "draft" | "delete") {
    if (!draft.existingId) return;
    if (saving) return;
    setSaving(true);
    try {
      await request("/api/ai/admin/posts", { method: "POST", body: JSON.stringify({ action, id: draft.existingId, data: action === "delete" ? undefined : { title: draft.title, slug: (draft as Draft & { slug?: string }).slug ?? generateSlug(draft.title), excerpt: draft.excerpt || null, body: draft.body || null, imageUrl: (draft as Draft & { imageUrl?: string | null }).imageUrl ?? null, eventDate: draft.eventDate, eventEndDate: draft.eventEndDate, eventLocation: draft.eventLocation, isHighlighted: Boolean((draft as Draft & { isHighlighted?: boolean }).isHighlighted), isPopularOverride: Boolean((draft as Draft & { isPopularOverride?: boolean }).isPopularOverride) } }) });
      const label = contentTypeLabel[draft.contentType];
      addMessage({ sender: "ai", text: `${label} berhasil diproses.`, operation: { action: action === "delete" ? "deleted" : action === "draft" ? "draft" : "updated", label, title: draft.title } });
    } catch (error) {
      addMessage({ sender: "ai", text: error instanceof Error ? error.message : "Gagal memproses." });
    } finally {
      setSaving(false);
    }
  }

  async function generateResource(prompt: string, resourceType: ResourceType, baseDraft?: ResourceDraft): Promise<{ chat: true; answer: string } | { chat: false; draft: ResourceDraft }> {
    const payload: Record<string, unknown> = { prompt, resourceType, mode: baseDraft ? "edit" : "create" };
    if (attachedImage) payload.imageUrl = attachedImage;
    if (baseDraft) payload.baseDraft = baseDraft;
    const data = await request("/api/ai/resource/generate", { method: "POST", body: JSON.stringify(payload) });
    if (data.kind === "chat") return { chat: true, answer: data.answer as string };
    const draft = { ...(data.draft as ResourceDraft), ...(baseDraft?.existingId ? { existingId: baseDraft.existingId, existingPublished: baseDraft.existingPublished } : {}) };
    setCurrentResource(draft);
    return { chat: false, draft };
  }

  function resourceSearchTerm(prompt: string) {
    const quoted = prompt.match(/[“"']([^”"']+)[”"']/);
    if (quoted) return quoted[1].trim();
    return prompt.replace(/^(tolong\s+)?(edit|ubah|hapus|delete|publikasikan|terbitkan)\s+/i, "").replace(/^(data|item|yang|praktik vokasi|fasilitas praktik vokasi)\s+/i, "").trim();
  }

  async function findExistingResource(prompt: string, resourceType: ResourceType) {
    const rows = await request(`/api/ai/admin/resources?resourceType=${encodeURIComponent(resourceType)}&q=${encodeURIComponent(resourceSearchTerm(prompt))}`) as Array<Record<string, unknown>>;
    const normalized = resourceSearchTerm(prompt).toLowerCase();
    const exact = rows.filter((row) => String(row.name ?? row.title ?? row.contentText ?? "").toLowerCase().includes(normalized));
    if (exact.length !== 1 && rows.length !== 1) return null;
    const row = (exact.length === 1 ? exact : rows)[0];
    return {
      resourceType, existingId: Number(row.id), existingPublished: Boolean(row.isPublished),
      name: String(row.name ?? row.title ?? row.contentText ?? ""), description: row.description == null ? (row.contentText == null ? null : String(row.contentText)) : String(row.description),
      imageUrl: row.imageUrl == null ? (row.logoUrl == null ? null : String(row.logoUrl)) : String(row.imageUrl), websiteUrl: row.websiteUrl == null ? null : String(row.websiteUrl),
      position: row.position == null ? null : String(row.position), bio: row.bio == null ? null : String(row.bio), slug: row.slug == null ? null : String(row.slug),
      label: row.label == null ? null : String(row.label), tefaName: row.tefaName == null ? null : String(row.tefaName), presentationSlot: (row.presentationSlot as ResourceDraft["presentationSlot"]) ?? null,
      jurusanHint: null, categoryHint: null, warnings: [], missingFields: [], confidence: 1,
    } satisfies ResourceDraft;
  }

  function resourcePayload(draft: ResourceDraft) {
    const type = draft.resourceType;
    if (type === "mitra-industri") return { name: draft.name, logoUrl: draft.imageUrl, description: draft.description, websiteUrl: draft.websiteUrl, sortOrder: 0 };
    if (type === "sarana-prasarana") return { title: draft.name, description: draft.description, imageUrl: draft.imageUrl, presentationSlot: draft.presentationSlot ?? "standard", sortOrder: 0 };
    if (type === "guru") return { name: draft.name, position: draft.position, bio: draft.bio, imageUrl: draft.imageUrl, sortOrder: 0 };
    if (type === "program-unggulan") return { title: draft.name, description: draft.description ?? "", label: draft.label ?? draft.name, imageUrl: draft.imageUrl, sortOrder: 0 };
    if (type === "fasilitas-vokasi") return { title: draft.name, description: draft.description, imageUrl: draft.imageUrl, tefaName: draft.tefaName, sortOrder: 0 };
    if (type === "chatbot-knowledge") return { title: draft.name, contentText: draft.description ?? "", isActive: true, isPublished: true, sourceUrl: draft.websiteUrl };
    return { name: draft.name, slug: draft.slug ?? generateSlug(draft.name), description: draft.description, sortOrder: 0 };
  }

  async function saveExistingResource(draft: ResourceDraft, action: "update" | "draft" | "publish" | "delete") {
    if (!draft.existingId) return;
    if (saving) return;
    setSaving(true);
    try {
      await request("/api/ai/admin/resources", { method: "POST", body: JSON.stringify({ resourceType: draft.resourceType, action, id: draft.existingId, confirm: true, data: action === "delete" ? undefined : resourcePayload(draft) }) });
      const label = resourceTypeLabel[draft.resourceType];
      addMessage({ sender: "ai", text: `${label} berhasil diproses.`, operation: { action: action === "delete" ? "deleted" : action === "draft" ? "draft" : action === "publish" ? "published" : "updated", label, title: draft.name } });
    } catch (error) {
      addMessage({ sender: "ai", text: error instanceof Error ? error.message : "Gagal memproses." });
    } finally {
      setSaving(false);
    }
  }

  function startNewSession() {
    setCurrentDraft(null);
    setCurrentResource(null);
    setAttachedImage(null);
    setSourceUrls([]);
    setPendingEdit(false);
    setEditingField(null);
    setMessages([{ ...initialMessage, id: Date.now() + Math.random() }]);
    setInput("");
    inputRef.current?.focus();
  }

  function needsClarification() {
    if (isResourceType(target)) return currentResource !== null && (currentResource.missingFields.length > 0 || currentResource.warnings.length > 0);
    return currentDraft !== null && (currentDraft.missingFields.length > 0 || currentDraft.warnings.length > 0);
  }

  async function handleSend(event: FormEvent, customPrompt?: string) {
    event.preventDefault();
    const text = (customPrompt ?? input).trim();
    if (!text || isProcessing) return;

    addMessage({ sender: "user", text });
    setInput("");
    setIsProcessing(true);
    addMessage({ sender: "ai", isTyping: true });

    try {
      if (isResourceType(target)) {
        if (!pendingEdit && /\b(edit|ubah|hapus|delete|publikasikan|terbitkan)\b/i.test(text)) {
          const existing = await findExistingResource(text, target);
          if (!existing) { addMessage({ sender: "ai", text: "Data tidak ditemukan atau hasil pencarian lebih dari satu. Sertakan nama lengkap." }); return; }
          setCurrentResource(existing);
          setPendingEdit(!/\b(hapus|delete|publikasikan|terbitkan)\b/i.test(text));
          addMessage({ sender: "ai", text: /\b(hapus|delete)\b/i.test(text) ? `Saya menemukan ${resourceTypeLabel[target]} ini. Periksa preview sebelum menghapus.` : `Saya menemukan ${resourceTypeLabel[target]} ini. Periksa preview, lalu jelaskan perubahan jika diperlukan.` });
          addMessage({ sender: "ai", resourceDraft: existing });
          return;
        }
        const base = pendingEdit ? currentResource ?? undefined : undefined;
        const result = await generateResource(text, target, base);
        setPendingEdit(false);
        if (result.chat) {
          addMessage({ sender: "ai", text: result.answer });
          return;
        }
        const draft = result.draft;
        const questions = [...new Set([...draft.missingFields, ...draft.warnings])];
        if (draft.missingFields.length > 0) addMessage({ sender: "ai", text: "Saya masih butuh data berikut:\n\n" + questions.map((q) => `• ${q}`).join("\n") });
        else if (draft.warnings.length > 0) addMessage({ sender: "ai", text: "Catatan:\n\n" + questions.map((q) => `• ${q}`).join("\n") });
        else addMessage({ sender: "ai", text: `Saya telah menyusun data **${resourceTypeLabel[target]}** dengan keyakinan ${Math.round(draft.confidence * 100)}%.` });
        addMessage({ sender: "ai", resourceDraft: draft });
      } else {
        if (!pendingEdit && /\b(edit|ubah|hapus|delete)\b/i.test(text)) {
          const existing = await findExistingNews(text, target);
          if (!existing) { addMessage({ sender: "ai", text: `${contentTypeLabel[target]} yang dimaksud tidak ditemukan atau hasilnya lebih dari satu. Sertakan judul lengkap.` }); return; }
          setCurrentDraft(existing);
          setPendingEdit(!/\b(hapus|delete)\b/i.test(text));
          addMessage({ sender: "ai", text: /\b(hapus|delete)\b/i.test(text) ? `Saya menemukan ${contentTypeLabel[target]} ini. Periksa preview sebelum menghapus.` : `Saya menemukan ${contentTypeLabel[target]} ini. Jelaskan perubahan yang ingin dilakukan setelah memeriksa preview.` });
          addMessage({ sender: "ai", draft: existing });
          return;
        }
        const base = pendingEdit ? currentDraft ?? undefined : undefined;
        const result = await generateContent(text, base);
        setPendingEdit(false);
        if (result.chat) {
          addMessage({ sender: "ai", text: result.answer });
          return;
        }
        const { draft, sources } = result;
        const questions = [...new Set([...draft.missingFields, ...draft.warnings])];
        if (draft.missingFields.length > 0) addMessage({ sender: "ai", text: "Saya masih butuh beberapa data sebelum konten ini lengkap:\n\n" + questions.map((q) => `• ${q}`).join("\n") + "\n\nSilakan jawab atau lengkapi." });
        else if (draft.warnings.length > 0) addMessage({ sender: "ai", text: "Catatan untuk melengkapi konten:\n\n" + questions.map((q) => `• ${q}`).join("\n") });
        else addMessage({ sender: "ai", text: `Saya telah menyusun konten **${contentTypeLabel[draft.contentType]}** dengan keyakinan ${Math.round(draft.confidence * 100)}%.` });
        addMessage({ sender: "ai", draft, sources });
      }
    } catch (error) {
      addMessage({ sender: "ai", text: error instanceof Error ? error.message : "Gagal memproses. Coba lagi." });
    } finally {
      setMessages((current) => current.filter((m) => !m.isTyping));
      setIsProcessing(false);
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("category", "chatbot");
      const result = await request("/api/uploads", { method: "POST", body });
      setAttachedImage(result.url);
    } catch (error) {
      addMessage({ sender: "ai", text: error instanceof Error ? error.message : "Upload gambar gagal." });
    } finally {
      setUploading(false);
    }
  }

  function addSourceUrl() {
    const url = sourceUrl.trim();
    if (!url) return;
    let parsed: URL;
    try { parsed = new URL(url); } catch { addMessage({ sender: "ai", text: "URL sumber tidak valid. Pastikan memakai format lengkap, contoh https://sekolah.sch.id/artikel." }); return; }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") { addMessage({ sender: "ai", text: "URL harus memakai protokol http atau https." }); return; }
    if (sourceUrls.includes(url)) { addMessage({ sender: "ai", text: "URL ini sudah ditambahkan." }); return; }
    setPendingSourceUrl(url);
  }

  function confirmSourceUrl() {
    if (!pendingSourceUrl) return;
    setSourceUrls((current) => [...current, pendingSourceUrl]);
    setPendingSourceUrl(null);
    setSourceUrl("");
  }

  function cancelSourceUrl() {
    setPendingSourceUrl(null);
  }

  function removeSourceUrl(url: string) {
    setSourceUrls((current) => current.filter((item) => item !== url));
  }

  async function publishDraft(messageId: number, draft: Draft, isHighlighted: boolean, isPopularOverride: boolean) {
    if (draft.contentType === "agenda" && !draft.eventDate) {
      addMessage({ sender: "ai", text: "Konten agenda belum bisa diterbitkan karena tanggal belum diisi." });
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await request("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          type: draft.contentType,
          title: draft.title,
          slug: `${generateSlug(draft.title)}-${Date.now()}`,
          excerpt: draft.excerpt,
          body: draft.contentType === "prestasi" ? null : draft.body,
          imageUrl: attachedImage ?? null,
          galleryUrls: [],
          eventDate: draft.eventDate ?? null,
          eventEndDate: draft.eventEndDate ?? null,
          eventLocation: draft.eventLocation ?? null,
          isPublished: true,
          publishedAt: new Date().toISOString(),
          isFeatured: false,
           isHighlighted,
           isPopularOverride,
        }),
      });
      setMessages((current) => current.map((m) => (m.id === messageId ? { ...m, publishedId: 1 } : m)));
      addMessage({ sender: "ai", text: `${contentTypeLabel[draft.contentType]} berhasil diterbitkan.`, operation: { action: "published", label: contentTypeLabel[draft.contentType], title: draft.title } });
    } catch (error) {
      addMessage({ sender: "ai", text: error instanceof Error ? error.message : "Konten gagal diterbitkan." });
    } finally {
      setSaving(false);
    }
  }

  async function saveResource(messageId: number, draft: ResourceDraft, publish: boolean) {
    const type = draft.resourceType;
    const image = attachedImage ?? draft.imageUrl;
    let endpoint = "";
    let payload: Record<string, unknown>;
    if (saving) return;
    setSaving(true);
    try {
      if (type === "mitra-industri") {
        endpoint = "/api/kerjasama-industri";
        payload = { name: draft.name, logoUrl: image, description: draft.description, websiteUrl: draft.websiteUrl, isPublished: publish, sortOrder: 0 };
      } else if (type === "sarana-prasarana") {
        endpoint = "/api/sarana-prasarana";
        payload = { title: draft.name, description: draft.description, imageUrl: image, presentationSlot: draft.presentationSlot ?? "standard", isPublished: publish, sortOrder: 0 };
      } else if (type === "guru") {
        endpoint = "/api/guru";
        payload = { name: draft.name, position: draft.position, bio: draft.bio, imageUrl: image, isPublished: publish, sortOrder: 0 };
      } else if (type === "program-unggulan") {
        endpoint = "/api/program-unggulan";
        payload = { title: draft.name, description: draft.description, label: draft.label, imageUrl: image, isPublished: publish, sortOrder: 0 };
      } else if (type === "fasilitas-vokasi") {
        endpoint = "/api/fasilitas-vokasi";
        payload = { title: draft.name, description: draft.description, imageUrl: image, tefaName: draft.tefaName, isPublished: publish, sortOrder: 0 };
      } else if (type === "chatbot-knowledge") {
        endpoint = "/api/chatbot-knowledge";
        payload = { title: draft.name, contentText: draft.description ?? "", sourceUrl: draft.websiteUrl, isActive: true, isPublished: publish };
      } else {
        endpoint = type === "kategori-konten" ? "/api/post-categories" : "/api/guru-categories";
        const slug = draft.slug ?? generateSlug(draft.name);
        payload = { name: draft.name, slug, description: type === "kategori-konten" ? draft.description : undefined, isActive: publish, sortOrder: 0 };
      }
      await request(endpoint, { method: "POST", body: JSON.stringify(payload) });
      setMessages((current) => current.map((m) => (m.id === messageId ? { ...m, publishedId: 1 } : m)));
      addMessage({ sender: "ai", text: `${resourceTypeLabel[draft.resourceType]} berhasil ${publish ? "disimpan dan dipublikasikan" : "disimpan sebagai draft"}.`, operation: { action: publish ? "published" : "draft", label: resourceTypeLabel[draft.resourceType], title: draft.name } });
    } catch (error) {
      addMessage({ sender: "ai", text: error instanceof Error ? error.message : "Data gagal disimpan." });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(draft: Draft, field: "title" | "excerpt" | "body") {
    setEditingField(field);
    setEditValue(draft[field] ?? "");
  }

  function applyEdit() {
    if (!currentDraft || !editingField) return;
    setCurrentDraft((current) => (current ? { ...current, [editingField]: editValue } : current));
    setEditingField(null);
    setEditValue("");
  }

  function handleExampleClick(prompt: string) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  const isPendingClarification = needsClarification();

  return (
    <div className="flex h-[calc(100svh-7rem)] min-h-0 flex-col md:h-[calc(100svh-8.5rem)]">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-content-center rounded-xl bg-blue-700 text-white"><Bot className="size-5" /></span>
            <div>
              <h1 className="text-lg font-bold text-slate-950">AI Content Assistant</h1>
              <p className="text-sm text-slate-500">Buat & kelola konten dan data sekolah</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={startNewSession} disabled={isProcessing}><RotateCcw className="size-4" />Sesi baru</Button>
          </div>
        </div>
      </header>

      <div ref={messagesRef} className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label htmlFor="target-select" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Pilih jenis yang ingin dibuat</label>
            <NativeSelect id="target-select" className="w-full sm:w-fit" value={target} onChange={(event) => setTarget(event.target.value as Target)}>
              <NativeSelectOptGroup label="Konten">
                {contentTypes.map((type) => <NativeSelectOption key={type} value={type}>{contentTypeLabel[type]}</NativeSelectOption>)}
              </NativeSelectOptGroup>
              <NativeSelectOptGroup label="Data Sekolah">
                {resourceTypes.map((type) => <NativeSelectOption key={type} value={type}>{resourceTypeLabel[type]}</NativeSelectOption>)}
              </NativeSelectOptGroup>
            </NativeSelect>
          </div>

          {messages.map((message) => (
            <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", message.sender === "user" && "flex-row-reverse")}>
              {message.sender === "ai" && <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-blue-700 text-white"><Bot className="size-4" /></span>}
              {message.sender === "user" && <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-slate-700 text-white"><MessageSquare className="size-4" /></span>}
              <div className={cn("flex max-w-[85%] flex-col gap-3", message.sender === "user" && "items-end")}>
                {message.isTyping ? (
                  <div className="flex w-fit gap-1.5 rounded-2xl rounded-tl-sm bg-white px-5 py-3 shadow-sm">
                    {[0, 1, 2].map((dot) => <motion.span key={dot} className="size-2 rounded-full bg-blue-500" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: dot * 0.12 }} />)}
                  </div>
                 ) : message.operation ? (
                   <div className="flex w-full min-w-[280px] items-start gap-3 rounded-2xl rounded-tl-sm border border-emerald-200 bg-linear-to-br from-emerald-50 to-white px-4 py-3 text-sm text-emerald-950 shadow-sm">
                     <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white"><Check className="size-4" /></span>
                     <div><p className="font-semibold">{message.operation.action === "deleted" ? "Data berhasil dihapus" : message.operation.action === "draft" ? "Draft berhasil disimpan" : message.operation.action === "published" ? "Berhasil dipublikasikan" : "Perubahan berhasil disimpan"}</p><p className="mt-1 text-emerald-800">{message.operation.label}: <span className="font-medium">{message.operation.title}</span></p></div>
                   </div>
                 ) : message.text ? (
                  <div className={cn("whitespace-pre-line rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm", message.sender === "ai" ? "rounded-tl-sm bg-white text-slate-700" : "rounded-tr-sm bg-blue-700 text-white")} dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                ) : null}

                {message.draft && (
                  <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center gap-1.5"><FileText className="size-3" />{contentTypeLabel[message.draft.contentType]}</Badge>
                      <div className="flex items-center gap-2">
                        {message.draft.jurusanHint && <Badge variant="outline">{message.draft.jurusanHint}</Badge>}
                        <Badge className="bg-amber-50 text-xs text-amber-700">Draft</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {editingField === "title" ? (
                        <div className="flex gap-2"><input className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" value={editValue} onChange={(e) => setEditValue(e.target.value)} /><Button size="sm" onClick={applyEdit}><Check className="size-4" /></Button></div>
                      ) : (
                        <h3 className="text-lg font-bold leading-tight text-slate-950">{message.draft.title}</h3>
                      )}
                      {editingField === "excerpt" ? (
                        <div className="flex gap-2"><textarea className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={2} value={editValue} onChange={(e) => setEditValue(e.target.value)} /><Button size="sm" onClick={applyEdit}><Check className="size-4" /></Button></div>
                      ) : (
                        <p className="text-sm leading-relaxed text-slate-600">{message.draft.excerpt}</p>
                      )}
                      {message.draft.eventDate && <p className="text-xs text-slate-500"><CalendarDays className="mr-1 inline size-3" />{new Date(message.draft.eventDate).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</p>}
                      {message.draft.categoryHint && <Badge variant="outline" className="text-xs">{message.draft.categoryHint}</Badge>}
                    </div>
                    {message.draft.needsImage && !attachedImage && (
                      <Alert className="mt-4 border-amber-200 bg-amber-50 text-amber-800"><ImagePlus className="size-4" /><AlertDescription>{message.draft.imageDescription ? `Sebaiknya memakai gambar: ${message.draft.imageDescription}` : "Sebaiknya dilengkapi gambar."}</AlertDescription></Alert>
                    )}
                    {!message.publishedId && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedDraft(message.draft ?? null); setShowFullPreview(false); }}><Eye className="size-4" />Preview</Button>
                        <Button size="sm" variant="outline" onClick={() => startEdit(message.draft!, "title")}><Pencil className="size-4" />Edit judul</Button>
                        <Button size="sm" variant="outline" onClick={() => startEdit(message.draft!, "excerpt")}><Pencil className="size-4" />Edit ringkasan</Button>
                        {message.draft.contentType !== "prestasi" && <Button size="sm" variant="outline" onClick={() => startEdit(message.draft!, "body")}><Pencil className="size-4" />Edit isi</Button>}
                        <Button size="sm" variant="outline" onClick={() => { setCurrentDraft(message.draft!); setTarget(message.draft!.contentType); setPendingEdit(true); }}><Bot className="size-4" />Edit via AI</Button>
                        {message.draft.existingId && <>
                          <Button size="sm" variant="outline" onClick={() => setExistingAction({ draft: message.draft!, action: "draft" })}><FileText className="size-4" />Simpan draft</Button>
                          <Button size="sm" className="bg-blue-700 hover:bg-blue-600" onClick={() => setExistingAction({ draft: message.draft!, action: "update" })}><Check className="size-4" />Simpan perubahan</Button>
                           <Button size="sm" variant="destructive" onClick={() => setExistingAction({ draft: message.draft!, action: "delete" })}>Hapus {contentTypeLabel[message.draft.contentType]}</Button>
                        </>}
                        <Button size="sm" className="ml-auto bg-blue-700 hover:bg-blue-600" onClick={() => { setPublishChoice({ messageId: message.id, draft: message.draft! }); setPublishHighlight(false); setPublishPopular(false); }}><Check className="size-4" />Publikasikan</Button>
                      </div>
                    )}
                    {message.publishedId && <Alert className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-800"><Check className="size-4" /><AlertDescription>Konten berhasil diterbitkan.</AlertDescription></Alert>}
                  </div>
                )}

                {message.resourceDraft && (
                  <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center gap-1.5">{resourceTypeLabel[message.resourceDraft.resourceType]}</Badge>
                      <Badge className="bg-amber-50 text-xs text-amber-700">Draft</Badge>
                    </div>
                    <h3 className="text-lg font-bold leading-tight text-slate-950">{message.resourceDraft.name}</h3>
                    {message.resourceDraft.position && <p className="mt-1 text-xs font-semibold text-blue-700">{message.resourceDraft.position}</p>}
                    {message.resourceDraft.tefaName && <Badge variant="outline" className="mt-2">{message.resourceDraft.tefaName}</Badge>}
                    {message.resourceDraft.description && <p className="mt-2 text-sm leading-relaxed text-slate-600">{message.resourceDraft.description}</p>}
                    {message.resourceDraft.slug && <Badge variant="outline" className="mt-2 text-xs">/{message.resourceDraft.slug}</Badge>}
                    {!message.publishedId && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setCurrentResource(message.resourceDraft!); setTarget(message.resourceDraft!.resourceType); setPendingEdit(true); }}><Bot className="size-4" />Edit via AI</Button>
                         {message.resourceDraft.existingId ? <>
                           <Button size="sm" variant="outline" onClick={() => setResourceAction({ draft: message.resourceDraft!, action: "draft" })}><FileText className="size-4" />Simpan draft</Button>
                           <Button size="sm" className="bg-blue-700 hover:bg-blue-600" onClick={() => setResourceAction({ draft: message.resourceDraft!, action: "publish" })}><Check className="size-4" />Simpan perubahan</Button>
                           <Button size="sm" variant="destructive" onClick={() => setResourceAction({ draft: message.resourceDraft!, action: "delete" })}>Hapus</Button>
                         </> : <>
                           <Button size="sm" variant="outline" onClick={() => setResourceSave({ messageId: message.id, draft: message.resourceDraft!, publish: false })}><FileText className="size-4" />Simpan draft</Button>
                           <Button size="sm" className="ml-auto bg-blue-700 hover:bg-blue-600" onClick={() => setResourceSave({ messageId: message.id, draft: message.resourceDraft!, publish: true })}><Check className="size-4" />Simpan & publikasikan</Button>
                         </>}
                      </div>
                    )}
                    {message.publishedId && <Alert className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-800"><Check className="size-4" /><AlertDescription>Data berhasil disimpan.</AlertDescription></Alert>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {messages.length === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
              <p className="text-center text-sm font-medium text-slate-600">Coba contoh prompt:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {examplePrompts.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => handleExampleClick(prompt)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800">{prompt}</button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="border-t bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl space-y-2">
          {(attachedImage || sourceUrls.length > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              {attachedImage && (
                <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2 text-xs text-slate-600">
                  <Image src={attachedImage} alt="Lampiran" width={24} height={24} className="size-6 rounded-full object-cover" />Gambar
                  <button type="button" onClick={() => setAttachedImage(null)} aria-label="Hapus gambar"><X className="size-3" /></button>
                </span>
              )}
              {sourceUrls.map((url) => (
                <span key={url} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{new URL(url).hostname}<button type="button" onClick={() => removeSourceUrl(url)} aria-label="Hapus sumber"><X className="size-3" /></button></span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input ref={urlRef} value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSourceUrl(); } }} placeholder="Tempel URL sumber artikel (opsional)..." className="hidden min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:block" />
            <Button type="button" variant="outline" size="icon" onClick={addSourceUrl} aria-label="Tambah URL sumber" className="hidden sm:inline-flex"><Link2 className="size-4" /></Button>
            <Button type="button" variant="outline" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Upload gambar"><ImagePlus className="size-4" /></Button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadImage(file); e.target.value = ""; }} />
          </div>
          <form onSubmit={handleSend} className="flex gap-3">
             <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} placeholder={pendingEdit ? "Jelaskan perubahan yang diinginkan..." : isPendingClarification ? "Jawab pertanyaan AI untuk melengkapi data..." : "Tulis instruksi untuk membuat data baru..."} rows={1} disabled={isProcessing} className="min-h-11 min-w-0 flex-1 resize-none overflow-y-auto wrap-break-word rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50" />
            <Button type="submit" disabled={!input.trim() || isProcessing} className="bg-blue-700 hover:bg-blue-600">{isProcessing ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}Kirim</Button>
          </form>
        </div>
      </div>

      <AlertDialog open={pendingSourceUrl !== null} onOpenChange={(open) => { if (!open) cancelSourceUrl(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gunakan URL ini sebagai sumber?</AlertDialogTitle>
            <AlertDialogDescription>
              AI akan mengambil isi artikel dari <span className="break-all font-semibold text-foreground">{pendingSourceUrl}</span>. URL sudah lolos validasi format. Pastikan kontennya relevan; sumber tetap dapat diedit secara manual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-blue-700 hover:bg-blue-600" onClick={confirmSourceUrl}>Ya, gunakan URL</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={publishChoice !== null} onOpenChange={(open) => { if (!open && !saving) setPublishChoice(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atur tampilan konten</AlertDialogTitle>
            <AlertDialogDescription>Pilih apakah konten ini ditampilkan pada banner highlight dan tab Populer.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
              <span><span className="block text-sm font-semibold text-slate-900">Tampilkan di banner highlight berita</span><span className="text-xs text-slate-500">Urutan mengikuti tanggal terbit terbaru.</span></span>
              <input checked={publishHighlight} onChange={(event) => setPublishHighlight(event.target.checked)} type="checkbox" disabled={saving} />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
              <span><span className="block text-sm font-semibold text-slate-900">Tandai sebagai populer</span><span className="text-xs text-slate-500">Prioritaskan pada tab Populer.</span></span>
              <input checked={publishPopular} onChange={(event) => setPublishPopular(event.target.checked)} type="checkbox" disabled={saving} />
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={async () => { if (publishChoice) await publishDraft(publishChoice.messageId, publishChoice.draft, publishHighlight, publishPopular); setPublishChoice(null); }}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : null}Terbitkan konten</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={existingAction !== null} onOpenChange={(open) => { if (!open && !saving) setExistingAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{existingAction?.action === "delete" ? `Hapus ${existingAction ? contentTypeLabel[existingAction.draft.contentType] : "konten"} ini?` : existingAction?.action === "draft" ? "Simpan sebagai draft?" : "Simpan perubahan konten?"}</AlertDialogTitle>
            <AlertDialogDescription>{existingAction?.action === "delete" ? `${existingAction ? contentTypeLabel[existingAction.draft.contentType] : "Konten"} terkait akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.` : `Perubahan pada “${existingAction?.draft.title ?? "konten"}” akan disimpan.`}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Batal</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={async () => { if (existingAction) await saveExisting(existingAction.draft, existingAction.action); setExistingAction(null); }} className={existingAction?.action === "delete" ? "bg-red-600 hover:bg-red-700" : undefined}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : null}{existingAction?.action === "delete" ? "Hapus permanen" : "Konfirmasi"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resourceAction !== null} onOpenChange={(open) => { if (!open && !saving) setResourceAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{resourceAction?.action === "delete" ? `Hapus ${resourceAction ? resourceTypeLabel[resourceAction.draft.resourceType] : "data"} ini?` : "Konfirmasi perubahan data"}</AlertDialogTitle>
            <AlertDialogDescription>{resourceAction?.action === "delete" ? `“${resourceAction.draft.name}” akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.` : `Perubahan pada “${resourceAction?.draft.name ?? "data"}” akan disimpan.`}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={saving}>Batal</AlertDialogCancel><AlertDialogAction disabled={saving} className={resourceAction?.action === "delete" ? "bg-red-600 hover:bg-red-700" : undefined} onClick={async () => { if (resourceAction) await saveExistingResource(resourceAction.draft, resourceAction.action); setResourceAction(null); }}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : null}{resourceAction?.action === "delete" ? "Hapus permanen" : "Ya, simpan"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resourceSave !== null} onOpenChange={(open) => { if (!open && !saving) setResourceSave(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Konfirmasi penyimpanan</AlertDialogTitle><AlertDialogDescription>Data “{resourceSave?.draft.name}” akan {resourceSave?.publish ? "dipublikasikan" : "disimpan sebagai draft"}.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={saving}>Batal</AlertDialogCancel><AlertDialogAction disabled={saving} onClick={async () => { if (resourceSave) await saveResource(resourceSave.messageId, resourceSave.draft, resourceSave.publish); setResourceSave(null); }}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : null}Konfirmasi</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(selectedDraft)} onOpenChange={(open) => { if (!open) setSelectedDraft(null); }}>
        <DialogContainer>
          <DialogContent className="relative flex h-[min(760px,92vh)] w-[min(1100px,95vw)] flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl">
            <DialogClose className="z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-900 shadow-md" />
            {selectedDraft && (
              <div className="grid min-h-0 flex-1 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[220px] overflow-hidden bg-slate-900 lg:min-h-full">
                  <Image src={attachedImage || "/banner.jpeg"} alt={selectedDraft.title} fill className="object-cover brightness-90" sizes="45vw" />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/80 to-transparent p-7 pt-20 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">{contentTypeLabel[selectedDraft.contentType]}</p>
                    {selectedDraft.eventDate && <p className="mt-3 flex items-center gap-2 text-sm text-white/75"><CalendarDays className="size-4" />{new Date(selectedDraft.eventDate).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</p>}
                  </div>
                </div>
                <div className="flex min-h-0 flex-col p-6 sm:p-9">
                  <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="mb-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.13em] text-blue-800">
                      <span className="rounded-full bg-blue-50 px-3 py-1.5">{contentTypeLabel[selectedDraft.contentType]}</span>
                      {selectedDraft.jurusanHint && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-500">{selectedDraft.jurusanHint}</span>}
                    </div>
                    <DialogTitle className="pr-8 text-3xl font-bold leading-tight text-slate-950">{selectedDraft.title}</DialogTitle>
                    <DialogDescription className="mt-5 text-sm leading-7 text-slate-600">
                      <p className="text-lg font-medium leading-8 text-slate-700">{selectedDraft.excerpt}</p>
                      {showFullPreview && selectedDraft.body ? <div className="prose prose-slate mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: selectedDraft.body }} /> : <p className="mt-6">Konten ini telah disusun dan siap ditinjau sebelum diterbitkan.</p>}
                    </DialogDescription>
                  </div>
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <Button type="button" className="w-full bg-blue-700 hover:bg-blue-600" onClick={() => setShowFullPreview((current) => !current)}>{showFullPreview ? "Kembali ke Ringkasan" : "Lihat Detail Lengkap"}<ChevronRight className="size-4" /></Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </DialogContainer>
      </Dialog>
    </div>
  );
}
