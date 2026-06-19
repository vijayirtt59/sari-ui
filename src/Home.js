function Home({ onLoginClick }) {
  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <div className="container py-5">
        <div className="row align-items-center">
          {/* ✅ LEFT SIDE */}
          <div className="col-md-7">
            {/* ✅ BIGGER LOGO */}
            <div className="mb-4">
              <img src="/logo.png" alt="Logo" style={{ height: "80px" }} />
            </div>

            <h1 className="fw-bold mb-3" style={{ color: "#111" }}>
              SARI System
            </h1>

            <h5 className="mb-4 text-muted">
              Compliance • Governance • Continuous Improvement
            </h5>

            <p style={{ color: "#444" }}>
              Atlanta Química S.A de C.V delivers high-quality chemical products
              while ensuring regulatory compliance, operational excellence, and
              safety through our SARI framework.
            </p>

            <p style={{ color: "#444" }}>
              Manage documents, procedures, audits, and improvements from a
              centralized platform designed for transparency and control.
            </p>

            {/* ✅ FEATURES */}
            <div className="mt-4">
              <div>✅ Document Management</div>
              <div>✅ Audit & Compliance</div>
              <div>✅ Continuous Improvement</div>
              <div>✅ Governance Control</div>
            </div>
          </div>

          {/* ✅ RIGHT SIDE (LOGIN BOX) */}
          <div className="col-md-5">
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <h4 className="text-center mb-3">Welcome Back</h4>

              <p className="text-center text-muted">Access your dashboard</p>

              <button
                className="btn w-100 mt-3"
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "10px",
                  fontWeight: "bold",
                  border: "none",
                }}
                onClick={onLoginClick}
              >
                Login
              </button>

              <div className="text-center small text-muted mt-3">
                Secure access for authorized users
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FOOTER */}
        <div className="text-center mt-5 small text-muted">
          © {new Date().getFullYear()} Atlanta Química S.A de C.V
        </div>
      </div>
    </div>
  );
}

export default Home;
