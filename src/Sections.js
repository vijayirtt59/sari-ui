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
    api
      .delete(`/sections/${sectionToDelete.id}`)
      .then(() => {
        setMessage({
          type: "success",
          text: `Section ${sectionToDelete.code} deleted successfully`,
        });

        setShowDeleteModal(false);

        setSectionToDelete(null);

        load();
      })
      .catch((err) => {
        setMessage({
          type: "danger",
          text: err.response?.data || "Unable to delete section.",
        });

        setShowDeleteModal(false);
      });
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm mb-3">

  <div className="card-header d-flex justify-content-between align-items-center">

    <h5 className="mb-0">
      🗂 Sections
    </h5>

  </div>

</div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {canEdit(user) && (
        <div className="card shadow mb-4 p-3">
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
  className="card shadow mb-3"
  style={{ cursor: "pointer" }}
  onClick={() => setShowSections(!showSections)}
>

  <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">

    <h5 className="mb-0">
      {showSections ? "▼" : "▶"} All Sections
    </h5>

    <span className="badge bg-light text-dark">
      {sections.length}
    </span>

  </div>

</div>
      {showSections &&
        sections.map((s) => (
          <div
  key={s.id}
  className="card shadow-sm mb-2"
  style={{
  transition: "all .2s ease",
  cursor: "pointer",
}}
onClick={() => setPreview(s)}
  onMouseEnter={(e) => {
    e.currentTarget.style.background =
      "#f8fafc";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background =
      "white";
  }}
>
            <div className="card-body d-flex justify-content-between align-items-center">

 <div>

  <div className="fw-bold">
    {s.name}
  </div>

</div>

<div>

  <button
    className="btn btn-sm btn-outline-warning me-2"
                onClick={(e) => {
  e.stopPropagation();
  edit(s);
}}
              >
                ✏️ Edit
              </button>

              <button
                className="btn btn-sm btn-secondary me-2"
                onClick={() => setPreview(s)}
              >
                📄 Preview
              </button>

              <button
                className="btn btn-sm btn-success me-2"
                onClick={(e) => {
  e.stopPropagation();
  download(s.id);
}}
              >
                ⬇ PDF
              </button>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={(e) => {
  e.stopPropagation();
  askDelete(s);
}}
              >
                🗑 Delete
              </button>
              </div>
            </div>
          </div>
        ))}

      {/* ✅ PREVIEW */}
      {preview && (

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
            {preview.code}
          </div>

          <h4 className="mb-0">
            {preview.name}
          </h4>

        </div>

        <button
          className="btn btn-light btn-sm"
          onClick={() => setPreview(null)}
        >
          Close
        </button>

      </div>

      <div className="card-body">

        <div className="row mb-4">

          <div className="col-md-6">

            <div className="card bg-light">

              <div className="card-body text-center">

                <small>Code</small>

                <div className="fw-bold">
                  {preview.code}
                </div>

              </div>

            </div>

          </div>

          <div className="col-md-6">

            <div className="card bg-light">

              <div className="card-body text-center">

                <small>Date</small>

                <div className="fw-bold">
                  {preview.documentDate || "-"}
                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="mb-3">

          <button
            className="btn btn-success"
            onClick={() => download(preview.id)}
          >
            ⬇ Download PDF
          </button>

        </div>

        <hr />

        <h4 className="mb-3">
          📄 Section Content
        </h4>

        <div
          dangerouslySetInnerHTML={{
            __html: preview.content,
          }}
        />

      </div>

    </div>

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
            alignItems: "center",
          }}
        >
          <div
            className="card shadow"
            style={{
              width: "500px",
              maxWidth: "90%",
            }}
          >
            <div className="card-header bg-danger text-white">
              Delete Section
            </div>

            <div className="card-body">
              <p>Are you sure you want to delete:</p>

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

              <button className="btn btn-danger" onClick={confirmDelete}>
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
