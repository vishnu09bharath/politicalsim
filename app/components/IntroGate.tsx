"use client";

import { useState, ReactNode } from "react";
import VideoIntro from "./VideoIntro";

export default function IntroGate({ children }: { children: ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && <VideoIntro onComplete={() => setShowIntro(false)} />}
      {children}
    </>
  );
}
