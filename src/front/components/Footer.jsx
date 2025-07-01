export const Footer = () => (
  <footer
    className="mt-auto py-4 text-center"
    style={{
      backgroundColor: "#1a1a1a",
      color: "#ccc",
      borderTop: "1px solid #333"
    }}
  >
    <div className="container">
      <p style={{ marginBottom: "0.5rem", color: "#5d4eff", fontWeight: "bold", fontSize: "1.1rem" }}>
        Proyecto final 4Geeks
      </p>
      <p style={{ marginBottom: 0, color: "#eee", fontSize: "0.95rem" }}>
        Desarrollado por <span style={{ color: "#5d4eff" }}>Albert</span>, <span style={{ color: "#5d4eff" }}>Alejandro</span>, <span style={{ color: "#5d4eff" }}>Diego</span> & <span style={{ color: "#5d4eff" }}>Nati</span>
      </p>
    </div>
  </footer>
);