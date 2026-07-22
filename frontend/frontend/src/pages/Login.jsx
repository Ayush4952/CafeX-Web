export default function Login({ form = {}, busy = false, onChange, onSubmit, onRegister }) {
  return (
    <section className="page-section">
      <div className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to CafeX</h2>
          <p>Your favorites and order history are waiting.</p>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            Email address
            <input
              required
              type="email"
              value={form.email ?? ""}
              onChange={(event) => onChange?.({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              value={form.password ?? ""}
              onChange={(event) => onChange?.({ ...form, password: event.target.value })}
            />
          </label>
          <button className="button auth-submit" disabled={busy} type="submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="auth-switch">
          New to CafeX?
          <button type="button" onClick={onRegister}>Create an account</button>
        </div>
      </div>
    </section>
  );
}
