import CredentialModal from "./CredentialModal";
import CredentialTable from "./CredentialTable";
import useDatabaseCredentials from "../../hooks/useDatabaseCredentials";

const DatabaseCredentials = (): React.ReactElement => {
  const {
    credentials,
    editing,
    modalOpen,
    searchTerm,
    setSearchTerm,
    form,
    setForm,
    copiedField,
    sortConfig,
    setSortConfig,
    openModal,
    closeModal,
    handleCopy,
    handleCopyConnectionString,
    handleSubmit,
    handleDelete,
    toggleSort,
  } = useDatabaseCredentials();

  return (
    <section className="content mt-1">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Database Credentials</h2>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-secondary" onClick={() => openModal()} type="button">
            <i className="fas fa-plus"></i> Add New
          </button>
          <input
            type="text"
            className="form-control"
            placeholder="Search credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "250px" }}
          />
        </div>
      </div>

      <CredentialTable
        credentials={credentials}
        searchTerm={searchTerm}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        onEdit={openModal}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onCopyConnectionString={handleCopyConnectionString}
        copiedField={copiedField}
        toggleSort={toggleSort}
      />

      {modalOpen && (
        <CredentialModal
          formData={form}
          setFormData={setForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isEditing={editing}
          isOpen={modalOpen}
        />
      )}
    </section>
  );
};

export default DatabaseCredentials;