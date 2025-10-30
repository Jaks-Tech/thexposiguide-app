import Link from "next/link";

type Props = {
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
};

export default function ResourceCard({ href, title, subtitle, badge }: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-blue-700">{title}</h3>
        {badge && (
          <span className="ml-3 text-xs rounded-full bg-blue-50 text-blue-700 px-2 py-1">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{subtitle}</p>
      )}
      <div className="mt-3 text-sm text-blue-600 group-hover:underline">Open →</div>
    </Link>
  );
}
