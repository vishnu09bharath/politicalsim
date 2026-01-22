"use client";

import { useState, useEffect, useRef } from "react";

export default function VideoIntro({ onComplete }: { onComplete: () => void }) {
  const [isFadingIn, setIsFadingIn] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add("intro-active");
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("intro-active");
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      // Show first frame, fade in, then play
      setIsVideoVisible(true);
      setIsFadingIn(false);
      setTimeout(() => {
        video.play();
      }, 500);
    };

    video.addEventListener("canplay", handleCanPlay);
    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  useEffect(() => {
    let tapCount = 0;
    let resetTimer: number | undefined;

    const reset = () => {
      tapCount = 0;
      if (resetTimer) {
        window.clearTimeout(resetTimer);
        resetTimer = undefined;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "l") {
        tapCount += 1;
        if (tapCount >= 3) {
          finishIntro();
          reset();
          return;
        }
        if (resetTimer) window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(reset, 800);
      } else {
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (resetTimer) window.clearTimeout(resetTimer);
    };
  }, []);

  const finishIntro = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      document.body.classList.remove("intro-active");
      onComplete();
    }, 1500);
  };

  const handleVideoEnd = () => {
    finishIntro();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity ${
        isFadingOut ? "opacity-0 duration-1500" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        className={`h-full w-full object-cover transition-opacity duration-2000 ${
          isVideoVisible && !isFadingIn ? "opacity-100" : "opacity-0"
        }`}
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
