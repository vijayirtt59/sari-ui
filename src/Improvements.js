import { useEffect, useState } from "react";
import api from "./api";

function Improvements() {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const load = () => {
    api.get("/improvements").then((res) => setList(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const create = () => {
    api
      .post("/improvements", {
        title,
        description: desc,
      })
      .then(() => {
        setTitle("");
        setDesc("");
        load();
      });
  };

  const update = (id, status) => {
    api.post(`/improvements/${id}/status?status=${status}`).then(load);
  };

  return (
    <div className="mt-4">
      <h4>Improvements (PRO-10)</h4>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <button onClick={create}>Add</button>

      <table className="table mt-3">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {list.map((i) => (
            <tr key={i.id}>
              <td>{i.title}</td>
              <td>{i.description}</td>
              <td>{i.status}</td>
              <td>
                <button onClick={() => update(i.id, "IN_PROGRESS")}>
                  Start
                </button>
                <button onClick={() => update(i.id, "CLOSED")}>Close</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Improvements;
