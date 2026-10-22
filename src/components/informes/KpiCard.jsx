export default function KpiCard({ label, value, helper }) {
  return (
    <article className="rounded-xl border border-border-subtle bg-surface p-4 shadow-xs">
      <p className="m-0 text-xs font-semibold text-text-muted">{label}</p>
      <p className="mb-0 mt-2 text-2xl font-bold text-text-primary">{value}</p>
      {helper && <p className="mb-0 mt-1 text-xs text-text-secondary">{helper}</p>}
    </article>
  );
}
