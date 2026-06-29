import { useEffect, useState } from "react";
import api from "./api";

export default function FormBuilder() {
  const [form, setForm] = useState({
    code: "",
    title: "",
  });

  const [file, setFile] = useState(null);
  const [forms, setForms] = useState([]);
  const [fileKey, setFileKey] = useState(Date.now());
  const [showUploadForm, setShowUploadForm] =
  useState(false);

  const [selectedTemplate, setSelectedTemplate] =
  useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    api.get("/forms").then((res) => setForms(res.data));
  };

  // ✅ Upload / Update
  const handleUpload = () => {
    if (!form.code || !form.title || !file) {
      alert("❌ Code, Title and File required");
      return;
    }

    const exists = forms.find((f) => f.code === form.code);

    if (exists) {
      const confirmUpdate = window.confirm(
        `⚠️ Template ${form.code} already exists.\n\nReplace file and regenerate snapshot?`,
      );
      if (!confirmUpdate) return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("code", form.code);
    formData.append("title", form.title);

    api
      .post("/forms/upload", formData)
      .then(() => {
        alert("✅ Uploaded successfully");

        setForm({ code: "", title: "" });
        setFile(null);
        setFileKey(Date.now()); // ✅ reset file input

        load();
      })
      .catch(() => alert("❌ Upload failed"));
  };

  const remove = (id) => {
    if (!window.confirm("Delete this template?")) return;
    api.delete(`/forms/${id}`).then(load);
  };

  return (
    <div className="container mt-4">
      {/* ✅ UPLOAD CARD */}
      {/* ✅ HEADER */}

<div className="card shadow-sm mb-3">

  <div className="card-header d-flex justify-content-between align-items-center">

    <h5 className="mb-0">
      📋 Form Templates
    </h5>

    <button
      className="btn btn-primary"
      onClick={() =>
        setShowUploadForm(
          !showUploadForm
        )
      }
    >
      {showUploadForm
        ? "Close Upload"
        : "Upload Template"}
    </button>

  </div>

</div>

{/* ✅ UPLOAD CARD */}

{showUploadForm && (

<div className="card mb-4">

  <div className="card-header">
    Upload Form Template
  </div>

  <div className="card-body">
          <input
            className="form-control mb-2"
            placeholder="Code (PRO-01-A)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <input
            className="form-control mb-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <input
            key={fileKey}
            type="file"
            className="form-control mb-2"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button className="btn btn-success" onClick={handleUpload}>
            Upload / Update
          </button>
        </div>
      </div>
      )}

      {/* ✅ TEMPLATE LIBRARY */}

<div className="card shadow">

  <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">

    <h5 className="mb-0">
      📚 Template Library
    </h5>

    <span className="badge bg-light text-dark">
      {forms.length}
    </span>

  </div>

  <div className="card-body">

    {forms.map((f) => (
      <div key={f.id}>

        <div
          className="d-flex justify-content-between align-items-center border-bottom py-3"
          style={{
            cursor: "pointer",
            transition: "all .2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
          }}
        >

          <div>
            <div className="fw-bold">
              {f.code}
            </div>

            <small className="text-muted">
              {f.title}
            </small>
          </div>

          <div>

            <button
  className="btn btn-sm btn-outline-primary me-2"
  onClick={() =>
    setSelectedTemplate(f)
  }
>
  📸 Preview
</button>

            {f.fileUrl && (
              <a
                href={`${process.env.REACT_APP_API_URL}${f.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-secondary me-2"
              >
                ⬇ Download
              </a>
            )}

            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => remove(f.id)}
            >
              🗑 Delete
            </button>

          </div>

        </div>

        

      </div>
    ))}

  </div>

</div>

{selectedTemplate && (

  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      zIndex: 9998,
    }}
  >

    <div
      className="card shadow"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "55%",
        height: "100%",
        overflow: "auto",
        borderRadius: 0,
      }}
    >

      <div
        className="
          card-header
          bg-primary
          text-white
          d-flex
          justify-content-between
        "
      >

        <div>

          <div className="badge bg-light text-dark mb-2">
            {selectedTemplate.code}
          </div>

          <h4 className="mb-0">
            {selectedTemplate.title}
          </h4>

        </div>

        <button
          className="btn btn-light btn-sm"
          onClick={() =>
            setSelectedTemplate(null)
          }
        >
          Close
        </button>

      </div>

      <div className="card-body">

        <div className="mb-3">

          <a
            href={`${process.env.REACT_APP_API_URL}${selectedTemplate.fileUrl}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-success"
          >
            ⬇ Download Template
          </a>

        </div>

        <hr />

        <h5>
          📸 Template Snapshot
        </h5>

        {selectedTemplate.imageUrl && (
          <img
            src={`${process.env.REACT_APP_API_URL}${selectedTemplate.imageUrl}`}
            alt="preview"
            style={{
              width: "100%",
              border: "1px solid #dee2e6",
              borderRadius: "8px",
            }}
          />
        )}

      </div>

    </div>

  </div>

)}
</div>
)}
