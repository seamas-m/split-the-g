"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxImage {
  src: string;
  alt: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  onClose: () => void;
}

const SWIPE_X_THRESHOLD = 60;  // px horizontal swipe to navigate
const SWIPE_Y_THRESHOLD = 100; // px vertical swipe to dismiss

export default function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDist = useRef<number | null>(null);

  const current = images[index];
  const canNav = images.length > 1;

  // Fade in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 240);
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft" && canNav) setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight" && canNav) setIndex((i) => Math.min(images.length - 1, i + 1));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleClose, canNav, images.length]);

  // Reset scale when navigating
  useEffect(() => { setScale(1); }, [index]);

  function getPinchDist(e: React.TouchEvent) {
    if (e.touches.length < 2) return null;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function onTouchStart(e: React.TouchEvent) {
    lastPinchDist.current = getPinchDist(e);
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setIsDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!touchStart.current) return;

    // Pinch to zoom
    if (e.touches.length === 2) {
      const dist = getPinchDist(e)!;
      if (lastPinchDist.current) {
        const ratio = dist / lastPinchDist.current;
        setScale((s) => Math.min(4, Math.max(1, s * ratio)));
      }
      lastPinchDist.current = dist;
      return;
    }

    // Swipe down to dismiss — only when not zoomed in
    if (scale === 1) {
      const dy = e.touches[0].clientY - touchStart.current.y;
      if (dy > 0) setDragY(dy);
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    setIsDragging(false);
    lastPinchDist.current = null;

    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current.x;
    const dy = (e.changedTouches[0]?.clientY ?? 0) - touchStart.current.y;
    touchStart.current = null;

    // Dismiss on swipe down
    if (scale === 1 && dy > SWIPE_Y_THRESHOLD && Math.abs(dx) < 80) {
      handleClose();
      return;
    }

    setDragY(0);

    // Navigate on horizontal swipe
    if (scale === 1 && canNav && Math.abs(dx) > SWIPE_X_THRESHOLD && Math.abs(dy) < 60) {
      if (dx < 0) setIndex((i) => Math.min(images.length - 1, i + 1));
      else setIndex((i) => Math.max(0, i - 1));
    }
  }

  const dragOpacity = Math.max(0, 1 - dragY / 280);
  const transition = isDragging ? "none" : "transform 240ms ease, opacity 240ms ease";

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{
        backgroundColor: `rgba(8, 4, 2, ${visible ? dragOpacity * 0.96 : 0})`,
        transition: isDragging ? "none" : "background-color 240ms ease",
      }}
      onClick={handleClose}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-porter/80 text-cream hover:bg-porter transition-colors"
        aria-label="Close"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 240ms ease" }}
      >
        <X size={20} />
      </button>

      {/* Prev arrow */}
      {canNav && index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex((i) => i - 1); }}
          className="absolute left-3 z-10 p-2 rounded-full bg-porter/80 text-cream hover:bg-porter transition-colors"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 240ms ease" }}
          aria-label="Previous"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Next arrow */}
      {canNav && index < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndex((i) => i + 1); }}
          className="absolute right-3 z-10 p-2 rounded-full bg-porter/80 text-cream hover:bg-porter transition-colors"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 240ms ease" }}
          aria-label="Next"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Dot indicators */}
      {canNav && (
        <div
          className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 pointer-events-none"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 240ms ease" }}
        >
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === index ? "w-4 bg-cream" : "w-1.5 bg-cream/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* Image */}
      <div
        className="relative w-full mx-4"
        style={{
          maxWidth: 512,
          maxHeight: "90vh",
          height: "90vh",
          transform: `translateY(${dragY}px) scale(${visible ? 1 : 0.94}) scale(${scale})`,
          opacity: visible ? dragOpacity : 0,
          transition,
          transformOrigin: "center center",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={current.src}
          alt={current.alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 512px"
          draggable={false}
        />
      </div>
    </div>,
    document.body
  );
}
