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
  const [message, setMessage] = useState(null);
  const [showSections, setShowSections] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [sectionToDelete, setSectionToDelete] = useState(null);

  // ✅ LOAD SECTIONS
  const load = () => {
    api.get("/sections").then((res) => setSections(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const [editorKey, setEditorKey] = useState(0);

  const resetForm = () => {
    setEditingId(null);

    setData({
      code: "",
      name: "",
      title: "",
      documentDate: "",
      content: "",
    });

    setEditorKey((prev) => prev + 1);
  };

  // ✅ SAVE
  const save = () => {
    if (!data.code || !data.title || !data.name) {
      setMessage({
        type: "danger",
        text: "Code, Title and Name are required",
      });
      return;
    }

    if (sections.some((s) => s.code === data.code) && !editingId) {
      setMessage({
        type: "danger",
        text: "Section code already exists",
      });

      return;
    }

    const req =
      editingId !== null
        ? api.put(`/sections/${editingId}`, data)
        : api.post("/sections", data);

    req.then(() => {
      setMessage({
        type: "success",
        text: editingId
          ? "Section updated successfully"
          : "Section created successfully",
      });

      resetForm();
      load();

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    });
  };

  const edit = (s) => {
    setEditingId(s.id);

    setData({
      code: s.code || "",
      name: s.name || "",
      title: s.title || "",
      documentDate: s.documentDate || "",
      content: s.content || "",
    });

    setEditorKey((prev) => prev + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ✅ DOWNLOAD PDF
  const download = (id) => {
    window.open(
      `${process.env.REACT_APP_API_URL}/sections/${id}/pdf`,
      "_blank",
    );
  };

  const insertSignatureTable = () => {
    setData({
      ...data,
      content: data.content + "<p>[[SIGNATURE_TABLE]]</p>",
    });
  };

  const user = JSON.parse(localStorage.getItem("user"));

  const cancelEdit = () => {
    resetForm();
  };

  const askDelete = (section) => {

  setSectionToDelete(section);

  setShowDeleteModal(true);
};

  const confirmDelete = () => {

  api.delete(`/sections/${sectionToDelete.id}`)
    .then(() => {

      setMessage({
        type: "success",
        text: `Section ${sectionToDelete.code} deleted successfully`
      });

      setShowDeleteModal(false);

      setSectionToDelete(null);

      load();
    })
    .catch((err) => {

      setMessage({
        type: "danger",
        text:
          err.response?.data ||
          "Unable to delete section."
      });

      setShowDeleteModal(false);
    });
};

  return (
    <div className="container mt-4">
      <h3>{editingId ? "Edit Section" : "Section Builder"}</h3>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {canEdit(user) && (
        <div className="card p-3">
          {editingId && (
            <div className="alert alert-warning d-flex justify-content-between align-items-center">
              <span>
                Editing section:
                <strong> {data.code}</strong>
              </span>

              <button
                className="btn btn-sm btn-outline-dark"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>
          )}

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
            key={`${editorKey}-${editingId || "new"}`}
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

          <div className="mt-3">
            <button className="btn btn-success me-2" onClick={save}>
              {editingId ? "Update Section" : "Save Section"}
            </button>

            {editingId && (
              <button className="btn btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <hr />

      {/* ✅ SECTION LIST */}
      <div
        className="card p-2 mb-3"
        style={{ cursor: "pointer" }}
        onClick={() => setShowSections(!showSections)}
      >
        <h5 className="mb-0">
          {showSections ? "▼" : "▶"} All Sections ({sections.length})
        </h5>
      </div>
      {showSections &&
        sections.map((s) => (
          <div key={s.id} className="card p-2 mb-2">
            <div>
              <strong>
                {s.name} - {s.title}
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
                  window.open(
                    `${process.env.REACT_APP_API_URL}${s.imageUrl}`,
                    "_blank",
                  )
                }
              >
                Preview Image
              </button>

              <button
  className="btn btn-sm btn-outline-danger"
  onClick={() => askDelete(s)}
>
  Delete
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
      {showDeleteModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <div
      className="card shadow"
      style={{
        width: "500px",
        maxWidth: "90%"
      }}
    >
      <div className="card-header bg-danger text-white">
        Delete Section
      </div>

      <div className="card-body">
        <p>
          Are you sure you want to delete:
        </p>

        <p>
          <strong>
            {sectionToDelete?.code} - {sectionToDelete?.name}
          </strong>
        </p>

        <div className="alert alert-warning mb-0">
          This action cannot be undone.
        </div>
      </div>

      <div className="card-footer text-end">
        <button
          className="btn btn-secondary me-2"
          onClick={() => {
            setShowDeleteModal(false);
            setSectionToDelete(null);
          }}
        >
          Cancel
        </button>

        <button
          className="btn btn-danger"
          onClick={confirmDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Sections;
