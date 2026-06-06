import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type ChatSession = {
    id?: number;
    name: string;
};

type SaveChatProps = {
    chatSession: ChatSession | null;
    onClose: () => void;
    onSave: (savedChatSession: ChatSession, isEditing: boolean) => void;
};

const SaveChatModal = ({ chatSession, onClose, onSave }: SaveChatProps): React.ReactElement => {
    const [title, setTitle] = useState("");

    useEffect(() => {
        setTitle(chatSession?.name ?? "");
    }, [chatSession]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const resolvedTitle = title.trim() || "Chat Session";
        onSave(
            {
                id: chatSession?.id,
                name: resolvedTitle,
            },
            Boolean(chatSession?.id)
        );
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">{chatSession?.id ? "Rename Chat Session" : "Save Chat Session"}</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <label htmlFor="chat-session-title" className="form-label">
                                Session Name
                            </label>
                            <input
                                id="chat-session-title"
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Enter a session name"
                                autoFocus
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SaveChatModal;


