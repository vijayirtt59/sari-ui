import { useState, useEffect } from "react";

import CreateDocument from "./CreateDocument";
import Dashboard from "./Dashboard";
import AuditLogs from "./AuditLogs";
import Improvements from "./Improvements";
import ProBuilder from "./ProBuilder";
import Sections from "./Sections";
import FormBuilder from "./FormBuilder";
import Home from "./Home";
import UserManagement from "./UserManagement";
import AuthPage from "./AuthPage";
import RoleProList from "./RoleProList";
import PurchaseOrderPage from "./PurchaseOrderPage";

import api from "./api";

function App() {
  // ✅ FULL USER OBJECT
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const [page, setPage] = useState(
  user ? "dashboard" : "home"
);

  const [docs, setDocs] = useState([]);

  const [showDocuments, setShowDocuments] = useState(false);

  const [showProcedures, setShowProcedures] = useState(false);

  const [showProcurement, setShowProcurement] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);

  // ✅ ROLE SHORTCUT
  const role = user?.systemRole;

  // =========================================
  // ✅ LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.clear();

    setUser(null);

    setPage("home");
  };

  // =========================================
  // ✅ LOAD DOCS
  // =========================================

  const loadDocs = () => {
    api
      .get("/docs")
      .then((res) => {
        const sorted = res.data.sort((a, b) =>
          a.code.localeCompare(b.code, undefined, { numeric: true }),
        );

        setDocs(sorted);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadDocs();
  }, []);

  useEffect(() => {

  if (user && page === "home") {
    setPage("dashboard");
  }

}, [user, page]);

  // =========================================
  // ✅ CLOSE DROPDOWN
  // =========================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-wrapper")) {
        setShowDocuments(false);
        setShowProcedures(false);
        setShowProcurement(false);
        setShowAdmin(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // =========================================
  // ✅ DROPDOWN ITEM
  // =========================================

  function DropdownItem({ label, page, setPage, setShowDocs, currentPage }) {
    return (
      <button
        style={{
          background: page === currentPage ? "#edf4ff" : "#ffffff",

          color: page === currentPage ? "#0d6efd" : "#212529",

          fontWeight: page === currentPage ? "600" : "500",

          padding: "12px 16px",

          width: "100%",

          textAlign: "left",

          border: "none",

          borderBottom: "1px solid #e9ecef",

          transition: "all .2s ease",
        }}
        onClick={() => {
          setPage(page);
          setShowDocs(false);
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div>
      {/* ========================================= */}
      {/* ✅ NAVBAR */}
      {/* ========================================= */}

      {user && (
        <nav className="navbar navbar-dark bg-dark px-3">
          <span
            className="navbar-brand fw-bold"
            style={{
              fontSize: "1.2rem",
              letterSpacing: ".5px",
            }}
          >
            🛡 SARI System
          </span>

          {/* ✅ MENU */}

          <div className="d-flex align-items-center">
            {/* ===================================== */}
            {/* ✅ COMMON MENU */}
            {/* ===================================== */}

            <button
              className="
      btn
      btn-sm
      btn-outline-light
      me-2
    "
              onClick={() => setPage("dashboard")}
            >
              📊 Dashboard
            </button>

            {role !== "VIEWER" && (
              <>
                <div
                  className="
    position-relative
    me-2
    dropdown-wrapper
  "
                >
                  <button
                    className="btn btn-info shadow-sm"
                    style={{
                      borderRadius: "12px",
                      fontWeight: "600",
                      minWidth: "220px",
                    }}
                    onClick={() => setShowDocuments(!showDocuments)}
                  >
                    📂 Documents
                    <span className="ms-2">{showDocuments ? "▲" : "▼"}</span>
                  </button>

                  {showDocuments && (
                    <div
                      style={{
                        position: "absolute",
                        top: "52px",
                        left: 0,
                        width: "320px",
                        background: "#fff",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 15px 40px rgba(0,0,0,.2)",
                        zIndex: 1000,
                      }}
                    >
                      <div
                        style={{
                          background: "linear-gradient(90deg,#0d6efd,#2563eb)",
                          color: "white",
                          padding: "12px 16px",
                          fontWeight: "600",
                        }}
                      >
                        📂 Documents
                      </div>

                      <DropdownItem
                        label="🛡 Policies & Governance"
                        page="create-docs"
                        setPage={setPage}
                        setShowDocs={setShowDocuments}
                        currentPage={page}
                      />

                      <DropdownItem
                        label="🗂 Sections"
                        page="sections"
                        setPage={setPage}
                        setShowDocs={setShowDocuments}
                        currentPage={page}
                      />

                      <DropdownItem
                        label="📋 Form Templates"
                        page="form-builder"
                        setPage={setPage}
                        setShowDocs={setShowDocuments}
                        currentPage={page}
                      />
                    </div>
                  )}
                </div>

                <div
  className="position-relative me-2 dropdown-wrapper"
>
  <button
    className="btn btn-secondary shadow-sm"
    style={{
      borderRadius: "12px",
      fontWeight: "600",
      minWidth: "200px",
    }}
    onClick={() =>
      setShowProcedures(!showProcedures)
    }
  >
    ⚙️ Procedures

    <span className="ms-2">
      {showProcedures ? "▲" : "▼"}
    </span>
  </button>

  {showProcedures && (
    <div
      style={{
        position: "absolute",
        top: "52px",
        left: 0,
        width: "320px",
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow:
          "0 15px 40px rgba(0,0,0,.2)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(90deg,#6c757d,#495057)",
          color: "white",
          padding: "12px 16px",
          fontWeight: "600",
        }}
      >
        ⚙️ Procedures
      </div>

      <DropdownItem
        label="📖 PRO Documents"
        page="role-pros"
        setPage={setPage}
        setShowDocs={setShowProcedures}
        currentPage={page}
      />

      <DropdownItem
        label="⚙️ PRO Builder"
        page="pro-builder"
        setPage={setPage}
        setShowDocs={setShowProcedures}
        currentPage={page}
      />
    </div>
  )}
</div>

<div
  className="
    position-relative
    me-2
    dropdown-wrapper
  "
>
  <button
    className="btn btn-success shadow-sm"
    style={{
      borderRadius: "12px",
      fontWeight: "600",
      minWidth: "200px",
    }}
    onClick={() =>
      setShowProcurement(
        !showProcurement
      )
    }
  >
    🛒 Procurement

    <span className="ms-2">
      {showProcurement ? "▲" : "▼"}
    </span>
  </button>

  {showProcurement && (

    <div
      style={{
        position: "absolute",
        top: "52px",
        left: 0,
        width: "320px",
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow:
          "0 15px 40px rgba(0,0,0,.2)",
        zIndex: 1000,
      }}
    >

      <div
        style={{
          background:
            "linear-gradient(90deg,#198754,#157347)",
          color: "white",
          padding: "12px 16px",
          fontWeight: "600",
        }}
      >
        🛒 Procurement
      </div>

      <DropdownItem
        label="🧾 Purchase Orders"
        page="purchase-orders"
        setPage={setPage}
        setShowDocs={setShowProcurement}
        currentPage={page}
      />

    </div>

  )}

</div>

<div
  className="position-relative me-2 dropdown-wrapper"
>
  <button
    className="btn btn-warning shadow-sm"
    style={{
      borderRadius: "12px",
      fontWeight: "600",
      minWidth: "200px",
    }}
    onClick={() =>
      setShowAdmin(!showAdmin)
    }
  >
    🛠 Administration

    <span className="ms-2">
      {showAdmin ? "▲" : "▼"}
    </span>
  </button>

  {showAdmin && (
    <div
      style={{
        position: "absolute",
        top: "52px",
        left: 0,
        width: "320px",
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow:
          "0 15px 40px rgba(0,0,0,.2)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(90deg,#ffc107,#ffca2c)",
          color: "#212529",
          padding: "12px 16px",
          fontWeight: "600",
        }}
      >
        🛠 Administration
      </div>

      <DropdownItem
        label="🔎 Audit"
        page="audit"
        setPage={setPage}
        setShowDocs={setShowAdmin}
        currentPage={page}
      />

      <DropdownItem
        label="🚀 Improvements"
        page="improvements"
        setPage={setPage}
        setShowDocs={setShowAdmin}
        currentPage={page}
      />

      {role === "ADMIN" && (
        <DropdownItem
          label="👥 Users"
          page="users"
          setPage={setPage}
          setShowDocs={setShowAdmin}
          currentPage={page}
        />
      )}
    </div>
  )}
</div>


                
              </>
            )}
          </div>

          {/* ========================================= */}
          {/* ✅ USER INFO */}
          {/* ========================================= */}

          <div
            className="
              d-flex
              align-items-center
              text-white
              ms-auto
            "
          >
            <div className="me-3 text-end">
              <div>
                <b>
                  {user.firstName} {user.lastName}
                </b>
              </div>

              <small
                style={{
                  color: "#cbd5e1",
                }}
              >
                {role}
              </small>
            </div>

            <button
              className="
                btn
                btn-outline-light
                btn-sm
              "
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </nav>
      )}

      {/* ========================================= */}
      {/* ✅ MAIN CONTENT */}
      {/* ========================================= */}

      <div className="container mt-4">
        {/* ✅ NOT LOGGED IN */}

        {!user && page === "home" && (
          <Home onLoginClick={() => setPage("login")} />
        )}

        {!user && page === "login" && (
          <AuthPage
            onLogin={(loggedUser) => {
              setUser(loggedUser);

              setPage("dashboard");
            }}
          />
        )}

        {/* ✅ LOGGED IN */}

        {user && (
          <>
            {page === "dashboard" && <Dashboard user={user} />}

            {page === "role-pros" && <RoleProList user={user} />}

            {page === "sections" && <Sections user={user} />}

            {page === "form-builder" && <FormBuilder user={user} />}

            {page === "pro-builder" && <ProBuilder user={user} />}
            {page === "purchase-orders" && <PurchaseOrderPage user={user} />}

            {page === "audit" && <AuditLogs />}

            {page === "improvements" && <Improvements />}

            {/* ✅ CREATE DOC */}

            {page === "create-docs" && (
              <CreateDocument user={user} role={role} docs={docs} onCreated={loadDocs} />
            )}

            {/* ✅ ADMIN ONLY */}

            {page === "users" && role === "ADMIN" && <UserManagement />}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
