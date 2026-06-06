import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { useCardsContext } from "../../hooks/useCardsContext";

type CardRecord = {
  id?: number;
  title: string;
  category?: string;
  content?: string;
  cardType?: string;
};

type CardModalProps = {
  card: CardRecord | null;
  onClose: () => void;
  onSave: (savedCard: CardRecord, isEditing: boolean) => void;
};

const CardModal = ({ card, onClose, onSave }: CardModalProps): React.ReactElement => {
  const { saveCard } = useCardsContext();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [cardType, setCardType] = useState("card-warning");
  const isEditing = Boolean(card);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setCategory(card.category || "");
      setContent(card.content || "");
      setCardType(card.cardType || "card-warning");
    } else {
      setTitle("");
      setCategory("");
      setContent("");
      setCardType("card-warning");
    }
  }, [card]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const cardData: CardRecord = { title, category, content, cardType };

    try {
      const savedCard = (await saveCard(cardData, isEditing, card?.id)) as CardRecord;
      onSave(savedCard, isEditing);
    } catch {
      window.alert("Error saving card");
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{isEditing ? "Edit Card" : "Add New Card"}</h5>
              <button type="button" className="close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Card Type</label>
                <select
                  className="form-select"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                >
                  <option value="card-primary">Primary</option>
                  <option value="card-success">Success</option>
                  <option value="card-info">Info</option>
                  <option value="card-warning">Warning</option>
                  <option value="card-danger">Danger</option>
                  <option value="card-secondary">Secondary</option>
                  <option value="card-dark">Dark</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEditing ? "Update Card" : "Save Card"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CardModal;