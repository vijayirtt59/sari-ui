import { useState } from "react";
import { useEffect } from "react";
import api from "./api";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

function CreateDocument({ role, docs, onCreated, selectedCode }) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [preparedBy, setPreparedBy] = useState("");
  const [reviewedBy, setReviewedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");

  const [preparedDate, setPreparedDate] = useState("");
  const [reviewedDate, setReviewedDate] = useState("");
  const [approvedDate, setApprovedDate] = useState("");
  const [changeDescription, setChangeDescription] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [availableImages, setAvailableImages] = useState([]);
  const [editorInstance, setEditorInstance] = useState(null);

  const [showCreateForm, setShowCreateForm] =
  useState(false);
  const [viewDoc, setViewDoc] = useState(null);

  const loadImages = () => {
    api.get("/doc-images").then((res) => {
      setAvailableImages(res.data);
    });
  };

  useEffect(() => {
    loadImages();
  }, []);

  const uploadImage = () => {
    if (!selectedImage) {
      return;
    }

    const formData = new FormData();

    formData.append("file", selectedImage);

    api
      .post("/doc-images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setSelectedImage(null);

        loadImages();

        setMessage({
          type: "success",
          text: "Image uploaded",
        });
      });
  };

  const [changes, setChanges] = useState([
    {
      version: 0,
      description: "Emisión inicial",
      changeDate: null,
    },
  ]);

  const insertImageTag = (fileName) => {
    if (!editorInstance) {
      return;
    }

    editorInstance.model.change((writer) => {
      editorInstance.model.insertContent(
        writer.createText(`\n[IMAGE:${fileName}]\n`),
      );
    });
  };

  // ✅ find selected document
  const selectedDoc = docs?.find((d) => d.code === selectedCode);

  // ✅ reset form
  const resetForm = () => {
    setCode("");
    setTitle("");
    setName("");
    setContent("");
    setEditingId(null);
    setPreparedBy("");
    setReviewedBy("");
    setApprovedBy("");
    setDate("");
    setPreparedDate("");
    setReviewedDate("");
    setApprovedDate("");
    setChangeDescription("");

    setChanges([
      {
        version: 0,
        description: "Emisión inicial",
        changeDate: null,
      },
    ]);
    setShowCreateForm(false);
  };

  // ✅ CREATE / UPDATE
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!code || !title || !name || !date) {
      setMessage({
        type: "danger",
        text: "Please fill all required fields",
      });
      return;
    }
    if (editingId && !changeDescription.trim()) {
      setMessage({
        type: "danger",
        text: "Change Description is required.",
      });

      return;
    }

    const payload = {
      code,
      title,
      name,
      content,
      preparedBy,
      reviewedBy,
      approvedBy,
      date,
      preparedDate,
      reviewedDate,
      approvedDate,
      changes,
      changeDescription,
    };

    const call = editingId
      ? api.put(`/docs/${editingId}`, payload)
      : api.post("/docs", payload);

    call.then(() => {
      setMessage({
        type: "success",
        text: editingId
          ? "Document updated successfully"
          : "Document created successfully",
      });

      setTimeout(() => {
        setMessage(null);
      }, 3000);

      resetForm();

setShowCreateForm(false);


      if (onCreated) onCreated();
    });
  };

  // ✅ EDIT CLICK
  const handleEdit = (doc) => {

  setShowCreateForm(true);

  setCode(doc.code);
  setTitle(doc.title);
  setName(doc.name);
  setDate(doc.date || "");
  setContent(doc.content || "");
  setEditingId(doc.id);
};

  // ✅ DOWNLOAD PDF
  const handleDownload = (code) => {
    window.open(`${process.env.REACT_APP_API_URL}/docs/${code}/pdf`, "_blank");
  };

  const addChange = () => {
    setChanges([
      ...changes,
      {
        version: changes.length,
        description: "",
        changeDate: null,
      },
    ]);
  };

  const updateChange = (index, field, value) => {
    const updated = [...changes];

    updated[index][field] = value;

    setChanges(updated);
  };

  const removeChange = (index) => {
    setChanges(changes.filter((_, i) => i !== index));
  };

  const askDelete = (doc) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    api
      .delete(`/docs/${docToDelete.id}`)
      .then(() => {
        setShowDeleteModal(false);
        setDocToDelete(null);

        if (onCreated) {
          onCreated();
        }

        setMessage({
          type: "success",
          text: "Document deleted successfully",
        });

        setTimeout(() => {
          setMessage(null);
        }, 3000);
      })
      .catch(() => {
        setMessage({
          type: "danger",
          text: "Failed to delete document",
        });
      });
  };

  const [message, setMessage] = useState(null);

  // =========================================
  // ✅ VIEW MODE (ALL USERS)
  // =========================================
  if (selectedCode && selectedDoc && !editingId) {
    return (
      <div className="container mt-4">
        <div className="card shadow">
          <div className="card-header bg-dark text-white text-center">
            <h5>
              {selectedDoc.code} - {selectedDoc.name}
            </h5>
          </div>

          <div className="accordion mt-4">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#docInfo"
                >
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Document Information
                </button>
              </h2>

              <div id="docInfo" className="accordion-collapse collapse">
                <div className="accordion-body">
                  <div className="row">
                    <div className="col-md-4">
                      <strong>Prepared By:</strong>
                      <br />
                      {selectedDoc.preparedBy || "-"}
                    </div>

                    <div className="col-md-4">
                      <strong>Reviewed By:</strong>
                      <br />
                      {selectedDoc.reviewedBy || "-"}
                    </div>

                    <div className="col-md-4">
                      <strong>Approved By:</strong>
                      <br />
                      {selectedDoc.approvedBy || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="accordion mt-3">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#changeHistory"
                >
                  <i className="bi bi-clock-history me-2"></i>
                  Change History
                </button>
              </h2>

              <div id="changeHistory" className="accordion-collapse collapse">
                <div className="accordion-body">
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>Version</th>
                          <th>Description</th>
                          <th>Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedDoc.changes?.length > 0 ? (
                          selectedDoc.changes.map((change, index) => (
                            <tr key={index}>
                              <td>{change.version}</td>

                              <td>{change.description}</td>

                              <td>{change.changeDate}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center text-muted">
                              No change history available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
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
                ? new Date(selectedDoc.date + "T00:00:00").toLocaleDateString(
                    "es-MX",
                  )
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
      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}
      {/* ✅ HEADER */}

{role === "ADMIN" && (
  <div className="card shadow-sm mb-3">

    <div className="card-header d-flex justify-content-between align-items-center">

      <h5 className="mb-0">
        🛡 Policies & Governance
      </h5>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() =>
          setShowCreateForm(!showCreateForm)
        }
      >
        {showCreateForm
          ? "Close Form"
          : "Create Document"}
      </button>

    </div>

  </div>
)}

{/* ✅ FORM */}
{role === "ADMIN" &&
 showCreateForm && (
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

                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              {editingId && (
                <>
                  <div className="alert alert-warning">
                    Describe the reason for this revision.
                  </div>

                  <div className="mb-3">
                    <label>Change Description *</label>

                    <textarea
                      className="form-control"
                      rows="3"
                      value={changeDescription}
                      onChange={(e) => setChangeDescription(e.target.value)}
                    />
                  </div>
                </>
              )}
              {!editingId && (
                <>
                  <hr />

                  <h5>Workflow Information</h5>

                  <div className="row">
                    <div className="col-md-4">
                      <label>Prepared By</label>

                      <input
                        className="form-control"
                        value={preparedBy}
                        onChange={(e) => setPreparedBy(e.target.value)}
                      />

                      <label className="mt-2">Prepared Date</label>

                      <input
                        type="date"
                        className="form-control"
                        value={preparedDate}
                        onChange={(e) => setPreparedDate(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label>Reviewed By</label>

                      <input
                        className="form-control"
                        value={reviewedBy}
                        onChange={(e) => setReviewedBy(e.target.value)}
                      />

                      <label className="mt-2">Reviewed Date</label>

                      <input
                        type="date"
                        className="form-control"
                        value={reviewedDate}
                        onChange={(e) => setReviewedDate(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label>Approved By</label>

                      <input
                        className="form-control"
                        value={approvedBy}
                        onChange={(e) => setApprovedBy(e.target.value)}
                      />

                      <label className="mt-2">Approved Date</label>

                      <input
                        type="date"
                        className="form-control"
                        value={approvedDate}
                        onChange={(e) => setApprovedDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <hr />

                  <h5 className="mt-4">Change History</h5>

                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Version</th>
                          <th>Description</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {changes.map((c, index) => (
                          <tr key={index}>
                            <td style={{ width: "120px" }}>
                              <input
                                type="number"
                                className="form-control"
                                value={c.version}
                                onChange={(e) =>
                                  updateChange(
                                    index,
                                    "version",
                                    Number(e.target.value),
                                  )
                                }
                              />
                            </td>

                            <td>
                              <input
                                className="form-control"
                                value={c.description}
                                onChange={(e) =>
                                  updateChange(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>

                            <td style={{ width: "180px" }}>
                              <input
                                type="date"
                                className="form-control"
                                value={c.changeDate || ""}
                                onChange={(e) =>
                                  updateChange(
                                    index,
                                    "changeDate",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>

                            <td style={{ width: "110px" }}>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removeChange(index)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addChange}
                  >
                    + Add Change
                  </button>
                </>
              )}

              <div className="mb-3">
                <label>Content</label>

                <CKEditor
                  editor={ClassicEditor}
                  data={content}
                  onReady={(editor) => {
                    setEditorInstance(editor);
                  }}
                  onChange={(event, editor) => {
                    setContent(editor.getData());
                  }}
                />
              </div>

              <hr />

              <div className="mt-4">
                <h5>Document Images</h5>

                
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-8">
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) =>
                            setSelectedImage(e.target.files?.[0] || null)
                          }
                        />
                      </div>

                      <div className="col-md-4">
                        <button
                          type="button"
                          className="btn btn-primary w-100"
                          onClick={uploadImage}
                          disabled={!selectedImage}
                        >
                          Upload Image
                        </button>
                      </div>
                    </div>

                    <hr />

                    <h6>Available Images</h6>

                    {availableImages.length === 0 ? (
                      <div className="text-muted">No images uploaded.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>Image</th>
                              <th style={{ width: "120px" }}>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {availableImages.map((img) => (
                              <tr key={img}>
                                <td>
                                  <a
                                    href={`${process.env.REACT_APP_API_URL}/doc/${img}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {img}
                                  </a>
                                </td>

                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => insertImageTag(img)}
                                  >
                                    Insert
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="alert alert-info mt-3 mb-0">
                      Clicking <b>Insert</b> will add:
                      <div className="mt-2">
                        <code>[IMAGE:file-name.png]</code>
                      </div>
                      into the document.
                    </div>
                  
                </div>
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

  <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">

    <h5 className="mb-0">
      📚 Controlled Documents
    </h5>

    <span className="badge bg-light text-dark">
      {docs?.length || 0}
    </span>

  </div>


        <div className="card-body">
          {docs && docs.length > 0 ? (
            docs.map((doc) => (
              <div
  key={doc.id}
  className="
    d-flex
    justify-content-between
    align-items-center
    border-bottom
    py-3
  "
  style={{
    cursor: "pointer",
     transition: "all .2s ease"
  }}
  onMouseEnter={(e) => {
  e.currentTarget.style.background =
    "#f8fafc";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.background =
    "white";
}}
  onClick={() =>
    setViewDoc(doc)
  }
>
                <div>

  <div className="fw-bold">
    {doc.code}
  </div>

  <small className="text-muted">
    {doc.name}
  </small>

</div>

                <div>
                  <button
                    className="btn btn-sm btn-outline-success me-2"
                    onClick={(e) => {
  e.stopPropagation();
  handleDownload(doc.code);
}}
                  >
                    📄 PDF
                  </button>

                  {role === "ADMIN" && (
                    <>
                      <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={(e) => {
  e.stopPropagation();
  handleEdit(doc);
}}
                      >
                      ✏️ Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
  e.stopPropagation();
  askDelete(doc);
}}
                      >
                      🗑 Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted">No documents available</div>
          )}
        </div>
      </div>
      {viewDoc && (

  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.5)",
      zIndex: 9998,
      overflowY: "auto",
      padding: 0,
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
  borderRadius: 0,
  overflow: "auto",
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

          
<div
    className="badge bg-light text-dark mb-2"
  >
    {viewDoc.code}
  </div>


          <h4 className="mb-0">
            {viewDoc.name}
          </h4>

        </div>

        <button
          className="
            btn
            btn-light
            btn-sm
          "
          onClick={() =>
            setViewDoc(null)
          }
        >
          Close
        </button>

      </div>

      <div className="card-body">
        <div className="card-body">

  <div className="row mb-4">

    <div className="col-md-4">

      <div className="card bg-light">

        <div className="card-body text-center">

          <small>Code</small>

          <div className="fw-bold">
            {viewDoc.code}
          </div>

        </div>

      </div>

    </div>

    <div className="col-md-4">

      <div className="card bg-light">

        <div className="card-body text-center">

          <small>Date</small>

          <div className="fw-bold">
            {viewDoc.date || "-"}
          </div>

        </div>

      </div>

    </div>

    <div className="col-md-4">

      <div className="card bg-light">

        <div className="card-body text-center">

          <small>Prepared By</small>

          <div className="fw-bold">
            {viewDoc.preparedBy || "-"}
          </div>

        </div>

      </div>

    </div>

  </div>

  <div className="mb-3">
    <div className="accordion mb-3">

  <div className="accordion-item">

    <h2 className="accordion-header">

      <button
        className="accordion-button collapsed"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#viewerDocInfo"
      >
        📋 Document Information
      </button>

    </h2>

    <div
      id="viewerDocInfo"
      className="accordion-collapse collapse"
    >

      <div className="accordion-body">

        <div className="row">

          <div className="col-md-4">

            <strong>Prepared By</strong>

            <div>
              {viewDoc.preparedBy || "-"}
            </div>

          </div>

          <div className="col-md-4">

            <strong>Reviewed By</strong>

            <div>
              {viewDoc.reviewedBy || "-"}
            </div>

          </div>

          <div className="col-md-4">

            <strong>Approved By</strong>

            <div>
              {viewDoc.approvedBy || "-"}
            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

</div>
<div className="accordion mb-3">

  <div className="accordion-item">

    <h2 className="accordion-header">

      <button
        className="accordion-button collapsed"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#viewerHistory"
      >
        🕒 Change History
      </button>

    </h2>

    <div
      id="viewerHistory"
      className="accordion-collapse collapse"
    >

      <div className="accordion-body">

        <table className="table table-sm">

          <thead>

            <tr>
              <th>Version</th>
              <th>Description</th>
              <th>Date</th>
            </tr>

          </thead>

          <tbody>

            {viewDoc.changes?.map(
              (change, index) => (

                <tr key={index}>
                  <td>{change.version}</td>
                  <td>{change.description}</td>
                  <td>{change.changeDate}</td>
                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  </div>

</div>

    <button
      className="btn btn-success"
      onClick={() =>
        handleDownload(viewDoc.code)
      }
    >
      📄 Download PDF
    </button>

  </div>
  <hr />

<h4 className="mb-3">
  📄 Document Content
</h4>

  <div
    dangerouslySetInnerHTML={{
      __html: viewDoc.content,
    }}
  />

</div>

        

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
              Delete Document
            </div>

            <div className="card-body">
              <p>Are you sure you want to delete:</p>

              <p>
                <strong>
                  {docToDelete?.code} - {docToDelete?.name}
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
                  setDocToDelete(null);
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

export default CreateDocument;
