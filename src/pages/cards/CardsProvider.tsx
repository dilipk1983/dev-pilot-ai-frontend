import type { ReactNode } from "react";

import useAuth from "../../auth/useAuth";
import useCards from "../../hooks/useCards";
import CardsContext from "../../hooks/useCardsContext";

type CardsProviderProps = {
  children: ReactNode;
};

const CardsProvider = ({ children }: CardsProviderProps): React.ReactElement => {
  const { getAuthToken } = useAuth();
  const apiBaseUrl = process.env.REACT_APP_API_URL || "";
  const cardsData = useCards(apiBaseUrl, getAuthToken);

  return <CardsContext.Provider value={cardsData}>{children}</CardsContext.Provider>;
};

export default CardsProvider;