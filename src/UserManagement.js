import { useEffect, useState } from "react";
import api from "./api";

function UserManagement() {
  const [users, setUsers] = useState([]);

  const load = () => {
    api.get("/auth/users").then((res) => {
      setUsers(res.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = (id, role) => {
    api.put(`/auth/users/${id}/role?role=${role}`).then(load);
  };

  const updateBusinessRole = (id, businessRole) => {
    api
      .put(`/auth/users/${id}/business-role?businessRole=${businessRole}`)
      .then(load);
  };

  const updateEnabled = (id, enabled) => {
    api.put(`/auth/users/${id}/enabled?enabled=${enabled}`).then(load);
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
                    {u.firstName} {u.lastName}
                  </td>

                  <td>{u.email}</td>

                  {/* ROLE */}

                  <td>
                    <select
                      className="form-select"
                      value={u.systemRole}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                    >
                      <option>VIEWER</option>

                      <option>PREPARER</option>

                      <option>REVIEWER</option>

                      <option>APPROVER</option>

                      <option>ADMIN</option>
                    </select>
                  </td>

                  {/* BUSINESS ROLE */}

                  <td>
                    <input
                      className="form-control"
                      value={u.businessRole || ""}
                      onBlur={(e) => updateBusinessRole(u.id, e.target.value)}
                    />
                  </td>

                  {/* ENABLED */}

                  <td>
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
