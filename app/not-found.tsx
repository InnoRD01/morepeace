import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-8">
      <p className="kicker">Not found</p>
      <h1 className="mt-3 font-serif text-(length:--text-heading) font-bold text-ink">This page isn’t in the record</h1>
      <p className="mt-4">
        <Link href="/cases" className="text-accent underline underline-offset-4">Browse the index of cases</Link>
      </p>
    </div>
  );
}
