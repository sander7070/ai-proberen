import type { Metadata } from "next";
import { publicConfig } from "@/lib/config";

const NAAM = "upgrAIde";
const BASIS_TITEL = "upgrAIde — automatisatie en systeemintegratie";

type PaginaSeo = {
  titel: string;
  omschrijving: string;
  pad: string;
};

export function paginaMetadata({ titel, omschrijving, pad }: PaginaSeo): Metadata {
  const url = new URL(pad, publicConfig.siteUrl).toString();
  return {
    title: titel,
    description: omschrijving,
    alternates: { canonical: url },
    openGraph: {
      title: titel,
      description: omschrijving,
      url,
      siteName: NAAM,
      locale: "nl_BE",
      type: "website",
      images: [{ url: "/video/poster.jpg", width: 774, height: 340, alt: NAAM }],
    },
    twitter: {
      card: "summary_large_image",
      title: titel,
      description: omschrijving,
      images: ["/video/poster.jpg"],
    },
  };
}

/** JSON-LD per pagina. Geen verzonnen cijfers, geen valse reviews. */
export function professionalService(omschrijving: string, pad: string) {
  const url = new URL(pad, publicConfig.siteUrl).toString();
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: NAAM,
    alternateName: BASIS_TITEL,
    description: omschrijving,
    url,
    email: publicConfig.contactMail,
    image: new URL("/video/poster.jpg", publicConfig.siteUrl).toString(),
    areaServed: { "@type": "Country", name: "België" },
    availableLanguage: ["nl-BE"],
    serviceType: "Automatisatie en systeemintegratie",
    address: { "@type": "PostalAddress", addressCountry: "BE" },
  };
}
