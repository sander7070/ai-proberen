"use client";

const HREF = "https://api.fontshare.com/v2/css?f%5B%5D=satoshi@300,400,500,700&display=swap";

/**
 * Laadt Satoshi zonder de eerste paint op te houden. De stylesheet komt binnen
 * als printstijl — die blokkeert niet — en wordt pas na het laden op alle media
 * gezet. Valt Fontshare weg, dan blijft de zelfgehoste terugval gewoon staan.
 */
export default function SatoshiFont() {
  return (
    <link
      rel="stylesheet"
      href={HREF}
      media="print"
      onLoad={(event) => {
        event.currentTarget.media = "all";
      }}
    />
  );
}
