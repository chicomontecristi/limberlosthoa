import AuthGate from "@/components/AuthGate";
import PortalNav from "@/components/PortalNav";
import Footer from "@/components/Footer";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <PortalNav />
      <main id="main" className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>
      <Footer />
    </AuthGate>
  );
}
