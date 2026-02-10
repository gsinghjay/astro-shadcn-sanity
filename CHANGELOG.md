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
