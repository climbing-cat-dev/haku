"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GALLERY_ITEMS = [
  { id: "haku-resting", label: "Haku resting", aspect: "aspect-[4/3]", bg: "bg-[#ddd8d0]", span: "col-span-12 md:col-span-7", delay: "delay-3" },
  { id: "portrait", label: "Portrait", aspect: "aspect-[3/4]", bg: "bg-[#e2dfd9]", span: "col-span-12 md:col-span-5", delay: "delay-4" },
  { id: "exploring", label: "Exploring", aspect: "aspect-square", bg: "bg-[#d5d2cc]", span: "col-span-6 md:col-span-4", delay: "delay-5" },
  { id: "sunlight", label: "Sunlight", aspect: "aspect-square", bg: "bg-[#e8e5df]", span: "col-span-6 md:col-span-4", delay: "delay-6" },
  { id: "window", label: "Window", aspect: "aspect-[4/3]", bg: "bg-[#dbd7d1]", span: "col-span-12 md:col-span-4", delay: "delay-7" },
  { id: "panoramic", label: "Panoramic", aspect: "aspect-[21/9]", bg: "bg-[#e0dcd6]", span: "col-span-12", delay: "delay-7" },
] as const;

function GalleryItem({ label, aspect, bg, span, delay }: Omit<(typeof GALLERY_ITEMS)[number], "id">) {
  return (
    <div className={`animate-fade-up ${delay} ${span}`}>
      <div className={`gallery-item ${aspect} rounded-sm ${bg} transition-transform duration-500`}>
        <div className="flex h-full items-center justify-center">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#bbb5ab]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function ArrowIcon({ direction }: { direction: "up" | "down" }) {
  const path = direction === "down"
    ? "M7 1V13M7 13L1 7M7 13L13 7"
    : "M7 13V1M7 1L1 7M7 1L13 7";

  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d={path} stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const SCROLL_THRESHOLD_RATIO = 0.5;

export default function Home() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const animationFrameRef = useRef(0);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      setShowBackToTop(window.scrollY > window.innerHeight * SCROLL_THRESHOLD_RATIO);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [onScroll]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section id="top" className="flex h-screen flex-col items-center px-6">
        {/* Pushes title to ~upper third */}
        <div className="h-[28vh]" />

        <div className="flex flex-col items-center">
          <div className="animate-fade-up delay-1">
            <div className="red-rule mx-auto mb-10" />
          </div>
          <h1 className="animate-fade-up delay-2 text-center text-[clamp(4rem,12vw,11rem)] font-light leading-[0.85] tracking-[-0.03em] text-foreground font-display">
            climbing{" "}
            <span className="bg-accent px-[0.1em] text-white">cat</span>
          </h1>
        </div>

        <div className="flex-1" />

        {/* Tagline + credits */}
        <div className="mb-[12vh] flex flex-col items-center">
          <p className="animate-fade-up delay-3 text-[24px] font-light tracking-[0.25em] uppercase text-muted">
            building apps that land on their feet
          </p>

          <div className="animate-fade-up delay-4 mt-4 flex flex-col items-center gap-2 md:flex-row md:gap-6">
            <span className="text-[24px] font-light tracking-[0.15em] text-muted">
              by{" "}
              <a href="https://www.linkedin.com/in/martin-leung/" target="_blank" rel="noopener noreferrer" className="underline decoration-accent transition-colors hover:text-accent">Martin Leung</a>
              {" & "}
              <a href="https://www.linkedin.com/in/nathanksou/" target="_blank" rel="noopener noreferrer" className="underline decoration-accent transition-colors hover:text-accent">Nathan Sou</a>
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Scroll-down arrow */}
        <button
          onClick={() => scrollToSection("gallery")}
          className="animate-fade-up delay-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted transition-all duration-300 hover:border-accent hover:text-accent"
          aria-label="Scroll to gallery"
        >
          <ArrowIcon direction="down" />
        </button>

        <div className="flex-1" />
      </section>

      {/* Divider */}
      <div className="mx-6 md:mx-10">
        <div className="line-expand" />
      </div>

      {/* Gallery */}
      <section id="gallery" className="px-6 py-16 md:px-10 md:py-20">
        <div className="animate-fade-up delay-3 mb-16">
          <h2 className="mt-3 text-[clamp(2rem,5vw,4rem)] font-light leading-[1.1] tracking-[-0.02em] font-display">
            gallery
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-3 md:gap-4">
          {GALLERY_ITEMS.map(({ id, ...item }) => (
            <GalleryItem key={id} {...item} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-6 mt-4 md:mx-10 md:mt-6">
        <div className="h-px bg-border" />
      </div>

      {/* Footer */}
      <footer className="px-6 pb-12 pt-8 text-right md:px-10 md:pb-16 md:pt-10">
        <span className="text-[11px] font-light tracking-[0.15em] text-muted">
          © 2026 Climbing Cat, LLC
        </span>
      </footer>

      {/* Back to top */}
      <button
        onClick={() => scrollToSection("top")}
        className={`fixed bottom-6 right-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted transition-all duration-300 hover:border-accent hover:text-accent ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowIcon direction="up" />
      </button>
    </div>
  );
}
