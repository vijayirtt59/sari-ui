import { useEffect, useState } from "react";
import api from "./api";

function Documents() {
  const [docs, setDocs] = useState([]);

  // ✅ Load documents
  const loadDocs = () => {
    api
      .get("/documents")
      .then((res) => setDocs(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadDocs();
  }, []);

  // ✅ Workflow action
  const applyAction = (code, action) => {
    if (!code) {
      alert("❌ Invalid document code");
      return;
    }

    api
      .post(`/documents/${code}/action?action=${action}`)
      .then(() => {
        alert("✅ " + action + " done");
        loadDocs();
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Action failed");
      });
  };

  // ✅ Create new version
  const createVersion = (code) => {
    api
      .post(`/documents/${code}/version`)
      .then(() => {
        alert("✅ New version created");
        loadDocs();
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Failed to create version");
      });
  };

  // ✅ View file
  const viewFile = (code) => {
    window.open(`${process.env.REACT_APP_API_URL}/documents/${code}/file`, "_blank");
  };

  // ✅ Download file
  const downloadFile = (code) => {
    window.open(`${process.env.REACT_APP_API_URL}/documents/${code}/file?download=true`);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Documents</h2>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Code</th>
            <th>Title</th>
            <th>Status</th>
            <th>File</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {docs
            .filter((doc) => doc.code && doc.code.trim() !== "")
            .map((doc) => {
              const status = String(doc.status).toUpperCase();
              const role = localStorage.getItem("role");

              return (
                <tr key={doc.code}>
                  <td>{doc.code}</td>
                  <td>{doc.title}</td>

                  {/* ✅ STATUS */}
                  <td>
                    <span
                      className={`badge 
                      ${
                        status === "DRAFT"
                          ? "bg-secondary"
                          : status === "UNDER_REVIEW"
                            ? "bg-warning text-dark"
                            : status === "APPROVED"
                              ? "bg-success"
                              : status === "DISTRIBUTED"
                                ? "bg-primary"
                                : "bg-dark"
                      }`}
                    >
                      {status}
                    </span>
                  </td>

                  {/* ✅ FILE */}
                  <td>{doc.fileName ? doc.fileName : "No file"}</td>

                  {/* ✅ ACTIONS */}
                  <td>
                    {/* ✅ VIEW & DOWNLOAD */}
                    {doc.fileName && (
                      <>
                        <button
                          className="btn btn-sm btn-info me-1"
                          onClick={() => viewFile(doc.code)}
                        >
                          View
                        </button>

                        <button
                          className="btn btn-sm btn-secondary me-1"
                          onClick={() => downloadFile(doc.code)}
                        >
                          Download
                        </button>
                      </>
                    )}

                    {/* ✅ SUBMIT */}
                    {(role === "ADMIN" || role === "COORDINATOR") &&
                      status === "DRAFT" && (
                        <button
                          className="btn btn-sm btn-primary me-1"
                          onClick={() => applyAction(doc.code, "submit")}
                        >
                          Submit
                        </button>
                      )}

                    {/* ✅ APPROVE */}
                    {(role === "ADMIN" || role === "APPROVER") &&
                      status === "UNDER_REVIEW" && (
                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() => applyAction(doc.code, "approve")}
                        >
                          Approve
                        </button>
                      )}

                    {/* ✅ DISTRIBUTE */}
                    {role === "ADMIN" && status === "APPROVED" && (
                      <button
                        className="btn btn-sm btn-success me-1"
                        onClick={() => applyAction(doc.code, "distribute")}
                      >
                        Distribute
                      </button>
                    )}

                    {/* ✅ NEW VERSION */}
                    {status === "DISTRIBUTED" && (
                      <button
                        className="btn btn-sm btn-dark"
                        onClick={() => createVersion(doc.code)}
                      >
                        New Version
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default Documents;
