"use client";

import { useEffect } from "react";

// Default portal landing — bounce to the Documents tab.
export default function PortalIndex() {
  useEffect(() => {
    window.location.replace("/portal/documents/");
  }, []);
  return <p className="text-lg">Loading…</p>;
}
