"use client"

import React, { useRef, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
} from "framer-motion"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type ImageItem = {
  id: number | string
  title: string
  desc: string
  url: string
  span: string
}

interface InteractiveImageBentoGalleryProps {
  imageItems: ImageItem[]
  title: string
  description: string
  autoPlay?: boolean
  autoPlaySpeed?: number
  pauseOnHover?: boolean
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 18 },
  },
}

const ImageModal = ({
  item,
  onClose,
}: {
  item: ImageItem
  onClose: () => void
}) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative flex h-full w-full max-w-6xl items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.url}
          alt={item.title}
          className="max-h-[88vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
        />
      </motion.div>
      <button
        onClick={onClose}
        className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-black/35 text-white transition-colors hover:bg-black/55 sm:right-8 sm:top-8"
        aria-label="Close image view"
      >
        <X size={24} />
      </button>
    </motion.div>,
    document.body,
  )
}

const InteractiveImageBentoGallery: React.FC<
  InteractiveImageBentoGalleryProps
> = ({ 
  imageItems, 
  title, 
  description,
  autoPlay = false,
  autoPlaySpeed = 1.5,
  pauseOnHover = true,
}) => {
  const [selectedItem, setSelectedItem] = useState<ImageItem | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const reduceMotion = useReducedMotion()

  const duplicatedItems = [...imageItems, ...imageItems, ...imageItems, ...imageItems]

  useEffect(() => {
    if (!autoPlay || isHovered || isDragging || reduceMotion) return

    let animationFrameId: number
    const speed = 1 * autoPlaySpeed

    const scroll = () => {
      const currentX = x.get()
      const newX = currentX - speed

      const singleSetWidth = gridRef.current ? gridRef.current.scrollWidth / 4 : 0

       if (singleSetWidth > 0 && newX <= -singleSetWidth) {
         x.set(newX + singleSetWidth)
      } else {
        x.set(newX)
      }

      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [autoPlay, isHovered, isDragging, autoPlaySpeed, reduceMotion, x])

  useEffect(() => {
    if (!selectedItem) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selectedItem])

  return (
    <section
      ref={targetRef}
      className="relative w-full overflow-hidden bg-background py-16 sm:py-24"
    >
      <div className="container mx-auto px-4 text-center">
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-4"
          >
            {title}
          </motion.h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          {description}
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative mt-12 w-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseEnter={() => pauseOnHover && setIsHovered(true)}
        onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      >
        <motion.div
          className="w-max"
          style={{ x }}
            drag={reduceMotion ? false : "x"}
            dragConstraints={{ left: -10000, right: 0 }}
            dragElastic={0.05}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => {
            setIsDragging(false)
            const currentX = x.get()
            const singleSetWidth = gridRef.current ? gridRef.current.scrollWidth / 4 : 0
            
            if (singleSetWidth > 0) {
              if (currentX > 0) {
                x.set(0)
              } else if (Math.abs(currentX) >= singleSetWidth) {
                const normalizedPosition = -(Math.abs(currentX) % singleSetWidth)
                x.set(normalizedPosition)
              }
            }
          }}
        >
          <motion.div
            ref={gridRef}
            className="grid grid-flow-col grid-rows-1 auto-cols-[12rem] auto-rows-[12rem] gap-2 px-2 md:grid-flow-col-dense md:grid-rows-2 md:auto-cols-[15rem] md:auto-rows-[11rem] md:gap-3 md:px-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {duplicatedItems.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                variants={itemVariants}
                className={cn(
                  "group relative flex h-full w-full cursor-pointer items-end overflow-hidden bg-white/5 backdrop-blur-md p-4 shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
                  item.span,
                )}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => setSelectedItem(item)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedItem(item)}
                tabIndex={0}
                aria-label={`View ${item.title}`}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}

export default InteractiveImageBentoGallery
