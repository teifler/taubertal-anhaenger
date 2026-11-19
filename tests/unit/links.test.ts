import { describe, expect, it } from 'vitest';

import { site } from '../../src/data';
import { telUrl, whatsappUrl } from '../../src/lib/links';

describe('whatsappUrl', () => {
  it('opens a chat with the business number, without the leading +', () => {
    const url = new URL(whatsappUrl());
    expect(url.origin + url.pathname).toBe(`https://wa.me/${site.phone.e164.slice(1)}`);
  });

  it('pre-fills a message naming the trailer', () => {
    const url = new URL(whatsappUrl('den Autotransporter'));
    expect(url.searchParams.get('text')).toBe('Hallo, ich möchte den Autotransporter mieten. Wunschtermin: ');
  });
});

describe('telUrl', () => {
  it('uses the E.164 number', () => {
    expect(telUrl).toBe(`tel:${site.phone.e164}`);
  });
});
