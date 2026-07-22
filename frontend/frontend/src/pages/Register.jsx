export default function Register({ form = {}, busy = false, onChange, onSubmit, onLogin }) {
  return (
    <section className="page-section">
      <div className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">Join the neighborhood</span>
          <h2>Create your CafeX account</h2>
          <p>Save favorites, order ahead, and earn rewards.</p>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            Full name
            <input
              required
              minLength={2}
              value={form.fullName ?? ""}
              onChange={(event) => onChange?.({ ...form, fullName: event.target.value })}
            />
          </label>
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
              minLength={8}
              value={form.password ?? ""}
              onChange={(event) => onChange?.({ ...form, password: event.target.value })}
            />
          </label>
          <button className="button auth-submit" disabled={busy} type="submit">
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>
        <div className="auth-switch">
          Already a member?
          <button type="button" onClick={onLogin}>Sign in</button>
        </div>
      </div>
    </section>
  );
}
