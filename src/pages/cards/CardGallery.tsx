import { useState } from "react";

import { useCardsContext } from "../../hooks/useCardsContext";
import CardItem from "./CardItem";
import CardModal from "./CardModal";
import CardSearch from "./CardSearch";

type CardRecord = {
  id: number;
  title: string;
  category?: string;
  content?: string;
  cardType?: string;
};

const CardGallery = (): React.ReactElement => {
  const { cards, loading, deleteCard } = useCardsContext();
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CardRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const openEditModal = (card: CardRecord): void => {
    setEditingCard(card);
    setShowModal(true);
  };

  const closeModal = (): void => {
    setShowModal(false);
    setEditingCard(null);
  };

  const handleSave = (): void => closeModal();

  const handleDelete = (id: number): void => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      deleteCard(id).catch(() => window.alert("Failed to delete card"));
    }
  };

  const filteredCards = (cards as CardRecord[]).filter((card) =>
    [card.title, card.category, card.content, card.cardType]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <section className="content mt-1">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Card Gallery</h2>
        <CardSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} onAdd={() => setShowModal(true)} />
      </div>

      <div className="row g-4 mb-4">
        {loading ? (
          <div className="col-12 text-center">
            <i className="fas fa-sync-alt fa-spin"></i>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="col-12 text-center">No cards found</div>
        ) : (
          filteredCards.map((card) => (
            <div className="col-md-3" key={card.id}>
              <CardItem card={card} onEdit={() => openEditModal(card)} onDelete={() => handleDelete(card.id)} />
            </div>
          ))
        )}
      </div>

      {showModal && <CardModal card={editingCard} onClose={closeModal} onSave={handleSave} />}
    </section>
  );
};

export default CardGallery;