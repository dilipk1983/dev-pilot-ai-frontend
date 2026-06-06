import { useState } from "react";

type CredentialRecord = {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  databaseType: string;
  [key: string]: unknown;
};

type SortConfig = {
  key: string | null;
  direction: string;
};

type CopyPayload = {
  id: number;
  field: string;
  text: string | number;
};

type CredentialTableProps = {
  credentials: CredentialRecord[];
  copiedField: string | null;
  onCopy: (payload: CopyPayload) => void;
  onCopyConnectionString: (credential: CredentialRecord) => void;
  onEdit: (credential: CredentialRecord) => void;
  onDelete: (id: number) => void;
  sortConfig: SortConfig;
  toggleSort: (key: string) => void;
  searchTerm?: string;
  setSortConfig?: (config: SortConfig) => void;
};

const columnWidths: Record<string, string> = {
  name: "10%",
  host: "35%",
  port: "5%",
  username: "15%",
  password: "15%",
  database: "10%",
  databaseType: "10%",
};

const cellStyle = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
};

const CredentialTable = ({
  credentials,
  copiedField,
  onCopy,
  onCopyConnectionString,
  onEdit,
  onDelete,
  sortConfig,
  toggleSort,
}: CredentialTableProps): React.ReactElement => {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});

  const togglePasswordVisibility = (id: number): void => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenSSMS = ({ host, username, password }: CredentialRecord): void => {
    const batContent = `
@echo off
"C:\\Program Files\\Microsoft SQL Server\\150\\Tools\\Binn\\ManagementStudio\\Ssms.exe" -S ${host} -U ${username} -P ${password}
`;
    const blob = new Blob([batContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "open_ssms.bat";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "host", label: "Host" },
    { key: "port", label: "Port" },
    { key: "username", label: "Username" },
    { key: "password", label: "Password" },
    { key: "database", label: "Database" },
    { key: "databaseType", label: "Database Type" },
  ];

  const renderCopyButton = (
    cred: CredentialRecord,
    field: string,
    value: string | number
  ): React.ReactElement => (
    <button
      className="btn btn-sm p-0 mt-1 mr-1"
      style={{ color: "#aaa", fontSize: "0.75rem" }}
      onClick={() => onCopy({ id: cred.id, field, text: value })}
      title={`Copy ${field}`}
      type="button"
    >
      {copiedField === `${cred.id}-${field}` ? (
        <i className="fas fa-check text-success"></i>
      ) : (
        <i className="fas fa-copy"></i>
      )}
    </button>
  );

  return (
    <div className="card table-responsive p-0 mt-2">
      <table className="table table-hover text-nowrap" style={{ tableLayout: "fixed", width: "100%" }}>
        <thead>
          <tr>
            {columns.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => toggleSort(key)}
                style={{
                  cursor: "pointer",
                  width: columnWidths[key],
                }}
                title={`Sort by ${label}`}
              >
                {label}{" "}
                {sortConfig.key === key && (
                  <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"}`}></i>
                )}
              </th>
            ))}
            <th style={{ width: "10%" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {credentials.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center">
                No credentials found.
              </td>
            </tr>
          ) : (
            credentials.map((cred) => (
              <tr key={cred.id}>
                <td style={{ ...cellStyle, width: columnWidths.name }}>{cred.name}</td>
                <td style={{ ...cellStyle, width: columnWidths.host }}>
                  <div className="d-flex align-items-center">
                    {renderCopyButton(cred, "host", cred.host)}
                    <span>{cred.host}</span>
                  </div>
                </td>
                <td style={{ ...cellStyle, width: columnWidths.port }}>
                  <div className="d-flex align-items-center">
                    {renderCopyButton(cred, "port", cred.port)}
                    <span>{cred.port}</span>
                  </div>
                </td>
                <td style={{ ...cellStyle, width: columnWidths.username }}>
                  <div className="d-flex align-items-center">
                    {renderCopyButton(cred, "username", cred.username)}
                    <span>{cred.username}</span>
                  </div>
                </td>
                <td style={{ ...cellStyle, width: columnWidths.password }}>
                  <div className="d-flex align-items-center">
                    {renderCopyButton(cred, "password", cred.password)}

                    <button
                      className="btn btn-sm p-0 mr-2 mt-1"
                      onClick={() => togglePasswordVisibility(cred.id)}
                      title={visiblePasswords[cred.id] ? "Hide password" : "Show password"}
                      type="button"
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "#555",
                      }}
                    >
                      {visiblePasswords[cred.id] ? (
                        <i className="fas fa-eye-slash"></i>
                      ) : (
                        <i className="fas fa-eye"></i>
                      )}
                    </button>

                    <input
                      type={visiblePasswords[cred.id] ? "text" : "password"}
                      value={cred.password}
                      readOnly
                      className="form-control-plaintext p-0 m-0"
                      style={{
                        width: "100px",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                </td>
                <td style={{ ...cellStyle, width: columnWidths.database }}>
                  <div className="d-flex align-items-center">
                    {renderCopyButton(cred, "database", cred.database)}
                    <span>{cred.database}</span>
                  </div>
                </td>
                <td style={{ ...cellStyle, width: columnWidths.databaseType }}>{cred.databaseType}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-warning mr-1"
                      onClick={() => onEdit(cred)}
                      title="Edit Credential"
                      type="button"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning mr-1"
                      onClick={() => onCopyConnectionString(cred)}
                      title="Copy Connection string"
                      type="button"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger mr-1"
                      onClick={() => onDelete(cred.id)}
                      title="Delete Credential"
                      type="button"
                    >
                      <i className="fas fa-trash"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-primary mr-1"
                      onClick={() => handleOpenSSMS(cred)}
                      title="Open SSMS"
                      type="button"
                    >
                      <i className="fas fa-database"></i> SSMS
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CredentialTable;