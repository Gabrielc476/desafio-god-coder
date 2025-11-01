'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Aqui definimos o estado que será puramente do lado do cliente.
// O histórico do chat é um bom candidato.
import { ChatMessage } from '@/lib/types';

interface GlobalState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

// O React 19 permite um valor padrão 'undefined' se checarmos
const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <GlobalStateContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        chatHistory,
        setChatHistory,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}

// Hook customizado para facilitar o acesso ao contexto
export function useGlobalState() {
  // O hook 'use' do React 19 simplifica o consumo de contexto
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState deve ser usado dentro de um GlobalStateProvider');
  }
  return context;
}

