import { readCollection } from "@/lib/content";
import { formatDate } from "@/lib/format";

export default function EventsPage() {
  const events = readCollection("events");
  const now = Date.now();
  const upcoming = events.filter(
    (e) => e.frontmatter.date && new Date(e.frontmatter.date).getTime() >= now
  );
  const past = events.filter(
    (e) => e.frontmatter.date && new Date(e.frontmatter.date).getTime() < now
  );

  return (
    <div>
      <h1 className="text-3xl mb-6">Community Events</h1>

      <h2 className="text-2xl mb-4">Upcoming</h2>
      {upcoming.length === 0 ? (
        <p className="text-lg mb-10">Nothing on the calendar right now.</p>
      ) : (
        <ul className="space-y-4 mb-10">
          {upcoming.reverse().map((e) => (
            <li key={e.slug} className="card">
              <p className="text-base text-primary font-semibold mb-1">
                {formatDate(e.frontmatter.date)}
              </p>
              <h3 className="text-2xl mb-2">{e.frontmatter.title}</h3>
              {e.frontmatter.location && (
                <p className="text-lg mb-2">📍 {e.frontmatter.location}</p>
              )}
              <p className="whitespace-pre-wrap">{e.body}</p>
            </li>
          ))}
        </ul>
      )}

      {past.length > 0 && (
        <>
          <h2 className="text-2xl mb-4">Past Events</h2>
          <ul className="space-y-3">
            {past.map((e) => (
              <li key={e.slug} className="card opacity-80">
                <p className="text-base text-ink mb-1">
                  {formatDate(e.frontmatter.date)}
                </p>
                <h3 className="text-xl">{e.frontmatter.title}</h3>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
