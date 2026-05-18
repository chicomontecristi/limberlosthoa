import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { readPage } from "@/lib/content";

export default function ContactPage() {
  const page = readPage("contact.md");
  const boardEmail = page?.frontmatter.board_email ?? "board@limberlosthoa.org";
  const address = page?.frontmatter.address ?? "Limberlost Community, Arizona";
  const body =
    page?.body ??
    "Reach out to the board with any questions, concerns, or community ideas.";

  return (
    <>
      <PublicHeader />
      <main id="main" className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl mb-6">Contact the Board</h1>
        <p className="text-lg mb-8 whitespace-pre-wrap">{body}</p>

        <div className="card mb-6">
          <h2 className="text-xl mb-2">Email</h2>
          <p>
            <a
              href={`mailto:${boardEmail}`}
              className="text-primary underline font-semibold"
            >
              {boardEmail}
            </a>
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl mb-2">Address</h2>
          <p className="whitespace-pre-wrap">{address}</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
