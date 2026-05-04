/**
 * Logo EEM oficial: rojo con punto blanco.
 */
export function Logo({
  size = 'md',
  inverted = false,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverted?: boolean;
}) {
  const dim = { sm: 32, md: 44, lg: 64, xl: 96 }[size];
  const font = { sm: 14, md: 18, lg: 28, xl: 44 }[size];
  const dot = { sm: 4, md: 6, lg: 8, xl: 12 }[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl ${
        inverted ? 'bg-white' : 'bg-eem-red'
      }`}
      style={{ width: dim, height: dim, gap: 3 }}
    >
      <span
        className={`font-black tracking-tight ${inverted ? 'text-eem-red' : 'text-white'}`}
        style={{ fontSize: font }}
      >
        eem
      </span>
      <span
        className={`rounded-full ${inverted ? 'bg-eem-red' : 'bg-white'}`}
        style={{ width: dot, height: dot }}
      />
    </div>
  );
}

export function PoweredByEem() {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <span className="text-[10px] text-eem-dark-soft">powered by</span>
      <span className="inline-flex items-center gap-1 font-extrabold text-eem-red text-sm">
        eem
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-white border border-eem-red" />
      </span>
    </div>
  );
}
