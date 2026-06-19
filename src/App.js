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

  const [page, setPage] = useState("home");

  const [showDocs, setShowDocs] = useState(false);

  const [docs, setDocs] = useState([]);

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

  // =========================================
  // ✅ CLOSE DROPDOWN
  // =========================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-wrapper")) {
        setShowDocs(false);
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
          background: page === currentPage ? "#374151" : "transparent",

          color: "white",

          padding: "8px 12px",

          width: "100%",

          textAlign: "left",

          border: "none",
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
          <span className="navbar-brand">SARI System</span>

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
              Dashboard
            </button>

            {/* ===================================== */}
            {/* ✅ VIEWER ONLY */}
            {/* ===================================== */}

            <button
              className="
    btn
    btn-sm
    btn-outline-info
    me-2
  "
              onClick={() => setPage("role-pros")}
            >
              PRO Documents
            </button>

            {/* ===================================== */}
            {/* ✅ GOVERNANCE USERS */}
            {/* ===================================== */}

            {role !== "VIEWER" && (
              <>
                <button
                  className="
          btn
          btn-sm
          btn-outline-light
          me-2
        "
                  onClick={() => setPage("sections")}
                >
                  Sections
                </button>

                <button
                  className="
          btn
          btn-sm
          btn-outline-light
          me-2
        "
                  onClick={() => setPage("form-builder")}
                >
                  Form Templates
                </button>

                <button
                  className="
          btn
          btn-sm
          btn-outline-light
          me-2
        "
                  onClick={() => setPage("pro-builder")}
                >
                  PROs
                </button>
                <button
  className="
    btn
    btn-sm
    btn-outline-light
    me-2
  "
  onClick={() => setPage("purchase-orders")}
>
  Purchase Orders
</button>

                <button
                  className="
          btn
          btn-sm
          btn-outline-light
          me-2
        "
                  onClick={() => setPage("audit")}
                >
                  Audit
                </button>

                <button
                  className="
          btn
          btn-sm
          btn-outline-light
          me-2
        "
                  onClick={() => setPage("improvements")}
                >
                  Improvements
                </button>

                {/* ✅ USERS ONLY FOR ADMIN */}

                {role === "ADMIN" && (
                  <button
                    className="
            btn
            btn-sm
            btn-outline-warning
            me-2
          "
                    onClick={() => setPage("users")}
                  >
                    Users
                  </button>
                )}

                {/* ===================================== */}
                {/* ✅ POLICIES DROPDOWN */}
                {/* ===================================== */}

                <div
                  className="
          position-relative
          me-2
          dropdown-wrapper
        "
                >
                  <button
                    className="
            btn
            btn-sm
            btn-outline-info
          "
                    onClick={() => setShowDocs(!showDocs)}
                  >
                    Policies & Governance ▾
                  </button>

                  {showDocs && (
                    <div
                      style={{
                        position: "absolute",

                        top: "38px",

                        left: 0,

                        minWidth: "260px",

                        background: "#1f2937",

                        border: "1px solid #444",

                        borderRadius: "6px",

                        zIndex: 1000,

                        padding: "6px 0",
                      }}
                    >
                      {docs.map((doc) => (
                        <DropdownItem
                          key={doc.id}
                          label={`📄 ${doc.code}
                   - ${doc.name}`}
                          page={doc.code}
                          setPage={setPage}
                          setShowDocs={setShowDocs}
                          currentPage={page}
                        />
                      ))}

                      <div
                        style={{
                          borderTop: "1px solid #444",

                          margin: "6px 0",
                        }}
                      />

                      {/* ✅ ONLY ADMIN CREATE */}

                      {role === "ADMIN" && (
                        <button
                          style={{
                            background: "transparent",

                            color: "#ffc107",

                            padding: "8px 12px",

                            width: "100%",

                            textAlign: "left",

                            border: "none",
                          }}
                          onClick={() => {
                            setPage("create-docs");

                            setShowDocs(false);
                          }}
                        >
                          ➕ Create Document
                        </button>
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
              Logout
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
            {page === "purchase-orders" && (
  <PurchaseOrderPage user={user} />
)}

            {page === "audit" && <AuditLogs />}

            {page === "improvements" && <Improvements />}

            {/* ✅ CREATE DOC */}

            {page === "create-docs" && (
              <CreateDocument role={role} docs={docs} onCreated={loadDocs} />
            )}

            {/* ✅ VIEW DOC */}

            {page?.startsWith("DOC") && (
              <CreateDocument
                role={role}
                docs={docs}
                selectedCode={page}
                onCreated={loadDocs}
              />
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
