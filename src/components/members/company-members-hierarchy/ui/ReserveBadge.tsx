export default function ReserveBadge() {
  return (
    <div
      className={
        "inline-flex items-center justify-center " +
        "rounded-full border border-reserve/40 " +
        "px-3 py-1 text-[11px] font-semibold tracking-[0.22em] uppercase " +
        "text-reserve shadow-[0_0_0_1px_rgba(0,0,0,0.02)]"
      }
      style={{
        background:
          "linear-gradient(-45deg, rgba(220,38,38,0.18), rgba(220,38,38,0.08), rgba(220,38,38,0.18))",
        backgroundSize: "300% 300%",
        animation: "holo-shift 2.8s ease infinite",
        backdropFilter: "blur(10px)",
      }}
    >
      Reserva
    </div>
  );
}
