"use client";

import dynamic from "next/dynamic";

// Dynamically import the SearchResults component with SSR disabled
const SearchResults = dynamic(
  () => import("@/components/SearchResults"),
  { ssr: false }
);

export default function RideResultsPage() {
  return (
    <>
      {typeof window !== 'undefined' && <SearchResults />}
    </>
  );
}
