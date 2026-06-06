import { useState, useEffect, useCallback } from "react";
import { toast } from 'react-toastify';

const useCards = (apiBaseUrl, getAuthToken) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all cards
  const fetchCards = useCallback(() => {
    setLoading(true);
    fetch(`${apiBaseUrl}/api/cards`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`
      }
    })
      .then((res) => res.json())
      .then((data) => setCards(Array.isArray(data) ? data : []))
      .catch((err) => {
          console.error("Fetch error:", err);
          toast.error(err, {
            theme: 'colored',
          });
      })
      .finally(() => setLoading(false));
  }, [apiBaseUrl, getAuthToken]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Add or update card
  const saveCard = async (cardData, isEditing, cardId = null) => {
    const url = isEditing
      ? `${apiBaseUrl}/api/cards/update/${cardId}`
      : `${apiBaseUrl}/api/cards/add`;

    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(cardData)
    });

    if (!res.ok) {
        toast.error(`An unxpected error occured : ${res}`, {
            theme: 'colored',
          });
        throw new Error("Failed to save card");
    }
    const savedCard = await res.json();

    setCards((prev) =>
      isEditing
        ? prev.map((c) => (c.id === savedCard.id ? savedCard : c))
        : [...prev, savedCard]
    );
    toast.success('Card saved successfully!', {
        theme: 'colored',
      });
    return savedCard;
  };

  // Delete card
  const deleteCard = async (id) => {
    const res = await fetch(`${apiBaseUrl}/api/cards/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getAuthToken()}`
      }
    });
    if (!res.ok) {
        toast.error(`An unxpected error occured : ${res}`, {
            theme: 'colored',
          });
        throw new Error("Failed to delete card");
    }    

    setCards((prev) => prev.filter((card) => card.id !== id));
    toast.success('Card deleted successfully!', {
        theme: 'colored',
      });
  };

  // Inline update (e.g., onBlur from textarea)
  const updateCardContent = async (cardId, updatedFields) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const updatedCard = { ...card, ...updatedFields };

    const res = await fetch(`${apiBaseUrl}/api/cards/update/${cardId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(updatedCard)
    });
    if (!res.ok) {
        toast.error(`An unxpected error occured : ${res}`, {
            theme: 'colored',
          });
        throw new Error("Failed to update card content");
    }   

    const updated = await res.json();
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    toast.success('Card updated successfully!', {
        theme: 'colored',
      });
  };

  return {
    cards,
    loading,
    saveCard,
    deleteCard,
    updateCardContent,
    fetchCards,
    setCards
  };
};

export default useCards;
