import { useState } from "react";
import api from "./api";

function AuthPage({ onLogin }) {
  const [registerMode, setRegisterMode] = useState(false);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    professionalTitle: "",
  });

  const submit = () => {
    const url = registerMode ? "/auth/register" : "/auth/login";

    api
      .post(url, data)
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data));

        onLogin(res.data);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error");
      });
  };

  return (
    <div className="container py-5">
      <div
        className="
          card
          shadow-sm
          border-0
          mx-auto
          p-4
        "
        style={{ maxWidth: "450px" }}
      >
        <h3 className="mb-4 text-center">
          {registerMode ? "Register" : "Login"}
        </h3>

        {registerMode && (
          <>
            <input
              className="form-control mb-2"
              placeholder="First Name"
              onChange={(e) =>
                setData({
                  ...data,
                  firstName: e.target.value,
                })
              }
            />

            <input
              className="form-control mb-2"
              placeholder="Last Name"
              onChange={(e) =>
                setData({
                  ...data,
                  lastName: e.target.value,
                })
              }
            />

            <input
              className="form-control mb-2"
              placeholder="Professional Title (Optional)"
              onChange={(e) =>
                setData({
                  ...data,
                  professionalTitle: e.target.value,
                })
              }
            />

            <small className="text-muted d-block mb-2">
              Examples: Lic., Ing., Dr., Mtra., QFB
            </small>
          </>
        )}

        <input
          className="form-control mb-2"
          placeholder="Email"
          onChange={(e) =>
            setData({
              ...data,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          onChange={(e) =>
            setData({
              ...data,
              password: e.target.value,
            })
          }
        />

        <select
          className="form-control mb-2"
          onChange={(e) =>
            setData({
              ...data,
              businessRole: e.target.value,
            })
          }
        >
          <option value="">Select Role</option>

          <option value="COORDINADOR_SARI">Coordinador del SARI</option>

          <option value="AGENTES_VENTAS">Agentes de Ventas</option>
        </select>

        <button className="btn btn-primary w-100" onClick={submit}>
          {registerMode ? "Register" : "Login"}
        </button>

        <div className="text-center mt-3">
          <button
            className="btn btn-link"
            onClick={() => setRegisterMode(!registerMode)}
          >
            {registerMode ? "Already have account?" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
