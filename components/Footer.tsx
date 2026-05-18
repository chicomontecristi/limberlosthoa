export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surfaceAlt mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 text-base text-ink">
        <p className="mb-2">
          &copy; {year} Limberlost HOA. All rights reserved.
        </p>
        <p>
          Questions?{" "}
          <a href="/contact/" className="text-primary underline font-semibold">
            Contact the board
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
