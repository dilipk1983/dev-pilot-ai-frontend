// CardsContext.js
import { createContext, useContext } from "react";

const CardsContext = createContext();
export const useCardsContext = () => useContext(CardsContext);
export default CardsContext;
