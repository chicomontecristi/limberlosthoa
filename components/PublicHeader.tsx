import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-primary no-underline"
        >
          Limberlost HOA
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/contact/" className="btn-secondary hidden sm:inline-flex">
            Contact
          </Link>
          <Link href="/login/" className="btn">
            Owner Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
