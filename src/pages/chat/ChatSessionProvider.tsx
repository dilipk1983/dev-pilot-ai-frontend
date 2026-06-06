import type { ReactNode } from "react";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import useAuth from "../../auth/useAuth";

export interface Message {
  sender: "user" | "ai";
  text: string;
}

interface ChatPayloadMessage {
  role: string;
  content: string;
}

interface SavedChatSessionSummary {
  id: number;
  name: string;
  created: string;
  messageCount: number;
}

interface SavedChatSessionDetail {
  id: number;
  name: string;
  created: string;
  messages: ChatPayloadMessage[];
}

interface LocalChatDraft {
  name: string;
  messages: Message[];
  sourceSessionId?: number;
  updatedAt: string;
}

interface HistoryItem {
  id: number;
  title: string;
}

interface ChatSessionContextValue {
  messages: Message[];
  input: string;
  sessionName: string;
  isSending: boolean;
  syncing: boolean;
  saving: boolean;
  isHistoryOpen: boolean;
  isBootstrapping: boolean;
  showSessionPicker: boolean;
  currentSavedSessionId: number | null;
  savedSessions: SavedChatSessionSummary[];
  savedSessionsLoading: boolean;
  loadingSessionId: number | null;
  deletingSessionId: number | null;
  localDraft: LocalChatDraft | null;
  hasUnsavedChanges: boolean;
  syncStatus: string | null;
  saveStatus: string | null;
  historyItems: HistoryItem[];
  setInput: (value: string) => void;
  updateSessionName: (value: string) => void;
  setIsHistoryOpen: (value: boolean) => void;
  startNewChat: () => void;
  resumeLocalDraft: () => void;
  loadSavedSession: (sessionId: number, closePicker?: boolean) => Promise<void>;
  deleteSavedSession: (sessionId: number) => Promise<void>;
  handleSyncData: () => Promise<void>;
  handleSave: () => Promise<void>;
  handleSend: () => Promise<void>;
}

const DEFAULT_SESSION_NAME = "New Chat";

function getDraftStorageKey(userId?: number): string {
  return `ai-chat-draft:${userId ?? "anonymous"}`;
}

function getSuggestedSessionName(messages: Message[]): string {
  const firstUserMessage = messages.find((message) => message.sender === "user")?.text.trim();
  if (!firstUserMessage) {
    return DEFAULT_SESSION_NAME;
  }
  return firstUserMessage.length > 50 ? `${firstUserMessage.slice(0, 50)}...` : firstUserMessage;
}

function toApiMessages(messages: Message[]): ChatPayloadMessage[] {
  return messages.map((message) => ({
    role: message.sender === "user" ? "user" : "ai",
    content: message.text,
  }));
}

function fromApiMessages(messages: ChatPayloadMessage[]): Message[] {
  return messages.map((message) => ({
    sender: message.role === "user" ? "user" : "ai",
    text: message.content,
  }));
}

export const ChatSessionContext = createContext<ChatSessionContextValue | undefined>(undefined);

type ChatSessionProviderProps = {
  children: ReactNode;
};

