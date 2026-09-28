import type { Metadata } from "next";
import { SavedListings } from "./SavedListings";

export const metadata: Metadata = {
  title: "Saved homes",
  description: "Homes you've saved while browsing.",
  robots: { index: false },
};

export default function SavedPage() {
  return (
    <div className="container-page pt-8 sm:pt-12">
      <header className="max-w-2xl">
        <p className="eyebrow">Your shortlist</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Saved homes</h1>
        <p className="mt-3 text-muted">Saved on this device. Tap the heart on any listing to add or remove it.</p>
      </header>
      <div className="mt-10">
        <SavedListings />
      </div>
    </div>
  );
}
