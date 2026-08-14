import Image from "next/image";
import Link from "next/link";
import { contactLink, publicConfig } from "@/lib/config";

export default function Footer() {
  const jaar = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-ink text-paper md:mt-32">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div className="max-w-sm">
          <Image
            src="/merk/logo-wit.webp"
            alt="upgrAIde"
            width={586}
            height={121}
            className="h-7 w-auto"
          />
          <p className="mt-5 text-[0.95rem] leading-relaxed text-paper/70">
            Wij verbinden uw systemen en nemen terugkerend werk over. Van één taak tot een
            volledige organisatie.
          </p>
        </div>

        <nav aria-label="Paginanavigatie">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-paper/45">Pagina&apos;s</h2>
          <ul className="mt-4 space-y-2.5 text-[0.95rem] text-paper/80">
            <li>
              <Link href="/" className="transition-colors hover:text-paper">
                Home
              </Link>
            </li>
            <li>
              <Link href="/oplossingen" className="transition-colors hover:text-paper">
                Oplossingen
              </Link>
            </li>
            <li>
              <Link href="/automatisatiescan" className="transition-colors hover:text-paper">
                Automatisatiescan
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-paper/45">Contact</h2>
          <ul className="mt-4 space-y-2.5 text-[0.95rem] text-paper/80">
            <li>
              <a
                href={`mailto:${publicConfig.contactMail}`}
                className="transition-colors hover:text-paper"
              >
                {publicConfig.contactMail}
              </a>
            </li>
            <li>
              <a href={contactLink()} className="transition-colors hover:text-paper">
                Plan een gesprek
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell border-t border-paper/10 py-6">
        <p className="text-xs text-paper/45">
          © {jaar} upgrAIde. Cijfers over resultaten zijn richtcijfers, geen belofte.
        </p>
      </div>
    </footer>
  );
}
