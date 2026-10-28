import Image from "next/image";
import Link from "next/link";

const nav: { href: string; label: string; long?: string }[] = [
  { href: "/#atlas", label: "Atlas" },
  { href: "/#themes", label: "Themes" },
  { href: "/cases", label: "Index", long: "Index of cases" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-(--header-h) border-b border-ink/80 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-ink">
          <Image src="/images/bird-red.svg" alt="" width={44} height={28} priority className="w-9 sm:w-11" />
          <span className="whitespace-nowrap font-serif text-lg font-bold leading-none sm:text-2xl">How We Stopped War</span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-4 text-(length:--text-body-sm) sm:gap-7">
            {nav.map((item) => (
              <li key={item.href} className={item.href === "/#themes" ? "hidden sm:block" : undefined}>
                <Link href={item.href} className="text-body underline-offset-4 hover:text-ink hover:underline">
                  {item.long ? (
                    <>
                      <span className="sm:hidden">{item.label}</span>
                      <span className="hidden sm:inline">{item.long}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
