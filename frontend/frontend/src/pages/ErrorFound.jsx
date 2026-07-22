export default function ErrorFound({ onHome }) {
  return (
    <section className="page-section">
      <div className="empty-state">
        <span className="eyebrow">404</span>
        <h2>That page is not on the menu.</h2>
        <p>Return to CafeX and find something worth ordering.</p>
        <button className="button" type="button" onClick={onHome}>
          Back to CafeX
        </button>
      </div>
    </section>
  );
}
