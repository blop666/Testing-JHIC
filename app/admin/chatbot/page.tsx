"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Bot, CalendarDays, Check, ChevronRight, Eye, FileText, MessageSquare, Send } from "lucide-react";
import { motion } from "motion/react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContainer, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/linear-dialog";
import { generateSlug } from "@/lib/slug";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  sender: "ai" | "user";
  text?: string;
  isTyping?: boolean;
  preview?: {
    type: string;
    title: string;
    excerpt: string;
    category: string;
    department: string;
    body: string;
    date: string;
    imageUrl?: string;
  };
  showActions?: boolean;
};

const examplePrompts = [
  "Buatkan berita tentang kegiatan PKL kelas XI SIJA yang berlangsung minggu ini.",
  "Tambahkan prestasi baru: Tim RPL juara 2 lomba aplikasi tingkat provinsi.",
  "Buat pengumuman tentang pendaftaran siswa baru tahun ajaran 2026/2027.",
];

const initialMessage: Message = {
  id: 1,
  sender: "ai",
  text: "Halo! Saya asisten AI CibiOne CMS. Saya dapat membantu Anda membuat konten seperti berita, prestasi, atau pengumuman dengan instruksi bahasa natural. Coba salah satu contoh di bawah atau tulis instruksi Anda sendiri.",
};

