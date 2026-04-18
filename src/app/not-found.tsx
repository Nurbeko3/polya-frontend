import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f1f5f9",
      gap: 16,
    }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: "#6366f1" }}>404</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: "#0f172a" }}>Sahifa topilmadi</div>
      <div style={{ fontSize: 14, color: "#64748b" }}>Siz qidirgan sahifa mavjud emas</div>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: "10px 24px",
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          color: "#fff",
          borderRadius: 10,
          fontWeight: 600,
          textDecoration: "none",
          fontSize: 14,
        }}
      >
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
