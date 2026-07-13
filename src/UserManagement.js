import { useEffect, useState } from "react";
import api from "./api";

function UserManagement() {
  const [users, setUsers] = useState([]);

  const load = () => {
    api.get("/users").then((res) => {
      setUsers(res.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const updateRoles = (id, roles) => {
    api.put(`/users/${id}/roles`, roles).then(load);
  };

  const updateBusinessRole = (id, businessRole) => {
    api
      .put(`/users/${id}/business-role?businessRole=${businessRole}`)
      .then(load);
  };

  const updateEnabled = (id, enabled) => {
    api.put(`/users/${id}/enabled?enabled=${enabled}`).then(load);
  };

  return (
    <div className="container">
      <h3 className="mb-4">User Management</h3>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Name</th>

                <th>Email</th>

                <th>System Role</th>

                <th>Business Role</th>

                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.professionalTitle
                      ? `${u.professionalTitle} ${u.firstName} ${u.lastName}`
                      : `${u.firstName} ${u.lastName}`}
                  </td>
                  <td>{u.email}</td>

                  {/* ROLE */}

                  <td>
                    <div className="mb-2">
                      {u.systemRoles?.map((role) => (
                        <span key={role} className="badge bg-primary me-1">
                          {role}
                        </span>
                      ))}
                    </div>

                    {[
                      "VIEWER",
                      "PREPARER",
                      "REVIEWER",
                      "APPROVER",
                      "ADMIN",
                    ].map((role) => (
                      <div key={role} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={u.systemRoles?.includes(role)}
                          onChange={(e) => {
                            let roles = u.systemRoles || [];

                            if (e.target.checked) {
                              roles = [...roles, role];
                            } else {
                              roles = roles.filter((r) => r !== role);
                            }

                            updateRoles(u.id, roles);
                          }}
                        />

                        <label className="form-check-label">{role}</label>
                      </div>
                    ))}
                  </td>

                  {/* BUSINESS ROLE */}

                  <td>
                    <select
                      className="form-select"
                      value={u.businessRole || ""}
                      onChange={(e) => updateBusinessRole(u.id, e.target.value)}
                    >
                      <option value="COORDINADOR_SARI">
                        Coordinador del SARI
                      </option>

                      <option value="RESPONSABLE_VENTAS_COMPRAS">
                        Responsable Ventas y Compras
                      </option>

                      <option value="AGENTES_VENTAS">Agentes de Ventas</option>

                      <option value="COORDINADOR_SISTEMA_SARI">
                        Coordinador Sistema SARI
                      </option>
                      <option value="RESPONSIBLE_DE_SISTEMAS">
                        Responsable de Sistemas
                      </option>
                      <option value="REPRESENTANTE_LEGAL">
                        Representante legal (responsable de Seguridad e higiene)
                      </option>
                      <option value="VENTAS">Ventas</option>
                      
                      <option value="COMPRAS">Compras</option>

                      <option value="DIRECCION_GENERAL">
                        Dirección General
                      </option>

                      <option value="LOGISTICA">Logística</option>

                      <option value="PRODUCCION">Producción</option>
                    </select>
                  </td>

                  {/* ENABLED */}

                  <td>
                    <span
                      className={`badge me-2 ${
                        u.enabled ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {u.enabled ? "ACTIVE" : "DISABLED"}
                    </span>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={u.enabled}
                        onChange={(e) => updateEnabled(u.id, e.target.checked)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
