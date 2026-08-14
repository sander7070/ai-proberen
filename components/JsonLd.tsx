type Props = { data: Record<string, unknown> };

/** Gestructureerde data. Server component, geen hydratatie nodig. */
export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
