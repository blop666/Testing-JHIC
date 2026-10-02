"use client";

import { useState } from "react";

const MAP_EMBED_URL =
  "https://www.google.com/maps?q=Jl.%20Raya%20Karadenan%20No.7%2C%20Karadenan%2C%20Kec.%20Cibinong%2C%20Kabupaten%20Bogor%2C%20Jawa%20Barat%2016111&output=embed";

const MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=Jl.+Raya+Karadenan+No.7,+Karadenan,+Kec.+Cibinong,+Kabupaten+Bogor,+Jawa+Barat+16111";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://web.facebook.com/smknegeri1cibinong",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "https://twitter.com/smkn1cbn",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/c/SMKN1Cibinong_Official",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/smkn1cbn_official/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
];

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#101828] placeholder-[#98A2B3] outline-none transition-colors focus:border-[#155DFC] focus:ring-0";

const labelClass = "mb-2 block text-sm font-medium text-[#364153]";

export function ContactFooter() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = (await response.json()) as { success?: boolean; error?: { message?: string; details?: Array<{ field: string; message: string }> } };
      if (!response.ok || !result.success) {
        const detail = (result.error?.details ?? []).map((d) => d.message).join(" ");
        setErrorMessage(detail || result.error?.message || "Gagal mengirim pesan.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setErrorMessage("Gagal mengirim pesan. Periksa koneksi Anda.");
      setStatus("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 lg:px-14">
        <div data-aos="fade-up" className="mb-8 md:mb-12">
          <h1 className="text-3xl font-bold text-[#1C398E] md:text-5xl">Hubungi Kami</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#364153] md:text-lg">
            Ada pertanyaan seputar pendaftaran, program keahlian, atau kerja sama? Hubungi kami melalui form atau kontak di bawah ini.
          </p>
          <p className="mt-2 text-sm font-medium text-[#364153] md:text-base">Senin–Jumat, 07.00–15.00 WIB</p>
        </div>

        {/* Peta */}
        <div data-aos="fade-up" className="overflow-hidden rounded-xl border border-[#E5E7EB]">
          <iframe
            title="Lokasi SMKN 1 Cibinong"
            src={MAP_EMBED_URL}
            className="h-[320px] w-full md:h-[440px] lg:h-[480px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#155DFC] transition hover:underline"
        >
          Buka di Google Maps
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </a>

        {/* Info Kontak + Form */}
        <div className="mt-8 grid grid-cols-1 gap-10 md:mt-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div data-aos="fade-up" className="space-y-8">
            <div className="space-y-5 text-sm text-[#364153]">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-content-center rounded-full bg-[#EFF6FF] text-[#155DFC]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-[#101828]">Alamat</p>
                  <p className="mt-1 leading-relaxed">Jl. Raya Karadenan No.7, Karadenan, Kec. Cibinong, Kabupaten Bogor, Jawa Barat 16111</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-content-center rounded-full bg-[#EFF6FF] text-[#155DFC]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-[#101828]">Telepon</p>
                  <a href="tel:+622518663846" className="mt-1 inline-block text-[#155DFC] transition hover:underline">(+62) 2518663 846</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-content-center rounded-full bg-[#EFF6FF] text-[#155DFC]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-[#101828]">Email</p>
                  <a href="mailto:smkn1cibinongbgr@gmail.com" className="mt-1 inline-block break-all text-[#155DFC] transition hover:underline">smkn1cibinongbgr@gmail.com</a>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#101828]">Media Sosial</p>
              <div className="mt-3 flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid size-10 place-content-center rounded-full bg-[#EFF6FF] text-[#155DFC] transition hover:bg-[#155DFC] hover:text-white"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <a
              href="https://wa.me/622518663846"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f4bc8]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Chat WhatsApp
            </a>
          </div>

          <form onSubmit={handleSubmit} data-aos="fade-up" data-aos-delay="100" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>Nama Lengkap</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama Anda"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@example.com"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="subject" className={labelClass}>Perihal</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Pilih perihal</option>
                <option value="informasi-pendaftaran">Informasi Pendaftaran</option>
                <option value="informasi-jurusan">Informasi Jurusan</option>
                <option value="kerjasama">Kerja Sama</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className={labelClass}>Pesan</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Tulis pesan Anda di sini..."
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f4bc8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                  <path d="m21.854 2.147-10.94 10.939" />
                </svg>
                {status === "sending" ? "Mengirim..." : "Kirim Pesan"}
              </button>
            </div>
            {status === "sent" && (
              <p className="sm:col-span-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Terima kasih! Pesan Anda telah dikirim.</p>
            )}
            {status === "error" && (
              <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorMessage}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
