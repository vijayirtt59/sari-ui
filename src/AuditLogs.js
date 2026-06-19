import { useEffect, useState } from "react";
import api from "./api";

function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/audit-logs").then((res) => setLogs(res.data));
  }, []);

  return (
    <div className="mt-4">
      <h4>Audit Logs</h4>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Document</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.username}</td>
              <td>{log.action}</td>
              <td>{log.documentCode}</td>
              <td>{log.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AuditLogs;
