import { useEffect, useState } from "react";
import api from "./api";
import { businessRoleLabels } from "./businessRoleLabels";

function RoleProList({ user }) {
  const [pros, setPros] = useState([]);
  const [myPros, setMyPros] = useState([]);

  useEffect(() => {
    api
      .get("/pro")
      .then((res) => {
        setPros(res.data);
      })
      .catch((err) => {
        console.error(err);
        setPros([]);
      });

    api
      .get(`/pro/by-role/${user.businessRole}`)
      .then((res) => {
        setMyPros(res.data);
      })
      .catch((err) => {
        console.warn("Unable to load role-specific PROs", err);

        setMyPros([]);
      });
  }, [user.businessRole]);

  const allPros = pros;

  const downloadPdf = (code) => {
    window.open(`${process.env.REACT_APP_API_URL}/pro/${code}/pdf`, "_blank");
  };

  return (
    <div className="container">
      {/* ==================================== */}
      {/* ✅ MY ROLE PROS */}
      {/* ==================================== */}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">PROs For Your Role</h5>

          <small>{businessRoleLabels[user.businessRole]}</small>
        </div>

        <div className="card-body">
          {myPros.length === 0 && (
            <div className="text-muted">No documents assigned</div>
          )}

          {myPros.map((p) => (
            <div
              key={p.id}
              className="
                border
                rounded
                p-3
                mb-3
              "
            >
              <div
                className="
                d-flex
                justify-content-between
                align-items-center
              "
              >
                <div>
                  <b>{p.code}</b> {p.title}
                  <div className="mt-1">
                    {p.registros
                      ?.filter(
                        (r) => r.responsableResguardo === user.businessRole,
                      )
                      .map((r, index) => (
                        <span key={index} className="badge bg-secondary me-1">
                          {r.nombre}
                        </span>
                      ))}
                  </div>
                </div>

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

              <div className="mt-2">
                <button
                  className="
                    btn
                    btn-sm
                    btn-outline-success
                  "
                  onClick={() => downloadPdf(p.code)}
                >
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================== */}
      {/* ✅ ALL PROS */}
      {/* ==================================== */}

      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">All PRO Documents</h5>
        </div>

        <div className="card-body">
          {allPros.map((p) => (
            <div
              key={p.id}
              className="
                border
                rounded
                p-3
                mb-3
              "
            >
              <div
                className="
                d-flex
                justify-content-between
                align-items-center
              "
              >
                <div>
                  <b>{p.code}</b> {p.title}
                </div>

                <span
                  className="
                    badge
                    bg-success
                  "
                >
                  {p.status}
                </span>
              </div>

              <div className="mt-2">
                <button
                  className="
                    btn
                    btn-sm
                    btn-outline-success
                  "
                  onClick={() => downloadPdf(p.code)}
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

export default RoleProList;
