export default function Home() {
  return (
    <div>
      <section className="hero-bg rounded-[var(--radius)] p-10 text-white shadow">
        <h1 className="text-3xl font-semibold tracking-tight drop-shadow">Cozy up your day ☕</h1>
        <p className="mt-2 opacity-90 max-w-xl">
          Fresh coffee, comfy seats, and a smooth digital experience.
        </p>
      </section>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold">Menu</h3>
          <p className="muted mt-1 text-sm">Discover classics & seasonal specials.</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Book a Seat</h3>
          <p className="muted mt-1 text-sm">Reserve your spot and skip the wait.</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Wallet</h3>
          <p className="muted mt-1 text-sm">Manage passes and track your balance.</p>
        </div>
      </section>
    </div>
  );
}
