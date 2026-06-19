import { useEffect, useState } from "react";
import api from "./api";
import ReactQuill from "react-quill";

function ProEditor({ code }) {
  const [content, setContent] = useState("");
  const [versionId, setVersionId] = useState(null);

  useEffect(() => {
    api.get(`/documents/${code}/latest-version`).then((res) => {
      if (res.data) {
        setContent(res.data.content || "");
        setVersionId(res.data.id);
      }
    });
  }, [code]);

  const save = () => {
    api
      .post(`/documents/version/${versionId}/content`, content, {
        headers: { "Content-Type": "text/plain" },
      })
      .then(() => {
        alert("✅ Content saved");
      });
  };

  return (
    <div className="card shadow mt-3">
      <div className="card-header bg-primary text-white">Edit PRO Content</div>

      <div className="card-body">
        <ReactQuill
          value={content}
          onChange={setContent}
          style={{ height: "200px", marginBottom: "50px" }}
        />

        <button className="btn btn-success" onClick={save}>
          Save Content
        </button>
      </div>
    </div>
  );
}

export default ProEditor;
