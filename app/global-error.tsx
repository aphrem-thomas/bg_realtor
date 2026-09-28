"use client";

/** Last-resort boundary (errors in the root layout). Must render its own <html>. */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en-CA">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f5f3ee", color: "#15171b", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#676a72", marginBottom: 20 }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ background: "#15171b", color: "#fff", border: 0, borderRadius: 999, padding: "12px 22px", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
