"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds (e.g., 100, 200, 300)
  duration?: number; // Transition duration in milliseconds (default: 700ms)
  yOffset?: number; // Upward translation distance in pixels (default: 24px)
  threshold?: number; // Intersection threshold (default: 0.05)
  rootMargin?: string; // Intersection rootMargin (default: "0px 0px -20px 0px")
  style?: React.CSSProperties;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 700,
  yOffset = 24,
  threshold = 0.05,
  rootMargin = "0px 0px -20px 0px",
  style = {},
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Accessibility: instantly reveal if user prefers reduced motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsVisible(true);
      return;
    }

    // 2. Fallback: instantly reveal if IntersectionObserver is not supported
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const node = elementRef.current;
    if (!node) return;

    // 3. Initial viewport check: Elements already in view upon mount (e.g. Home section)
    const checkInView = () => {
      const rect = node.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < windowHeight - 10 && rect.bottom > 10;
    };

    if (checkInView()) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return;
    }

    // 4. Primary scroll-reveal observer (triggers as user scrolls to each section)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    // 5. Secondary fallback: Passive scroll check to ensure every section triggers reliably on scroll
    const handleScrollCheck = () => {
      if (checkInView()) {
        setIsVisible(true);
        observer.unobserve(node);
        window.removeEventListener("scroll", handleScrollCheck);
        window.removeEventListener("resize", handleScrollCheck);
      }
    };

    window.addEventListener("scroll", handleScrollCheck, { passive: true });
    window.addEventListener("resize", handleScrollCheck, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollCheck);
      window.removeEventListener("resize", handleScrollCheck);
    };
  }, [threshold, rootMargin]);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal ${className}`}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0px)" : `translateY(${yOffset}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
