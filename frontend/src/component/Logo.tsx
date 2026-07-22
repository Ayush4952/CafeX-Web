import { CAFEX_LOGO } from "../assets";

type LogoProps = {
  compact?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  return (
    <span className={`brand ${compact ? "brand-compact" : ""}`}>
      <img src={CAFEX_LOGO} alt="CafeX" />
      {!compact && (
        <span>
          <strong>CafeX</strong>
          <small>Roastery &amp; kitchen</small>
        </span>
      )}
    </span>
  );
}
