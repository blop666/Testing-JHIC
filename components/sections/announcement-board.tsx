import { ArrowUpRight, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Announcement = {
  title: string;
  excerpt: string;
  date: Date | null;
  image: string;
  label: string;
  slug: string;
};

const fallbackAnnouncements: Announcement[] = [
  { title: "Daftar Ulang Peserta Didik Baru", excerpt: "Informasi daftar ulang peserta didik baru tahun ajaran 2026/2027.", date: new Date(2026, 7, 20), image: "/smkn-hero-banner.webp", label: "Penting", slug: "daftar-ulang-peserta-didik-baru" },
  { title: "Pembagian Kelas Tahun Ajaran 2026/2027", excerpt: "Pengumuman pembagian kelas untuk seluruh siswa.", date: new Date(2026, 7, 18), image: "", label: "Akademik", slug: "pembagian-kelas-2026" },
  { title: "Jadwal Masa Pengenalan Lingkungan Sekolah", excerpt: "Jadwal resmi kegiatan MPLS siswa baru.", date: new Date(2026, 7, 15), image: "", label: "Kesiswaan", slug: "jadwal-mpls-2026" },
  { title: "Pengambilan Kartu Pelajar Siswa Baru", excerpt: "Jadwal pengambilan kartu pelajar siswa baru.", date: new Date(2026, 7, 12), image: "/hero-banner.webp", label: "Administrasi", slug: "pengambilan-kartu-pelajar" },
];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function AnnouncementBoard({ items }: { items?: Announcement[] }) {
  const announcements = items && items.length ? items : fallbackAnnouncements;
  const featured = announcements[0];
  const rest = announcements.slice(1, 4);

  return (
    <section className="relative z-10 bg-[#eef5ff] px-4 py-20 text-slate-950 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-5 md:mb-10">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Pengumuman</h2>
          </div>
          <Link href="/berita?kategori=Pengumuman" className="hidden items-center gap-2 text-sm text-slate-600 transition hover:text-blue-700 sm:inline-flex">
            Lihat semua <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-[7fr_5fr]">
          <article className="relative overflow-hidden rounded-3xl bg-blue-700 p-6 text-white md:min-h-[520px] md:p-10">
            {featured.image ? (
              <>
                <Image src={featured.image} alt="" fill loading="lazy" decoding="async" quality={55} sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/65 to-blue-900/20" />
              </>
            ) : (
              <div className="absolute -right-20 -top-20 size-72 rounded-full bg-sky-300/20 blur-2xl" />
            )}
            <div className="relative flex h-full min-h-72 flex-col">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">{featured.label}</span>
                <Bell className="size-6 text-blue-200" />
              </div>
              <div className="mt-auto pt-16">
                {featured.date && (
                  <p className="text-sm text-blue-100">
                    {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(featured.date)}
                  </p>
                )}
                <h3 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] md:text-5xl">{featured.title}</h3>
                <Link href={`/berita/${featured.slug}`} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                  Baca pengumuman <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </article>

          <div className="grid gap-4">
            {rest.map((item) => {
              const day = item.date ? String(item.date.getDate()).padStart(2, "0") : "--";
              const month = item.date ? monthNames[item.date.getMonth()] : "";
              return (
                <article key={item.slug} className="relative min-h-40 overflow-hidden rounded-3xl bg-blue-700 text-white">
                  {item.image ? (
                    <>
                      <Image src={item.image} alt="" fill loading="lazy" decoding="async" quality={55} sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/75 to-blue-900/30" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
                  )}
                  <div className="relative flex min-h-40 items-center gap-5 p-5 md:p-6">
                    <span className="grid size-14 shrink-0 place-content-center rounded-2xl bg-white/15 text-center backdrop-blur-sm">
                      <strong className="text-xl leading-none">{day}</strong><small className="mt-1 text-[10px] uppercase">{month}</small>
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-blue-200">{item.label}</span>
                      <h3 className="mt-1 text-lg font-semibold leading-snug">{item.title}</h3>
                    </div>
                    <Link href={`/berita/${item.slug}`} aria-label={`Baca ${item.title}`} className="ml-auto grid size-10 shrink-0 place-content-center rounded-full bg-white text-blue-700 transition hover:bg-blue-50">
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <Link href="/berita?kategori=Pengumuman" className="mt-5 flex items-center justify-center gap-2 rounded-full border border-blue-200 py-3 text-sm font-semibold text-blue-700 sm:hidden">
          Semua pengumuman <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
