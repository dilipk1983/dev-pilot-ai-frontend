

import React from 'react';

interface HistoryItem {
  id: number;
  title: string;
}

interface SavedSessionItem {
  id: number;
  name: string;
  created: string;
  messageCount: number;
}

interface ChatHistorySidebarProps {
  items: HistoryItem[];
  savedSessions: SavedSessionItem[];
  currentSessionId: number | null;
  loadingSessionId: number | null;
  deletingSessionId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: number) => void;
  onDeleteSession: (sessionId: number) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  items,
  savedSessions,
  currentSessionId,
  loadingSessionId,
  deletingSessionId,
  isOpen,
  onClose,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '300px',
        minWidth: '300px',
        borderLeft: '1px solid #dee2e6',
        background: '#fff',
        overflowY: 'auto',
        padding: '1rem',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 220ms ease-in-out',
        boxShadow: isOpen ? '-6px 0 16px rgba(0, 0, 0, 0.08)' : 'none',
        zIndex: 5,
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Chat History</h5>
        <button type="button" className="btn btn-sm btn-light" onClick={onClose} aria-label="Close history">
          <i className="fas fa-times"></i>
        </button>
      </div>
      <button type="button" className="btn btn-primary btn-sm w-100 mb-3" onClick={onNewChat}>
        <i className="fas fa-plus mr-1"></i>
        New Chat
      </button>
      <div className="mb-4">
        <div className="small font-weight-bold text-uppercase text-muted mb-2">Saved Sessions</div>
        {savedSessions.length === 0 ? (
          <p className="text-muted small mb-0">No saved sessions yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {savedSessions.map((session) => {
              const isCurrent = currentSessionId === session.id;

              return (
                <li key={session.id} className="mb-2">
                  <div className="d-flex" style={{ gap: '0.5rem' }}>
                    <button
                      type="button"
                      className={`btn btn-sm text-left flex-grow-1 ${isCurrent ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => onSelectSession(session.id)}
                      disabled={loadingSessionId === session.id || deletingSessionId === session.id}
                      style={{ whiteSpace: 'normal' }}
                    >
                      <div className="font-weight-bold">{session.name}</div>
                      <div className={`small ${isCurrent ? 'text-white-50' : 'text-muted'}`}>
                        {new Date(session.created).toLocaleString()} | {session.messageCount} messages
                      </div>
                      {loadingSessionId === session.id && (
                        <div className="small mt-1">Loading...</div>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onDeleteSession(session.id)}
                      disabled={loadingSessionId === session.id || deletingSessionId === session.id}
                      aria-label={`Delete ${session.name}`}
                    >
                      <i className={`fas ${deletingSessionId === session.id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="small font-weight-bold text-uppercase text-muted mb-2">Current Conversation</div>
      {items.length === 0 ? (
        <p className="text-muted small mb-0">No messages yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map(item => (
            <li
              key={item.id}
              className="mb-2 p-2"
              style={{ border: '1px solid #e9ecef', borderRadius: '0.5rem', background: '#f8f9fa' }}
            >
              <div className="small text-truncate" title={item.title}>{item.title}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistorySidebar;