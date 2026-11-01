/** Shared vector identity chosen from logo concept 02. */
export function BrandLogo() {
  return (
    <span className="brand-logo" aria-hidden="true">
      <img
        className="brand-symbol"
        src="/brand/daftarin-symbol.svg"
        width="44"
        height="44"
        alt=""
      />
      <span className="brand-wordmark">
        Daftar<span>In</span>
      </span>
    </span>
  );
}
