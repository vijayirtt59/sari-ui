import { useEffect, useState } from "react";
import api from "./api";

export default function FormBuilder() {
  const [form, setForm] = useState({
    code: "",
    title: "",
  });

  const [file, setFile] = useState(null);
  const [forms, setForms] = useState([]);
  const [fileKey, setFileKey] = useState(Date.now()); // ✅ reset file input

  const [reviewCode, setReviewCode] = useState(null);

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
      <div className="card mb-4">
        <div className="card-header">Upload Form Template</div>

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

      {/* ✅ LIST */}
      <div className="card">
        <div className="card-header">Form Templates</div>

        <div className="card-body">
          {forms.map((f) => (
            <div key={f.id} className="border rounded p-3 mb-3 bg-light">
              {/* ✅ HEADER */}
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <b>{f.code}</b> - {f.title}
                </div>

                <div>
                  {/* ✅ REVIEW BUTTON */}
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() =>
                      setReviewCode(reviewCode === f.code ? null : f.code)
                    }
                  >
                    {reviewCode === f.code ? "Close" : "Review"}
                  </button>

                  {/* ✅ DOWNLOAD */}
                  {f.fileUrl && (
                    <a
                      href={`${process.env.REACT_APP_API_URL}${f.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-secondary me-2"
                    >
                      Download
                    </a>
                  )}

                  {/* ✅ DELETE */}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => remove(f.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* ✅ PREVIEW SECTION */}
              {reviewCode === f.code && f.imageUrl && (
                <div className="mt-3">
                  <img
                    src={`${process.env.REACT_APP_API_URL}${f.imageUrl}`}
                    alt="preview"
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