export default function AdminChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [publishedId, setPublishedId] = useState<number | null>(null);
  const [publishedPostId, setPublishedPostId] = useState<number | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<Message["preview"] | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSend(event: FormEvent, customPrompt?: string) {
    event.preventDefault();
    const text = customPrompt || input.trim();
    if (!text || isProcessing) return;

    const userMessage: Message = { id: Date.now(), sender: "user", text };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsProcessing(true);

    setTimeout(() => {
      const typingMessage: Message = { id: Date.now() + 1, sender: "ai", isTyping: true };
      setMessages((current) => [...current, typingMessage]);
    }, 300);

    setTimeout(() => {
      setMessages((current) => current.filter((msg) => !msg.isTyping));

      const understandingMessage: Message = {
        id: Date.now() + 2,
        sender: "ai",
        text: "Baik, saya sedang memahami instruksi Anda...",
      };
      setMessages((current) => [...current, understandingMessage]);
    }, 1200);

    setTimeout(() => {
      const isAchievement = /prestasi|juara|penghargaan|kompetisi|lomba/i.test(text);
      const isAnnouncement = /pengumuman|pendaftaran|ppdb|daftar/i.test(text);
      const contentType = isAchievement ? "Prestasi" : isAnnouncement ? "Pengumuman" : "Berita";
      const department = isAchievement ? "RPL" : /sija/i.test(text) ? "SIJA" : /tkj/i.test(text) ? "TKJ" : "Umum";

      const preview = {
        type: contentType,
        title: isAchievement
          ? "Tim RPL Raih Juara 2 Lomba Aplikasi Tingkat Provinsi"
          : isAnnouncement
            ? "Pendaftaran Siswa Baru Tahun Ajaran 2026/2027 Dibuka"
            : "Kegiatan PKL Kelas XI SIJA Memperkuat Pengalaman Industri",
        excerpt: isAchievement
          ? "Tim Rekayasa Perangkat Lunak SMKN 1 Cibinong berhasil meraih juara 2 dalam kompetisi pengembangan aplikasi mobile tingkat provinsi Jawa Barat. Prestasi ini membuktikan kompetensi siswa dalam teknologi."
          : isAnnouncement
            ? "SMKN 1 Cibinong membuka pendaftaran peserta didik baru untuk tahun ajaran 2026/2027. Pendaftaran dilakukan secara online melalui portal PPDB Jawa Barat mulai 1 Juni hingga 30 Juni 2026."
            : "Siswa kelas XI program keahlian Sistem Informasi Jaringan dan Aplikasi (SIJA) mengikuti kegiatan Praktek Kerja Lapangan (PKL) untuk memperluas pengalaman belajar dan kesiapan memasuki dunia kerja.",
        category: isAchievement ? "Prestasi Siswa" : isAnnouncement ? "Pengumuman" : "Kegiatan Sekolah",
        department,
         body: isAchievement
           ? "Tim Rekayasa Perangkat Lunak SMKN 1 Cibinong berhasil meraih juara 2 dalam kompetisi pengembangan aplikasi mobile tingkat provinsi Jawa Barat. Prestasi ini menjadi bukti semangat belajar dan kompetensi siswa dalam mengembangkan solusi digital.\n\nCapaian ini juga menjadi motivasi bagi seluruh siswa untuk terus berkarya, berkolaborasi, dan mengikuti berbagai kompetisi di tingkat nasional maupun provinsi."
           : isAnnouncement
             ? "SMKN 1 Cibinong membuka pendaftaran peserta didik baru untuk tahun ajaran 2026/2027. Pendaftaran dilakukan secara online melalui portal PPDB Jawa Barat mulai 1 Juni hingga 30 Juni 2026.\n\nInformasi mengenai persyaratan, jadwal, dan tahapan pendaftaran dapat diakses melalui kanal resmi sekolah. Calon peserta didik diharapkan mempersiapkan seluruh dokumen sesuai ketentuan yang berlaku."
             : "Siswa kelas XI program keahlian Sistem Informasi Jaringan dan Aplikasi (SIJA) mengikuti kegiatan Praktek Kerja Lapangan (PKL) untuk memperluas pengalaman belajar dan kesiapan memasuki dunia kerja.\n\nMelalui kegiatan ini, siswa mendapatkan kesempatan untuk menerapkan kompetensi yang dipelajari di sekolah sekaligus mengenal budaya kerja secara langsung di industri.",
         date: "24 Agustus 2026",
         imageUrl: "/banner.jpeg",
      };

      const interpretationMessage: Message = {
        id: Date.now() + 3,
        sender: "ai",
        text: `Saya telah memahami instruksi Anda. Saya akan membuat konten **${contentType}** untuk jurusan **${department}**. Berikut adalah preview konten yang akan dibuat:`,
      };

      const previewMessage: Message = {
        id: Date.now() + 4,
        sender: "ai",
        preview,
        showActions: true,
      };

      setMessages((current) => [...current, interpretationMessage, previewMessage]);
      setIsProcessing(false);
    }, 3000);
  }

  async function handlePublish(messageId: number, preview: NonNullable<Message["preview"]>) {
    if (publishedId === messageId) return;
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: preview.type === "Prestasi" ? "prestasi" : preview.type === "Pengumuman" ? "pengumuman" : "berita",
          title: preview.title,
          slug: `${generateSlug(preview.title)}-${Date.now()}`,
          excerpt: preview.excerpt,
          body: preview.body,
          imageUrl: preview.imageUrl,
          galleryUrls: [],
          isPublished: true,
          publishedAt: new Date().toISOString(),
          isFeatured: false,
          isHighlighted: false,
          isPopularOverride: false,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "Konten gagal diterbitkan.");
      setPublishedId(messageId);
      setPublishedPostId(result.data?.id ?? null);
      const successMessage: Message = {
        id: Date.now() + 100,
        sender: "ai",
        text: `Konten “${preview.title}” berhasil diterbitkan dan sudah tersimpan di Kelola Konten.`,
      };
      setMessages((current) => [...current, successMessage]);
    } catch (error) {
      const successMessage: Message = {
        id: Date.now() + 100,
        sender: "ai",
        text: error instanceof Error ? error.message : "Konten gagal diterbitkan.",
      };
      setMessages((current) => [...current, successMessage]);
    }
  }

  function handleExampleClick(prompt: string) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-[calc(100svh-7rem)] min-h-0 flex-col md:h-[calc(100svh-8.5rem)]">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-content-center rounded-xl bg-blue-700 text-white">
              <Bot className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-950">AI Content Assistant</h1>
              <p className="text-sm text-slate-500">Kelola konten dengan bahasa natural</p>
            </div>
          </div>
          <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
             Siap membantu
          </Badge>
        </div>
      </header>

      <div ref={messagesRef} className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-3", message.sender === "user" && "flex-row-reverse")}
            >
              {message.sender === "ai" && (
                <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-blue-700 text-white">
                  <Bot className="size-4" />
                </span>
              )}
              {message.sender === "user" && (
                <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-slate-700 text-white">
                  <MessageSquare className="size-4" />
                </span>
              )}

              <div className={cn("flex max-w-[85%] flex-col gap-3", message.sender === "user" && "items-end")}>
                {message.isTyping ? (
                  <div className="flex w-fit gap-1.5 rounded-2xl rounded-tl-sm bg-white px-5 py-3 shadow-sm">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="size-2 rounded-full bg-blue-500"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: dot * 0.12 }}
                      />
                    ))}
                  </div>
                ) : message.text ? (
                  <div
                    className={cn(
                      "rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
                      message.sender === "ai"
                        ? "rounded-tl-sm bg-white text-slate-700"
                        : "rounded-tr-sm bg-blue-700 text-white"
                    )}
                    dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                  />
                ) : null}

                {message.preview && (
                  <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <Badge variant="outline" className="flex items-center gap-1.5">
                        <FileText className="size-3" />
                        {message.preview.type}
                      </Badge>
                      <Badge variant="outline">{message.preview.department}</Badge>
                    </div>

                     {message.preview.imageUrl && (
                       <div className="relative mb-4 h-40 overflow-hidden rounded-xl bg-slate-100">
                         <Image src={message.preview.imageUrl} alt="Gambar konten" fill className="object-cover" sizes="600px" />
                         <div className="absolute inset-0 bg-linear-to-t from-slate-950/35 to-transparent" />
                       </div>
                     )}

                     <button type="button" className="text-left" onClick={() => { setSelectedPreview(message.preview ?? null); setShowFullPreview(false); }}>
                       <h3 className="text-lg font-bold leading-tight text-slate-950 hover:text-blue-700">{message.preview.title}</h3>
                     </button>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{message.preview.excerpt}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {message.preview.category}
                      </Badge>
                      <Badge className="bg-amber-50 text-xs text-amber-700 hover:bg-amber-50">Draft</Badge>
                    </div>

                    {message.showActions && publishedId !== message.id && (
                      <div className="mt-5 flex gap-2">
                         <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                           onClick={() => { setSelectedPreview(message.preview ?? null); setShowFullPreview(false); }}
                        >
                          <Eye className="size-4" />
                          Preview Detail
                        </Button>
                         <Button size="sm" className="flex-1 bg-blue-700 hover:bg-blue-600" onClick={() => message.preview && void handlePublish(message.id, message.preview)}>
                          <Check className="size-4" />
                          Publikasikan
                        </Button>
                      </div>
                    )}

                    {publishedId === message.id && (
                      <Alert className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-800">
                        <Check className="size-4" />
                         <AlertDescription>Konten berhasil diterbitkan{publishedPostId ? ` dengan ID #${publishedPostId}` : ""}.</AlertDescription>
                      </Alert>
                    )}
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
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleExampleClick(prompt)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="border-t bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl">
           <form onSubmit={handleSend} className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis instruksi untuk membuat konten..."
              disabled={isProcessing}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button type="submit" disabled={!input.trim() || isProcessing} className="bg-blue-700 hover:bg-blue-600">
              <Send className="size-4" />
              Kirim
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={Boolean(selectedPreview)} onOpenChange={(open) => { if (!open) setSelectedPreview(null); }}>
        <DialogContainer>
          <DialogContent className="relative flex h-[min(760px,92vh)] w-[min(1100px,95vw)] flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl">
            <DialogClose className="z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-900 shadow-md" />
            {selectedPreview && <div className="grid min-h-0 flex-1 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[220px] overflow-hidden bg-slate-900 lg:min-h-full"><Image src={selectedPreview.imageUrl || "/banner.jpeg"} alt={selectedPreview.title} fill className="object-cover brightness-90" sizes="45vw" /><div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/80 to-transparent p-7 pt-20 text-white"><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">{selectedPreview.category}</p><p className="mt-3 flex items-center gap-2 text-sm text-white/75"><CalendarDays className="size-4" />{selectedPreview.date}</p></div></div>
              <div className="flex min-h-0 flex-col p-6 sm:p-9"><div className="min-h-0 flex-1 overflow-y-auto pr-1"><div className="mb-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.13em] text-blue-800"><span className="rounded-full bg-blue-50 px-3 py-1.5">{selectedPreview.type}</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-500">{selectedPreview.department}</span></div><DialogTitle className="pr-8 text-3xl font-bold leading-tight text-slate-950">{selectedPreview.title}</DialogTitle><DialogDescription className="mt-5 text-sm leading-7 text-slate-600"><p className="text-lg font-medium leading-8 text-slate-700">{selectedPreview.excerpt}</p>{showFullPreview ? <div className="mt-6 space-y-4">{selectedPreview.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div> : <p className="mt-6">Konten ini telah disusun dan siap ditinjau sebelum diterbitkan.</p>}</DialogDescription></div><div className="mt-6 border-t border-slate-200 pt-5"><Button type="button" className="w-full bg-blue-700 hover:bg-blue-600" onClick={() => setShowFullPreview((current) => !current)}>{showFullPreview ? "Kembali ke Ringkasan" : "Lihat Detail Lengkap"}<ChevronRight className="size-4" /></Button></div></div>
            </div>}
          </DialogContent>
        </DialogContainer>
      </Dialog>
    </div>
  );
}
