import { readCollection } from "@/lib/content";

export default function MembersPage() {
  const members = readCollection("members");

  return (
    <div>
      <h1 className="text-3xl mb-6">Board &amp; Community Members</h1>
      {members.length === 0 ? (
        <p className="text-lg">Directory coming soon.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-6">
          {members.map((m) => (
            <li key={m.slug} className="card flex gap-4 items-start">
              {m.frontmatter.photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={m.frontmatter.photo}
                  alt={m.frontmatter.name}
                  width={96}
                  height={96}
                  className="rounded-full object-cover w-24 h-24 border-2 border-border flex-shrink-0"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="w-24 h-24 rounded-full bg-surfaceAlt border-2 border-border flex-shrink-0"
                />
              )}
              <div>
                <h2 className="text-xl mb-1">{m.frontmatter.name}</h2>
                <p className="text-base text-primary font-semibold mb-2">
                  {m.frontmatter.role}
                </p>
                {m.frontmatter.bio && (
                  <p className="text-base whitespace-pre-wrap">{m.frontmatter.bio}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
