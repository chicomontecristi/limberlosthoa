import { readCollection } from "@/lib/content";
import { formatDateShort } from "@/lib/format";

export default function DocumentsPage() {
  const docs = readCollection("docs");

  // Group by category for clearer scanning.
  const byCategory: Record<string, typeof docs> = {};
  for (const d of docs) {
    const cat = (d.frontmatter.category as string) || "Other";
    (byCategory[cat] ||= []).push(d);
  }
  const categories = Object.keys(byCategory).sort();

  return (
    <div>
      <h1 className="text-3xl mb-6">HOA Documents</h1>
      {docs.length === 0 ? (
        <p className="text-lg">No documents posted yet. Check back soon.</p>
      ) : (
        categories.map((cat) => (
          <section key={cat} className="mb-10">
            <h2 className="text-2xl mb-4">{cat}</h2>
            <ul className="space-y-3">
              {byCategory[cat].map((d) => (
                <li key={d.slug} className="card flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{d.frontmatter.title}</p>
                    {d.frontmatter.posted_date && (
                      <p className="text-base text-ink">
                        Posted {formatDateShort(d.frontmatter.posted_date)}
                      </p>
                    )}
                  </div>
                  {d.frontmatter.pdf && (
                    <a
                      href={d.frontmatter.pdf}
                      className="btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open PDF
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
