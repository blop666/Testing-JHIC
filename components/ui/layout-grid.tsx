"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type LayoutGridCard = {
  id: number;
  content: React.ReactNode;
  className: string;
  thumbnail: string;
  alt?: string;
  title?: string;
  category?: string;
};

export const LayoutGrid = ({ cards, selectedCard, onSelectedCardChange }: { cards: LayoutGridCard[]; selectedCard?: LayoutGridCard | null; onSelectedCardChange?: (card: LayoutGridCard | null) => void }) => {
  const [internalSelected, setInternalSelected] = useState<LayoutGridCard | null>(null);
  const selected = selectedCard === undefined ? internalSelected : selectedCard;
  const [lastSelected, setLastSelected] = useState<LayoutGridCard | null>(null);

  const handleClick = (card: LayoutGridCard) => {
    setLastSelected(selected);
    setInternalSelected(card);
    onSelectedCardChange?.(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setInternalSelected(null);
    onSelectedCardChange?.(null);
  };

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleOutsideClick();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected]);

  const selectedModal = selected && typeof document !== "undefined"
    ? createPortal(
        <div className="fixed inset-0 z-[100] grid place-items-center p-3 sm:p-6">
          <motion.button
            type="button"
            aria-label="Tutup dialog"
            onClick={handleOutsideClick}
            className="absolute inset-0 h-full w-full cursor-default bg-slate-950/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <ExpandedCard selected={selected} onClose={handleOutsideClick} />
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div className="relative grid h-full min-h-0 min-w-0 w-full grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-3">
      {cards.map((card) => {
        const isSelected = selected?.id === card.id;
        const isLast = lastSelected?.id === card.id;
        return (
          <div key={card.id} className={cn("min-w-0 w-full", card.className)}>
            <motion.div
              onClick={() => handleClick(card)}
              className={cn(
                "group relative h-full min-h-0 w-full overflow-hidden",
                isSelected
                  ? "pointer-events-none h-full w-full opacity-0"
                  : cn("w-full rounded-xl bg-white", !isLast && "cursor-pointer"),
              )}
              layoutId={`card-${card.id}`}
            >
              <Thumbnail card={card} />
            </motion.div>
          </div>
        );
      })}

      </div>
      {selectedModal}
    </>
  );
};

function Thumbnail({ card }: { card: LayoutGridCard }) {
  return (
    <motion.div
      layoutId={`image-${card.id}-image`}
      className="absolute inset-0 h-full w-full"
    >
      <Image
        src={card.thumbnail}
        alt={card.alt ?? "thumbnail"}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover object-top transition duration-200"
      />
      <motion.div
        className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-slate-950/85 via-slate-950/15 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        initial={false}
      >
        <span className="w-fit rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1d4f98]">
          {card.category ?? "Prestasi"}
        </span>
        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-tight text-white sm:text-lg">
          {card.title}
        </h3>
      </motion.div>
    </motion.div>
  );
}

function ExpandedCard({
  selected,
  onClose,
}: {
  selected: LayoutGridCard | null;
  onClose: () => void;
}) {
  return (
    <motion.div
      layoutId={`card-${selected?.id}`}
      className="relative z-[101] grid h-[min(720px,calc(100vh-32px))] w-[min(1120px,calc(100vw-24px))] grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-[0_30px_90px_-30px_rgba(15,23,42,0.65)] sm:h-[min(720px,calc(100vh-64px))] sm:w-[min(1120px,calc(100vw-48px))] lg:grid-cols-[1.05fr_0.95fr]"
    >
      <motion.div
        layoutId={`image-${selected?.id}-image`}
        className="relative min-h-[260px] overflow-hidden bg-slate-900 lg:min-h-full"
      >
        <Image
          src={selected?.thumbnail ?? ""}
          alt={selected?.alt ?? "thumbnail"}
          fill
          sizes="(max-width: 1024px) 100vw, 48vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
      </motion.div>

      <button
        aria-label="Tutup dialog"
        className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-900 shadow-md transition-colors hover:bg-white"
        onClick={onClose}
        type="button"
      >
        <X className="h-5 w-5" />
      </button>

      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-10 flex min-h-0 flex-col overflow-y-auto p-6 sm:p-8 lg:p-12"
      >
        {selected?.content}
      </motion.div>
    </motion.div>
  );
}
