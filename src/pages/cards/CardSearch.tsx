type CardSearchProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onAdd: () => void;
};

const CardSearch = ({
  searchQuery,
  setSearchQuery,
  onAdd,
}: CardSearchProps): React.ReactElement => {
  return (
    <div className="d-flex align-items-center gap-2">
      <button className="btn btn-outline-secondary" onClick={onAdd} type="button">
        <i className="fas fa-plus"></i> Add Card
      </button>
      <input
        type="text"
        className="form-control"
        placeholder="Search cards..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: "250px" }}
      />
    </div>
  );
};

export default CardSearch;