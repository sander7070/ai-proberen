/**
 * Centrale configuratie.
 *
 * Publieke waarden komen uit NEXT_PUBLIC_-variabelen en mogen in de browser
 * terechtkomen. De webhook-URL's staan bewust NIET onder NEXT_PUBLIC_: die
 * worden enkel in app/api/scan/route.ts gelezen, zodat ze de client nooit
 * bereiken. Next.js vervangt process.env.NEXT_PUBLIC_* letterlijk bij de
 * build, dus deze verwijzingen moeten voluit geschreven blijven.
 */

export const publicConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://upgraide.be",
  agendaUrl: process.env.NEXT_PUBLIC_AGENDA_URL ?? "",
  analyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID ?? "",
  contactMail: process.env.NEXT_PUBLIC_CONTACT_MAIL ?? "hello@upgraide.be",
} as const;

/** Server-only. Nooit importeren vanuit een client component. */
export function serverConfig() {
  return {
    webhookUrl: process.env.WEBHOOK_URL ?? "",
    crmWebhookUrl: process.env.CRM_WEBHOOK_URL ?? "",
  } as const;
}

/** Zonder ingevulde agenda-URL valt alles terug op een mailto. */
export function contactLink(): string {
  return publicConfig.agendaUrl || `mailto:${publicConfig.contactMail}`;
}
