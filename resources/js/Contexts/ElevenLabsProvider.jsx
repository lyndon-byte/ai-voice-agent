import { createContext, useContext, useState } from "react";

const ElevenLabsContext = createContext();

export function ElevenLabsProvider({ children }) {
  const [agentId, setAgentId] = useState("");
  const [config, setConfig] = useState(null);
  
  return (
    <ElevenLabsContext.Provider
      value={{
        agentId,
        setAgentId,
        config,
        setConfig,
      }}
    >
      {children}
    </ElevenLabsContext.Provider>
  );
}

export function useElevenLabs() {
  return useContext(ElevenLabsContext);
}