import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { readPage } from "@/lib/content";

export default function HomePage() {
  const page = readPage("home.md");
  const heroTitle =
    page?.frontmatter.hero_title ?? "Welcome to the Limberlost HOA";
  const welcome =
    page?.body ??
    "A private community of 45 owners. Sign in to view documents, events, member directory, and your dues status.";

  return (
    <>
      <PublicHeader />
      <main id="main">
        <section className="bg-surfaceAlt border-b border-border">
          <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center">
            <h1 className="text-4xl sm:text-5xl mb-6">{heroTitle}</h1>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              {welcome.trim().split("\n")[0]}
            </p>
            <Link href="/login/" className="btn text-xl px-10 py-5">
              Owner Login
            </Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-6">
          <div className="card">
            <h2 className="text-xl mb-2">HOA Documents</h2>
            <p>Rules, bylaws, and meeting minutes — available any time you sign in.</p>
          </div>
          <div className="card">
            <h2 className="text-xl mb-2">Community Events</h2>
            <p>Upcoming gatherings, work parties, and seasonal events.</p>
          </div>
          <div className="card">
            <h2 className="text-xl mb-2">Your Dues</h2>
            <p>Check whether your current period dues have been received.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
