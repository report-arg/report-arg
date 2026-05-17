import Link from "next/link";

export default function Breadcrumb({ items }) {
  return (
    <p className="admin-breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="admin-breadcrumb-sep"> › </span>}
          {item.href ? (
            <Link href={item.href} className="admin-breadcrumb-link">
              {item.label}
            </Link>
          ) : (
            item.label
          )}
        </span>
      ))}
    </p>
  );
}
