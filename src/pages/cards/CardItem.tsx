import { useState } from "react";

import { useCardsContext } from "../../hooks/useCardsContext";

type CardRecord = {
  id: number;
  title: string;
  content?: string;
  cardType?: string;
};

type CardItemProps = {
  card: CardRecord;
  onEdit: () => void;
  onDelete: () => void;
};

const CardItem = ({ card, onEdit, onDelete }: CardItemProps): React.ReactElement => {
  const { updateCardContent } = useCardsContext();
  const [content, setContent] = useState(card.content || "");

  const handleBlur = (): void => {
    if (content !== card.content) {
      updateCardContent(card.id, { content }).catch(() => window.alert("Failed to update content"));
    }
  };

  return (
    <div className={`card ${card.cardType || "card-secondary"} card-outline`}>
      <div className="card-header">
        <h3 className="card-title">{card.title}</h3>
        <div className="card-tools">
          <button type="button" className="btn btn-tool" data-card-widget="collapse">
            <i className="fas fa-minus"></i>
          </button>
          <button type="button" className="btn btn-tool" onClick={onEdit} title="Edit Card">
            <i className="fas fa-edit"></i>
          </button>
          <button type="button" className="btn btn-tool" onClick={onDelete} title="Delete Card">
            <i className="fas fa-trash"></i>
          </button>
          <button type="button" className="btn btn-tool" data-card-widget="maximize">
            <i className="fas fa-expand"></i>
          </button>
        </div>
      </div>
      <div className="card-body">
        <textarea
          className="form-control"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

export default CardItem;