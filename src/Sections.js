import { useEffect, useState } from "react";
import api from "./api";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { canEdit } from "./permissions";

function Sections() {
  const [sections, setSections] = useState([]);
  const [data, setData] = useState({
    code: "",
    name: "",
    title: "",
    documentDate: "",
    content: "",
  });

  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // ✅ LOAD SECTIONS
  const load = () => {
    api.get("/sections").then((res) => setSections(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ SAVE
  const save = () => {
    if (!data.code || !data.title || !data.name) {
      alert("❌ Code, Title & Name required");
      return;
    }

    if (sections.some((s) => s.code === data.code) && !editingId) {
      alert("❌ Section code already exists");
      return;
    }

    const req =
      editingId !== null
        ? api.put(`/sections/${editingId}`, data)
        : api.post("/sections", data);

    req.then(() => {
      alert("✅ Saved");
      setData({ code: "", title: "", name: "", content: "", documentDate: "" });
      setEditingId(null);
      load();
    });
  };

  const edit = (s) => {
    console.log("EDIT SECTION", s);

    setEditingId(s.id);

    setData({
      code: s.code || "",
      name: s.name || "",
      title: s.title || "",
      documentDate: s.documentDate || "",
      content: s.content || "",
    });
  };

  // ✅ DOWNLOAD PDF
  const download = (id) => {
    window.open(`http://${process.env.BACKEND_APP_API_URL}/sections/${id}/pdf`, "_blank");
  };

  const insertSignatureTable = () => {
    setData({
      ...data,
      content: data.content + "<p>[[SIGNATURE_TABLE]]</p>",
    });
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="container mt-4">
      <h3>Section Builder</h3>

      {canEdit(user) && (
        <div className="card p-3">
          {/* ✅ BASIC FIELDS */}
          <input
            className="form-control mb-2"
            placeholder="Code (e.g. SEC-01)"
            value={data.code}
            disabled={editingId !== null}
            onChange={(e) => setData({ ...data, code: e.target.value })}
          />

          <input
            className="form-control mb-2"
            placeholder="Name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />

          <input
            className="form-control mb-2"
            placeholder="Title"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
          <input
            type="date"
            className="form-control"
            value={data.documentDate || ""}
            onChange={(e) =>
              setData({
                ...data,
                documentDate: e.target.value,
              })
            }
          />

          <button
            className="btn btn-sm btn-outline-dark mb-2"
            onClick={insertSignatureTable}
          >
            Insert Signature Table
          </button>

          {/* ✅ ✅ STEP 3 — CKEDITOR WITH INSTANCE */}
          <CKEditor
            key={editingId || "new"}
            editor={ClassicEditor}
            data={data.content || ""}
            onChange={(event, editor) => {
              const html = editor.getData();

              setData({
                ...data,
                content: html,
              });
            }}
            config={{
              toolbar: [
                "heading",
                "|",
                "bold",
                "italic",
                "underline",
                "|",
                "bulletedList",
                "numberedList",
                "|",
                "insertTable",
                "|",
                "link",
                "undo",
                "redo",
              ],
              table: {
                contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
              },
            }}
          />

          <button className="btn btn-success mt-3" onClick={save}>
            {editingId ? "Update Section" : "Save Section"}
          </button>
        </div>
      )}

      <hr />

      {/* ✅ SECTION LIST */}
      <h4>All Sections</h4>

      {sections.map((s) => (
        <div key={s.id} className="card p-2 mb-2">
          <div>
            <strong>
              {s.code} - {s.name} - {s.title}
            </strong>
          </div>

          <div className="mt-2">
            <button
              className="btn btn-sm btn-dark me-2"
              onClick={() => edit(s)}
            >
              Edit
            </button>

            <button
              className="btn btn-sm btn-secondary me-2"
              onClick={() => setPreview(s)}
            >
              Preview
            </button>

            <button
              className="btn btn-sm btn-success me-2"
              onClick={() => download(s.id)}
            >
              PDF
            </button>

            <button
              className="btn btn-sm btn-secondary me-2"
              onClick={() =>
                window.open(`http://${process.env.BACKEND_APP_API_URL}${s.imageUrl}`, "_blank")
              }
            >
              Preview Image
            </button>
          </div>
        </div>
      ))}

      {/* ✅ PREVIEW */}
      {preview && (
        <div className="card mt-3 p-3">
          <h5>
            {preview.name} - {preview.title}
          </h5>

          <div
            style={{ maxHeight: "300px", overflow: "auto" }}
            dangerouslySetInnerHTML={{ __html: preview.content }}
          />

          <button
            className="btn btn-sm btn-secondary mt-2"
            onClick={() => setPreview(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default Sections;
