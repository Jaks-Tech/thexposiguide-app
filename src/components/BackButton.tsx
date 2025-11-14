import Link from "next/link";

export default function BackButton({
  href = "/",
  label = "Other Projections... ",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <div className="mb-6">
      <Link
        href={href}
        className="
          inline-flex items-center gap-2
          bg-blue-100 text-blue-700
          rounded-full px-4 py-2 font-medium shadow-sm
          transition-all duration-300
          hover:bg-blue-200 hover:text-blue-800
          hover:shadow-blue-400/50 hover:shadow-lg
        "
      >
        <span className="text-lg">←</span>
        {label}
      </Link>
    </div>
  );
}
