import { useEffect, useRef } from "react";
import { useElevenLabs } from "@/Contexts/ElevenLabsProvider";

export default function ElevenLabsWidget() {
  const ref = useRef(null);
  const { agentId, config } = useElevenLabs();

  // Load script once
  useEffect(() => {
    if (
      !document.querySelector(
        'script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]'
      )
    ) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Apply config only when provided
  useEffect(() => {
    if (config && ref.current) {
      ref.current.setAttribute(
        "override-config",
        JSON.stringify(config)
      );
    }
  }, [config]);

  return (
    <elevenlabs-convai
      override-language="en"
      agent-id={agentId}
      {...(config ? { ref } : {})}
    />
  );
}