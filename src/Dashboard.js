import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { useEffect, useState } from "react";
import api from "./api";

function Dashboard() {
  // ✅ MOCK DATA (replace later from backend)

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    reviewed: 0,
    prepared: 0,
    draft: 0,
  });

  const statusData = [
    {
      name: "Approved",
      value: stats.approved,
    },
    {
      name: "Reviewed",
      value: stats.reviewed,
    },
    {
      name: "Prepared",
      value: stats.prepared,
    },
    {
      name: "Draft",
      value: stats.draft,
    },
  ];

  const COLORS = ["#198754", "#0dcaf0", "#ffc107", "#dc3545"];
  const [pending, setPending] = useState([]);
  useEffect(() => {
    api.get("/dashboard/stats").then((res) => {
      setStats(res.data);
    });
    api.get("/dashboard/pending").then((res) => {
      setPending(res.data);
    });
  }, []);

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
          <h2 className="fw-bold">SARI Dashboard</h2>

          <div className="text-muted">
            Governance • Compliance • Document Control
          </div>
        </div>

        {/* ===================================== */}
        {/* ✅ KPI CARDS */}
        {/* ===================================== */}

        <div className="row g-4">
          <DashboardCard
            title="Total Documents"
            value={stats.total}
            color="#2563eb"
            icon="bi-folder2-open"
          />

          <DashboardCard
            title="Approved"
            value={stats.approved}
            color="#198754"
            icon="bi-check-circle"
          />

          <DashboardCard
            title="Pending Review"
            value={stats.reviewed}
            color="#0dcaf0"
            icon="bi-search"
          />

          <DashboardCard
            title="Drafts"
            value={stats.draft}
            color="#ffc107"
            icon="bi-pencil-square"
          />

          <DashboardCard
            title="Prepared"
            value={stats.prepared}
            color="#fd7e14"
            icon="bi-pencil"
          />
        </div>

        {/* ===================================== */}
        {/* ✅ CHARTS + ACTIVITY */}
        {/* ===================================== */}

        <div className="row mt-4">
          {/* ✅ STATUS CHART */}

          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5 className="fw-bold mb-4">Document Status</h5>

                <div style={{ height: "320px" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={110}
                        label
                      >
                        {statusData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ RECENT ACTIVITY */}

          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h5 className="fw-bold mb-4">Recent Activity</h5>

                <ActivityItem
                  color="#198754"
                  icon="bi-check-circle"
                  text="PRO-02 approved"
                  user="admin"
                />

                <ActivityItem
                  color="#2563eb"
                  icon="bi-pencil-square"
                  text="SECTION 1 updated"
                  user="Ashish"
                />

                <ActivityItem
                  color="#ffc107"
                  icon="bi-search"
                  text="PRO-03 pending review"
                  user="Vijaya"
                />

                <ActivityItem
                  color="#dc3545"
                  icon="bi-exclamation-circle"
                  text="2 overdue reviews"
                  user="System"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================== */}
        {/* ✅ PENDING ACTIONS */}
        {/* ===================================== */}

        <div className="card shadow-sm border-0 mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Pending Actions</h5>

              <span className="badge bg-danger">{pending.length}</span>
            </div>

            {pending.length === 0 ? (
              <div className="text-muted">No pending actions</div>
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
                    <div className="fw-semibold">{p.code}</div>

                    <small className="text-muted">{p.title}</small>
                  </div>

                  <span
                    className={`badge rounded-pill ${
                      p.status === "PREPARED"
                        ? "bg-warning text-dark"
                        : "bg-info"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ===================================== */}
        {/* ✅ QUICK ACTIONS */}
        {/* ===================================== */}

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5 className="fw-bold mb-4">Quick Actions</h5>

            <div className="d-flex flex-wrap gap-3">
              <QuickButton
                icon="bi-file-earmark-plus"
                label="Create PRO"
                color="#2563eb"
              />

              <QuickButton
                icon="bi-journal-plus"
                label="Create Section"
                color="#198754"
              />

              <QuickButton
                icon="bi-ui-checks-grid"
                label="Create Form"
                color="#0dcaf0"
              />

              <QuickButton
                icon="bi-file-earmark-pdf"
                label="Generate PDF"
                color="#dc3545"
              />
            </div>
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

/* ===================================== */
/* ✅ ACTIVITY ITEM */
/* ===================================== */

function ActivityItem({ icon, text, user, color }) {
  return (
    <div className="d-flex align-items-center mb-4">
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          background: color,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "14px",
        }}
      >
        <i className={`bi ${icon}`}></i>
      </div>

      <div>
        <div className="fw-semibold">{text}</div>

        <small className="text-muted">by {user}</small>
      </div>
    </div>
  );
}

/* ===================================== */
/* ✅ QUICK BUTTON */
/* ===================================== */

function QuickButton({ icon, label, color }) {
  return (
    <button
      className="btn text-white"
      style={{
        background: color,
        borderRadius: "12px",
        padding: "12px 20px",
        fontWeight: "600",
      }}
    >
      <i className={`bi ${icon} me-2`}></i>

      {label}
    </button>
  );
}

export default Dashboard;
