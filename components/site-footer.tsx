import Image from "next/image";
import Link from "next/link";
import { stats } from "@/lib/cases";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-paper/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-[1fr_auto] sm:px-8">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <Image src="/images/bird-black.svg" alt="" width={56} height={36} className="invert" />
            <p className="font-serif text-2xl font-bold text-paper">How We Stopped War</p>
          </div>
          <p className="mt-4 text-(length:--text-body-sm) leading-relaxed">
            A record of {stats.total} documented efforts to end, reduce and prevent armed conflict, from {stats.firstYear} to
            the present. Map data © Natural Earth.
          </p>
        </div>
        <ul className="space-y-2 text-(length:--text-body-sm)">
          <li><Link className="hover:text-paper hover:underline" href="/#atlas">Atlas</Link></li>
          <li><Link className="hover:text-paper hover:underline" href="/#themes">Themes</Link></li>
          <li><Link className="hover:text-paper hover:underline" href="/cases">Index of cases</Link></li>
        </ul>
      </div>
    </footer>
  );
}
