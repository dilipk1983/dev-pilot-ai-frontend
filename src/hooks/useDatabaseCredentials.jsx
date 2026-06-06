import { useState, useEffect, useMemo  } from "react";
import useAuth from '../auth/useAuth';

const defaultForm = {
  name: "",
  host: "",
  port: 1433,
  database: "",
  username: "",
  password: "",
  databaseType: ""
};

export default function useDatabaseCredentials() {
  const { getAuthToken } = useAuth();
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  const [credentials, setCredentials] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [copiedField, setCopiedField] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const toCredentialList = (value) => (Array.isArray(value) ? value : []);

  // Fetch credentials on mount
  useEffect(() => {
    fetch(`${apiBaseUrl}/api/dbcredentials`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.detail || "Failed to load credentials");
        }
        return data;
      })
      .then((data) => setCredentials(toCredentialList(data)))
      .catch((err) => {
        console.error("Failed to load credentials", err);
        setCredentials([]);
      });
  }, [apiBaseUrl, getAuthToken]);

  const openModal = (cred = null) => {
    setForm(cred ? { ...defaultForm, ...cred } : defaultForm);
    setEditing(cred);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(defaultForm);
    setEditing(null);
  };

  const handleCopy = ({ id, field, text }) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedField(`${id}-${field}`);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch(() => console.error("Copy failed"));
  };

  const handleCopyConnectionString = (cred) => {
    if (!cred) return;
  
    let connectionString = "";
  
    switch (cred.databaseType.toLowerCase()) {
      case "sql server":
      case "mssql":
        connectionString = `Server=${cred.host},${cred.port};Database=${cred.database};User Id=${cred.username};Password=${cred.password};TrustServerCertificate=True;`;
        break;
      case "postgres":
      case "postgresql":
        connectionString = `Host=${cred.host};Port=${cred.port};Database=${cred.database};Username=${cred.username};Password=${cred.password};SSL Mode=Prefer;`;
        break;
      case "mysql":
        connectionString = `Server=${cred.host};Port=${cred.port};Database=${cred.database};Uid=${cred.username};Pwd=${cred.password};`;
        break;
      case "oracle":
        connectionString = `User Id=${cred.username};Password=${cred.password};Data Source=${cred.host}:${cred.port}/${cred.database};`;
        break;
      default:
        console.warn("Unsupported database type");
        return;
    }
  
    navigator.clipboard
      .writeText(connectionString)
      .then(() => {
        setCopiedField(`${cred.id}-connectionString`);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch(() => console.error("Copy failed"));
  };
  
  

  const handleSubmit = async (newForm) => {
    const url = editing
      ? `${apiBaseUrl}/api/dbcredentials/update/${editing.id}`
      : `${apiBaseUrl}/api/dbcredentials/add`;
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(newForm),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Save failed");
      }
      const result = await res.json();
      setCredentials((prev) =>
        editing
          ? toCredentialList(prev).map((c) => (c.id === result.id ? result : c))
          : [...toCredentialList(prev), result]
      );
      closeModal();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this credential?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/dbcredentials/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Delete failed");
      }
      setCredentials((prev) => toCredentialList(prev).filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  }; 

  const filteredAndSortedCredentials = useMemo(() => {
    const filtered = toCredentialList(credentials).filter((cred) =>
      Object.values(cred).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  
    if (!sortConfig.key) return filtered;
  
    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [credentials, searchTerm, sortConfig]);

  const toggleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };
  return {
    credentials: filteredAndSortedCredentials,
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
    toggleSort    
  };
}
