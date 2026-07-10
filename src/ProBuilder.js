import { useEffect, useState } from "react";
import api from "./api";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { canEdit, canPrepare, canReview, canApprove } from "./permissions";
import { Editor } from "@tinymce/tinymce-react";

function ProBuilder({ user }) {
  const [data, setData] = useState({
    code: "",
    name: "",
    title: "",
    documentDate: "",
    objetivo: "",
    alcance: "",
    procedimiento: "",
  });
  

  const canPreview =
    data.code?.trim() &&
    data.title?.trim() &&
    data.objetivo?.trim() &&
    data.alcance?.trim() &&
    data.procedimiento?.trim();

  const [sections, setSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [preview, setPreview] = useState(null);
  const [listPreview, setListPreview] = useState(null);
  const [previewCode, setPreviewCode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPro, setSelectedPro] = useState(null);
  const [editingCode, setEditingCode] = useState(null);

  const [preparedBy, setPreparedBy] = useState("");
const [reviewedBy, setReviewedBy] = useState("");
const [approvedBy, setApprovedBy] = useState("");

const [preparedDate, setPreparedDate] = useState("");
const [reviewedDate, setReviewedDate] = useState("");
const [approvedDate, setApprovedDate] = useState("");
const [legacyDocument, setLegacyDocument] =
  useState(false);

const [changes, setChanges] = useState([
  {
    version: 0,
    description: "Emisión inicial",
    changeDate: null,
  },
]);

  const [forms, setForms] = useState([]);

  useEffect(() => {
    api.get("/forms").then((res) => setForms(res.data));
  }, [editingCode]);

  const [pros, setPros] = useState([]); // ✅ LIST

  // ✅ LOAD DATA
  useEffect(() => {
    loadPros();
    api.get("/sections").then((res) => setSections(res.data));
  }, []);

  // ✅ AUTOSAVE DRAFT
  useEffect(() => {
    localStorage.setItem("pro-builder-draft", JSON.stringify(data));
  }, [data]);

  // ✅ RESTORE DRAFT
  useEffect(() => {
    const saved = localStorage.getItem("pro-builder-draft");

    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  const loadPros = () => {
  api.get("/pro")
    .then((res) => {
      console.log("PRO RESPONSE", res.data);
      setPros(Array.isArray(res.data) ? res.data : []);
    })
    .catch((err) => {
      console.error(err);
      setPros([]);
    });
};

  // ✅ CKEDITOR CONFIG
  const editorConfig = {
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },

    toolbar: [
      "heading",
      "|",
      "bold",
      "italic",
      "|",
      "insertTable",
      "|",
      "numberedList",
      "bulletedList",
      "|",
      "undo",
      "redo",
    ],

list: {
    properties: {
      styles: true,
      startIndex: true,
      reversed: true,
    },
  },

  };

  // ✅ SAVE (CREATE)
  const save = async () => {
    try {
      if (!data.code || !data.title) {
        alert("❌ Code and Title required");
        return;
      }

      if (
  editingCode &&
  !changeDescription.trim()
) {
  alert(
    "Change Description is required"
  );
  return;
}

const invalidRegistro = registros.find(
  (r) => !r.responsableResguardo
);

if (invalidRegistro) {
  alert(
    "All registros must have a Responsable de Resguardo selected."
  );
  return;
}

      const username = `${user.firstName} ${user.lastName}`;

      const payload = {
  ...data,

  preparedBy,
  reviewedBy,
  approvedBy,

  preparedDate,
  reviewedDate,
  approvedDate,

  changes,
  changeDescription,

  registros,

  updatedBy: username,

  sectionIds: selectedSections.map(
    (s) => s.id
  ),
};

      console.log("editingCode", editingCode);

      if (editingCode) {
        await api.put(`/pro/${editingCode}`, payload);
      } else {
        await api.post("/pro", payload);
      }

      alert("✅ Saved");

      localStorage.removeItem("pro-builder-draft");

      setData({
        code: "",
        name: "",
        title: "",
        documentDate: "",
        objetivo: "",
        alcance: "",
        procedimiento: "",
      });
      setChangeDescription("");

      setEditingCode(null);

      setSelectedSections([]);

      setPreview(null);

      loadPros();
    } catch (e) {
      console.error(e);

      alert("❌ Save failed");
    }
  };

  // ✅ PREVIEW (IMPORTANT)
  const previewDoc = () => {
    api.post("/pro/preview", {
  ...data,

  preparedBy,
  reviewedBy,
  approvedBy,

  preparedDate,
  reviewedDate,
  approvedDate,

  changes,

  registros,

  sectionIds: selectedSections.map(
    s => s.id
  )
})
      .then((res) => {
        setPreview(res.data);
      });
  };

  // ✅ DELETE
  const remove = (id) => {
    api.delete(`/pro/${id}`).then(() => loadPros());
  };

  // ✅ PDF

  const downloadPdf = (code) => {
    window.open(
      `${process.env.REACT_APP_API_URL}/pro/${encodeURIComponent(code)}/pdf`,
      "_blank",
    );
  };

  const action = (code, type) => {

  api
    .post(
      `/pro/${code}/action`,
      null,
      {
        params: {
          action: type,
          userId: user.id
        }
      }
    )
    .then(() => {

      alert("✅ Updated: " + type);

      loadPros();

    })
    .catch((err) => {

      alert(
        err.response?.data?.message ||
        "Action failed"
      );

    });

};

  const previewFromList = (p) => {
    api.post("/pro/preview", p).then((res) => {
      setListPreview(res.data);
      setSelectedPro(p);
      setShowModal(true);
    });
  };

  const editPro = (p) => {
    setEditingCode(p.code);
    setData({
      code: p.code || "",
      name: p.name || "",
      title: p.title || "",
      documentDate: p.documentDate || "",
      objetivo: p.objetivo || "",
      alcance: p.alcance || "",
      procedimiento: p.procedimiento || "",
    });
    setRegistros(
      p.registros?.length
        ? p.registros
        : [
            {
              codigo: "",
              nombre: "",
              almacenamiento: "",
              tiempoRetencion: "",
              responsableResguardo: "",
            },
          ],
    );

    setSelectedSections([]); // ✅ reset sections (optional fix)
    setPreparedBy(p.preparedBy || "");
setReviewedBy(p.reviewedBy || "");
setApprovedBy(p.approvedBy || "");

setPreparedDate(p.preparedDate || "");
setReviewedDate(p.reviewedDate || "");
setApprovedDate(p.approvedDate || "");

setChanges(
  p.changes?.length
    ? p.changes
    : [
        {
          version: 0,
          description: "Initial Release",
          changeDate: null,
        },
      ]
);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const insertForm = (f) => {
    setData({
      ...data,
      procedimiento: data.procedimiento + `<p>[[FORM:${f.code}]]</p>`,
    });
  };

  const insertSection = (s) => {
    setData({
      ...data,
      procedimiento: data.procedimiento + `<p>[[SECTION:${s.code}]]</p>`,
    });
  };

  const [registros, setRegistros] = useState([
    {
      codigo: "",
      nombre: "",
      almacenamiento: "",
      tiempoRetencion: "",
      responsableResguardo: "",
    },
  ]);
  const addRegistro = () => {
    setRegistros([
      ...registros,
      {
        codigo: "",
        nombre: "",
        almacenamiento: "",
        tiempoRetencion: "",
        responsableResguardo: "",
      },
    ]);
  };
  const updateRegistro = (index, field, value) => {
    const updated = [...registros];

    updated[index][field] = value;

    setRegistros(updated);
  };
  const removeRegistro = (index) => {
    const updated = registros.filter((_, i) => i !== index);

    setRegistros(updated);
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

const updateChange = (
  index,
  field,
  value
) => {
  const copy = [...changes];

  copy[index][field] = value;

  setChanges(copy);
};

const removeChange = (index) => {
  setChanges(
    changes.filter(
      (_, i) => i !== index
    )
  );
};

const [changeDescription, setChangeDescription] =
  useState("");

  return (
    <div className="container pro-container mt-4" style={{ padding: "20px" }}>
      {/* ========================================= */}
      {/* ✅ FORM */}
      {/* ========================================= */}

      {canEdit(user) && (

  <div className="accordion mb-4">

    <div className="accordion-item">

      <h2 className="accordion-header">

        <button
  className="accordion-button collapsed"
  style={{
    background:
      "linear-gradient(135deg,#1e3a8a,#2563eb)",
    color: "white",
    fontWeight: "600",
    fontSize: "1.1rem"
  }}      
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#proBuilder"
        >
            <i className="bi bi-journal-text me-2"></i>
          {editingCode
            ? `Edit PRO (${editingCode})`
            : "Create PRO Document"}
        </button>

      </h2>

      <div
        id="proBuilder"
        className="accordion-collapse collapse"
      >

        <div className="accordion-body">
            {/* ✅ BASIC FIELDS */}
            <div className="row">
              <div className="col-md-4">
                <input
                  className="form-control mb-2"
                  placeholder="Code (PRO-01)"
                  value={data.code}
                  disabled={editingCode !== null}
                  onChange={(e) => setData({ ...data, code: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <input
                  className="form-control mb-2"
                  placeholder="Name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <input
                  className="form-control mb-2"
                  placeholder="Title"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                />
              </div>
              <div className="row align-items-end">

  <div className="col-md-4">
    <label className="form-label">
      Document Date
    </label>

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
  </div>

{!editingCode && (
  <div className="col-md-4">

  <div className="form-check form-switch">

    <input
      className="form-check-input"
      type="checkbox"
      checked={legacyDocument}
      onChange={(e) =>
        setLegacyDocument(
          e.target.checked
        )
      }
    />

    <label className="form-check-label">
      Historical Document
    </label>

    {legacyDocument ? (
      <span className="badge bg-success ms-2">
        APPROVED
      </span>
    ) : (
      <span className="badge bg-warning text-dark ms-2">
        DRAFT
      </span>
    )}

  </div>

</div>)}

</div>
            </div>

{!editingCode && legacyDocument && (
  <>

            <hr />

<h5>Workflow Information</h5>

<div className="row">

  <div className="col-md-4">

    <label>Prepared By</label>

    <input
      className="form-control"
      value={preparedBy}
      onChange={(e) =>
        setPreparedBy(e.target.value)
      }
    />

    <label className="mt-2">
      Prepared Date
    </label>

    <input
      type="date"
      className="form-control"
      value={preparedDate}
      onChange={(e) =>
        setPreparedDate(
          e.target.value
        )
      }
    />

  </div>

  <div className="col-md-4">

    <label>Reviewed By</label>

    <input
      className="form-control"
      value={reviewedBy}
      onChange={(e) =>
        setReviewedBy(e.target.value)
      }
    />

    <label className="mt-2">
      Reviewed Date
    </label>

    <input
      type="date"
      className="form-control"
      value={reviewedDate}
      onChange={(e) =>
        setReviewedDate(
          e.target.value
        )
      }
    />

  </div>

  <div className="col-md-4">

    <label>Approved By</label>

    <input
      className="form-control"
      value={approvedBy}
      onChange={(e) =>
        setApprovedBy(e.target.value)
      }
    />

    <label className="mt-2">
      Approved Date
    </label>

    <input
      type="date"
      className="form-control"
      value={approvedDate}
      onChange={(e) =>
        setApprovedDate(
          e.target.value
        )
      }
    />

  </div>

</div>

</>
)}

{!editingCode && legacyDocument && (
  <>
<hr />

<h5>Change History</h5>

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

      {changes.map((change, index) => (

        <tr key={index}>

          <td>
            <input
              type="number"
              className="form-control"
              value={change.version}
              onChange={(e) =>
                updateChange(
                  index,
                  "version",
                  Number(e.target.value)
                )
              }
            />
          </td>

          <td>
            <input
              className="form-control"
              value={change.description}
              onChange={(e) =>
                updateChange(
                  index,
                  "description",
                  e.target.value
                )
              }
            />
          </td>

          <td>
            <input
              type="date"
              className="form-control"
              value={change.changeDate || ""}
              onChange={(e) =>
                updateChange(
                  index,
                  "changeDate",
                  e.target.value
                )
              }
            />
          </td>

          <td>
            <button
              className="btn btn-sm btn-danger"
              onClick={() =>
                removeChange(index)
              }
            >
              Remove
            </button>
          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

</>
)}
{editingCode && (
  <>
    <hr />

    <h5>Revision Information</h5>

    <div className="alert alert-warning">
      Saving this document will create a new
      revision and restart the approval workflow.
    </div>

    <label>
      Change Description *
    </label>

    <textarea
      className="form-control"
      rows="3"
      value={changeDescription}
      onChange={(e) =>
        setChangeDescription(
          e.target.value
        )
      }
    />

  </>
)}

{(legacyDocument || editingCode) && (
<button
  className="btn btn-outline-primary btn-sm"
  onClick={addChange}
>
  + Add Change
</button>
)}


            {/* ✅ EDITORS */}
            <div className="mt-3">
              <h6>OBJETIVO</h6>
              <CKEditor
                key={"objetivo_" + data.code}
                editor={ClassicEditor}
                config={editorConfig}
                data={data.objetivo}
                onChange={(e, editor) =>
                  setData({ ...data, objetivo: editor.getData() })
                }
              />

              <h6 className="mt-4">ALCANCE</h6>
              <CKEditor
                key={"alcance_" + data.code}
                editor={ClassicEditor}
                config={editorConfig}
                data={data.alcance}
                onChange={(e, editor) =>
                  setData({ ...data, alcance: editor.getData() })
                }
              />

              <div className="mb-2"></div>

              <h6 className="mt-4">PROCEDIMIENTO</h6>

<Editor apiKey='0rofizmtdt5urrczcvs5wlzkkd3h8eckur9oojmzpio0g8wr'
  value={data.procedimiento}
  onEditorChange={(content) => {
    console.log("Editor content changed:", content);
    setData({
          ...data,
          procedimiento: content,
    })
  }
  }
  init={{
    paste_preprocess: (plugin, args) => {

  const div = document.createElement("div");

  div.innerHTML = args.content;

  

  div.querySelectorAll("*").forEach((el) => {

    el.removeAttribute("class");

    const style = el.getAttribute("style");

    if (!style) return;

    const cleaned = style

      .replace(/margin[^;]*;?/gi, "")
      .replace(/text-indent[^;]*;?/gi, "")
      .replace(/padding-left[^;]*;?/gi, "")
      .replace(/mso-[^:]+:[^;]+;?/gi, "");

    if (cleaned.trim()) {
      el.setAttribute("style", cleaned);
    } else {
      el.removeAttribute("style");
    }
  });

  args.content = div.innerHTML;
},
paste_as_text: false,
paste_remove_styles_if_webkit: true,
paste_webkit_styles: "none",
    height: 600,

    menubar: true,

    plugins: [
      "paste",
      "lists",
      "table",
      "link",
      "code",
      "fullscreen",
      "searchreplace",
      "wordcount",
    ],

    toolbar:
      "undo redo | " +
      "styles | " +
      "bold italic underline | " +
      "bullist numlist | " +
      "table | " +
      "link | " +
      "code fullscreen",

    table_default_attributes: {
      border: "1",
    },

    content_style: `
      body {
        font-family:Arial,sans-serif;
        font-size:14px;
      }
    `,
  }}
/>
              <h6 className="mt-4">REGISTROS</h6>

              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr className="table-secondary">
                      <th rowSpan="2">Código</th>

                      <th rowSpan="2">Nombre</th>

                      <th colSpan="3" className="text-center">
                        Retención / Archivo activo
                      </th>

                      <th rowSpan="2">Actions</th>
                    </tr>

                    <tr className="table-secondary">
                      <th>Almacenamiento</th>

                      <th>Tiempo de retención y disposición</th>

                      <th>Responsable de resguardo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registros.map((r, index) => (
                      <tr key={index}>
                        {/* ✅ CODIGO */}

                        <td>
                          <input
                            className="form-control"
                            value={r.codigo}
                            onChange={(e) =>
                              updateRegistro(index, "codigo", e.target.value)
                            }
                          />
                        </td>

                        {/* ✅ NOMBRE */}

                        <td>
                          <input
                            className="form-control"
                            value={r.nombre}
                            onChange={(e) =>
                              updateRegistro(index, "nombre", e.target.value)
                            }
                          />
                        </td>

                        {/* ✅ ALMACENAMIENTO */}

                        <td>
                          <input
                            className="form-control"
                            value={r.almacenamiento}
                            onChange={(e) =>
                              updateRegistro(
                                index,
                                "almacenamiento",
                                e.target.value,
                              )
                            }
                          />
                        </td>

                        {/* ✅ TIEMPO */}

                        <td>
                          <input
                            className="form-control"
                            value={r.tiempoRetencion}
                            onChange={(e) =>
                              updateRegistro(
                                index,
                                "tiempoRetencion",
                                e.target.value,
                              )
                            }
                          />
                        </td>

                        {/* ✅ RESPONSABLE */}

                        <td>
                          <select
                            className="form-select"
                            value={r.responsableResguardo}
                            onChange={(e) =>
                              updateRegistro(
                                index,
                                "responsableResguardo",
                                e.target.value,
                              )
                            }
                          >
                            <option value="">Select</option>

                            <option value="COORDINADOR_SARI">
                              Coordinador del SARI
                            </option>

                            <option value="RESPONSABLE_VENTAS_COMPRAS">
                              Responsable de Ventas y Compras
                            </option>

                            <option value="AGENTES_VENTAS">
                              Agentes de Ventas
                            </option>

                            <option value="COORDINADOR_SISTEMA_SARI">
                              Coordinador de Sistema SARI
                            </option>
                          </select>
                        </td>

                        {/* ✅ DELETE */}

                        <td>
                          <button
                            className="
                btn
                btn-sm
                btn-outline-danger
              "
                            onClick={() => removeRegistro(index)}
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
                className="
    btn
    btn-outline-primary
    btn-sm
  "
                onClick={addRegistro}
              >
                + Add Registro
              </button>
            </div>
            <h5 className="mt-4">Reusable Sections</h5>

            <div className="accordion mt-4">
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#sectionsCollapse"
                  >
                    📚 Reusable Sections ({sections.length})
                  </button>
                </h2>

                <div
                  id="sectionsCollapse"
                  className="accordion-collapse collapse"
                >
                  <div
                    className="accordion-body"
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    {sections.map((s) => (
                      <div
                        key={s.id}
                        className="
              border
              rounded
              p-2
              mb-2
              d-flex
              justify-content-between
              align-items-center
            "
                      >
                        <div>
                          <b>{s.code}</b> {s.name}
                        </div>

                        <button
                          className="
                btn
                btn-sm
                btn-outline-primary
              "
                          onClick={() => insertSection(s)}
                        >
                          Insert
                        </button>
                      </div>
                    ))}
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
                    data-bs-target="#formsCollapse"
                  >
                    📄 Form Templates ({forms.length})
                  </button>
                </h2>

                <div id="formsCollapse" className="accordion-collapse collapse">
                  <div
                    className="accordion-body"
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    {forms.map((f) => (
                      <div
                        key={f.id}
                        className="
              border
              rounded
              p-2
              mb-2
              d-flex
              justify-content-between
              align-items-center
            "
                      >
                        <div>
                          <b>{f.code}</b> {f.title}
                        </div>

                        <button
                          className="
                btn
                btn-sm
                btn-outline-primary
              "
                          onClick={() => insertForm(f)}
                        >
                          Insert
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ ACTION BUTTONS */}
            <div className="mt-4">
              <button
                className="btn btn-success me-2"
                onClick={save}
                disabled={!canPreview}
              >
                Save
              </button>
              {editingCode && (
                <button
                  className="btn btn-outline-danger ms-2"
                  onClick={() => {
                    setEditingCode(null);
                    setData({
                      code: "",
                      name: "",
                      title: "",
                      documentDate: "",
                      objetivo: "",
                      alcance: "",
                      procedimiento: "",
                    });

setRegistros([
    {
      codigo: "",
      nombre: "",
      almacenamiento: "",
      tiempoRetencion: "",
      responsableResguardo: "",
    },
  ]);

  setChangeDescription("");

setPreparedBy("");
  setReviewedBy("");
  setApprovedBy("");

  setPreparedDate("");
  setReviewedDate("");
  setApprovedDate("");


  setChanges([
    {
      version: 0,
      description: "Emisión inicial",
      changeDate: null,
    },
  ]);

  setPreview(null);
  setSelectedSections([]);
                  }}
                >
                  Cancel
                </button>
              )}

              <button
                className="btn btn-outline-secondary"
                onClick={previewDoc}
                disabled={!canPreview}
                title={!canPreview ? "Complete all sections first" : ""}
              >
                Preview
              </button>
            </div>

            {preview && (
              <div className="card mt-4 border">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <b>Preview</b>

                  {/* ✅ CLOSE BUTTON */}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setPreview(null)}
                  >
                    Close
                  </button>
                </div>

                <div
                  className="card-body"
                  style={{ maxHeight: "400px", overflow: "auto" }}
                >
                  <div dangerouslySetInnerHTML={{ __html: preview }} />
                </div>
              </div>
            )}
                  </div>

      </div>

    </div>

  </div>

)}

      {/* ========================================= */}
      {/* ✅ PRO LIST */}
      {/* ========================================= */}

      <div className="card shadow-lg">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">PRO Documents</h5>
        </div>

        <div className="card-body">
          {pros.map((p) => (
            <div
  key={p.id}
  className="
    card
    shadow-sm
    border-0
    mb-3
  "
  style={{ background: "#fafafa" }}
>
            
              {/* ✅ TITLE ROW */}
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <b>{p.code}</b> {p.name}
                
                  <div
  className="
    d-flex
    flex-wrap
    gap-3
    small
    text-muted
    mt-2
  "
>

  Prepared:
  {" "}
  {p.preparedBy || "-"}
  {" | "}

  Reviewed:
  {" "}
  {p.reviewedBy || "-"}
  {" | "}

  Approved:
  {" "}
  {p.approvedBy || "-"}

</div>
                
                </div>

                {/* ✅ STATUS BADGE */}
                <span
                  className={`badge ${
                    p.status === "APPROVED"
                      ? "bg-success"
                      : p.status === "REVIEWED"
                        ? "bg-info"
                        : p.status === "PREPARED"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              {/* ✅ ACTIONS */}
              <div className="mt-3">
                {canEdit(user) && (
                  <button
                    className="btn btn-sm btn-outline-dark me-2"
                    onClick={() => editPro(p)}
                  >
                    Edit
                  </button>
                )}

                {/* ✅ PREVIEW BUTTON */}
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => previewFromList(p)}
                >
                  Preview
                </button>

                {/* ✅ WORKFLOW BUTTONS */}

                {p.status === "DRAFT" && canPrepare(user) && (
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => action(p.code, "PREPARE")}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
Prepare
                  </button>
                )}

                {p.status === "PREPARED" && canReview(user) && (
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => action(p.code, "REVIEW")}
                  >
                    <i className="bi bi-clipboard-check me-1"></i>
Review
                  </button>
                )}

                {p.status === "REVIEWED" && canApprove(user) && (
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => action(p.code, "APPROVE")}
                  >
                    <i className="bi bi-shield-check me-1"></i>
Approve
                  </button>
                )}

                {/* ✅ PDF */}
                <button
                  className="btn btn-sm btn-outline-success me-2"
                  onClick={() => downloadPdf(p.code)}
                >
                  PDF
                </button>

                {/* ✅ DELETE */}
                {canEdit(user) && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => remove(p.id)}
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* ✅ ✅ ✅ PREVIEW PANEL (IMPORTANT — ADD HERE) */}
              {previewCode === p.code && listPreview && (
                <div className="card mt-3 border">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <b>Preview</b>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setPreviewCode(null);
                        setListPreview(null);
                      }}
                    >
                      Close
                    </button>
                  </div>

                  <div
                    className="card-body"
                    style={{ maxHeight: "400px", overflow: "auto" }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: listPreview }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "80%",
              height: "80%",
              background: "white",
              borderRadius: "8px",
              padding: "15px",
              overflow: "auto",
            }}
          >
            {/* HEADER */}
            <div className="d-flex justify-content-between mb-2">
              <h5>PRO Preview</h5>

              <button
                className="btn btn-sm btn-danger"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
            {selectedPro && (
              <div className="mb-3">
                <b>Prepared:</b> {selectedPro.preparedBy || "-"} <br />
                <b>Reviewed:</b> {selectedPro.reviewedBy || "-"} <br />
                <b>Approved:</b> {selectedPro.approvedBy || "-"}
              </div>
            )}

            {/* CONTENT */}
            <div dangerouslySetInnerHTML={{ __html: listPreview }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProBuilder;
