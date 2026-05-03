## [2.2.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v2.1.0...v2.2.0) (2026-05-03)

### Features

* **2-8:** add logoCloud variant support (grid, marquee, flex-wrap) ([dec418f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/dec418fdaae6c8eebcecf1e37dff80f80b6a06ae))
* **2-8:** add variants + image field to contactForm ([b1961ca](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b1961ca3393dcbe044e442e31a0b1bb751971379))
* **blocks:** add editable per-card CTA label to linkCards grid variant ([7018812](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7018812da3f2b0ecf45736f58ccded36795e9dba))
* **infra:** preview Workers SSR mode for content freshness (Story 5.22) ([bed8902](https://github.com/gsinghjay/astro-shadcn-sanity/commit/bed89023df35cacb28e46e643a8083fda429e7e7))
* **story-2.8:** support YouTube Shorts in video embeds ([19e337c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/19e337c6e692355d1f14bec61b8ee35b35f671d6))

### Bug Fixes

* apply CodeRabbit auto-fixes ([cda79d3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cda79d39ca14372d7d299f87337f767677b3dae1))
* apply CodeRabbit auto-fixes ([066dacb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/066dacb0deb1836f02631e72c54072abdb61cbea))
* apply CodeRabbit auto-fixes ([a29738d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a29738dcdb8c8a399bbc63d00ec74fb66698a7e6))
* apply CodeRabbit auto-fixes ([a6cadbc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a6cadbc228bd9e25335b622b90de499a0909fd01))
* **blocks:** apply 5.15 site-search code review patches ([01279b7](https://github.com/gsinghjay/astro-shadcn-sanity/commit/01279b7d918125998a2762aae554bb3c27b6595d)), closes [#692](https://github.com/gsinghjay/astro-shadcn-sanity/issues/692)
* **blocks:** trim whitespace in linkCards ctaLabel fallback ([c651ad7](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c651ad70c86039309c605db0e06845dcb652777d))
* **ci:** drop $$Astro spread in storybook renderer ([774d039](https://github.com/gsinghjay/astro-shadcn-sanity/commit/774d03904795720dbbc85eeb3772536703d0f8d9))
* **infra:** coerce visualEditingEnabled to string before VE-flag comparison ([0ca75bb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0ca75bb8873fbd773308579fc357fdb022602261))
* **search:** apply 5.15 second-pass review patches + deploy schema ([1faa037](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1faa037b054b571d0ae0c6810ef28a5456f3c464))

### Miscellaneous

* untrack .github/skills/ (BMAD agent skill files) ([a8d504a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a8d504af513a78bb7066f5963176764ccab830f8))
* updated project documentation ([ade5961](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ade596119cf7c3cdea35a7f84cad47ffd823acbe))

### Tests

* **video-embed:** align Shorts assertions with facade render ([7030a92](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7030a920d274eb67eebbe56b7f5ed3ecb2d8c8b9))

## [2.1.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v2.0.0...v2.1.0) (2026-05-02)

### Features

* **portal:** add emailOTP fallback to magic-link sign-in ([378223f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/378223fb223338c522a321a40d21ee82ed2cd85d))
* **portal:** GitHub account disconnect & re-link control (9.22) ([44316b0](https://github.com/gsinghjay/astro-shadcn-sanity/commit/44316b0a48ec243736e259241ade62fdf50d3f39))
* **portal:** redesign sponsor agreement gate with version pinning + audit capture (15.11) ([2777597](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2777597cb24217a92195764bc5316a0d18e387bf))
* **security:** identity-based authz for sponsor acceptances tool (24.1) ([3b3ccbb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3b3ccbbaef26fa8702790b2f72ec22b44e2bcf63))
* **seo:** agent discovery — Link headers + markdown content negotiation (5.21) ([bdce6a5](https://github.com/gsinghjay/astro-shadcn-sanity/commit/bdce6a502fb56d5eb54a9426abb52418b6f42197))
* **seo:** declare Content-Signal preferences in robots.txt ([b3cda06](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b3cda063154780ada93d60b1cd5dfc6d4b2ad7d8))
* **studio:** add facebook to socialLinks platform enum ([1ab6c55](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1ab6c550a69d38c8fcfde731000ae69b1e6aa7d6))

### Bug Fixes

* **ci:** bump storybook-astro to 0.2.1 for Astro 6 peer support ([f06f514](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f06f514b3c679478bac7f466c7e3275d79c4c119)), closes [#681](https://github.com/gsinghjay/astro-shadcn-sanity/issues/681)
* **portal:** code review patches for 9.22 disconnect flow ([3f09e08](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3f09e0832d4668b26c3757c14ae4e20c2055d35f))
* **security:** close gaps in 24.1 round-2 review ([3af30e7](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3af30e706d13ac04a091f04871d79c6d13f9098b))
* **security:** code review patches for 24.1.5 acceptances endpoint ([1940b85](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1940b852c82bcde5695a18a0306789b64f201134))
* **security:** parameterize sponsor whitelist GROQ + redact db-health response ([436807c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/436807cf2557556a753909697f510ad4dd765e64))
* **security:** restore acceptances tool via project membership check (24.1.5) ([b08bb43](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b08bb4359efec14277f027a24072e9242e47de8d))
* **seo:** agent discovery code review patches (5.21) ([d4d6fb1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d4d6fb13861323bc27046e06f011e41fb69743d2)), closes [#1](https://github.com/gsinghjay/astro-shadcn-sanity/issues/1)
* **studio:** force www host for acceptances API to avoid CORS preflight redirect ([740cf30](https://github.com/gsinghjay/astro-shadcn-sanity/commit/740cf306cbba434ac3315e5ff51ecc4d3a209250))

### Miscellaneous

* **deploy:** guard against stale dist + localhost vars in built bundle ([7b6400b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7b6400b33e758164204a2abbba7c7de26328a919))

### Tests

* **infra:** allow extra steps between astro build and wrangler deploy ([1b5a35f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1b5a35f63a283a8723cf094cdcb182f382450f8a))
* **portal:** stub window.location via vi.stubGlobal in modal test ([354b9ca](https://github.com/gsinghjay/astro-shadcn-sanity/commit/354b9ca8ee59cf52d3e12107f67e77f09f505af4))

## [2.0.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.20.1...v2.0.0) (2026-04-30)

### ⚠ BREAKING CHANGES

* **infra:** refactors required by adapter v13:

- 9 sites convert `Astro.locals.runtime.env` → `import { env } from
  'cloudflare:workers'` (middleware, actions, lib/db, all portal/api
  routes). Removed 'locals' parameter from getDb / getDrizzle.
- wrangler.jsonc replaces `pages_build_output_dir` with
  `assets.directory + binding=ASSETS` and `main:
  '@astrojs/cloudflare/entrypoints/server'` (the new unified adapter
  entry, not a build-output path).
- env.d.ts drops the `Runtime<>` ambient and references
  wrangler-generated worker-configuration.d.ts. Cloudflare.Env is
  augmented with dashboard-managed secrets (Better Auth / Resend /
  OAuth / Studio admin) and the RATE_LIMITER cross-script DO RPC type.
- Per-env deploys now use CLOUDFLARE_ENV build-time var, not
  `wrangler deploy --env`. New scripts: deploy:capstone /
  deploy:rwc-us / deploy:rwc-intl.
- experimental.fonts → root-level fonts (graduated in v6).
- adapter pinned to imageService:'compile' (v13 default
  cloudflare-binding deferred — Sanity images bypass <Image> already).
- Vite plugin pre-compiles picomatch (CJS via @astrojs/react) so it
  works in the new workerd dev runtime.
- block-registry drops the Astro 5 internal type import path.
- tsconfig excludes test files from astro check (vitest globals
  drift); db.test rewritten against mocked cloudflare:workers env.

Verified: `astro build` succeeds (10.2 MB / 2.8 MB gz, 239 assets,
59 modules), `wrangler deploy --dry-run` resolves all bindings
(RATE_LIMITER, SESSION_CACHE, PORTAL_DB, ASSETS, STUDIO_ORIGIN).
Pre-existing TypeGen / fixture drift errors in astro check are out
of scope for this commit.

NOT YET DONE (follow-ups):
- Phased deploy: rwc-intl → rwc-us → ywcc-capstone (custom domain
  cutover + Better Auth callback URL update).
- Pa11y / LHCI gates already green via sitemap-driven URL set.
- CLAUDE.md + project-context.md doc updates.
- Audit endpoints with file extension trailing slashes (Astro 6
  rejects /sitemap.xml/ etc).

### Features

* **infra:** add rwc-us-preview + rwc-intl-preview Workers (story 15.10 AC 3-5) ([fc72939](https://github.com/gsinghjay/astro-shadcn-sanity/commit/fc7293993ec8f19312967a8bda820334a9d09945))
* **infra:** cutover capstone to www.ywcccapstone1.com + add capstone-preview Worker (story 15.10) ([509df13](https://github.com/gsinghjay/astro-shadcn-sanity/commit/509df13969fdb480d8263e6423906392ae79460f))
* **infra:** migrate to Astro 6 + Cloudflare Workers static-assets ([f687f66](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f687f661a1a774e3a2d38a8bb12a79bbb9e586a7))
* **seo:** add astro-llms-md + sitemap-driven LHCI/Pa11y scope ([321526c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/321526c1649918c6e9988fd041a2cbb1403d78b8))

### Bug Fixes

* **chat-bubble:** restore reopen after vendor X close (Story 5.18) ([b230b76](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b230b76c0f1739558264b305408eab526ed3b61d))
* **ci:** tighten LHCI gating and useCdn coercion after Story 5.19 ([d1b3e04](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d1b3e045a60b51fdc4c5d01a9dbec8ab4b69b3db))
* **infra:** refactor Capstone into [env.capstone] block + fix wrangler-vars lookup ([9d36cef](https://github.com/gsinghjay/astro-shadcn-sanity/commit/9d36cefb85c3fa5c8cc52ed184a55ac19fc5bbc4))
* **infra:** unblock SSR portal pages on Workers (astro[#15434](https://github.com/gsinghjay/astro-shadcn-sanity/issues/15434) workaround) ([39874ce](https://github.com/gsinghjay/astro-shadcn-sanity/commit/39874ce7e21c8f325fecb4a606dd08c880df69fc)), closes [astro#15917](https://github.com/gsinghjay/astro/issues/15917) [astro#16040](https://github.com/gsinghjay/astro/issues/16040)
* **infra:** wire wrangler.jsonc env vars into Astro 6 build ([d70ee9a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d70ee9a2373dcee652ba91ab6370ec8b9ab12c04))
* **studio:** site-aware Presentation resolver + workspace tooling cleanup (Story 15.9) ([bd9281c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/bd9281c9c1bc9e409a49a176ae31448ea8f6c766))

### Miscellaneous

* **ci:** pin Node to 22 for CF Pages build cache compatibility ([081b139](https://github.com/gsinghjay/astro-shadcn-sanity/commit/081b1390c213d5be793acac54d64497b21aed4c8))
* gitignore .lhci report dumps and check in demo-audit assets ([b809c5a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b809c5aa6d1b5f113ad712252219fc4b227016cb))
* project files ([c0ea28a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c0ea28ad3be45f1e80731b72e8e1b24b94187c03))
* **studio:** auto-bump @sanity/vision + sanity to 5.23.0 ([565bf78](https://github.com/gsinghjay/astro-shadcn-sanity/commit/565bf78bd6c43097fdfbda47e432912ded145673))

### Tests

* **infra:** green unit suite under Astro 6 + @astrojs/cloudflare v13 ([3bafec6](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3bafec631a522993e71cd55299274dc39ce88553))

## [1.20.1](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.20.0...v1.20.1) (2026-04-29)

### Bug Fixes

* **portal:** bypass session middleware for /api/portal/admin/* + log Sanity write errors ([acb4e6f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/acb4e6f8cde375e3f83215b41c9ff06306091f4d))

## [1.20.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.19.0...v1.20.0) (2026-04-29)

### Features

* **portal:** sponsor acceptances Studio tool + scroll-to-accept gate ([c6ec470](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c6ec470de9b9f9430215ad053d8db2ea8d648116))

### Bug Fixes

* **forms:** switch to output:server so Astro Actions deploy as Worker routes ([d7e2417](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d7e2417b056b65bdf3a378e5d155352351ae1252))
* **portal:** address code-review findings on acceptances tool + scroll gate ([2f448bc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2f448bc24e64eff2882dbf2a4527000c7f490b64))
* **studio:** post-review fixes for sponsor acceptances tool ([9b96718](https://github.com/gsinghjay/astro-shadcn-sanity/commit/9b9671801b09316d33d237aa3021120c835a4af2))

### Tests

* **deploy:** update 5.2-INT-004 to assert output:server ([977c688](https://github.com/gsinghjay/astro-shadcn-sanity/commit/977c688ad622bff5b1d040c30581c071e5e68e5b))

## [1.19.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.18.0...v1.19.0) (2026-04-21)

### Features

* **chatbubble:** Swiss-design upgrade + code review patches (story 5.18) ([30fbe23](https://github.com/gsinghjay/astro-shadcn-sanity/commit/30fbe23ef3e1b2045f82dd2709b8bab069f3e923))
* **embed-block:** add raw embed code support for script-based widgets ([ee57349](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ee57349ae945f35d225821e9d2b63a4261e1f49c))
* **portal:** add portalPage singleton schema for CMS-editable portal pages ([6c48ba4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/6c48ba4391448d4926ed37f6e1c26e039060f0e2))
* **portal:** sponsor agreement gate + rename sponsorship to agreement + /portal/form ([c29b563](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c29b563789444edffec6cc272d2e835bc11a5070))
* **seo:** consolidate JSON-LD into single [@graph](https://github.com/graph) per page ([12f2590](https://github.com/gsinghjay/astro-shadcn-sanity/commit/12f2590e114dab74ae29db3ba9f7db5e0e8dd01e))

### Bug Fixes

* **csp:** allowlist *.formsite.com for raw embed code support ([7a9b594](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7a9b594863efb3cfed546c148d20683d764c3a45))
* **portal:** apply sponsor agreement code review patches + backfill migration ([5e793df](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5e793df8649fe0e4d24b96c8bb9ae60b2267d6c1))
* **portal:** apply story 22.9 code review patches ([1f33223](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1f33223e47a8d0479ed771279f1220549eb9003a))
* **portal:** code review fixes for portal page singletons ([29c94ca](https://github.com/gsinghjay/astro-shadcn-sanity/commit/29c94cab4c81537ea2d64becd56cee40fbd19969))
* **seo:** avoid input mutation in buildPageGraph ([5dc1982](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5dc19821928c9cb6ffa73b4f241bb8f9581ed469))
* **seo:** code review fixes for JSON-LD structured data ([f7e9916](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f7e9916d653cd1da5eb833d937b398a6ec979600))
* **studio:** reach RWC workspace parity with Capstone desk + per-site forms ([80ead26](https://github.com/gsinghjay/astro-shadcn-sanity/commit/80ead26852d216a102ae92ae7fab4b9de038ef8d))

### Miscellaneous

* documentation updates ([a024a95](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a024a95beeb094eef310490e50f405be8992504f))
* **studio:** bump sanity and @sanity/vision to ^5.21.0 ([5cc068e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5cc068e28cfcf767b8b9a07a8f0cf342f949eb35))

## [1.18.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.17.0...v1.18.0) (2026-04-15)

### Features

* **env:** adopt astro:env schema validation for typed env vars ([add79ab](https://github.com/gsinghjay/astro-shadcn-sanity/commit/add79ab95788d8a8749513306fc9aa882473b72e))
* **fonts:** adopt Astro Fonts API with self-hosted Inter via Fontsource ([34ae16a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/34ae16af39190f15d3760ed5846dbb17a8a043f2))
* **projects:** add sorting controls to /projects listing page ([6262947](https://github.com/gsinghjay/astro-shadcn-sanity/commit/6262947a80f1015c5f4878858d11c0c4cdd2e552))
* **schema:** add optional logoSquare and logoHorizontal fields to sponsor ([2783f50](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2783f506f8078c5b14ea6d16f6f22c101e13c81f))

### Bug Fixes

* **blocks:** contact-form image bleed, feature-grid columns/description, icon picker ([f0de7bf](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f0de7bf1a172f66ea412ad80b5c7f5cc159aa0fc))
* **blocks:** hero glass card, pullquote avatar, service-cards alternation, testimonials split + carousel ([49b5f00](https://github.com/gsinghjay/astro-shadcn-sanity/commit/49b5f005d122bed579aab9b6f7e682f0255f1a5d))
* **blocks:** restore readable contrast on dark-bg wrappers across custom blocks ([38b8610](https://github.com/gsinghjay/astro-shadcn-sanity/commit/38b8610ffa01e920212f2ee258444ab9dc4ccc45)), closes [#6b6b6b](https://github.com/gsinghjay/astro-shadcn-sanity/issues/6b6b6b) [#525252](https://github.com/gsinghjay/astro-shadcn-sanity/issues/525252) [#e5e5e5](https://github.com/gsinghjay/astro-shadcn-sanity/issues/e5e5e5) [#d4d4d4](https://github.com/gsinghjay/astro-shadcn-sanity/issues/d4d4d4)
* **fonts:** code review patches — CSS fallback, italic style, Font injection, disable dark mode ([6bfb656](https://github.com/gsinghjay/astro-shadcn-sanity/commit/6bfb65672537fa9dc26a2530509ea57c74855bed))
* **hero:** make centered-variant card semi-transparent so hero image shows through ([c442934](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c4429343f94cbacbc02c8683f9f8a28ed9eb14bf))
* resolve Lighthouse accessibility issues and optimize hero image srcset ([723703e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/723703e7575fa6fc46564acec1868a986e674295))
* **tests:** align sponsor schema + logo URL assertions with PR [#641](https://github.com/gsinghjay/astro-shadcn-sanity/issues/641) changes ([027b7d9](https://github.com/gsinghjay/astro-shadcn-sanity/commit/027b7d99bc4e751110a430b7cd8a77ca32ba1a0b))
* **ui:** apply sponsor logo crop fix across all components ([40b0542](https://github.com/gsinghjay/astro-shadcn-sanity/commit/40b05426776a964cb9b847f92608246868551468))
* **ui:** make mobile nav parents clickable and fix sponsor logo cropping ([bca74af](https://github.com/gsinghjay/astro-shadcn-sanity/commit/bca74af73d3c739e9fdab73f7365cc876cc79a55))
* **ui:** unify outline button hover behavior on dark hero/CTA banners ([5613cbc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5613cbc4f497b8363b370dfa911f660c4cc1b0c7)), closes [#222](https://github.com/gsinghjay/astro-shadcn-sanity/issues/222)

### Miscellaneous

* **ci:** audit every built page in Lighthouse CI, assert perf + LCP thresholds ([8e774cd](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8e774cda5cbae5e3d3c3c50b5e22690588f5a82f))
* **ci:** replace Lighthouse CI job with Lighthouse CI + Pa11y CI over /demo/ pages ([ef22de0](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ef22de0c7832ebda333be42bc7aa0b3f0c6824b1))
* **seo:** exclude /demo/ routes from sitemap and robots.txt ([4361f1a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4361f1a25c43e81197173b96ce856fca223f66ea)), closes [#12](https://github.com/gsinghjay/astro-shadcn-sanity/issues/12) [#13](https://github.com/gsinghjay/astro-shadcn-sanity/issues/13)

### Tests

* **schema:** update featureGrid field-count assertion to include description ([79c3e75](https://github.com/gsinghjay/astro-shadcn-sanity/commit/79c3e750d6b884865d0ba9fec563979e1c9798fe))

## [1.17.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.16.0...v1.17.0) (2026-04-13)

### Features

* add dedicated gallery page with breadcrumbs, Swiss design filters, and CMS listing page ([5cbb36f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5cbb36f37a8f6f77f14b3667d2b8a8f2b39df028))
* add Swiss Style concept stories for projects page redesign ([c1421be](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c1421be04d8552ce3cd6003cee32113550af06a0))
* **articles:** add category archive pages and chip navigation (Story 19.10) ([855eb72](https://github.com/gsinghjay/astro-shadcn-sanity/commit/855eb72a1f0e15e0d13ac894a2e42392fbf0cf3d))
* **articles:** add newsletter CTA to detail pages and articleList block (Story 19.7) ([1c81c0a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1c81c0ace613ec19fe556b539b2c8b33346848c3))
* **authors:** add author listing and detail pages with review hardening (Story 20.2) ([1e3dfdb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1e3dfdbb0c4c137fe67540de478d082bb77154f6))
* **authors:** add Person JSON-LD structured data to author detail pages (Story 20.3) ([77a4ae5](https://github.com/gsinghjay/astro-shadcn-sanity/commit/77a4ae5252ca58db70d044531aa2d2c685ea380a))
* **blocks:** add ColumnsBlock two-column layout wrapper (Story 21.10) ([672e090](https://github.com/gsinghjay/astro-shadcn-sanity/commit/672e090357157235526d09e77c783fb7abd307cc))
* **blocks:** variant audit, EventList variants, BlockWrapper improvements (Story 21.9) ([7ea3b5a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7ea3b5a427dc503ca06a3893edb05a79ee0822de))
* establish 12-column grid system and migrate to container queries ([256229d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/256229d6563c68c7e512450f82708f659cd0fe14))
* flagship capstone image gallery with PhotoSwipe, filters, and deep linking ([20d5d84](https://github.com/gsinghjay/astro-shadcn-sanity/commit/20d5d84c94f5b1aafe5b8dc32cf87f31927e87aa))
* **listing-pages:** add CMS-editable singleton listing page documents (Story 21.0) ([c4397f5](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c4397f5359567d73a7a0bee672dda73d5863f8b6))
* promote Swiss Style concept components to projects listing page ([39cad15](https://github.com/gsinghjay/astro-shadcn-sanity/commit/39cad150ea6fea3c448ba6b0548efccbc9db60e6))
* **seo:** add Article/NewsArticle JSON-LD to article detail pages (Story 19.6) ([07b4e0d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/07b4e0d35c2f4d01337526c8158df0ee0d1afb73))

### Bug Fixes

* **articles:** harden newsletter CTA per code review (Story 19.7) ([8efd133](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8efd133eee0928af3e00686b8b2690bd23bd7ae9))
* **blocks:** code review patches — race fix, empty guard, GROQ variant, test titles (Story 21.10) ([3f69a2b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3f69a2b9b8cc1cad1295382925fd4b3a55541987))
* **blocks:** code review patches — spacing override, null slug, hiddenByVariant, cleanup ([4f63316](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4f63316d8b674663063e4aa6f46974ca63c278a5))
* **blocks:** fix Lucide icon rendering, logo cloud cropping, and remove brutalist hovers ([ae2e4c8](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ae2e4c8f58a2f784bb69726f893953760f2cdcdf))
* code review fixes for 12-column grid system ([5a3dcf1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5a3dcf1302b904cd33597be2a1009b9132991c79))
* correct container query breakpoints and ColumnsBlock containment ([c940c36](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c940c3680735a835a87860ac95eb5d57d6f9b006))
* improve header nav accessibility and update stale schema description ([b6e3dee](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b6e3dee59b103c75ba74a7c84398b7ba9af9efa0))
* **listing-pages:** extract shared BLOCK_FIELDS_PROJECTION, fix null caching and slug guard ([6ab5944](https://github.com/gsinghjay/astro-shadcn-sanity/commit/6ab59447ca784942515e025af14e1b5206b41c00))
* resolve 3 Sanity review findings for image gallery ([1acb2aa](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1acb2aa170d216ba9fa15b6ac90a6cc330450a8c))
* resolve 9 code review findings for image gallery (Story 22.4) ([d2a2719](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d2a2719c028f92986e6bf478bef2be85fc386127)), closes [#11](https://github.com/gsinghjay/astro-shadcn-sanity/issues/11) [#6](https://github.com/gsinghjay/astro-shadcn-sanity/issues/6) [#7](https://github.com/gsinghjay/astro-shadcn-sanity/issues/7) [#8](https://github.com/gsinghjay/astro-shadcn-sanity/issues/8)
* restore site logo, nested nav dropdowns, and lower hamburger breakpoint ([f16cae2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f16cae2a963c8996bfa2fd873cbdb13ac4a14149))
* Sanity review fixes — pin Vite 6, remove dead code, deterministic gallery ID ([6bee0ab](https://github.com/gsinghjay/astro-shadcn-sanity/commit/6bee0ab19ecb5a1366db1ffc2a523250c1d650e6))
* Sanity review fixes — StatsRow text sizing, dead gutter fallbacks, SponsorSteps grid ([53039da](https://github.com/gsinghjay/astro-shadcn-sanity/commit/53039da97c6d3a7b96f5b79ba2ead29bf09c2df2))
* **seo:** harden Article JSON-LD builder per code review (Story 19.6) ([f115de7](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f115de751b9a0c4a4ab5fe4b877c2b2150115f6e))
* **studio:** deploy schema to all workspaces, not just capstone ([8bcf552](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8bcf5528a71cf68e5fab47cc4f76e88223344416))
* **types:** use TypeGen result types in getStaticPaths across all detail pages ([87aaa23](https://github.com/gsinghjay/astro-shadcn-sanity/commit/87aaa2343765e3a97a58783487730fc8734424fb))
* use DOMContentLoaded for ChatBubble and CookieConsent init ([4411576](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4411576529c8f2bcca71aa57eeae89fd079adc7c))

### Miscellaneous

* deleted old screenshots ([1ac6633](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1ac6633320c706b8edc986849cf6192d316fdc1e))

## [1.16.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.15.0...v1.16.0) (2026-04-11)

### Features

* **articleList:** add brutalist and magazine variants, refactor to reuse ArticleCard ([f85210e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f85210e6ebefed4e86c1c7c58947aa4c5e0e6975))
* **articleList:** wire block to real article documents (Story 19.4) ([7052c7e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7052c7e6aaff38f3fdac1f6cf269c7eadd8795cc))
* **astro:** add article listing and detail pages (Story 19.3) ([a9e1e62](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a9e1e62a805cfab63f1eeff91b288ccc152e2b4c))
* **portable-text:** add table block to portable text schema ([7ef1b4a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7ef1b4a62517bbcc234f472052ff714d520f9388))
* **rss:** add site-wide RSS feed endpoint for articles (Story 19.5) ([c84aeef](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c84aeefb8cf1ec18f9946eb5d998fcd40b603294))
* **storybook:** add ArticleCard stories and strict CSF3 template (Story 19.9) ([ed31dce](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ed31dcee5cf96c485af06cba81551e7498d53788)), closes [#26](https://github.com/gsinghjay/astro-shadcn-sanity/issues/26)
* **studio:** add article document schema (Story 19.2) ([1373ab2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1373ab225dccc646c1bfb41e30d60a08076d68cd))
* **studio:** add articleCategory document schema (Story 19.1) ([ca52732](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ca52732543f7e44dbb5acbd6fdbaa4516dee9a96))
* **studio:** add author document schema (Story 20.1) ([3232989](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3232989c01e28fd4d84f05c08e87fb6356794ba6))

### Bug Fixes

* **articleList:** prevent split-featured sidebar thumbnail stretch ([4f13ba2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4f13ba2be4aabc495d511c0536dced0aca06df09))
* **astro:** responsive srcset on ArticleCard and article link handler ([8f67e34](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8f67e349184ce6b879735cf6ba078672f8a3be27))
* **review:** address code review findings for Story 18.7 ([b3eb5d9](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b3eb5d995837c28e4bdaa368199ed5387570cc3a))
* **review:** address code review findings for Story 19.3 ([5167ff2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5167ff2246b9bc455166cdb36b0cd0531b8c797c))
* **review:** address Story 19.8 code review findings ([80ccd10](https://github.com/gsinghjay/astro-shadcn-sanity/commit/80ccd101851d2a727b2b6a4dcd7c4ea5b74a564d))
* **review:** address Story 19.9 code review findings ([50647cb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/50647cbe02eb90bc9fc3c868c08b8dca5cd9bbc6))
* **studio:** address code review findings for Story 18.6 ([5af2989](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5af2989bf1690f6cf0288d28d459adf5fdf0bfa7))
* **studio:** clean up RWC workspace config, add site-scoped slug uniqueness ([c87120a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c87120aaa6fc1cd091878a9df31a794763f692fb))
* **studio:** harden migration script with PT support, optimistic locking, error handling ([8cfeaff](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8cfeaffbac8b5bebd3a9e4294ad30017c406dbd0))

### Miscellaneous

* **studio:** update sanity to 5.20.0 and @sanity/vision to 5.20.0 ([154d60e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/154d60efd29bfd6668f296ac275a3bedd86b6dc2))

### Refactoring

* **groq:** remove coalesce() fallbacks after successful migration ([43a0f22](https://github.com/gsinghjay/astro-shadcn-sanity/commit/43a0f226cf403a89db08a17e3ac3f9575ef0c8eb))
* remove page template system, use full-width for all pages ([066a4f0](https://github.com/gsinghjay/astro-shadcn-sanity/commit/066a4f0c6478136649601656733e35968f3766e5))
* **studio:** make heading field optional across all block schemas ([a304648](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a304648cf2b071b1a1c9f9ecee6794c8b2aa3bc6))
* **studio:** remove presentation leakage from schemas (Story 18.7) ([f823be6](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f823be6e644514b619365badf3906e04fea08f3f))
* **studio:** split RWC workspace into separate US and International workspaces ([9a15ccc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/9a15ccc6df6cbf1cafb1fc14e1ea4e8877cdc361))

## [1.15.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.14.1...v1.15.0) (2026-04-09)

### Features

* **ai-search:** add Cloudflare AI Search chat bubble widget ([21b9696](https://github.com/gsinghjay/astro-shadcn-sanity/commit/21b969673eaea967b2899e670017b9a8a5abda16))

## [1.14.1](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.14.0...v1.14.1) (2026-04-09)

### Bug Fixes

* **seo:** add Cloudflare AI Search user-agent to robots.txt and fix trailing slash ([84f4f7e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/84f4f7efdf2fc52810b98bfee7a3b76232f2538b))

## [1.14.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.13.0...v1.14.0) (2026-04-09)

### Features

* **a11y:** add semantic HTML and accessibility fixes to block components ([d35baf4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d35baf4cad92a723d5c1a2dbd2e8d92209eec0d3))
* **blocks:** add brutalist variants for data and content components ([f673c81](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f673c815f6a22c9a4c31f1adcf55fa8d2d654485))
* **blocks:** add brutalist variants for HeroBanner, CtaBanner, and StatsRow ([12dc59f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/12dc59fb3046aa7f81417204258aeffefbaf8bae))
* **blocks:** add brutalist variants for sponsor and social proof components ([ed6d585](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ed6d58511b612c5d0cc47862af9e91dfb1e72275))
* **blocks:** add brutalist variants for UI and engagement components ([bf3e6a2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/bf3e6a2de22b585c0702de14c70f119b956085d1))
* **blocks:** add variants to videoEmbed, logoCloud, and contactForm ([aafefc7](https://github.com/gsinghjay/astro-shadcn-sanity/commit/aafefc74cd9331782cf99a6d08958a1d5165a54d))
* **calendar:** add Swiss Brutalist theme for Schedule-X calendars ([8ddd3bb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8ddd3bbe7122b5942ff3d8ed04ffc5e05ef4e82b)), closes [#E30613](https://github.com/gsinghjay/astro-shadcn-sanity/issues/E30613)
* **css:** add brutalist foundation CSS utilities and background variants ([1bd4fcd](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1bd4fcdeec09f9d922b3295e60f5c766a4f1e6fe))
* **seo:** add JSON-LD structured data to 17 block components ([4d7de6f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4d7de6fad1480c3bc33970cfd84b421ac540af15))
* **seo:** add sitemap, robots.txt, canonical URLs, and noIndex support ([15e4d83](https://github.com/gsinghjay/astro-shadcn-sanity/commit/15e4d83837a2ba8ac3bc8bb8498e50f463cc7da9))
* **studio:** add schema validation rules and editor descriptions ([5e4afd3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5e4afd339bb9aaa6a4e6f57278e375ac3aedb780))
* **studio:** extract shared schema helpers and standardize field naming ([a91505f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a91505fb72d61f543082e84bf6fd5ff7ed609792))
* **studio:** register brutalist variants in Sanity block schemas ([a56cdc8](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a56cdc8da245c8f0da33ae8f2f23a465d5221795))

### Bug Fixes

* **a11y:** address code review findings for Story 18.4 ([77bd53b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/77bd53b87294328afcdb40f1ccc3b08f83efc2e1))
* **blocks:** add missing button map entries for new background variants ([7f6db2e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7f6db2ee12f7a011d2e2c35d69bf7f90a8c933b1))
* **blocks:** address review findings for Story 2.8 ([a64dfe6](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a64dfe65ac0b0c1b37c8df817914ef11e947d8b3))
* **blocks:** apply code review fixes for image handling and URL validation ([b616257](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b616257e03db36d2662384d8c2fc1760a90b2fa2))
* **blocks:** apply code review patches for brutalist variant bugs ([215b1b1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/215b1b1e7b1689f2b5718ead5dd11a0ef67448af)), closes [#4](https://github.com/gsinghjay/astro-shadcn-sanity/issues/4)
* **blocks:** apply code review patches for security, bugs and schema consistency ([bf6123c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/bf6123c463d67516987410935d09725f0cc28fd1))
* **blocks:** wrap VideoEmbed split variants in Section for container queries ([cdc77a3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cdc77a3b5f8ac385d4e967033f267b0932b5eb8d))
* **calendar:** correct Schedule-X CSS selectors and review findings for Story 17.27 ([f1694d5](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f1694d538423d6880b00f597d6fe3a16a2a0b448))
* **home:** add missing getAllProjects fetch so projectCards block renders ([c30f3e7](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c30f3e7032025fd31631969cee28787bc79baedb))
* **home:** resolve CSP, CLS, and carousel loading issues from production audit ([fee4aaf](https://github.com/gsinghjay/astro-shadcn-sanity/commit/fee4aaf944b3a5769c0d51907bc07e23502ddf4c))
* **seo:** address code review findings for Story 5.1 ([eb7c7dc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/eb7c7dc23bf36770ac4821bae9509d40284d030a))
* **studio:** add default variants and hiddenByVariant for brutalist schemas ([e6a48b3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e6a48b3125ba94850ee0fde6e838d636afec19f9))
* **studio:** address code review findings for Story 18.5 ([698ba89](https://github.com/gsinghjay/astro-shadcn-sanity/commit/698ba8942b3a7d214dc8d09ad1373dc0f6909a5a)), closes [#1](https://github.com/gsinghjay/astro-shadcn-sanity/issues/1)

### Documentation

* **storybook:** add stories for new block variants ([aefe18a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/aefe18a57973e8718d388cad4b7f3e26a73d67cb))

### Miscellaneous

* lingering ([2bfe688](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2bfe6880cf3b790691f1425ebb9c0086c6cb1c72))

## [1.13.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.12.0...v1.13.0) (2026-04-04)

### Features

* **2-6:** Add layout variants to content blocks ([cf89f22](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cf89f22c18d59b636b7fdb2fd522535b95886a23))
* **2-7:** update custom block schemas, components, and tests ([1c4105f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1c4105f38cd0db933167a9c4d3e7d664d8730243))
* add /ping slash command with bot status and uptime ([a5296b2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a5296b27d62baededa365ffa7a351b3e98930352))
* add project-status, upcoming-events, sponsor-info, and ping slash commands ([4896df3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4896df357b7982c719f4c14d11535e18b374b618))
* **blocks:** add 13 essential CMS block components with Storybook stories ([8dd97fd](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8dd97fd3ff2e76da8d22aa3aa892bd40849aa4d0))
* **blocks:** add hatched background pattern variants for Swiss Brutalist style ([3eb509d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3eb509d93ce37ff5a30182cbf250981772891dbf))
* **blocks:** add Sanity schema integration for 13 essential CMS blocks ([3d77d5c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3d77d5c01aba667671ff1d2b097ba833b4dbb059))
* **perf:** add responsive images, YouTube facade & cache headers ([74d5e4d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/74d5e4d9ec59bc717a75de0893c87ad751809908))

### Bug Fixes

* **2-7:** add variant fallback handling and focused schema/component tests ([8d30f17](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8d30f17e2c1db46db82bb288dc3c96b31bebaab0))
* address CodeRabbit review comments ([3cc221c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3cc221cfbd513bc11962a49857fd6418b57cd18a))
* address CodeRabbit review comments - json.dumps, timeout, remove hello handler ([eedbe1b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/eedbe1bca480fd1017ec7e6def63d9b82998bebf))
* **blocks:** apply code review patches to 13 essential CMS block components ([d6326a0](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d6326a0e85cbd1a9822cddcc68108162198d28bc))
* **blocks:** apply code review patches to hatched background variants ([8295f51](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8295f51ea010180f83f1f565e86cdf5618b5d833))
* **feature-grid:** fully center grid-centered heading and cards ([cbf4dc1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cbf4dc14c946829e74672ced03ca6f0f0f856456))
* **story-2.6:** resolve variant findings and pass typegen+vitest ([84a8334](https://github.com/gsinghjay/astro-shadcn-sanity/commit/84a83347014163a065def1d8021a0eb14c318c12))
* **storybook:** correct argTypes, prop names, and descriptions from code review ([8dec72d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8dec72d0fac45e8252c718aa2418ef684bfae59a))
* **test:** add missing positive assertions to HeroBanner heading cap tests ([82c03e9](https://github.com/gsinghjay/astro-shadcn-sanity/commit/82c03e940c57caa2adcce448ef80fdb4e43ae866))
* use POST for single command registration, remove verify.mjs ([cfa5304](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cfa5304a03ca25df6dcfbc74156360de5677018e))

### Documentation

* **storybook:** add block-base argTypes (backgroundVariant, spacing, maxWidth) to all stories ([27080a7](https://github.com/gsinghjay/astro-shadcn-sanity/commit/27080a7d244b0d57da98993f4efe9aa9a4b48874))
* **storybook:** add descriptions, argTypes, and expanded variants to all 21 block stories ([3e17329](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3e173292ab015e412a8de34bf69cc503989c34ea))

### Miscellaneous

* remove out-of-scope files from /ping PR ([917599b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/917599b45bfe4bf5aa8eac54341430c9383b02a6))

## [1.12.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.11.0...v1.12.0) (2026-04-03)

### Features

* **blocks:** add projectCards page builder block (Story 2.16) ([e417566](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e417566f842a3c4acb95803438af269f0a78adc3))
* **blocks:** add sponsorshipTiers page builder block (Story 2.17) ([264a5d1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/264a5d1c02410330dc6b85b3c919ce8a4b9c87ea))
* **events:** add event reminder notifications via CF Workers cron (Story 2.13) ([a2fdb25](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a2fdb25588fb33500d83089a5c31512a1abae552))
* **events:** add iCal export and Add to Calendar buttons (Story 2.18) ([128ba16](https://github.com/gsinghjay/astro-shadcn-sanity/commit/128ba16440da2363ccc329747653caf7bcc36f81))
* **gdpr:** add cookie consent banner gating GTM behind user opt-in ([7cf2017](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7cf201705fd679826c83d47b0c88864070f2936c))
* **portal:** add extended GitHub dashboard insights ([5b59168](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5b591685778bea5d63e2d191bef1e861a04f876c))
* **portal:** add GitHub dev dashboard with self-serve repo linking (Story 9.4) ([8d78b5c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8d78b5cc0ca118220907d79c51e676eea43f737a))
* replace PyNaCl with Web Crypto API via Node.js FFI for Ed25519 signature verification ([e8ecf84](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e8ecf84bbd4d1ce20395da8e1dde2efa54f76dec))
* **testimonials:** add YouTube video embed support (Story 2.19) ([8483b41](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8483b411f8a5a0ccfcad64fbc905d4f9594a7290))
* **video:** add reusable video embed component with code review fixes (Story 2.21) ([0198c4a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0198c4ad42f32ee1cc9a0425c4b04603ee420322))

### Bug Fixes

* address CodeRabbit review comments ([b1af408](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b1af4088ed51431d9c965102272eb30280b74f16))
* address CodeRabbit review comments ([41e12b1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/41e12b1bbdd3904356deb867f69a9d8775175cd3))
* **auth:** allow linking GitHub accounts with different emails ([93f8d5d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/93f8d5d45797b9f6777cbee7481c5cd7ff8c2746))
* **blocks:** add stegaClean to SponsorshipTiers button variant prop ([8f7b139](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8f7b1393b79fd692ca1ba3318c46fe0362444b23))
* **blocks:** improve SponsorshipTiers preview subtitle and SVG accessibility ([45b4329](https://github.com/gsinghjay/astro-shadcn-sanity/commit/45b43295c5d1f40d4e8ce1bc0b8b08cb51c1214c))
* **csp:** allow GitHub avatars and Cloudflare Web Analytics ([c3282fc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c3282fc120c6fd62da23f3b6caa6799520ce59b7))
* **docker:** remove workspace node_modules named volumes to fix EACCES errors ([81449c4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/81449c4a51bfefe8dd1ffa370c40d0b1d24f7bcb))
* **gdpr:** address code review findings for cookie consent banner ([44e177b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/44e177bc00a3d756e8786a392876d10e66d019d8))
* **header:** stegaClean nav labels so Presentation Tool links navigate directly ([b1a198a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b1a198a9820acf8914819a4f89637aeff44d0ee4))
* **platform-api:** address PR [#562](https://github.com/gsinghjay/astro-shadcn-sanity/issues/562) review findings ([a93d597](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a93d597f6e4e3d9c77965cb98f2d03aeb7c3b7b9))
* **platform-api:** code review fixes for Stories 12.1 and 12.2 ([4e2bb61](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4e2bb6181e43daf4dc7b661a295eb4f2567f84d1))
* **platform-api:** pass null params to Sanity and validate token prefix ([b8516cb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b8516cb8633b075ab694a240471c2bae6773c8b7))
* **platform-api:** restore hardcoded Sanity project ID fallback ([bd578b1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/bd578b1b5b69f22058613eef5f3a43ad32704ece))
* **portal:** additional code review fixes for Story 9.19 ([8428b9d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8428b9dcd70e726a2f49534fdaedc9a8ec120164))
* **portal:** code review fixes for Story 9.19 GitHub extended insights ([3ab35af](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3ab35af23c23346b32fb119566b19d0b37e54a3e))
* **portal:** code review fixes for Story 9.4 GitHub dev dashboard ([7610041](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7610041b5d2f0a5b62b804ee281d8d6cf61c9c5e))
* **portal:** harden Better Auth GitHub integration ([d3ac11f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d3ac11fcf5bee76bdfcba6bef263bd1f9ea18d45))
* **portal:** use linkSocial instead of signIn.social for GitHub account linking ([c762112](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c7621128ec16810b20f693b34474b143bc4328cd))
* **testimonials:** add stegaClean to video embed and expand test coverage (Story 2.19) ([11c2d7a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/11c2d7a1c810f0996084093f1cf38db26184524a))
* **testimonials:** code review fixes for Story 2.19 ([6e970cf](https://github.com/gsinghjay/astro-shadcn-sanity/commit/6e970cff5d9aebf652b510f4d5c46aec175ba260))
* **tests:** add missing test coverage for SponsorshipTiers code review findings ([8227519](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8227519dfb04c9142568d2127ff0000b0bc48d6d))
* **video:** code review fixes for Story 2.21 ([d1f0a60](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d1f0a60f2a4c6b9b7f4a945d7cffd49bc5b6f8af))

### Documentation

* add docstrings to meet 80% coverage threshold ([c04c6ed](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c04c6edeb96d964d787f2380e9a3e6be8632fbe7))
* rescan and update project documentation (deep scan v1.11.0) ([8c37d04](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8c37d04fb38b9395b0be244ac28e0f873a0fa6d1))

### Miscellaneous

* resolve merge conflicts ([f73ed89](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f73ed893d8348973bcf656b6ba01bb0beb542351))
* update package-lock.json after wrangler upgrade ([d6247ff](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d6247ff09247fec867e615e2c93bfbdbc08ab9a9))

## [1.11.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.10.0...v1.11.0) (2026-03-10)

### Features

* **2-5:** implement ctaBanner variant rendering (Tasks 3-5) ([0c0a73c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0c0a73c482f22ee716b89dfe91c8bea1a54f4165))
* **2.10:** Swiss design blocks — comparisonTable, timeline, pullquote ([b46acb0](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b46acb0ddd19181b6ece4ad2542d8fc62a54a92c))
* **2.9:** add Swiss design content display blocks — TeamGrid, ImageGallery, ArticleList ([0d8670d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0d8670dc18cae020714b66a7ea8830033926382f))
* add Durable Object rate limiter for sponsor/student routes (Story 9.17) ([3601f71](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3601f711da70de5a347bad8b3c3cbf62ff2cb894))
* add layout variant infrastructure for page builder blocks (Story 2.4) ([ea9f15a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ea9f15a987695978fcfb4e49623835d600225857))
* add layout variants to heroBanner block (Story 2.5, Tasks 1-2) ([0c2bbd7](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0c2bbd79e6faa5d38a4a0ae3c62a57ab64142f5a))
* **hero:** add split-bleed variant with edge-to-edge image ([8996212](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8996212ffdfae80f5b7651b9f9fad8d03f53bb45))
* migrate sponsors from CF Access to Better Auth (Story 9.18) ([b637e71](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b637e715f93f015e42a571cf24daeeb8c6029447))
* **schema:** rename event.color to semantic category, structure mentor, fix image types ([2ba3e61](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2ba3e6118e0460ea2ff6b2e877671bbbc4fcf52e))
* **sponsor:** add hidden visibility toggle and prevent dead links ([b2cdaad](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b2cdaad5806aa9a813a0a7106b54f4f822e69f97))

### Bug Fixes

* **17.2:** remove rounded-full, rounded-lg, rounded-xl overrides ([71f52db](https://github.com/gsinghjay/astro-shadcn-sanity/commit/71f52db4d1405baf90087426ea05de4db8f4a89c))
* **2-5:** Sanity code review fixes for hero/CTA variants ([c039728](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c0397282153c5c3f29b6cdb6c7425c43efc0104d))
* **2-5:** Swiss design compliance and [#488](https://github.com/gsinghjay/astro-shadcn-sanity/issues/488) CTA banner fixes ([d491848](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d4918489c54282860eb9e334f099b781b665765d))
* **2.11:** code review fixes — divider & announcementBar blocks ([a8d527f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a8d527fefb98b6b83248356c642e0a236613132e))
* **2.11:** dismiss button layout and Swiss design alignment ([746b416](https://github.com/gsinghjay/astro-shadcn-sanity/commit/746b416f2f3b4c361db0390c0f200765b4311132))
* **2.11:** floating variant button right-alignment ([0d463d8](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0d463d80f60316da6a3fc48f81dca4a2a1fb2312))
* **2.11:** inline banner layout — single row, visible button ([62860e4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/62860e418b1456e4c0d16263f23ecc122680b2f4))
* **2.9:** ArticleList — use Button component and fix SectionSplit nesting ([c6ee26f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c6ee26f068103e71875fceac3d33aaa9f314e9fa))
* **3-4:** code review fixes — hidden sponsor tests, fixture drift, SSG docs ([8a38ea0](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8a38ea04c33533a0b678ff18fd4a03df7536e153))
* **7-16:** code review fixes — calendar category mapping, query consistency, test assertions ([d1d9824](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d1d98244ae3cf009ceaf23f4f5b7e47f673649fd))
* address code review [#2](https://github.com/gsinghjay/astro-shadcn-sanity/issues/2) findings for Story 9.18 auth migration ([fcc378f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/fcc378ff9b5fb92f232fedb6f56767744f6b8eb9))
* address code review findings for Story 9.17 rate limiter ([fdb312b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/fdb312bf51f5c0908bc3c849324dac0864e95010))
* address code review findings for Story 9.18 auth migration ([c26ae8c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c26ae8cfeb13d993dfd25be6d747967d431ead6a))
* align login pages with design system and fix security/a11y issues ([33c423c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/33c423c972985397e38c10e1c4ccbc54a39d4a13))
* **auth:** harden Better Auth with security fixes, account linking, and client consolidation ([361b071](https://github.com/gsinghjay/astro-shadcn-sanity/commit/361b0718ee0ff5c6493e211f04e376f2918cba38))
* **auth:** pass RESEND_FROM_EMAIL through to createAuth in route handler ([16fdee8](https://github.com/gsinghjay/astro-shadcn-sanity/commit/16fdee898e432e555d6496f978ce2d980ffb4725))
* **auth:** use absolute URL for Better Auth client baseURL ([0795371](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0795371d511d8609383ced47b63bd73353480a63))
* **ci:** use async exec in build tests to prevent Vitest worker RPC timeout ([cc40581](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cc40581ac501361e738a17c7f46788cc54b092c1))
* remove unnecessary chown and USER node from Dockerfile base stage ([4a24c01](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4a24c01d7dcb5a74e9efd06de3df320a1be439e7))
* resolve visual editing workspace routing and presentation navigation ([a508146](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a508146e1837070e72da90a8472a79fe04a0df47))
* **schema:** add radio layout to event.category for better editor UX ([5f00e3c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5f00e3c9f237b48a26bb26d234e5ebe0cb129210))
* **studio:** add missing "All Events" link to event location resolver ([84bf6d0](https://github.com/gsinghjay/astro-shadcn-sanity/commit/84bf6d065493d810127f175f1e51961d5c7797bc))
* use dynamic imports in middleware and replace CF Access logout with Better Auth ([df24557](https://github.com/gsinghjay/astro-shadcn-sanity/commit/df245571e82aca145b16a229a32aa756cca93973))

### Documentation

* new documentation to help understand the project ([702703b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/702703b16705ffcff88ed48940d05528426b4bb8))

### Miscellaneous

* descope student portal, revert 16.4/16.5 code, add auth consolidation docs ([0d8c5c4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0d8c5c462efc7450bbb311aee5a661091be85a90))
* optimize Cloudflare Pages build pipeline ([167188f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/167188ff9db238b8a0df6db3b36560d5872c5f5c))
* remove _bmad-output from git tracking ([9399451](https://github.com/gsinghjay/astro-shadcn-sanity/commit/9399451bd2ea68a4354784ff10302d3a83bb289b))
* scrapped website ([be569d1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/be569d151eb9ae9c13f3da7ebbce465bb2aaf863))
* updated agent context ([d37829b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d37829b5bf435122c255753e51759b888ee70e6e))
* updated Cursor rules ([a0b0ddd](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a0b0ddde0241fbe9a77e721893cbf5fe298567ab))

## [1.10.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.9.0...v1.10.0) (2026-03-02)

### Features

* add Better Auth + Drizzle ORM spike for student auth (Story 16.1) ([e3b81af](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e3b81af64aade811ce4aea34eb40f33ae860f022))
* add Cloudflare D1 database setup and portal schema (Story 9.8) ([a484fb5](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a484fb5d600f5b043852d988f113061581569d53))
* add Cloudflare Pages multi-project deployment (Story 15-5) ([56ccefc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/56ccefc459eabf1819d09bfdbe20f908eced080c))
* add dual-auth middleware for sponsor + student routes (Story 16.3) ([1ff8764](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1ff8764655938b46ae77ccbad42011ad1c2552c7))
* add multi-site data fetching with GROQ site filtering ([199afbd](https://github.com/gsinghjay/astro-shadcn-sanity/commit/199afbdecf4438abb2b54d1c6da05b219035aa06))
* add multi-workspace Studio configuration for Capstone and RWC ([70d5f22](https://github.com/gsinghjay/astro-shadcn-sanity/commit/70d5f22772330810240f0600d6d980126d63bb35))
* add nested dropdown navigation support to Header component ([f7e44ab](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f7e44ab802e2aaf239aa66388761af8d91278083))
* add per-site theming with CSS custom properties (Story 15-4) ([b2ab6c4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b2ab6c46eaddf1c2b4b7715167824320a09c016a))
* add portal events calendar with Schedule-X (Story 9.3) ([baa25d6](https://github.com/gsinghjay/astro-shadcn-sanity/commit/baa25d6bbc8ecb6f2af48e1ec58ec399d3968233))
* add production Better Auth infrastructure for student auth (Story 16.2) ([a09f898](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a09f8984d35c3e0f141c0a8d5ce7e594f75131ac))
* add Sanity schemas for team, capstoneStudent, and studentResource (Story 16.4) ([b1a7d45](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b1a7d456dd5398c882fc9718a3e05b69fa213331))
* add sponsor portal project view (Story 9.2) ([a74bd98](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a74bd98c857d75e6e972ded998fc16cc7b82c2d0))
* add student layout and dashboard page (Story 16.5) ([89460fa](https://github.com/gsinghjay/astro-shadcn-sanity/commit/89460fa12bdd8af83952c8b9234c09aa29dd6d96))

### Bug Fixes

* add missing hotspot/crop to sponsor logo projection in STUDENT_TEAM_QUERY (Story 16.4) ([e50c0de](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e50c0dedfaefec79bf6c7c97edf5173f7676ef5d))
* address code review findings for Better Auth infrastructure (Story 16.2) ([919c5df](https://github.com/gsinghjay/astro-shadcn-sanity/commit/919c5df88171fd39da479f986b10bbf85aeb2713))
* address code review findings for Better Auth spike (Story 16.1) ([458335f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/458335fca6c9fd123d98f9490356ad593ac0a882))
* address code review findings for D1 database setup (Story 9.8) ([c307aa2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c307aa24dd20fd2694a2ef6f2121f72f299f0015))
* address code review findings for dual-auth middleware (Story 16.3) ([a77eea3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a77eea345cd575c859fd25b8794359bd46c9b456))
* address code review findings for multi-site data fetching ([48aa3cb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/48aa3cb9e2d07af2811ae486baeac7ad7c6a2cce))
* address code review findings for multi-workspace config ([80b626c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/80b626c2de53c23db3f640f045c53b464d9e1d65))
* address code review findings for per-site theming (Story 15-4) ([203a8cd](https://github.com/gsinghjay/astro-shadcn-sanity/commit/203a8cd76e10543b48b2cc50ef6a177da41367de))
* address code review findings for portal events calendar (Story 9.3) ([ab5f2e4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ab5f2e4eccce967e82a9d15e261ed2fadf42e638)), closes [AC#2](https://github.com/gsinghjay/AC/issues/2) [AC#3](https://github.com/gsinghjay/AC/issues/3) [AC#4](https://github.com/gsinghjay/AC/issues/4)
* address code review findings for sponsor portal (Story 9.2) ([04ac42e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/04ac42efc05b1e34bc0a32df52684e6bb1c5b64b))
* address code review findings for Story 16.4 GROQ queries and tests ([14aae96](https://github.com/gsinghjay/astro-shadcn-sanity/commit/14aae96c6aa93796773b96d852afab7399d18029))
* address code review findings for Story 16.5 accessibility and UX ([3b0be12](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3b0be12c01e01921f6a26a1943ba206d50ece34f))
* address Sanity code review findings for sponsor portal (Story 9.2) ([1379100](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1379100ff32640be2d94f443b4d1daa7af462eca))
* address second code review findings for multi-workspace config ([3b15d81](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3b15d81a2f66ec2b6fda20ab457b2abaf666c585))
* derive Better Auth baseURL from request origin for preview deployments ([948bbc6](https://github.com/gsinghjay/astro-shadcn-sanity/commit/948bbc678d01eb6fd438f49ca600a36efe0caf40))
* redirect unauthenticated students to login page instead of API endpoint ([a068406](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a0684069357642f573e76f1522ceeb978791d2b2))
* use absolute URL for auth client in student login page ([8e36668](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8e366689ad6d4cb04e2d04e76044b1573a5a1a5e))

### Documentation

* update professional development guide for all 7 team roles ([41a6416](https://github.com/gsinghjay/astro-shadcn-sanity/commit/41a6416dacf82b9412d1667c9a5bca2e7c795c62))

### Miscellaneous

* add placeholder student page for middleware auth testing (Story 16.3) ([afa26de](https://github.com/gsinghjay/astro-shadcn-sanity/commit/afa26de44ca83889b7188e7e326c2afc0eace66b))
* add sign-out button to placeholder student page ([3036975](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3036975279087e499a392de347f68d732e74445d))
* Sanity CLI update ([dbab00a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/dbab00a665daaf2ec12d4511ff13e48629d14b91))
* update sprint status for spike 16.1 to review ([ccd5b5b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ccd5b5b1c2949914f3995d5b0def6eab80fc28e3))
* update story 16.3 with preview testing findings and file list ([596746a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/596746a6ac503cd5dfc3c03756290b82c2d35f65))

### Tests

* add E2E and integration tests for Story 15-3 coverage expansion ([08aee95](https://github.com/gsinghjay/astro-shadcn-sanity/commit/08aee95d322dd6dd9e598d08fb3c3d5be3291125))

## [1.9.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.8.0...v1.9.0) (2026-02-28)

### Features

* add FastAPI + Cloudflare Python Worker template (Story 0.1) ([6a56e7f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/6a56e7fb3e0aefb9d9b156ce61b8ed227e44eba4))
* add public events calendar view with list/calendar toggle (Story 2-15) ([c2a5999](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c2a59996857e7f8b4b59bb216834e0b0e39014ed))
* add reusable site field for multi-site content filtering (Story 15.1) ([ca1d5ce](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ca1d5ce84cea6cbdcad614b2ff067b23c0ee8e8e))
* add Sanity Live Content API for real-time content updates (Story 5-12) ([c157cfd](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c157cfd610a71b2b8c57e138936525d082f93f5f))
* apply code review fixes — safeUrlFor consistency, PT components wiring, status updates (Story 7-15) ([dc01391](https://github.com/gsinghjay/astro-shadcn-sanity/commit/dc01391d9ed67298bf18c2d40b97a64c04a0ec5e))
* **studio:** add schema validations, previews, and resolver polish (Story 7-12) ([b750b8f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b750b8f76e48ae6c79cc236d48bb9c0944d8ce6d))
* **studio:** add SEO object to sponsor, project, and event schemas (Story 7-13) ([c489bcc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c489bcca6e30594f572db9f1f395f39747cd9a4c))
* **studio:** formalize technology tags as predefined list (Story 7-14) ([425431c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/425431cec33cd58dbefa21c9c8fd1eb9664935bd))

### Bug Fixes

* align template with Cloudflare docs best practices ([da1e3e4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/da1e3e4cbccc1da57f8b7198391fdcb8264a38ae))
* code review fixes — seo test assertions, project.ts field order (Story 7-13 review) ([d1dcdfc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d1dcdfc0cb6e9ea9f48c4e070e4184010e9f9d83))
* format health endpoint docstring as proper markdown for Swagger UI ([a058b60](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a058b60144ea639a8384791cc14f1fe7b85b441b))
* prevent Docker from creating root-owned dirs on host filesystem ([b2f65fe](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b2f65fe65c1c6782306f14f9d827b583691c6c25))
* resolve code review issues in Sanity Live Content API (Story 5-12) ([755435c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/755435c53afc8113ee8d42aaf22d00732d793fb1))
* resolve EventCalendarIsland rendering errors (Story 2-15) ([4a5565b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4a5565b3097b5a2bc01f5b0713ddb09311e1656e))
* resolve PT internal link dead anchors, optimize PT image delivery (Story 7-15 review) ([8cf91ff](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8cf91ffc266fb1f40a446c3698975487c61130ca))
* security hardening and best practices for FastAPI CF Worker template (Story 0.1) ([8c7c608](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8c7c608e8429f7ae0c3185e81b83564be7921c5e))

### Documentation

* add PEP 257 docstrings explaining Cloudflare concepts for beginners ([cced0a6](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cced0a6dae6d9f6c02740fa44e690a559dd566a7))

### Miscellaneous

* ignored the wiki folder ([ca6aeb6](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ca6aeb631cd828631714b4d9253af337c1a35a12))
* remove tracked _bmad-output file that should be gitignored ([8555664](https://github.com/gsinghjay/astro-shadcn-sanity/commit/85556647aa65bd3894c5e589e89105d20cd66816))

## [1.8.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.7.0...v1.8.0) (2026-02-20)

### Features

* add contact form submission pipeline with Astro Actions ([1bd2e3c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1bd2e3cf5e6e318212cf23b917b9b1ed6a1fd412))
* add Figma Storybook capture scripts — free alternative to $100+/mo SaaS tools ([93f0ed2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/93f0ed29da80b74490a6507ad45b3c0242c3dbfe))
* optimize images for LCP <2s with urlFor(), LQIP placeholders, and preload ([e2d953e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e2d953eb4e45bf61129d9070af1c6f8274cc88f7))

### Bug Fixes

* add Cloudflare Turnstile to CSP script-src and frame-src ([cd3eb6c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cd3eb6c647b05d34dc7cead0a1019948f9f855bb))
* address Sanity code review findings for contact form ([9408957](https://github.com/gsinghjay/astro-shadcn-sanity/commit/94089574871c3ffa7d849ce35fbf5be15655c660))

### Documentation

* add preview links to status report pages and routes tables ([81aec4b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/81aec4bc23ff6ac229bbf598e427cde451188091))
* add Turnstile env vars and troubleshooting to cloudflare guide ([0af4208](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0af4208a5c463831e4e5241a74f8221dce009c33))
* consolidate 3 Cloudflare docs into single cloudflare-guide.md ([4f9fb17](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4f9fb17efcb41704c1b5bec1aed611380e251c62))
* generate comprehensive project documentation via parallel agent team ([0df48f2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0df48f2855fff1e6fefbccb77a36373331a02579))
* move Figma/Chromatic references into scripts README, delete tracking doc ([5e52d27](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5e52d2716baa6ef2292a8c2566c52f46eac519d4))
* remove 29 files replaced by GitHub wiki ([7d75736](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7d75736b2ab5a014c9c8849fe88fe1e2539b3706))
* update Cloudflare guide with Queues, Analytics Engine, Cron Triggers ([daabf24](https://github.com/gsinghjay/astro-shadcn-sanity/commit/daabf24a2bf0e8548cfa71ebf3f3d56aa166f48e))
* update status report with Story 6.1 contact form completion ([2c431fc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2c431fccaabfd32c1458efe75e08dcab7c35582c))

### Miscellaneous

* add .dev.vars to gitignore ([af8a8ef](https://github.com/gsinghjay/astro-shadcn-sanity/commit/af8a8ef04bd69a5ec64ded27f8cd8f71e5f7dcc4))
* cleanup docs ([364a2e1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/364a2e18703bdbc6a5b41989ca2eae016fa6325a))

## [1.7.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.6.0...v1.7.0) (2026-02-20)

### Features

* add Chromatic visual testing and Figma design sync ([31eb349](https://github.com/gsinghjay/astro-shadcn-sanity/commit/31eb3490b8ac9db9a6068b5897733f9f819c6a57))
* add Cloudflare Access auth for sponsor portal (Story 9.1) ([008d9f1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/008d9f180a4543b7380e9a24975535ecb1b80e05))
* add Docker support for discord-bot and fix Main entry point ([567c202](https://github.com/gsinghjay/astro-shadcn-sanity/commit/567c2027147eea93790aaa282b0af26daac10b80))
* add event detail pages at /events/[slug] (Story 2.14) ([861dd18](https://github.com/gsinghjay/astro-shadcn-sanity/commit/861dd185d96c77f67db503cad9bb5f6b2c54286f))
* add GTM-ready data attributes and dataLayer integration ([0400d19](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0400d195d724bf2f4c78879f3b258b72ebc2de18))
* add portal landing page layout and skeleton UI (Story 9.1b) ([e7539bd](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e7539bd6456b410b6e61ed6188555ce890f1542f))
* add SEO structured data and social sharing metadata (Story 5.11) ([ea0dedb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ea0dedba7d6f68c2d620ec74af887968e5fdaa21))
* migrate GA4 gtag.js to Google Tag Manager (Story 5.8) ([7bde29f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7bde29f0797b91a952bbdab265aeb75e211d64ec))

### Bug Fixes

* add [@id](https://github.com/id) to JSON-LD organizations and remove invalid industry property ([d2a3ed3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d2a3ed3a5c41eae93a6c1fa94e75ddac6ac3ae3a))
* add googletagmanager.com to CSP connect-src for GTM container fetches ([6684572](https://github.com/gsinghjay/astro-shadcn-sanity/commit/6684572f91f3d15a6f05a2f6716820a20f4f8e2a))
* consolidate event detail page into single Section to fix spacing ([a14884a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a14884a0fa1ee7ee89188a8c0a49f5718c2c3afb)), closes [#270](https://github.com/gsinghjay/astro-shadcn-sanity/issues/270)
* correct team domain to ywcc-capstone-pages and add logout docs ([5d953bb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5d953bbb8d78fadb9007b7414335f1f4480ae704))
* enable Sheet slide animation for Tailwind v4 ([97cdbeb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/97cdbebfec1f1bf6d89078de2b948fe27685f266))
* flush sidebar to left edge and add dev auth bypass ([3adbd9d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3adbd9dee88af10aad36a3415d2872521263a178))
* merge double-Section layout in detail pages and add GTM attrs to ProjectCard sponsor link ([4e28d35](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4e28d35036205aa3015f535a6e49e82c6e9ac484))
* portal code review — use PortalCard/PortalSkeleton, add PortalIcon, dedupe SeoProps ([72a159c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/72a159c18094c88f19255cf7f06dc5f6f19e3715))
* remove off-screen translate from Sheet content variants ([8db0507](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8db050701a9df031c327cce055c3c4a89911b00e))
* use Cloudflare runtime env for JWT validation instead of process.env ([a5e51e6](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a5e51e6bf3dcde2d62e236370f7b17ee537d3e8d))
* use EventScheduled for all events in JSON-LD structured data ([0883e08](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0883e08772a8ce904768909dda4e8ab31d4527ca))

### Documentation

* add beginner-friendly JSDoc to portal React components ([fe94886](https://github.com/gsinghjay/astro-shadcn-sanity/commit/fe94886cf2280a64e799f776b2a4ce86e5a52f41))
* add pranav to team section ([5b39bc2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5b39bc2598af7a1fcb2b879949a38394acf64087))
* explain how SSR works with output: static in portal guide ([7590a15](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7590a15d7995bb57548d819174d3ed6af27127c1))

### Miscellaneous

* add CODEOWNERS rule for discord-bot directory ([2c5898c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2c5898cdc4c69c2b18e4f3f6bf7c887bc16e1235))

### Refactoring

* align portal placeholders with stakeholder requirements ([5876b17](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5876b17bba6ebc28799f73ba339e4c70e80e7c47))

## [1.6.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.5.2...v1.6.0) (2026-02-18)

### Features

* add event document schema and EventList block (Story 2.12) ([1deb82c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1deb82cb5880e4b5559eaa56cbc8c3999fd22bfb))
* add project listing page with filtering and cross-reference navigation (Story 4.3) ([e330396](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e330396a3967182650df19253b4a4e0223dff8e2))
* add SidebarLayout and move project filters to sticky sidebar ([ff53129](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ff53129e1de2ac4acaf2a6344407eb7075fd35a1))
* add sponsor detail links, urlFor logos, listing page, and fix Storybook build ([a038979](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a038979dd41dae9585eeb35f35c2d4b046385688))
* add sponsor detail pages with breadcrumb navigation ([c4a8877](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c4a88777b5bfbe3874acbaa1b0afe7a80d3614f4))
* add testimonial document schema and testimonials block (Story 2.11) ([1ec72eb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1ec72ebe49658697301895c698e237cf71cbac8a))

### Bug Fixes

* add hotspot/crop to sponsor logo GROQ projections and noreferrer to SponsorCard ([a174e43](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a174e436913669ffdcb19e714be1f54766326619))
* add stegaClean to displayMode comparisons for Visual Editing compatibility ([d89078d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d89078de264c6896cedded9b6ff9ccd5a19bd481))
* code review fixes for Stories 2.11, 2.12, 4.3, 4.4 ([7ec81eb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7ec81eb0568c0d8b354118252208e581d567e147))
* remove debug logging and keep Vite define for CF env vars ([b8fda54](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b8fda541e7af9f0b89e4b2eb316c7ba0a5992dbd))
* stegaClean on href values and extract shared SponsorCard component ([c353777](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c3537779243084f14ac3010873d2175ebdb7c93e))

### Miscellaneous

* update sanity CLI ([4040a6e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4040a6e0e40905ddc653e8a5e11c9ded0d81a735))

## [1.5.2](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.5.1...v1.5.2) (2026-02-18)

### Bug Fixes

* pass GA4 and visual editing env vars through Vite define ([89e6fbf](https://github.com/gsinghjay/astro-shadcn-sanity/commit/89e6fbf9ef20a202c7fc5b9c623357716c031150))

### Documentation

* update README title to match site name ([c807787](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c80778796802862912dc2210e098b90380090f5c))

## [1.5.1](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.5.0...v1.5.1) (2026-02-18)

### Bug Fixes

* add build-time env vars to wrangler.toml for CF Pages v3 ([9301e60](https://github.com/gsinghjay/astro-shadcn-sanity/commit/9301e60b862548536fd0b798ba6f2bc46517c724))
* remove wrangler.toml so CF Pages dashboard controls env vars ([f80f93a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f80f93aff1dea27f02cfd79aa985c1b6b2580954))

### Tests

* update wrangler config tests for removed root wrangler.toml ([0b28ea8](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0b28ea880ca713e4d308da642f2382c63eef2355))

## [1.5.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.4.0...v1.5.0) (2026-02-18)

### Features

* optimize build-time Sanity API calls and update typegen ([45fbf24](https://github.com/gsinghjay/astro-shadcn-sanity/commit/45fbf24f1da68d5e8423f46add70f764e7ec5c64))
* **studio:** dynamic Presentation Tool locations and MPA navigation (Story 7-11) ([9b7fa33](https://github.com/gsinghjay/astro-shadcn-sanity/commit/9b7fa339441012969c01a6421541e2a68950ea35))
* use Server Islands for preview instead of full SSR (Story 7-4) ([34d07b3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/34d07b3bd95ed42e6be4906e556dc3344173dfc5))

### Bug Fixes

* address 3 P1 findings from TEA test review ([e4e43a7](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e4e43a7608b892917bb794298cb2ff48a269bef1))
* address code review findings for build-time optimization ([913c398](https://github.com/gsinghjay/astro-shadcn-sanity/commit/913c3982440aaea0d72ea27a5519674cfcc1e227))
* **blocks:** update BlockWrapper CSS values and delegate CtaBanner background (Story 7-9) ([098a064](https://github.com/gsinghjay/astro-shadcn-sanity/commit/098a0643e9569f6ef3dc307a13b23441798dbc75))
* **blocks:** use PortableText component for RichText and FAQ rendering (Story 7-8) ([36f00ba](https://github.com/gsinghjay/astro-shadcn-sanity/commit/36f00ba12dcb949d21ea1dd37461668181026619))
* move BlockWrapper out of blocks/, remove as-any casts, align CtaBanner default ([482b54f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/482b54ff9f00af6d792f1d2a1374734adc96d833))
* remove sponsor location resolver pointing to non-existent routes ([4e6e1f9](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4e6e1f90636d43a8da606617b6ff7ca98ea9780d))
* **test:** update block schema tests for named object types and run data migration (Story 7-10) ([77afcde](https://github.com/gsinghjay/astro-shadcn-sanity/commit/77afcde5b0496553f3288b60c634c0bc628251d5))

### Documentation

* add joshua lastimosa to team section ([fd8b50f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/fd8b50f67d0701afe07534b6d1aa916623969839))
* add relevent business information ([aff751a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/aff751a282e2694ab90db291180697fea1f9818a))

### Miscellaneous

* **typegen:** regenerate types after named object type extraction (Story 7-10) ([a7167fb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a7167fbb886f67f3414c45567663b117b3a8791c))

### Refactoring

* **schema:** extract reusable inline object types (Story 7-10) ([f03c695](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f03c695975af5ded91b3991f34da93fbd7b513e9))
* **schema:** extract reusable link and button field patterns (Story 7-7) ([6385461](https://github.com/gsinghjay/astro-shadcn-sanity/commit/638546161778f7aca5ca5f48275f876f5f0bc8b6))

## [1.4.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.3.0...v1.4.0) (2026-02-12)

### Features

* **docker:** add containerized dev environment with Docker Compose ([a5c68a4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a5c68a4c5fd04f359dba07d0fbe04b0d56f2a595))
* **sanity:** add stegaClean BlockWrapper and Studio UX polish (Story 7-6) ([64111e8](https://github.com/gsinghjay/astro-shadcn-sanity/commit/64111e8e7f2ffb80b00f65cbd1d21067bd1c3e7a))

### Bug Fixes

* **config:** make studioUrl env-driven for local Visual Editing ([28f3dad](https://github.com/gsinghjay/astro-shadcn-sanity/commit/28f3dad3f3ab6134d6b547c4350c41aed0580474))

### Documentation

* add aryaan to team section ([2e5ba64](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2e5ba643ce1084bd23e65e03d121cb5bda3e4fa1))
* add Mohsin Imtiaz to team section ([de22337](https://github.com/gsinghjay/astro-shadcn-sanity/commit/de2233768e8de2f93565e74e46142255b92d7ed4))
* add Sanity webhook setup guide with screenshots and update publishing docs ([21dc3e8](https://github.com/gsinghjay/astro-shadcn-sanity/commit/21dc3e84a341a787441672e346f5d1cbc4111af4))
* update README with unified block dispatch and fulldev/ui library ([f31cf30](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f31cf30517b5254d3ee4f8ce77af3342d8af1c86))
* updated team docs ([54ecb43](https://github.com/gsinghjay/astro-shadcn-sanity/commit/54ecb432a6ede2e76f9a4091029bd56f3640a880))

### Refactoring

* **blocks:** unify dispatch pattern — all blocks use spread props (Story 2-9) ([cb94d14](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cb94d140d579e5101826877f1d403919f6380620))

## [1.3.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.2.0...v1.3.0) (2026-02-11)

### Features

* **astro:** migrate remaining pages to CMS-driven catch-all route (Story 2.2b) ([098f9f1](https://github.com/gsinghjay/astro-shadcn-sanity/commit/098f9f1ffb3ee76e88858d0271eff08de78ecfd2))
* **sanity:** schema polish, SEO projection & cleanup (Story 7-5) ([cf57632](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cf576321a956cd31178115d44a3417808ac08227))

### Bug Fixes

* **storybook:** align story args with Sanity schema field names and fix render errors ([056512e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/056512ede171523701a501aa24ca32a14b07b202))
* **tsconfig:** exclude vitest.config.ts from astro check ([fb7a000](https://github.com/gsinghjay/astro-shadcn-sanity/commit/fb7a0001fc5b92033d0a3e8042e74b13f44fee00))

### Documentation

* added a guide for converting the shadcn components ([0fd8bd3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0fd8bd31187df5d2ae0fe63418f50c898e466474))
* added rules for Cursor ([71331f2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/71331f212d35a052329b87a417091be2cf75aa2c))

### Miscellaneous

* add .astro/ to gitignore ([cf73d8c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/cf73d8cb7dfd6fd607194b6e9b3c5e5eaeeac43d))
* remove TeamGrid, Timeline blocks and team/event document schema plans ([e72acf0](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e72acf03455b15810c522be1b30aad8428324f98))

### CI/CD

* add Sanity webhook → GitHub Actions deploy workflow ([ee8002b](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ee8002b2a500bee14d1b7260b92b8326d47fb921))

### Refactoring

* **astro:** replace 200+ static block imports with import.meta.glob registry ([8117877](https://github.com/gsinghjay/astro-shadcn-sanity/commit/81178779c1e92481f4cb763cc2e2be4720c17081))
* **test:** consolidate test architecture to Vitest + Playwright E2E ([886917e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/886917e4a5ee641d2e499c67714b93c8a0df27b8))

## [1.2.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.1.0...v1.2.0) (2026-02-10)

### Features

* add schema icons, defineArrayMember wrapping, and update apiVersion ([4e4c559](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4e4c559f396bc17da80933e031e3b46bb5677dcd))
* configure TypeGen and replace hand-written types with generated types ([042a414](https://github.com/gsinghjay/astro-shadcn-sanity/commit/042a4140de2a6f0690019a7193a8e374c5f631cf)), closes [#1](https://github.com/gsinghjay/astro-shadcn-sanity/issues/1) [#5](https://github.com/gsinghjay/astro-shadcn-sanity/issues/5)

### Bug Fixes

* add --kill-others to concurrently dev scripts to prevent orphaned processes ([0a29c8a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0a29c8a0a76ab0ea3298d2cdb5b258956393ed8a))
* address code review findings for story 7.1 (PR [#5](https://github.com/gsinghjay/astro-shadcn-sanity/issues/5)) ([0f1189a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0f1189a50347513fc9f6c5c504ee4f27b418729d))
* resolve TypeScript errors in defineBlock helper and add CogIcon to structure ([9c92074](https://github.com/gsinghjay/astro-shadcn-sanity/commit/9c920749fd01d61fbd61de97b9253e53b5a0fab4))

### Documentation

* add before/after screenshots for story 7.2 schema icons ([74f65c0](https://github.com/gsinghjay/astro-shadcn-sanity/commit/74f65c0acd5963cb2ac996416030637bfc3655ca))
* add type checking and schema management sections to onboarding guide ([fe4a895](https://github.com/gsinghjay/astro-shadcn-sanity/commit/fe4a895aa1bc1aded0c7d5f1882cff4487b063b0))
* update README with tech badges and team section, add git workflow guide, update onboarding guide ([f11edfb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f11edfb2317612583e69c69f0ba53d0f167f1bf3))

### Miscellaneous

* gitignore test-results and playwright-report directories ([ece88e3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/ece88e30d0e41b70ce57efd2cea9e52253747284))
* update sanity/cli from 5.8.1 -> 5.9.0 ([b0bd0ec](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b0bd0ec8775fb7da628cb26994e0d9ef7169a637))

## [1.1.0](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.0.1...v1.1.0) (2026-02-10)

### Features

* add Discord notifications for preview branch sync status ([c207c5c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c207c5c851fa2618d5d1d10e47abed42e072a0f4))

### Miscellaneous

* clean up docs and gitignore ([1f30dfa](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1f30dfa8f14295a86f7d4643a7c4db2c605b2c78))

## [1.0.1](https://github.com/gsinghjay/astro-shadcn-sanity/compare/v1.0.0...v1.0.1) (2026-02-10)

### Bug Fixes

* sync preview after release completes and block main-to-preview PRs ([4be9582](https://github.com/gsinghjay/astro-shadcn-sanity/commit/4be9582dade23f9a0fe9e7a647253ab2336e6b03))

## 1.0.0 (2026-02-10)

### Features

* 1-4 storybook ([895b3b5](https://github.com/gsinghjay/astro-shadcn-sanity/commit/895b3b5f71deb8af4ba26f0b58f470c7a3f1e118))
* add 12 block schemas for page composition system (Stories 2.1, 2.1b) ([c498141](https://github.com/gsinghjay/astro-shadcn-sanity/commit/c4981410455bf5bcd1a7cf1078e1fd2b9a55a8c3))
* add Cloudflare-specific unit tests for wrangler configs and build output ([d450037](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d450037c46fea62cdac3258ced942a36138a897d))
* add GA4 analytics, security headers, and Cloudflare Pages deployment (Story 5.2) ([158c962](https://github.com/gsinghjay/astro-shadcn-sanity/commit/158c962ecedf41081f32a1333b84d5c3b24e5ac6))
* add Lighthouse CI to GitHub Actions for automated performance auditing ([386be90](https://github.com/gsinghjay/astro-shadcn-sanity/commit/386be901fb0e10196835d54fcc97a57791eef3e9))
* add placehold.co logo avatars to sponsor cards test data ([a504610](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a5046106e938f40df9c93e4d387de9509c69f503))
* add semantic-release for automated versioning and changelog generation ([05bedcf](https://github.com/gsinghjay/astro-shadcn-sanity/commit/05bedcf342da051adaaec79683f115e289bbd37c))
* add sponsor document schema with 11 integration tests (Story 3.1) ([5c1ce47](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5c1ce470b1dd6028d84b0c9d72d78430ce5a608b))
* add SSR worker smoke tests using Miniflare ([be991aa](https://github.com/gsinghjay/astro-shadcn-sanity/commit/be991aa8e2f2c24f06e8cbfacfa49d212ef8b736))
* add template layout system with 5 page templates, insert menu groups, and catch-all route ([d188e07](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d188e070bfbfaf754a5aa3b76a327fb722bfcea2))
* add Vitest unit test layer and clean up gitignore ([de8efc4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/de8efc4b543f88fb58afe019cb3b3eeaa373b422))
* add workflow to enforce only preview branch can merge into main ([b5e1a8f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b5e1a8f63249c7c704186abf0ca1366d6951208b))
* component library courtesy uifulldotdev ([2cfcffa](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2cfcffa69ed3f550b85a610f28747f7ac68e9c8b))
* enable Visual Editing on preview branch deployment ([b226413](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b226413fa227ecea9a1e6371b3a2293c1e9b3bc9))
* replace homepage timeline with SponsorSteps block ([bbcc57e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/bbcc57e79a3371c637d9c23ec695ba4580f56bb1))
* replace placeholder logo with official NJIT SVG marks ([abb0b44](https://github.com/gsinghjay/astro-shadcn-sanity/commit/abb0b44f2cda587305ec412d19a608390f916708))
* run Lighthouse CI in parallel with unit tests, limit to homepage ([b241e25](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b241e25a7d62907834f7e46ce9fa6a1a62725e7a))
* story 1-2 ([a90a947](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a90a94786be36e76e7071598cc9e484b2e56c85d))
* story 1-3 ([89ad966](https://github.com/gsinghjay/astro-shadcn-sanity/commit/89ad966fddefac8a9410f4a374b4f60e00fd0f2e))
* switch preview build to SSR for live draft content ([e5a2767](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e5a276771a78d0c03cbdb954dba6637a4dc28c5d))
* test scaffold ([de36e53](https://github.com/gsinghjay/astro-shadcn-sanity/commit/de36e53f9f2fcf330ab8c2f60c9e6c0244e95c35))
* wire homepage to Sanity with GROQ queries, visual editing, and Presentation tool (Story 2.2) ([eec2329](https://github.com/gsinghjay/astro-shadcn-sanity/commit/eec23294f6d5b34c1973dc87c553cacef209220f))
* wire site settings to Sanity with memoized queries and full schema validation (Story 2.3a) ([e5b0d87](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e5b0d870a96dfc99b125e4961163ca8f986f7fd3))
* wrap GROQ queries in defineQuery, add missing block projections, fix SEO stega ([e082284](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e0822842a868023b5e4bee1f52981d4d35363535))

### Bug Fixes

* add disable_nodejs_process_v2 flag to fix SSR [object Object] response ([3f6202f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3f6202f4a3cc9451e97ede37b7ee98ae3d3990ee))
* add missing body text and replace broken image URL on about page ([0a33464](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0a334643531dc62b1ac8bd883d6716054e9cb970))
* add prerender export to index page + update implementation doc ([0f25fde](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0f25fded345f7942c49d51613a88548c6fa34882))
* add process.env fallback for Cloudflare Pages git integration ([a133174](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a133174ba89580ce534dc67c0bcc009b1e4b0b4e))
* add process.env fallback for Cloudflare Pages git integration ([f215e08](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f215e08e36cbbb2e2b06fcd4b01850b97974cd1d))
* add root wrangler.toml for Cloudflare Pages git integration ([e4c8552](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e4c8552d9192a2175ccae3f89226ae01bdc149a6))
* address Story 1.5 code review follow-ups and mark done ([316a510](https://github.com/gsinghjay/astro-shadcn-sanity/commit/316a5101eb867edd51305887735034f0cf13955e)), closes [#4](https://github.com/gsinghjay/astro-shadcn-sanity/issues/4)
* allow Sanity Studio to iframe the site for Presentation tool ([8704cb3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8704cb33e650164f2a046a78bdc4479bdf007635))
* correct CI workflow to run E2E tests from root and install browsers ([efd932e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/efd932e81bcbf9591de958f5043b58f78b61db1c))
* externalize /[@react-refresh](https://github.com/react-refresh) in Storybook build to fix CI failure ([bccb4a8](https://github.com/gsinghjay/astro-shadcn-sanity/commit/bccb4a89f3143756ed7620d277e76fa320436c87))
* install semantic-release plugin dependencies in release workflow ([d0aa9b8](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d0aa9b8acd8a8508e97a65138373de99281aed8e))
* prerender hardcoded pages to avoid fs crash on Cloudflare Workers ([7b2ab7c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/7b2ab7c38e463e06e859c32deb4d61366b754938))
* remove _key from Portable Text spans to match type definition ([71e6315](https://github.com/gsinghjay/astro-shadcn-sanity/commit/71e6315105084c8c622f16c066b80ff49f904467))
* remove X-Frame-Options and broaden frame-ancestors for Sanity Studio ([f40a670](https://github.com/gsinghjay/astro-shadcn-sanity/commit/f40a6706cf178fe3f771ad5afa6180e90a452cac))
* replace astro-icon with @iconify/utils for Cloudflare Workers edge compatibility ([95e38e6](https://github.com/gsinghjay/astro-shadcn-sanity/commit/95e38e6a7e46011dbe617c5277f60b477af155d9))
* replace sync-preview workflow with sync-main for new default branch ([e63acda](https://github.com/gsinghjay/astro-shadcn-sanity/commit/e63acda2364f66f3cfeec9a14fea6df61e7deb42))
* resolve SSR cache staleness and deprecated perspective in preview mode ([0cf0ab4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0cf0ab492262c0c54ef109cda8bcad792726d202))
* resolve storybook-astro production build producing empty iframe ([8b40d6d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/8b40d6d5ee6089522f07b45c23ac4877eb8506f4))
* set base path for Storybook GitHub Pages deploy ([5970ab7](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5970ab76f75798b721b499ad81360f5daffe3817))
* stub astro:assets in Storybook to resolve image service errors ([2859514](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2859514ff8f77dc288468c3188544a521e9d2d21))
* update CSP meta tag for Visual Editing and placeholder images ([39b2a68](https://github.com/gsinghjay/astro-shadcn-sanity/commit/39b2a68dfe53c78d4e41b769a01b19e6bf0f59dd))
* update tests for blocks/custom/ path and add SponsorSteps as 13th block ([b24d540](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b24d54010d86b68ce8c32b3010101ca7371e3a5f))
* use fast-forward merge in sync-main workflow to prevent drift ([a33b81f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a33b81f2d89eb788347077aa26297c14277a8b0a))
* use PAT for semantic-release to bypass branch protection rules ([71f9d45](https://github.com/gsinghjay/astro-shadcn-sanity/commit/71f9d4534b7006d5a7e4847fa8036a8a155cce22))
* use wrangler pages dev for preview (Cloudflare adapter has no preview) ([91dc8cd](https://github.com/gsinghjay/astro-shadcn-sanity/commit/91dc8cd70b6781ee92252af049bce7169e524965))
* write .env file in CI so Vite inlines SANITY_API_READ_TOKEN into SSR bundle ([1f8e2f3](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1f8e2f301d2bebaa4d669bee48eebfa72c3f10d7))

### Documentation

* document storybook-astro known issues and use pre-built output in CI ([5cd3c14](https://github.com/gsinghjay/astro-shadcn-sanity/commit/5cd3c147f9611ea669205b2519efe627b03d2a33))
* update story 5.2 with SSR runtime fix details ([d9cf07e](https://github.com/gsinghjay/astro-shadcn-sanity/commit/d9cf07ef5adabb9592fdadd2b236630500bac5bc))

### Miscellaneous

* BMAD ([a4102f9](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a4102f901853178731fb3bb3b49b3fe2b8841610))
* deleted spaghetti method for Cloudflare deployment ([a7472b4](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a7472b4a958b64e25211b2ca85e2138cc7400fb1))
* documentation updates ([b9acd2c](https://github.com/gsinghjay/astro-shadcn-sanity/commit/b9acd2c5f76e49cfda7acb04876b723a9f88d6f6))
* house cleaning ([055036d](https://github.com/gsinghjay/astro-shadcn-sanity/commit/055036d07b59cb1cd0b5bcc7c193ec69833f5d84))
* move autoUpdates into deployment config and add appId for sanity deploy ([92e92dc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/92e92dcb3412abca5cf70199f3b14a0dbcc29de4))
* move storybook deploy spec to implementation-artifacts ([1071d55](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1071d55fd102f6ad3012567d0b8e65aee0d15733))
* remove E2E from CI, keep unit tests and build only ([0d84856](https://github.com/gsinghjay/astro-shadcn-sanity/commit/0d848562ea0c5417735fc80c039d2320c2ff33af))
* remove storybook github pages spec, tracked as known issue instead ([2ab5760](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2ab5760e97dcc1393a1c1cf030ad8ea9ecbed16f))

### CI/CD

* add Storybook GitHub Pages deploy workflow and team docs ([72a9e4a](https://github.com/gsinghjay/astro-shadcn-sanity/commit/72a9e4a8ee8282a9906c77840a205c25d6dfa2a7))
* add workflow to auto-sync preview branch after main updates ([15f05cc](https://github.com/gsinghjay/astro-shadcn-sanity/commit/15f05cc8f88bf91d5f8f8ff49fc9d2bffe8fd8dd))
* add workflow to auto-sync preview branch with main ([3e43dd0](https://github.com/gsinghjay/astro-shadcn-sanity/commit/3e43dd009b1e9590b3cc00b1fecf89f3d5b1e216))
* restrict Lighthouse CI to PRs targeting preview branch only ([2be378f](https://github.com/gsinghjay/astro-shadcn-sanity/commit/2be378ffdd199e68f52f0e447f1047049227e155))
* scope CI workflow to preview branch PRs only ([1a4e8b2](https://github.com/gsinghjay/astro-shadcn-sanity/commit/1a4e8b26655b8c7c4fc948cc17e1d899509de188))

### Refactoring

* move custom blocks to blocks/custom/ subdirectory ([54e5dd5](https://github.com/gsinghjay/astro-shadcn-sanity/commit/54e5dd5b72764b8c9ee1ba1f1ba64c5104618d72))
* replace capstone-specific content with lorem ipsum placeholders ([40ff1b5](https://github.com/gsinghjay/astro-shadcn-sanity/commit/40ff1b568e407df7e0541c21431e03ef1f58a31f))
* scaffold from MyWebClass ([a3b28bb](https://github.com/gsinghjay/astro-shadcn-sanity/commit/a3b28bb9d211ecf3f7dee4647fbcddc242e4da22))
