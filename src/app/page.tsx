"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

function ProjectCard({ href, image, title, description, subtitle, delay, onClick }: {
  href?: string;
  image?: string;
  title: string;
  description: string;
  subtitle: string;
  delay: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="gallery-item rounded-sm bg-[#e0dcd6] transition-transform duration-500 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            width={688}
            height={384}
            className="block w-full h-auto"
          />
        ) : (
          <div className="aspect-[16/9] flex items-center justify-center">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#bbb5ab]">
              {title}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[clamp(1.1rem,2.5vw,1.4rem)] font-light tracking-[-0.01em] font-display">
            {title}
          </h3>
          <span className="text-[10px] tracking-[0.15em] uppercase text-muted font-light group-hover:text-accent transition-colors whitespace-nowrap flex items-center gap-1">
            {subtitle}
            <span className="text-[0.9em]">↗</span>
          </span>
        </div>
        <p className="mt-0.5 text-[12px] font-light tracking-[0.05em] text-muted">
          {description}
        </p>
      </div>
    </>
  );

  return (
    <div className={`animate-fade-up ${delay}`}>
      {href ? (
        <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" className="group block">
          {content}
        </a>
      ) : onClick ? (
        <button onClick={onClick} className="group block text-left w-full cursor-pointer">
          {content}
        </button>
      ) : (
        <div className="group block">{content}</div>
      )}
    </div>
  );
}

function WaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setTimeout(onClose, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md mx-4 bg-background border border-border rounded-sm p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="0.75" />
          </svg>
        </button>

        <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-light tracking-[-0.02em] font-display mb-1">
          Undertone
        </h2>
        <p className="text-[12px] font-light tracking-[0.05em] text-muted mb-6">
          Join the waitlist to get early access.
        </p>

        {status === "success" ? (
          <div className="py-8 text-center">
            <p className="text-[clamp(1.1rem,2.5vw,1.4rem)] font-light font-display text-accent">
              You&apos;re on the list
            </p>
            <p className="mt-2 text-[12px] font-light tracking-[0.05em] text-muted">
              We&apos;ll be in touch soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-border bg-transparent px-3 py-2 text-[13px] font-light tracking-[0.02em] text-foreground placeholder:text-muted/60 outline-none focus:border-accent transition-colors rounded-sm"
            />
            {status === "error" && (
              <p className="text-[11px] font-light tracking-[0.05em] text-red-500">
                {errorMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full border border-accent bg-accent text-white py-2 text-[12px] font-light tracking-[0.15em] uppercase transition-all hover:bg-transparent hover:text-accent disabled:opacity-50 cursor-pointer rounded-sm"
            >
              {status === "loading" ? "Submitting..." : "Join Waitlist"}
            </button>
          </form>
        )}
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
  const [showWaitlist, setShowWaitlist] = useState(false);
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
              <a href="https://www.linkedin.com/in/martin-leung/" target="_blank" rel="noopener noreferrer" className="text-accent transition-all hover:underline hover:decoration-accent">Martin Leung</a>
              {" & "}
              <a href="https://www.linkedin.com/in/nathanksou/" target="_blank" rel="noopener noreferrer" className="text-accent transition-all hover:underline hover:decoration-accent">Nathan Sou</a>
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Scroll-down arrow */}
        <button
          onClick={() => scrollToSection("projects")}
          className="animate-fade-up delay-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-accent transition-all duration-300 hover:border-accent"
          aria-label="Scroll to projects"
        >
          <ArrowIcon direction="down" />
        </button>

        <div className="flex-1" />
      </section>

      {/* Divider */}
      <div className="mx-6 md:mx-10">
        <div className="line-expand" />
      </div>

      {/* Projects */}
      <section id="projects" className="px-6 py-12 md:px-10 md:py-16">
        <div className="animate-fade-up delay-3 mb-10">
          <h2 className="mt-3 text-[clamp(2rem,5vw,4rem)] font-light leading-[1.1] tracking-[-0.02em] font-display text-center">
            projects
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <ProjectCard
            href="mailto:nathan@climbingcat.dev"
            image="/climbing-cat.webp"
            title="Climbing Cat"
            description="An AI-native agency"
            subtitle="contact us"
            delay="delay-3"
          />
          <ProjectCard
            href="https://playground.climbingcat.dev"
            image="/hakus-playground.webp"
            title="Haku's Playground"
            description="A playful guide to AI"
            subtitle="learn more"
            delay="delay-4"
          />
          <ProjectCard
            image="/undertone.webp"
            title="Undertone"
            description="Your inner voice, illuminated"
            subtitle="coming soon — join the waitlist"
            delay="delay-5"
            onClick={() => setShowWaitlist(true)}
          />
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
        className={`fixed bottom-6 right-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-accent transition-all duration-300 hover:border-accent ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowIcon direction="up" />
      </button>

      {showWaitlist && <WaitlistModal onClose={() => setShowWaitlist(false)} />}
    </div>
  );
}
