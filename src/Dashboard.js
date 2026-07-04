import { useEffect, useState } from "react";
import api from "./api";

function Dashboard({user}) {

  const [overview, setOverview] =
useState({
  totalPros: 0,
  totalDocs: 0,
  totalSections: 0,
  totalForms: 0,

  total: 0,
  approved: 0,
  reviewed: 0,
  prepared: 0,
  draft: 0,
});

  const [pending, setPending] = useState([]);
  useEffect(() => {
    api.get("/dashboard/pending").then((res) => {
      setPending(res.data);
    });
    api.get("/dashboard/recent")
  .then((res) => {
    setRecent(res.data);
  });
  api
  .get(
    `/dashboard/my-responsibilities/${user.businessRole}`
  )
  .then((res) => {

    setResponsibilities(
      res.data
    );

  });
  api
  .get("/dashboard/overview")
  .then((res) => {
    setOverview(res.data);
  });
  }, [user]);

  const [recent, setRecent] = useState([]);
  

  const [responsibilities,
        setResponsibilities] =
  useState({
    assignedPros: 0,
    assignedRecords: 0,
    pendingReview: 0,
    pendingApproval: 0,
  });

  

  return (
    <div
      style={{
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <div className="container-fluid py-4">
        {/* ===================================== */}
        {/* ✅ PAGE TITLE */}
        {/* ===================================== */}

        <div className="mb-4">
          <div
  className="card border-0 shadow-sm mb-4"
  style={{
    background:
      "linear-gradient(135deg,#0f172a,#1e40af)",
    color: "white"
  }}
>
  <div className="card-body p-4">

    <h2 className="fw-bold mb-1">
  Welcome, {user.professionalTitle
    ? `${user.professionalTitle} ${user.firstName} ${user.lastName}`
    : `${user.firstName} ${user.lastName}`
  }
</h2>

<div className="mb-2">
  {user.businessRole}
</div>

<hr
  style={{
    borderColor:
      "rgba(255,255,255,.2)"
  }}
/>

<div className="opacity-75">
  ATLANTA QUÍMICA • SARI
</div>

    <div className="opacity-75">
      Sistema de Administración de Responsabilidad Integral (SARI)
    </div>

  </div>
</div>
</div>
        

        {/* ===================================== */}
        {/* ✅ KPI CARDS */}
        {/* ===================================== */}
        <div className="row g-4">
          <DashboardCard
  title="PRO Procedures"
  value={overview.totalPros}
  color="#2563eb"
  icon="bi-journal-text"
/>

<DashboardCard
  title="Controlled Docs"
  value={overview.totalDocs}
  color="#198754"
  icon="bi-file-earmark-text"
/>

<DashboardCard
  title="Sections"
  value={overview.totalSections}
  color="#fd7e14"
  icon="bi-collection"
/>

<DashboardCard
  title="Forms"
  value={overview.totalForms}
  color="#6f42c1"
  icon="bi-ui-checks-grid"
/>
</div>

<div className="row mt-4">

  <DashboardCard
    title="Draft"
    value={overview.draft}
    color="#6c757d"
    icon="bi-file-earmark"
  />

  <DashboardCard
    title="Prepared"
    value={overview.prepared}
    color="#ffc107"
    icon="bi-pencil-square"
  />

  <DashboardCard
    title="Reviewed"
    value={overview.reviewed}
    color="#0dcaf0"
    icon="bi-search"
  />

  <DashboardCard
    title="Approved"
    value={overview.approved}
    color="#198754"
    icon="bi-check-circle"
  />

</div>

<div className="row mt-4">

  {/* Compliance */}

  <div className="col-lg-6 mb-4">

    <div className="card shadow-sm border-0 h-100">

      <div className="card-body">

        <h5 className="fw-bold mb-4">
          System Compliance
        </h5>

        <div className="text-center mb-4">

          <div
            className="display-5 fw-bold text-success"
          >
            {overview.total > 0
              ? Math.round(
                  (overview.approved /
                    overview.total) *
                    100
                )
              : 0}
            %
          </div>

          <div className="text-muted">
            Compliance Score
          </div>

        </div>

        <ComplianceRow
          label="Approved"
          value={overview.approved}
          color="#198754"
          total={overview.total}
        />

        <ComplianceRow
          label="Reviewed"
          value={overview.reviewed}
          color="#0dcaf0"
          total={overview.total}
        />

        <ComplianceRow
          label="Prepared"
          value={overview.prepared}
          color="#ffc107"
          total={overview.total}
        />

        <ComplianceRow
          label="Draft"
          value={overview.draft}
          color="#dc3545"
          total={overview.total}
        />

      </div>

    </div>

  </div>

  {/* Pending */}

  <div className="col-lg-6 mb-4">

    <div className="card shadow-sm border-0 h-100">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <h5 className="fw-bold mb-0">
            Pending Workflow Actions
          </h5>

          <span className="badge bg-danger">
            {pending.length}
          </span>

        </div>

        {pending.length === 0 ? (

          <div className="text-muted">
            No pending actions
          </div>

        ) : (

          pending.map((p, i) => (

            <div
              key={i}
              className="
                d-flex
                justify-content-between
                align-items-center
                border-bottom
                py-3
              "
            >

              <div>

                <div className="fw-semibold">

  <span
    className={`badge me-2 ${
      p.type === "PRO"
        ? "bg-primary"
        : "bg-success"
    }`}
  >
    {p.type}
  </span>

  {p.code}

</div>

                <small className="text-muted">
                  {p.title}
                </small>

              </div>

              <span
                className={`badge ${
                  p.status === "PREPARED"
                    ? "bg-warning text-dark"
                    : "bg-info"
                }`}
              >
                {p.status === "PREPARED"
                  ? "Review Required"
                  : "Approval Required"}
              </span>

            </div>

          ))

        )}

      </div>

    </div>

  </div>


</div>
      </div>
      <div className="card shadow-sm border-0 mt-4">

  <div className="card-body">

    <div className="d-flex justify-content-between align-items-center mb-4">

      <h5 className="fw-bold mb-0">
        👤 My Responsibilities
      </h5>

    </div>

    <div className="row text-center">

      <div className="col-md-3">

        <div className="border rounded p-3">

          <i className="bi bi-journal-text fs-1 text-primary"></i>

          <h3 className="mt-2">
            {responsibilities.assignedPros}
          </h3>

          <div className="text-muted">
            Assigned PROs
          </div>

        </div>

      </div>

      <div className="col-md-3">

        <div className="border rounded p-3">

          <i className="bi bi-folder-check fs-1 text-success"></i>

          <h3 className="mt-2">
            {responsibilities.assignedRecords}
          </h3>

          <div className="text-muted">
            Assigned Records
          </div>

        </div>

      </div>

      <div className="col-md-3">

        <div className="border rounded p-3">

          <i className="bi bi-search fs-1 text-warning"></i>

          <h3 className="mt-2">
            {responsibilities.pendingReview}
          </h3>

          <div className="text-muted">
            Pending Review
          </div>

        </div>

      </div>

      <div className="col-md-3">

        <div className="border rounded p-3">

          <i className="bi bi-check-circle fs-1 text-danger"></i>

          <h3 className="mt-2">
            {responsibilities.pendingApproval}
          </h3>

          <div className="text-muted">
            Pending Approval
          </div>

        </div>

      </div>

    </div>

  </div>

</div>
<div className="card shadow-sm border-0 mt-4">

  <div className="card-body">

    <div className="d-flex justify-content-between align-items-center mb-4">

      <h5 className="fw-bold mb-0">
        Recent Controlled Documents
      </h5>

      <span className="badge bg-primary">
        {recent.length}
      </span>

    </div>

    <div className="table-responsive">

      <table className="table align-middle">

        <thead>

          <tr>

            <th>Code</th>

            <th>Type</th>

            <th>Title</th>

            <th>Status</th>

            <th>Date</th>

          </tr>

        </thead>

        <tbody>

          {recent.map((doc, index) => (

            <tr key={index}>

              <td>

                <strong>
                  {doc.code}
                </strong>

              </td>

              <td>

                <span
                  className={`badge ${
                    doc.type === "PRO"
                      ? "bg-primary"
                      : "bg-success"
                  }`}
                >
                  {doc.type}
                </span>

              </td>

              <td>
                {doc.title}
              </td>

              <td>

                <span
                  className={`badge ${
                    doc.status === "APPROVED"
                      ? "bg-success"
                      : doc.status === "REVIEWED"
                      ? "bg-info"
                      : doc.status === "PREPARED"
                      ? "bg-warning text-dark"
                      : "bg-secondary"
                  }`}
                >
                  {doc.status}
                </span>

              </td>

              <td>
                {doc.date}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>

</div>
    </div>
    
  );
}

/* ===================================== */
/* ✅ KPI CARD */
/* ===================================== */

function DashboardCard({ title, value, color, icon }) {
  return (
    <div className="col-lg-3 col-md-6">
      <div className="card shadow-sm border-0 h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="text-muted mb-1">{title}</div>

              <h2 className="fw-bold" style={{ color }}>
                {value}
              </h2>
            </div>

            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "14px",
                background: color,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              <i className={`bi ${icon}`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceRow({
  label,
  value,
  color,
  total,
}) {

  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div className="mb-4">

      <div className="d-flex justify-content-between mb-1">

        <span>{label}</span>

        <strong>
          {value} ({percentage}%)
        </strong>

      </div>

      <div className="progress">

        <div
          className="progress-bar"
          style={{
            width: `${percentage}%`,
            background: color,
          }}
        />

      </div>

    </div>
  );
}
export default Dashboard;
