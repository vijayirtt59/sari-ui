import { useEffect, useState } from "react";
import api from "./api";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { canEdit, canPrepare, canReview, canApprove } from "./permissions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    api.get("/pro").then((res) => setPros(res.data));
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
  };

  // ✅ SAVE (CREATE)
  const save = async () => {
    try {
      if (!data.code || !data.title) {
        alert("❌ Code and Title required");
        return;
      }

      const username = `${user.firstName} ${user.lastName}`;

      const payload = {
        ...data,
        registros,
        updatedBy: username,
        sectionIds: selectedSections.map((s) => s.id),
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
    api
      .post("/pro/preview", {
        ...data,
        sectionIds: selectedSections.map((s) => s.id),
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
      `http://${process.env.REACT_APP_API_URL}/pro/${encodeURIComponent(code)}/pdf`,
      "_blank",
    );
  };

  const action = (code, type) => {
    const username = `${user.firstName} ${user.lastName}`;

    api
      .post(`/pro/${code}/action?action=${type}&user=${username}`)
      .then(() => {
        alert("✅ Updated: " + type);
        loadPros();
      })
      .catch(() => {
        alert("❌ Failed action");
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

  const insertFirmas = () => {
    setData({
      ...data,
      procedimiento: data.procedimiento + "<p>[[FIRMAS]]</p>",
    });
  };

  const insertControlCambios = () => {
    setData({
      ...data,
      procedimiento: data.procedimiento + "<p>[[CONTROL_CAMBIOS]]</p>",
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

  return (
    <div className="container mt-4">
      {/* ========================================= */}
      {/* ✅ FORM */}
      {/* ========================================= */}

      {canEdit(user) && (
        <div className="card shadow-lg mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              {editingCode
                ? `Edit PRO (${editingCode})`
                : "Create PRO Document"}
            </h5>
          </div>

          <div className="card-body">
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
              <div className="col-md-4">
                <DatePicker
                  className="form-control mb-2"
                  selected={
                    data.documentDate ? new Date(data.documentDate) : null
                  }
                  onChange={(date) =>
                    setData({
                      ...data,
                      documentDate: date?.toISOString().split("T")[0],
                    })
                  }
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select document date"
                />
              </div>
            </div>

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
              <CKEditor
                key={"procedimiento_" + data.code}
                editor={ClassicEditor}
                config={editorConfig}
                data={data.procedimiento}
                onChange={(e, editor) =>
                  setData({ ...data, procedimiento: editor.getData() })
                }
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

            <h5 className="mt-4">Templates</h5>

            <button
              className="btn btn-sm btn-outline-dark me-2"
              onClick={insertFirmas}
            >
              Insert Firmas
            </button>

            <button
              className="btn btn-sm btn-outline-dark me-2"
              onClick={insertControlCambios}
            >
              Insert Control Cambios
            </button>

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
              className="border rounded p-3 mb-3"
              style={{ background: "#fafafa" }}
            >
              {/* ✅ TITLE ROW */}
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <b>{p.code}</b> {p.name} - {p.title}
                </div>
                <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                  Last updated by: {p.lastModifiedBy || "-"} on{" "}
                  {p.lastModifiedDate || "-"}
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
                    Prepare
                  </button>
                )}

                {p.status === "PREPARED" && canReview(user) && (
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => action(p.code, "REVIEW")}
                  >
                    Review
                  </button>
                )}

                {p.status === "REVIEWED" && canApprove(user) && (
                  <button
                    className="btn btn-sm btn-success me-2"
                    onClick={() => action(p.code, "APPROVE")}
                  >
                    Approve
                  </button>
                )}

                {/* ✅ PDF */}
                <button
                  className="btn btn-sm btn-outline-success me-2"
                  disabled={p.status !== "APPROVED"}
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
