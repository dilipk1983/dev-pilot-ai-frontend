import CardGallery from "./CardGallery";
import CardsProvider from "./CardsProvider";

const Cards = (): React.ReactElement => {
  return (
    <CardsProvider>
      <CardGallery />
    </CardsProvider>
  );
};

export default Cards;