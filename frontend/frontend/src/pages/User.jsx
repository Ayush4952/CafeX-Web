export default function User({ user, favorites = 0, cartItems = 0, onEdit }) {
  return (
    <section className="page-section dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">Your CafeX</span>
          <h1>Good to see you, {user?.fullName?.split(" ")[0] ?? "friend"}.</h1>
          <p>Your favorites, recent orders, and next coffee are all here.</p>
        </div>
        <button className="button" type="button" onClick={onEdit}>Edit profile</button>
      </div>
      <div className="account-grid">
        <article className="account-card loyalty-card">
          <span className="card-label">CafeX rewards</span>
          <strong>120 <small>beans</small></strong>
          <p>80 more beans until your next drink is on us.</p>
        </article>
        <article className="account-card">
          <span className="card-label">Saved favorites</span>
          <strong>{favorites}</strong>
        </article>
        <article className="account-card">
          <span className="card-label">Active cart</span>
          <strong>{cartItems}</strong>
        </article>
      </div>
    </section>
  );
}
