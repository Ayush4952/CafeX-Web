export default function EditUser({ user = {}, onChange, onSubmit }) {
  return (
    <section className="page-section dashboard-page">
      <div className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">Your CafeX profile</span>
          <h2>Edit account</h2>
          <p>Keep your contact and pickup details current.</p>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            Full name
            <input
              required
              value={user.fullName ?? ""}
              onChange={(event) => onChange?.({ ...user, fullName: event.target.value })}
            />
          </label>
          <label>
            Email address
            <input
              required
              type="email"
              value={user.email ?? ""}
              onChange={(event) => onChange?.({ ...user, email: event.target.value })}
            />
          </label>
          <button className="button auth-submit" type="submit">
            Save profile
          </button>
        </form>
      </div>
    </section>
  );
}
