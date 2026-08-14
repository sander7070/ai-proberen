import Image from "next/image";
import Link from "next/link";
import { contactLink } from "@/lib/config";

/** Op smalle schermen is er geen plaats voor het volledige label. */
const NAV = [
  { href: "/oplossingen", label: "Oplossingen", kort: "Oplossingen" },
  { href: "/automatisatiescan", label: "Automatisatiescan", kort: "Scan" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="shell pt-3 md:pt-4">
        <nav
          aria-label="Hoofdnavigatie"
          className="glass flex items-center gap-3 rounded-pill py-2 pl-4 pr-2 md:gap-6 md:pl-6"
        >
          <Link href="/" className="shrink-0" aria-label="upgrAIde, naar de startpagina">
            <Image
              src="/merk/logo.webp"
              alt="upgrAIde"
              width={586}
              height={121}
              priority
              className="h-6 w-auto md:h-7"
            />
          </Link>

          <ul className="ml-auto flex items-center gap-1 md:gap-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-pill px-2.5 py-2 text-[0.82rem] font-medium text-ink/70 transition-colors hover:text-ink md:px-4 md:text-sm"
                >
                  <span className="sm:hidden">{item.kort}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <a
            href={contactLink()}
            className="hidden shrink-0 rounded-pill bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90 sm:inline-block"
          >
            Plan een gesprek
          </a>
        </nav>
      </div>
    </header>
  );
}
