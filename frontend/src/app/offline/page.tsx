export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="shell offline-page">
      <img src="/mark.svg" alt="" width={72} height={72} />
      <p className="page-kicker">Canopy is offline</p>
      <h1>Your collection is still here.</h1>
      <p>Reconnect to load market prices and current Solana records.</p>
      <a href="/" className="btn-primary">Try again</a>
    </div>
  );
}
