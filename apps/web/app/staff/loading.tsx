export default function StaffLoading() {
  return (
    <section
      className="staff-dashboard staff-route-loading"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="eyebrow">Staff workspace</p>
      <h1>Loading your workspace.</h1>
      <p className="staff-loading">Preparing protected staff tools...</p>
    </section>
  );
}