const ChatSessionProvider = ({ children }: ChatSessionProviderProps): React.ReactElement => {
  const { getAuthToken, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInputState] = useState("");
  const [sessionName, setSessionName] = useState(DEFAULT_SESSION_NAME);
  const [isSending, setIsSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  const [currentSavedSessionId, setCurrentSavedSessionId] = useState<number | null>(null);
  const [savedSessions, setSavedSessions] = useState<SavedChatSessionSummary[]>([]);
  const [savedSessionsLoading, setSavedSessionsLoading] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState<number | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null);
  const [localDraft, setLocalDraft] = useState<LocalChatDraft | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const draftStorageKey = getDraftStorageKey(user?.userId);

  const setInput = (value: string): void => {
    setInputState(value);
  };

  const updateSessionName = (value: string): void => {
    setSessionName(value);
    if (messages.length > 0) {
      setHasUnsavedChanges(true);
    }
  };

  const fetchSavedSessions = useCallback(async (): Promise<SavedChatSessionSummary[]> => {
    const authToken = getAuthToken?.();
    if (!authToken) {
      return [];
    }

    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const response = await fetch(`${apiBaseUrl}/api/chat/sessions`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.detail || "Unable to fetch saved chat sessions.");
    }

    return response.json();
  }, [getAuthToken]);

  const startNewChat = (): void => {
    setMessages([]);
    setInputState("");
    setSessionName(DEFAULT_SESSION_NAME);
    setCurrentSavedSessionId(null);
    setHasUnsavedChanges(false);
    setSaveStatus(null);
    setShowSessionPicker(false);
    setIsHistoryOpen(false);
    localStorage.removeItem(draftStorageKey);
    setLocalDraft(null);
  };

  const resumeLocalDraft = (): void => {
    if (!localDraft) {
      startNewChat();
      return;
    }

    setMessages(localDraft.messages);
    setSessionName(localDraft.name || getSuggestedSessionName(localDraft.messages));
    setCurrentSavedSessionId(localDraft.sourceSessionId ?? null);
    setHasUnsavedChanges(true);
    setShowSessionPicker(false);
  };

  const loadSavedSession = async (sessionId: number, closePicker = false): Promise<void> => {
    const authToken = getAuthToken?.();
    if (!authToken) {
      toast.error("Please login again to load saved chats.", { theme: "colored" });
      return;
    }

    setLoadingSessionId(sessionId);
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiBaseUrl}/api/chat/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Unable to load saved chat.");
      }

      const session: SavedChatSessionDetail = await response.json();
      setMessages(fromApiMessages(session.messages));
      setSessionName(session.name || DEFAULT_SESSION_NAME);
      setCurrentSavedSessionId(session.id);
      setHasUnsavedChanges(false);
      setInputState("");
      if (closePicker) {
        setShowSessionPicker(false);
      }
      setIsHistoryOpen(false);
      setSaveStatus(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load saved chat.", { theme: "colored" });
    } finally {
      setLoadingSessionId(null);
    }
  };

  const deleteSavedSession = async (sessionId: number): Promise<void> => {
    const authToken = getAuthToken?.();
    if (!authToken) {
      toast.error("Please login again to delete saved chats.", { theme: "colored" });
      return;
    }

    setDeletingSessionId(sessionId);
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiBaseUrl}/api/chat/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Unable to delete saved chat.");
      }

      const updatedSessions = savedSessions.filter((session) => session.id !== sessionId);
      setSavedSessions(updatedSessions);

      if (currentSavedSessionId === sessionId) {
        setMessages([]);
        setInputState("");
        setSessionName(DEFAULT_SESSION_NAME);
        setCurrentSavedSessionId(null);
        setHasUnsavedChanges(false);
      }

      if (!localDraft?.messages.length && updatedSessions.length === 0) {
        setShowSessionPicker(false);
      }

      toast.success("Chat session deleted.", { theme: "colored" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete saved chat.", { theme: "colored" });
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleSyncData = async (): Promise<void> => {
    setSyncing(true);
    setSyncStatus(null);

    const authToken = getAuthToken?.();
    if (!authToken) {
      setSyncStatus("Please login again to sync data.");
      setSyncing(false);
      return;
    }

    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiBaseUrl}/api/chat/sync-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.status === "success") {
        toast.success("Data sync successful!", { theme: "colored" });
      } else {
        toast.error(data.detail || "Sync failed.", { theme: "colored" });
      }
    } catch {
      toast.error("Unable to sync data.", { theme: "colored" });
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setSaveStatus(null);

    const authToken = getAuthToken?.();
    if (!authToken) {
      setSaveStatus("Please login again to save data.");
      setSaving(false);
      return;
    }

    if (messages.length === 0) {
      setSaveStatus("No chats to save.");
      setSaving(false);
      return;
    }

    const resolvedSessionName = sessionName.trim() || getSuggestedSessionName(messages);

    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiBaseUrl}/api/chat/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: resolvedSessionName,
          messages: toApiMessages(messages),
        }),
      });

      const data = await response.json();
      if (response.ok && data.result === "success") {
        setCurrentSavedSessionId(data.sessionId);
        setSessionName(data.name || resolvedSessionName);
        setHasUnsavedChanges(false);
        setSaveStatus("Chat session saved to database.");
        localStorage.removeItem(draftStorageKey);
        setLocalDraft(null);
        setSavedSessions(await fetchSavedSessions());
        toast.success("Chat saved successfully!", { theme: "colored" });
      } else {
        toast.error(data.detail || "Save failed.", { theme: "colored" });
      }
    } catch {
      toast.error("Unable to save chat.", { theme: "colored" });
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || isSending) {
      return;
    }

    const prompt = input.trim();
    const authToken = getAuthToken?.();
    if (!authToken) {
      setMessages((prev) => [...prev, { sender: "ai", text: "Please login again to continue chatting." }]);
      return;
    }

    const newUserMessage: Message = { sender: "user", text: prompt };
    const recentHistory = toApiMessages(messages.slice(-6));

    setHasUnsavedChanges(true);
    if (!sessionName.trim() || sessionName === DEFAULT_SESSION_NAME) {
      setSessionName(getSuggestedSessionName([...messages, newUserMessage]));
    }
    setMessages((prev) => [...prev, newUserMessage]);
    setInputState("");
    setIsSending(true);

    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ message: prompt, history: recentHistory }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.detail || errorData?.message || "Chat request failed";
        setMessages((prev) => [...prev, { sender: "ai", text: errorMessage }]);
        return;
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply || "No response from server." }]);
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", text: "Unable to reach chat service right now." }]);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setIsBootstrapping(true);
      setSavedSessionsLoading(true);

      let nextSavedSessions: SavedChatSessionSummary[] = [];
      try {
        nextSavedSessions = await fetchSavedSessions();
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Unable to fetch saved chats.", { theme: "colored" });
        }
      } finally {
        if (!cancelled) {
          setSavedSessionsLoading(false);
        }
      }

      let nextLocalDraft: LocalChatDraft | null = null;
      const rawDraft = localStorage.getItem(draftStorageKey);
      if (rawDraft) {
        try {
          nextLocalDraft = JSON.parse(rawDraft) as LocalChatDraft;
        } catch {
          localStorage.removeItem(draftStorageKey);
        }
      }

      if (cancelled) {
        return;
      }

      setSavedSessions(nextSavedSessions);
      setLocalDraft(nextLocalDraft);

      if (nextLocalDraft && nextLocalDraft.messages.length > 0) {
        setMessages(nextLocalDraft.messages);
        setSessionName(nextLocalDraft.name || getSuggestedSessionName(nextLocalDraft.messages));
        setCurrentSavedSessionId(nextLocalDraft.sourceSessionId ?? null);
        setHasUnsavedChanges(true);
        setShowSessionPicker(false);
      } else {
        setMessages([]);
        setSessionName(DEFAULT_SESSION_NAME);
        setCurrentSavedSessionId(null);
        setHasUnsavedChanges(false);
        setShowSessionPicker(nextSavedSessions.length > 0);
      }

      setIsBootstrapping(false);
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [draftStorageKey, fetchSavedSessions]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if (messages.length === 0) {
      if (currentSavedSessionId === null) {
        localStorage.removeItem(draftStorageKey);
        setLocalDraft(null);
      }
      return;
    }

    const draft: LocalChatDraft = {
      name: sessionName.trim() || getSuggestedSessionName(messages),
      messages,
      sourceSessionId: currentSavedSessionId ?? undefined,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    setLocalDraft(draft);
  }, [currentSavedSessionId, draftStorageKey, hasUnsavedChanges, isBootstrapping, messages, sessionName]);

  const historyItems: HistoryItem[] = useMemo(
    () =>
      messages
        .map((msg, idx) => ({ msg, idx }))
        .filter(({ msg }) => msg.sender === "user")
        .map(({ msg, idx }) => ({
          id: idx,
          title: msg.text.length > 40 ? `${msg.text.slice(0, 40)}...` : msg.text,
        }))
        .reverse(),
    [messages]
  );

  const value: ChatSessionContextValue = {
    messages,
    input,
    sessionName,
    isSending,
    syncing,
    saving,
    isHistoryOpen,
    isBootstrapping,
    showSessionPicker,
    currentSavedSessionId,
    savedSessions,
    savedSessionsLoading,
    loadingSessionId,
    deletingSessionId,
    localDraft,
    hasUnsavedChanges,
    syncStatus,
    saveStatus,
    historyItems,
    setInput,
    updateSessionName,
    setIsHistoryOpen,
    startNewChat,
    resumeLocalDraft,
    loadSavedSession,
    deleteSavedSession,
    handleSyncData,
    handleSave,
    handleSend,
  };

  return <ChatSessionContext.Provider value={value}>{children}</ChatSessionContext.Provider>;
};

export default ChatSessionProvider;