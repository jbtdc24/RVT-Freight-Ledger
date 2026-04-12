"use client";

import dynamic from "next/dynamic";

const AIChatbot = dynamic(
    () => import("./ai-chatbot").then((mod) => ({ default: mod.AIChatbot })),
    { ssr: false }
);

export function AIChatbotWrapper() {
    return <AIChatbot />;
}
