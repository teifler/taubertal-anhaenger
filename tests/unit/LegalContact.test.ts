import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';

import LegalContact from '../../src/components/LegalContact.astro';
import { site } from '../../src/data';
import { telUrl } from '../../src/lib/links';

describe('<LegalContact />', () => {
  let html: string;

  beforeAll(async () => {
    const container = await AstroContainer.create();
    html = await container.renderToString(LegalContact);
  });

  it('names the owner and gives a complete postal address (§ 5 DDG)', () => {
    const { street, district, postalCode, city } = site.address;
    for (const part of [site.owner, site.company, street, `${postalCode} ${city}-${district}`]) {
      expect(html).toContain(part);
    }
  });

  it('links the phone number', () => {
    expect(html).toContain(`href="${telUrl}"`);
  });

  it('shows the e-mail address exactly when one is set', () => {
    expect(html.includes('mailto:')).toBe(site.email !== null);
  });
});
