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

  // LOAD purchase orders
  useEffect(() => {
    loadPOs();
  }, []);

  const loadPOs = () => {
    api.get("/po").then((res) => setPos(res.data));
  };

  const formatDate = (date) => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const save = () => {
    if (!data.poNumber || !data.date) {
      alert("❌ PO Number and Date required");
      return;
    }

    const payload = {
      ...data,
      date: formatDate(data.date),
      createdBy: user.firstName + " " + user.lastName,
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

  const downloadPdf = (id) => {
    window.open(`${process.env.REACT_APP_API_URL}/po/${id}/pdf`, "_blank");
  };

  const filtered = pos.filter(
    (p) =>
      p.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.product?.toLowerCase().includes(search.toLowerCase()) ||
      p.producer?.toLowerCase().includes(search.toLowerCase())
  );

  const action = (id, type) => {
    const username = user.firstName + " " + user.lastName;
    api.post(`/po/${id}/action?action=${type}&user=${username}`).then(() => {
      loadPOs();
    });
  };

  return (
    <div className="container mt-4">
      {/* ========================= */}
      {/* FORM: All Sections + Buttons */}
      {/* ========================= */}

      {/* ========================= */}
      {/* Basic Info Section */}
      {/* ========================= */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Basic Information</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <label>PO Number (auto)</label>
              <input className="form-control" value={data.poNumber} readOnly />
            </div>
            <div className="col-md-4">
              <label>Date</label>
              <DatePicker
                selected={data.date}
                onChange={(date) => setData({ ...data, date })}
                dateFormat="dd/MM/yyyy"
                className="form-control"
                placeholderText="Select Date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* Product Details Section */}
      {/* ========================= */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">Product Details</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3">
              <label>Product</label>
              <input
                className="form-control"
                placeholder="Product"
                value={data.product}
                onChange={(e) => setData({ ...data, product: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label>Origin</label>
              <input
                className="form-control"
                placeholder="Origin"
                value={data.origin}
                onChange={(e) => setData({ ...data, origin: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label>Producer</label>
              <input
                className="form-control"
                placeholder="Producer"
                value={data.producer}
                onChange={(e) => setData({ ...data, producer: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label>Grade</label>
              <input
                className="form-control"
                placeholder="Grade"
                value={data.grade}
                onChange={(e) => setData({ ...data, grade: e.target.value })}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3">
              <label>Quantity (kg)</label>
              <input
                className="form-control"
                placeholder="Quantity"
                value={data.quantity}
                onChange={(e) => setData({ ...data, quantity: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label>Price (USD/mt)</label>
              <input
                className="form-control"
                placeholder="Price"
                value={data.price}
                onChange={(e) => setData({ ...data, price: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label>Packaging</label>
              <input
                className="form-control"
                placeholder="Packaging"
                value={data.packaging}
                onChange={(e) => setData({ ...data, packaging: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* Logistics & Terms Section */}
      {/* ========================= */}
      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h5 className="mb-0">Logistics & Terms</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label>Logistics</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Logistics details"
              value={data.logistics}
              onChange={(e) => setData({ ...data, logistics: e.target.value })}
            />
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Incoterm</label>
              <input
                className="form-control"
                placeholder="Incoterm"
                value={data.incoterm}
                onChange={(e) => setData({ ...data, incoterm: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label>Credit</label>
              <input
                className="form-control"
                placeholder="Credit"
                value={data.credit}
                onChange={(e) => setData({ ...data, credit: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label>Shipment</label>
              <input
                className="form-control"
                placeholder="Shipment"
                value={data.shipment}
                onChange={(e) => setData({ ...data, shipment: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* Notes Section */}
      {/* ========================= */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Additional Notes</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label>Notes</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Additional notes..."
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* Buttons */}
      {/* ========================= */}
      <div className="mt-3 d-flex gap-2 flex-wrap">
        <button className="btn btn-success" onClick={save}>
          {editingId ? "Update PO" : "Create PO"}
        </button>
        {editingId && (
          <button className="btn btn-secondary" onClick={resetForm}>
            Cancel
          </button>
        )}
        {/* Optional Preview Button */}
        {/* <button className="btn btn-outline-primary" onClick={handlePreview}>Preview</button> */}
      </div>

      {/* ========================= */}
      {/* List Existing POs */}
      {/* ========================= */}
      <div className="card shadow mt-4">
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
            <div key={p.id} className="border rounded p-3 mb-3">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <b>{p.poNumber}</b> - {p.product}
                  <br />
                  <small className="text-muted">
                    {p.producer} | {p.origin}
                  </small>
                </div>
                {/* Status Badge */}
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
              {/* Actions */}
              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => edit(p)}
                >
                  Edit
                </button>
                {p.status === "DRAFT" && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => action(p.id, "SEND")}
                  >
                    Send
                  </button>
                )}
                {p.status === "SENT" && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => action(p.id, "APPROVE")}
                  >
                    Approve
                  </button>
                )}
                {p.status === "APPROVED" && (
                  <button
                    className="btn btn-sm btn-dark"
                    onClick={() => action(p.id, "CLOSE")}
                  >
                    Close
                  </button>
                )}
                {/* PDF */}
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