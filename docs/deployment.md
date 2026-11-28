# Deployment

The site is a static Astro build, served by GitHub Pages at **https://www.taubertal-anhaenger.de**. Live since
28 November 2026.

## How a change goes live

Push to `main`. The workflow in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) then runs, in this order:

1. Lint, Prettier, `astro check` and the unit tests
2. Production build plus the Playwright end-to-end and accessibility tests
3. Production build for GitHub Pages and the deployment

If any check fails, nothing is deployed and the old version stays online. Pull requests run steps 1 and 2 but never
deploy. A push is live after about three minutes.

## Domain and DNS

The domain is registered at netcup. DNS is managed in the netcup CCP under Domains → `taubertal-anhaenger.de` →
**CloudDNS**:

| Host  | Type  | Value                                                                                      | TTL  |
| ----- | ----- | ------------------------------------------------------------------------------------------ | ---- |
| `@`   | A     | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`                 | 3600 |
| `@`   | AAAA  | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` | 3600 |
| `www` | CNAME | `teifler.github.io.`                                                                       | 3600 |

The IP addresses are GitHub's published Pages addresses. netcup rejects a change set in which records with the same
host and type have different TTLs ("gemischte TTL-Werte"), so keep them equal.

There are no MX records: the business e-mail is a WEB.DE address, not an address on this domain. If e-mail on the
domain is ever needed, add MX records and leave the records above alone.

In the repository settings under **Pages**, the custom domain is `www.taubertal-anhaenger.de` and **Enforce HTTPS**
is on. GitHub issues and renews the certificate for both `www` and the bare domain. Every variant ends up on
`https://www.taubertal-anhaenger.de/`, including the old preview address `teifler.github.io/taubertal-anhaenger/`.

## Checking that everything is in place

```sh
# What netcup's name server publishes
dig +short @netcup.firstns.cc taubertal-anhaenger.de A
dig +short @netcup.firstns.cc www.taubertal-anhaenger.de CNAME

# What the rest of the internet sees
dig +short @1.1.1.1 www.taubertal-anhaenger.de

# Redirects, HTTPS and the Pages settings
curl -sI http://taubertal-anhaenger.de/ | grep -i '^location'
curl -sI https://www.taubertal-anhaenger.de/ | head -1
gh api repos/teifler/taubertal-anhaenger/pages --jq '{cname, https_enforced, https_certificate}'
```

## Troubleshooting

**The site loads everywhere except on one computer.** That computer's DNS cache still holds the old record. Before
the switch the bare domain pointed at netcup's parking page with a TTL of one hour. On the day of the switch, a
machine using Tailscale MagicDNS (`100.100.100.100`) still returned the parking IP and timed out for `www`, while the
router and public resolvers already had the new records. Compare with `dig @1.1.1.1 …`. If that answer is right,
restart the local DNS (for Tailscale: `sudo systemctl restart tailscaled`) or wait an hour, then restart the browser,
which caches DNS too. A phone on mobile data is a quick second opinion.

**"There isn't a GitHub Pages site here" (404 from GitHub).** DNS reaches GitHub, but the repository has no custom
domain set. Set it again under Settings → Pages, or with
`gh api -X PUT repos/teifler/taubertal-anhaenger/pages -f cname=www.taubertal-anhaenger.de`.

**"Enforce HTTPS" can't be ticked.** GitHub only issues the certificate once DNS points at its servers. That usually
takes a few minutes and can take up to an hour.

**netcup won't save the zone.** netcup reports the reason above the table. The one seen so far is mixed TTLs; see
above. If a saved revision breaks the zone, netcup automatically rolls back to the last working one.

## Preview builds

`DEPLOY_TARGET=github-pages` with `PAGES_ORIGIN` and `PAGES_BASE_PATH` builds the site for a sub-path such as
`https://<user>.github.io/<repo>/`, marked `noindex` throughout. Nothing deploys it at the moment; it was the preview
before the domain existed and is useful for a staging copy:

```sh
DEPLOY_TARGET=github-pages PAGES_ORIGIN=https://teifler.github.io PAGES_BASE_PATH=/taubertal-anhaenger npm run build
npm run preview
```

## Moving to another host

1. Set `hosting` in [`src/data/site.json`](../src/data/site.json) to the new host. The privacy policy names it.
2. Change the DNS records at netcup to the new host and remove the custom domain in the Pages settings.
3. On Apache, [`public/.htaccess`](../public/.htaccess) adds HSTS, the redirect to `https://www.` and cache headers.
   GitHub Pages ignores this file.

## Still open

Verify the domain for GitHub Pages: under github.com → Settings → Pages → **Add a domain**, enter
`taubertal-anhaenger.de` and add the TXT record GitHub shows (`_github-pages-challenge-teifler`) at netcup. As long
as DNS points at GitHub, this stops anyone else from claiming the domain for their Pages site, for example if this
repository's Pages were switched off.
