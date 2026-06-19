import { useEffect, useState } from "react";
import api from "./api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function PurchaseOrderPage({ user }) {

  const [data, setData] = useState({
    poNumber: "",
    date: null,
    product: "",
    origin: "",
    producer: "",
    grade: "",
    quantity: "",
    price: "",
    packaging: "",
    logistics: "",
    incoterm: "",
    credit: "",
    shipment: "",
    notes: "",
  });

  const [pos, setPos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  // ✅ LOAD
  useEffect(() => {
    loadPOs();
  }, []);

  const loadPOs = () => {
    api.get("/po")
      .then((res) => setPos(res.data));
  };

  // ✅ DATE FORMAT (NO TIMEZONE ISSUE)
  const formatDate = (date) => {
    if (!date) return null;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  // ✅ SAVE
  const save = () => {

    if (!data.poNumber || !data.date) {
      alert("❌ PO Number and Date required");
      return;
    }

    const payload = {
      ...data,
      date: formatDate(data.date),

    createdBy:
        user.firstName + " " + user.lastName,

    };

    const call = editingId
      ? api.put(`/po/${editingId}`, payload)
      : api.post("/po", payload);

    call.then(() => {
      alert("✅ Saved");

      resetForm();
      loadPOs();
    });
  };

  // ✅ RESET
  const resetForm = () => {
    setData({
      poNumber: "",
      date: null,
      product: "",
      origin: "",
      producer: "",
      grade: "",
      quantity: "",
      price: "",
      packaging: "",
      logistics: "",
      incoterm: "",
      credit: "",
      shipment: "",
      notes: "",
    });

    setEditingId(null);
  };

  // ✅ EDIT
  const edit = (p) => {

    setEditingId(p.id);

    setData({
      poNumber: p.poNumber || "",
      date: p.date ? new Date(p.date + "T00:00:00") : null,
      product: p.product || "",
      origin: p.origin || "",
      producer: p.producer || "",
      grade: p.grade || "",
      quantity: p.quantity || "",
      price: p.price || "",
      packaging: p.packaging || "",
      logistics: p.logistics || "",
      incoterm: p.incoterm || "",
      credit: p.credit || "",
      shipment: p.shipment || "",
      notes: p.notes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ PDF
  const downloadPdf = (id) => {
    window.open(
      `http://localhost:8080/po/${id}/pdf`,
      "_blank"
    );
  };

  // ✅ FILTER
  const filtered = pos.filter((p) =>
    p.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.product?.toLowerCase().includes(search.toLowerCase()) ||
    p.producer?.toLowerCase().includes(search.toLowerCase())
  );

  const action = (id, type) => {

  const username =
    user.firstName + " " + user.lastName;

  api.post(
    `/po/${id}/action?action=${type}&user=${username}`
  ).then(() => {
    loadPOs();
  });
};

  return (
    <div className="container mt-4">

      {/* ===================================== */}
      {/* ✅ FORM */}
      {/* ===================================== */}

      <div className="card shadow mb-4">

        <div className="card-header bg-primary text-white d-flex justify-content-between">
          <h5 className="mb-0">
            {editingId ? "Edit Purchase Order" : "Create Purchase Order"}
          </h5>

          {editingId && (
            <button
              className="btn btn-light btn-sm"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="card-body">

          <div className="row">

            <div className="col-md-4">
              <input
  className="form-control"
  placeholder="PO Number (auto)"
  value={data.poNumber}
  readOnly
/>
            </div>

            <div className="col-md-4">
              <DatePicker
                className="form-control mb-2"
                selected={data.date}
                onChange={(date) =>
                  setData({ ...data, date })
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="Fecha"
              />
            </div>

          </div>

          {/* ✅ PRODUCT INFO */}

          <div className="row">

            <div className="col-md-3">
              <input className="form-control mb-2" placeholder="Product"
                value={data.product}
                onChange={(e) => setData({ ...data, product: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <input className="form-control mb-2" placeholder="Origin"
                value={data.origin}
                onChange={(e) => setData({ ...data, origin: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <input className="form-control mb-2" placeholder="Producer"
                value={data.producer}
                onChange={(e) => setData({ ...data, producer: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <input className="form-control mb-2" placeholder="Grade"
                value={data.grade}
                onChange={(e) => setData({ ...data, grade: e.target.value })}
              />
            </div>

          </div>

          <div className="row">

            <div className="col-md-3">
              <input className="form-control mb-2" placeholder="Quantity"
                value={data.quantity}
                onChange={(e) => setData({ ...data, quantity: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <input className="form-control mb-2" placeholder="Price"
                value={data.price}
                onChange={(e) => setData({ ...data, price: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <input className="form-control mb-2" placeholder="Packaging"
                value={data.packaging}
                onChange={(e) => setData({ ...data, packaging: e.target.value })}
              />
            </div>

          </div>

          <textarea
            className="form-control mb-2"
            placeholder="Logistics"
            value={data.logistics}
            onChange={(e) =>
              setData({ ...data, logistics: e.target.value })
            }
          />

          <div className="row">

            <div className="col-md-3">
              <input className="form-control mb-2" placeholder="Incoterm"
                value={data.incoterm}
                onChange={(e) => setData({ ...data, incoterm: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <input className="form-control mb-2" placeholder="Credit"
                value={data.credit}
                onChange={(e) => setData({ ...data, credit: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <input className="form-control mb-2" placeholder="Shipment"
                value={data.shipment}
                onChange={(e) => setData({ ...data, shipment: e.target.value })}
              />
            </div>

          </div>

          <textarea
            className="form-control mb-3"
            placeholder="Notes"
            value={data.notes}
            onChange={(e) =>
              setData({ ...data, notes: e.target.value })
            }
          />

          <button className="btn btn-success" onClick={save}>
            {editingId ? "Update PO" : "Create PO"}
          </button>

        </div>
      </div>


      {/* ===================================== */}
      {/* ✅ LIST */}
      {/* ===================================== */}

      <div className="card shadow">

        <div className="card-header bg-dark text-white d-flex justify-content-between">
          <h5 className="mb-0">Purchase Orders</h5>

          <input
            className="form-control w-25"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="card-body">

          {filtered.map((p) => (

            <div
  key={p.id}
  className="border rounded p-3 mb-3"
>

  {/* ✅ HEADER */}
  <div className="d-flex justify-content-between align-items-center">

    <div>
      <b>{p.poNumber}</b> - {p.product}
      <br />

      <small className="text-muted">
        {p.producer} | {p.origin}
      </small>
    </div>

    {/* ✅ STATUS BADGE */}
    <span
      className={`badge ${
        p.status === "APPROVED"
          ? "bg-success"
          : p.status === "SENT"
          ? "bg-primary"
          : p.status === "CLOSED"
          ? "bg-dark"
          : "bg-secondary"
      }`}
    >
      {p.status}
    </span>

  </div>

  {/* ✅ ✅ ACTIONS (THIS WAS MISSING) */}
  <div className="mt-3 d-flex gap-2 flex-wrap">

    <button
      className="btn btn-sm btn-outline-primary me-2"
      onClick={() => edit(p)}
    >
      Edit
    </button>

    {/* ✅ WORKFLOW BUTTONS */}

    {p.status === "DRAFT" && (
      <button
        className="btn btn-sm btn-primary me-2"
        onClick={() => action(p.id, "SEND")}
      >
        Send
      </button>
    )}

    {p.status === "SENT" && (
      <button
        className="btn btn-sm btn-success me-2"
        onClick={() => action(p.id, "APPROVE")}
      >
        Approve
      </button>
    )}

    {p.status === "APPROVED" && (
      <button
        className="btn btn-sm btn-dark me-2"
        onClick={() => action(p.id, "CLOSE")}
      >
        Close
      </button>
    )}

    {/* ✅ PDF */}
    <button
      className="btn btn-sm btn-outline-success"
      onClick={() => downloadPdf(p.id)}
    >
      PDF
    </button>

  </div>

</div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default PurchaseOrderPage;