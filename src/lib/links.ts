import { site } from '../data';

const { street, postalCode, city } = site.address;

export const telUrl = `tel:${site.phone.e164}`;

/** WhatsApp chat link with a pre-filled German message, e.g. "Hallo, ich möchte den Autotransporter mieten." */
export function whatsappUrl(inquiryObject = 'einen Anhänger'): string {
  const text = `Hallo, ich möchte ${inquiryObject} mieten. Wunschtermin: `;
  return `https://wa.me/${site.phone.e164.slice(1)}?text=${encodeURIComponent(text)}`;
}

export const mapsRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${street}, ${postalCode} ${city}`)}`;

export const mapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.company}, ${street}, ${postalCode} ${city}`)}`;
