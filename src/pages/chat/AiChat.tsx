import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useChatSessionContext } from "../../hooks/useChatSessionContext";
import ChatHistorySidebar from "./ChatHistory";
import ChatSessionProvider from "./ChatSessionProvider";

const AiChatView: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [pendingSessionName, setPendingSessionName] = useState("");

  const {
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
  } = useChatSessionContext();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSending) {
      handleSend();
    }
  };

  const handleDeleteSession = (sessionId: number) => {
    const shouldDelete = window.confirm("Delete this chat session permanently?");
    if (!shouldDelete) {
      return;
    }
    void deleteSavedSession(sessionId);
  };

  const openNewChatDialog = () => {
    setPendingSessionName("");
    setIsNameModalOpen(true);
  };

  const handleCreateNamedChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const resolvedName = pendingSessionName.trim() || "New Chat";
    startNewChat();
    updateSessionName(resolvedName);
    setIsNameModalOpen(false);
  };

  return (
    <section className="content mt-1">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3" style={{ gap: "0.75rem" }}>
        <div>
          <div className="d-flex align-items-center" style={{ gap: "0.75rem" }}>
            <h2 className="mb-0">Chat</h2>
            <span className="badge badge-primary">{messages.length} messages</span>
          </div>
          <div className="small text-muted mt-1">
            {currentSavedSessionId ? `Viewing saved session #${currentSavedSessionId}` : "Unsaved local session"}
          </div>
        </div>
        <div className="d-flex align-items-center flex-wrap" style={{ gap: "0.5rem" }}>
          <span className="badge badge-light border" style={{ padding: "0.45rem 0.65rem", fontSize: "0.85rem" }}>
            Session: {sessionName}
          </span>
          <button className="btn btn-outline-secondary" type="button" onClick={openNewChatDialog}>
            <i className="fas fa-plus mr-1"></i>
            Start New Chat
          </button>
          <button className="btn btn-success" type="button" onClick={handleSyncData} disabled={syncing}>
            <i className={`fas fa-sync-alt${syncing ? " fa-spin" : ""}`}></i> {syncing ? "Syncing..." : "Sync Data"}
          </button>
          <button className="btn btn-primary" type="button" onClick={handleSave} disabled={saving || messages.length === 0}>
            <i className={`fas ${saving ? "fa-spinner fa-spin" : "fa-save"} mr-1`}></i> {saving ? "Saving..." : "Save"}
          </button>
          <button
            className="btn btn-outline-primary d-flex align-items-center justify-content-center p-2"
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            aria-label={isHistoryOpen ? "Close history" : "Open history"}
          >
            {isHistoryOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
          </button>
        </div>
      </div>
      {syncStatus && <div className="small text-muted mb-2">{syncStatus}</div>}
      {saveStatus && <div className="small text-muted mb-2">{saveStatus}</div>}

      <div className="card card-primary card-outline d-flex flex-row flex-grow-1 mb-0" style={{ height: "84vh", position: "relative", overflow: "hidden" }}>
        {(isBootstrapping || showSessionPicker) && (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(248, 249, 250, 0.96)",
              zIndex: 8,
              padding: "1.5rem",
            }}
          >
            <div className="card shadow-sm" style={{ maxWidth: "760px", width: "100%" }}>
              <div className="card-body p-4">
                {isBootstrapping ? (
                  <div className="text-center py-5">
                    <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
                    <div>Loading chat sessions...</div>
                  </div>
                ) : (
                  <>
                    <h4 className="mb-2">Choose how to start</h4>
                    <p className="text-muted mb-4">
                      Start a new chat, resume your local draft, or load one of your saved chat sessions.
                    </p>
                    <div className="d-flex flex-wrap mb-4" style={{ gap: "0.75rem" }}>
                      <button type="button" className="btn btn-primary" onClick={openNewChatDialog}>
                        <i className="fas fa-plus mr-1"></i>
                        New Chat
                      </button>
                      {localDraft && localDraft.messages.length > 0 && (
                        <button type="button" className="btn btn-outline-secondary" onClick={resumeLocalDraft}>
                          <i className="fas fa-history mr-1"></i>
                          Resume Local Draft
                        </button>
                      )}
                    </div>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Saved Chats</h5>
                        {savedSessionsLoading && <span className="small text-muted">Refreshing...</span>}
                      </div>
                      {savedSessions.length === 0 ? (
                        <div className="text-muted small">No saved chats found.</div>
                      ) : (
                        <div className="list-group">
                          {savedSessions.map((session) => (
                            <div key={session.id} className="list-group-item">
                              <div className="d-flex justify-content-between align-items-start" style={{ gap: "0.75rem" }}>
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-left flex-grow-1"
                                  onClick={() => loadSavedSession(session.id, true)}
                                  disabled={loadingSessionId === session.id || deletingSessionId === session.id}
                                  style={{ textDecoration: "none" }}
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <strong>{session.name}</strong>
                                    <span className="small text-muted">{session.messageCount} messages</span>
                                  </div>
                                  <div className="small text-muted mt-1">{new Date(session.created).toLocaleString()}</div>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteSession(session.id)}
                                  disabled={loadingSessionId === session.id || deletingSessionId === session.id}
                                  aria-label={`Delete ${session.name}`}
                                >
                                  <i className={`fas ${deletingSessionId === session.id ? "fa-spinner fa-spin" : "fa-trash"}`}></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
          <div className="card-body p-0 d-flex flex-column" style={{ background: "#f8f9fa", minHeight: 0 }}>
            <div className="p-4 flex-grow-1" style={{ overflowY: "auto" }}>
              {messages.length === 0 && !showSessionPicker && (
                <div className="text-center text-muted" style={{ paddingTop: "12vh" }}>
                  <h3 className="mb-2">How can I help you today?</h3>
                  <p className="mb-0">Before starting, click "Sync Data" to sync your most recent data with AI.</p>
                  <p className="mb-0">Start by typing a prompt below</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="d-flex mb-3"
                  style={{ justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}
                >
                  <div
                    className={msg.sender === "user" ? "bg-primary text-white" : "bg-white"}
                    style={{
                      maxWidth: "82%",
                      borderRadius: "0.75rem",
                      padding: "0.85rem 1rem",
                      border: msg.sender === "user" ? "none" : "1px solid #dee2e6",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    <div className="small mb-1" style={{ opacity: 0.75 }}>
                      {msg.sender === "user" ? "You" : "Assistant"}
                    </div>
                    {msg.sender === "ai" ? (
                      <div className="chat-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <div>{msg.text}</div>
                    )}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="card-footer bg-white border-top">
            <div className="mx-auto" style={{ maxWidth: "980px" }}>
              <div className="input-group input-group-lg">
                <input
                  type="text"
                  placeholder="Message AI Assistant..."
                  className="form-control"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                />
                <div className="input-group-append">
                  <button className="btn btn-primary" onClick={handleSend} type="button" disabled={!input.trim() || isSending}>
                    <i className={`fas ${isSending ? "fa-spinner fa-spin" : "fa-paper-plane"} mr-1`}></i>
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ChatHistorySidebar
          items={historyItems}
          savedSessions={savedSessions}
          currentSessionId={currentSavedSessionId}
          loadingSessionId={loadingSessionId}
          deletingSessionId={deletingSessionId}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onNewChat={openNewChatDialog}
          onSelectSession={(sessionId) => loadSavedSession(sessionId)}
          onDeleteSession={handleDeleteSession}
        />
      </div>

      {isNameModalOpen && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            zIndex: 1200,
            padding: "1rem",
          }}
        >
          <div className="card shadow" style={{ maxWidth: "460px", width: "100%" }}>
            <div className="card-body">
              <h5 className="mb-2">Name Your Chat</h5>
              <p className="text-muted small mb-3">Enter a chat name before starting a fresh session.</p>
              <form onSubmit={handleCreateNamedChat}>
                <input
                  autoFocus
                  type="text"
                  className="form-control mb-3"
                  placeholder="e.g. Sprint Planning"
                  value={pendingSessionName}
                  onChange={(e) => setPendingSessionName(e.target.value)}
                />
                <div className="d-flex justify-content-end" style={{ gap: "0.5rem" }}>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setIsNameModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Start Chat
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const AiChat: React.FC = () => {
  return (
    <ChatSessionProvider>
      <AiChatView />
    </ChatSessionProvider>
  );
};

export default AiChat;
