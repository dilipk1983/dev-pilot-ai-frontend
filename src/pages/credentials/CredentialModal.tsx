import type { ChangeEvent, FormEvent } from "react";
import type { Dispatch, SetStateAction } from "react";

type CredentialForm = {
  name: string;
  host: string;
  database: string;
  port: number;
  username: string;
  password: string;
  databaseType: string;
};

type CredentialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formData: CredentialForm;
  setFormData: Dispatch<SetStateAction<CredentialForm>>;
  onSubmit: (form: CredentialForm) => void;
  isEditing: unknown;
};

const databaseTypes = ["SQL Server", "PostgreSQL", "MySQL", "Oracle", "SQLite", "MongoDB"];

const fields: Array<{
  key: keyof CredentialForm;
  label: string;
  type: "text" | "number" | "password" | "select";
  required: boolean;
  min?: number;
  max?: number;
}> = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "host", label: "Host", type: "text", required: true },
  { key: "database", label: "Database", type: "text", required: true },
  { key: "port", label: "Port", type: "number", required: true, min: 1, max: 65535 },
  { key: "username", label: "Username", type: "text", required: true },
  { key: "password", label: "Password", type: "password", required: true },
  { key: "databaseType", label: "Database Type", type: "select", required: true },
];

const CredentialModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isEditing,
}: CredentialModalProps): React.ReactElement | null => {
  if (!isOpen) {
    return null;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <form
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              onSubmit(formData);
            }}
          >
            <div className="modal-header">
              <h5 className="modal-title">{isEditing ? "Edit Credential" : "Add Credential"}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {fields.map(({ key, label, type, required, min, max }) => (
                <div className="mb-3" key={key}>
                  <label htmlFor={key} className="form-label">
                    {label}
                  </label>

                  {type === "select" ? (
                    <select
                      id={key}
                      name={key}
                      className="form-select"
                      value={formData[key] ?? ""}
                      onChange={handleChange}
                      required={required}
                    >
                      <option value="" disabled>
                        Select a database type
                      </option>
                      {databaseTypes.map((dbType) => (
                        <option key={dbType} value={dbType}>
                          {dbType}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={key}
                      name={key}
                      type={type}
                      className="form-control"
                      value={formData[key] ?? ""}
                      onChange={handleChange}
                      required={required}
                      min={min}
                      max={max}
                      autoComplete={key === "password" ? "new-password" : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEditing ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CredentialModal;