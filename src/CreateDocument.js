import { useState } from "react";
import api from "./api";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CreateDocument({ role, docs, onCreated, selectedCode }) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(null);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  const formatDate = (date) => {

  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

  // ✅ find selected document
  const selectedDoc = docs?.find((d) => d.code === selectedCode);

  // ✅ reset form
  const resetForm = () => {
    setCode("");
    setTitle("");
    setName("");
    setDate(null);
    setContent("");
    setEditingId(null);
  };

  // ✅ CREATE / UPDATE
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!code || !title || !name || !date) {
      alert("❌ Fill all fields");
      return;
    }

    const payload = {
  code,
  title,
  name,
  content,

  date: formatDate(date)
};

    const call = editingId
      ? api.put(`/docs/${editingId}`, payload)
      : api.post("/docs", payload);

    call.then(() => {
      alert(editingId ? "✅ Updated" : "✅ Created");

      resetForm();

      if (onCreated) onCreated();
    });
  };

  // ✅ EDIT CLICK
  const handleEdit = (doc) => {
    setCode(doc.code);
    setTitle(doc.title);
    setName(doc.name);
    setDate(
  doc.date
    ? new Date(doc.date + "T00:00:00")
    : null
);
    setContent(doc.content || "");
    setEditingId(doc.id);
  };

  // ✅ DOWNLOAD PDF
  const handleDownload = (code) => {
    window.open(`http://localhost:8080/docs/${code}/pdf`, "_blank");
  };

  // =========================================
  // ✅ VIEW MODE (ALL USERS)
  // =========================================
  if (selectedCode && selectedDoc && !editingId) {
    return (
      <div className="container mt-4">
        <div className="card shadow">
          <div className="card-header bg-dark text-white d-flex justify-content-between">
            <h5>
              {selectedDoc.code} - {selectedDoc.name}
            </h5>

            {/* ✅ ADMIN EDIT BUTTON */}
            {role === "ADMIN" && (
              <button
                className="btn btn-warning btn-sm"
                onClick={() => handleEdit(selectedDoc)}
              >
                Edit
              </button>
            )}
          </div>

          <div className="card-body">
            {/* ✅ ONLY CONTENT */}
            <div
              dangerouslySetInnerHTML={{
                __html: selectedDoc.content,
              }}
            />

            <div className="mb-2 text-muted">
  <b>Fecha:</b>{" "}
  {selectedDoc.date
    ? new Date(selectedDoc.date + "T00:00:00")
        .toLocaleDateString("es-MX")
    : "-"}
</div>

            {/* ✅ PDF */}
            <div className="mt-3">
              <button
                className="btn btn-outline-success"
                onClick={() => handleDownload(selectedDoc.code)}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // ✅ CREATE / EDIT MODE (ADMIN ONLY)
  // =========================================
  return (
    <div className="container mt-4">
      {/* ✅ FORM */}
      {role === "ADMIN" && (
        <div className="card shadow mb-4">
          <div className="card-header bg-primary text-white d-flex justify-content-between">
            <h5>{editingId ? "Edit Document" : "Create Document"}</h5>

            {editingId && (
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Code</label>
                <input
                  className="form-control"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="DOC-01"
                />
              </div>

              <div className="mb-3">
                <label>Title</label>
                <input
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label>Name</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="mb-3">

  <label>Document Date</label>

  <DatePicker
  className="form-control"
  selected={date}
  onChange={(selectedDate) =>
    setDate(selectedDate)
  }
  dateFormat="dd/MM/yyyy"
  placeholderText="Seleccionar fecha"
/>

</div>

              <div className="mb-3">
                <label>Content</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={content}
                  onChange={(event, editor) => {
                    setContent(editor.getData());
                  }}
                />
              </div>

              <button className="btn btn-success">
                {editingId ? "Update Document" : "Create Document"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ LIST */}
      <div className="card shadow">
        <div className="card-header bg-dark text-white">
          <h5>Documents</h5>
        </div>

        <div className="card-body">
          {docs && docs.length > 0 ? (
            docs.map((doc) => (
              <div
                key={doc.id}
                className="d-flex justify-content-between align-items-center border-bottom py-2"
              >
                <div>
                  <b>{doc.code}</b> - {doc.name}
                </div>

                <div>
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={() => handleDownload(doc.code)}
                  >
                    PDF
                  </button>

                  {role === "ADMIN" && (
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleEdit(doc)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted">No documents available</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateDocument;
