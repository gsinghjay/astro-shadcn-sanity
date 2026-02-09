# Story 6.1: Contact Form with Formsite Integration

Status: ready-for-dev

> **Change Log (2026-02-09b):** Rewritten. Original Stories 6.1 (Sanity submission schema + API route) and 6.2 (contact form block) collapsed into single story. Formsite replaces custom Sanity API route — NJIT already has institutional Formsite license. Eliminates: submission document schema, SSR API route, Sanity write token, server-side rate limiting.

## Story

As a prospective sponsor,
I want to fill out and submit an inquiry form on the site with validation and confirmation feedback,
So that I can express interest in sponsoring a capstone team and know my submission was received.

## Acceptance Criteria

1. `studio/src/schemaTypes/blocks/contact-form.ts` is updated with a `formsiteUrl` field (url) so editors can configure the Formsite endpoint per-block (FR28)
2. `astro-app/src/components/blocks/custom/ContactForm.astro` renders a form with fields: name (text input, required), organization (text input), email (email input, required), message (textarea, required) (FR17)
3. Client-side validation prevents submission of empty required fields and validates email format, displaying inline error messages with ARIA attributes (FR18)
4. On valid submission, the form POSTs to the Formsite endpoint URL configured in the block schema (FR19)
5. On successful submission, a confirmation message displays using the `successMessage` from the block schema (FR21)
6. On submission error, a user-friendly error message is displayed without exposing technical details
7. The form uses vanilla JS (under 50 lines) with inline `<script>`, data-attribute patterns, and proper ARIA attributes for error states (`aria-invalid`, `aria-describedby`)
8. The form is fully keyboard navigable with visible focus indicators (NFR15)
9. Formsite handles spam protection, rate limiting, and submission storage (NFR10, NFR22)
10. No Sanity write token is needed — zero server-side secrets for forms (NFR9)
11. Form submissions are viewable in the Formsite dashboard (FR20)
12. Production build succeeds with no errors

## Current State Analysis

### What Exists

| Component | Status | Notes |
|---|---|---|
| Block schema | EXISTS | `studio/src/schemaTypes/blocks/contact-form.ts` — has `heading`, `description`, `successMessage`. Missing: `formsiteUrl` |
| Component | EXISTS | `astro-app/src/components/blocks/custom/ContactForm.astro` — renders form UI with fields (name, email, message), success state UI with `data-form-success` div. **No `<script>` tag, no submission logic.** |
| BlockRenderer | EXISTS | `ContactForm` already registered in switch statement (`case 'contactForm'`) |
| Schema registry | EXISTS | `contactForm` already in `schemaTypes/index.ts` and page schema `blocks[]` |
| GROQ projection | MISSING | No `contactForm` projection in `pageBySlugQuery` in `sanity.ts` |
| Types | EXISTS | `ContactFormBlock` in `types.ts` — has `headline`, `subtitle`, `formEndpoint`, `fields[]`. Needs update to match schema. |

### What Formsite Eliminates

| Component | Status | Why Not Needed |
|---|---|---|
| `submission.ts` schema | NOT NEEDED | Formsite stores submissions |
| `pages/api/submit.ts` | NOT NEEDED | Form POSTs directly to Formsite |
| `SANITY_API_WRITE_TOKEN` | NOT NEEDED | No Sanity writes |
| Rate limiting code | NOT NEEDED | Formsite handles it |
| `@sanity/client` write client | NOT NEEDED | No server-side mutations |

## Tasks / Subtasks

- [ ] Task 1: Update contact form block schema (AC: #1)
  - [ ] 1.1 Add `formsiteUrl` field (url, required) to `contact-form.ts`
  - [ ] 1.2 Add description: "Formsite Server Post URL — get from Formsite form settings"
  - [ ] 1.3 Deploy updated schema to Sanity cloud

- [ ] Task 2: Update TypeScript types (AC: #2)
  - [ ] 2.1 Update `ContactFormBlock` in `types.ts` to match schema: `heading`, `description`, `successMessage`, `formsiteUrl`
  - [ ] 2.2 Remove unused `formEndpoint`, `fields[]`, `FormField` interface (these were placeholder types)

- [ ] Task 3: Add GROQ projection (AC: #4)
  - [ ] 3.1 Add `contactForm` projection to `pageBySlugQuery` in `sanity.ts`: `_type == "contactForm" => { heading, description, successMessage, formsiteUrl }`

- [ ] Task 4: Update ContactForm.astro component (AC: #2, #3, #4, #5, #6, #7, #8)
  - [ ] 4.1 Update Props interface to use updated `ContactFormBlock` type
  - [ ] 4.2 Render heading from `block.heading` (already uses `block.headline` — align naming)
  - [ ] 4.3 Render description from `block.description`
  - [ ] 4.4 Set form `action` attribute to `block.formsiteUrl`
  - [ ] 4.5 Map form field `name` attributes to Formsite field IDs (configured in Formsite form builder)
  - [ ] 4.6 Add hidden `_gotcha` honeypot field (CSS `display:none`) as extra spam layer
  - [ ] 4.7 Update success message to use `block.successMessage`
  - [ ] 4.8 Add inline `<script>` tag for form submission handling

- [ ] Task 5: Implement client-side form logic (AC: #3, #4, #5, #6, #7, #8)
  - [ ] 5.1 Add validation: required field checks, email format regex
  - [ ] 5.2 Add inline error messages with `aria-invalid` and `aria-describedby`
  - [ ] 5.3 Submit via `fetch()` POST to Formsite URL (or traditional form submit with redirect)
  - [ ] 5.4 Show success state (toggle `data-form-success` visibility)
  - [ ] 5.5 Show error state on failure
  - [ ] 5.6 Ensure keyboard navigation works (tab order, Enter to submit, focus management)

- [ ] Task 6: Configure Formsite form (AC: #9, #11)
  - [ ] 6.1 Create or configure the sponsor inquiry form in NJIT's Formsite account
  - [ ] 6.2 Set up fields: Name, Organization, Email, Message
  - [ ] 6.3 Get the Server Post URL / form action URL
  - [ ] 6.4 Add the URL to the contactForm block in Sanity Studio

- [ ] Task 7: Verify end-to-end (AC: #10, #12)
  - [ ] 7.1 Submit form on local dev
  - [ ] 7.2 Verify submission appears in Formsite dashboard
  - [ ] 7.3 Test validation (empty required fields show errors)
  - [ ] 7.4 Test keyboard navigation (tab through fields, Enter to submit)
  - [ ] 7.5 Production build succeeds
  - [ ] 7.6 No Sanity write token in any env file or client bundle

## Dev Notes

### Formsite Integration Approach

Two approaches for form submission — choose based on Formsite's CORS policy:

**Approach A: Traditional form POST (recommended if CORS blocks fetch)**
```html
<form action={block.formsiteUrl} method="POST">
  <!-- fields -->
</form>
```
- Form submits natively, Formsite handles response
- Configure Formsite's "Success Page" to redirect back to the site (e.g., `/contact?submitted=true`)
- Read query param on load to show success message
- Simplest, most reliable — no CORS issues

**Approach B: fetch() POST (preferred UX if Formsite allows CORS)**
```javascript
const form = document.querySelector('[data-contact-form]');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  try {
    await fetch(form.action, { method: 'POST', body: formData });
    // Show success state
    form.querySelector('[data-form-fields]').dataset.state = 'hidden';
    form.querySelector('[data-form-success]').dataset.state = 'visible';
  } catch {
    // Show error
  }
});
```
- Stays on page, toggles success/error UI via data attributes
- Better UX (no page navigation)
- May fail if Formsite doesn't set `Access-Control-Allow-Origin`

**Recommendation:** Start with Approach A. If Formsite supports CORS, upgrade to Approach B.

### Schema Update

Add `formsiteUrl` to existing `contact-form.ts`:

```typescript
// studio/src/schemaTypes/blocks/contact-form.ts
import {defineField} from 'sanity'
import {defineBlock} from '../helpers/defineBlock'

export const contactForm = defineBlock({
  name: 'contactForm',
  title: 'Contact Form',
  preview: {select: {title: 'heading'}},
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'formsiteUrl',
      title: 'Formsite URL',
      type: 'url',
      description: 'Formsite form action URL — get from Formsite form settings > Integration > Server Post URL',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'successMessage',
      title: 'Success Message',
      type: 'string',
      description: 'Shown after successful form submission',
    }),
  ],
})
```

### TypeScript Type Update

Replace current `ContactFormBlock` in `types.ts`:

```typescript
// BEFORE (placeholder types from migration)
export interface ContactFormBlock {
  _type: 'contactForm';
  _key: string;
  headline?: string;
  subtitle?: string;
  formEndpoint?: string;
  fields?: FormField[];
}

// AFTER (matches Sanity schema)
export interface ContactFormBlock extends BlockBase {
  _type: 'contactForm';
  _key: string;
  heading?: string;
  description?: string;
  formsiteUrl: string;
  successMessage?: string;
}
```

Also remove the `FormField` interface if it's no longer used anywhere.

### GROQ Projection

Add to `pageBySlugQuery` in `sanity.ts`, inside the `blocks[]{}` projection:

```groq
_type == "contactForm" => {
  heading,
  description,
  formsiteUrl,
  successMessage
},
```

### Formsite Field Mapping

The form's `name` attributes must match Formsite's expected field identifiers. Formsite uses numeric field IDs like `RESULT_TextField-1`, `RESULT_TextField-2`, etc.

**After creating the form in Formsite**, update the HTML field names:

```html
<input name="RESULT_TextField-1" />  <!-- Name -->
<input name="RESULT_TextField-2" />  <!-- Organization -->
<input name="RESULT_TextField-3" />  <!-- Email -->
<textarea name="RESULT_TextArea-1"></textarea>  <!-- Message -->
```

The exact field IDs come from Formsite's form builder. The developer should coordinate with whoever has Formsite admin access to get these.

**Alternative:** If using Formsite's "Server Post" feature (which sends data TO an external URL), the field mapping works differently. Clarify with NJIT which direction the integration goes:
- **Option 1:** Site form POSTs to Formsite (site → Formsite) — needs Formsite's form action URL
- **Option 2:** Formsite form POSTs to our API (Formsite → site) — needs our API endpoint (but we're avoiding building one)

This story assumes **Option 1** (site → Formsite).

### Client-Side JS Pattern

Follow project conventions from `main.ts` and existing block scripts:

```javascript
// Inline <script> in ContactForm.astro
document.querySelectorAll('[data-contact-form]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    // Validate required fields
    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const message = form.querySelector('[name="message"]');

    let valid = true;

    [name, email, message].forEach((field) => {
      if (!field.value.trim()) {
        field.setAttribute('aria-invalid', 'true');
        valid = false;
      } else {
        field.removeAttribute('aria-invalid');
      }
    });

    // Email format
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.setAttribute('aria-invalid', 'true');
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      // Focus first invalid field
      form.querySelector('[aria-invalid="true"]')?.focus();
    }
    // If valid, form submits natively to Formsite
  });
});
```

### Existing Component Analysis

Current `ContactForm.astro` (lines 24-94) already has:
- `data-contact-form` attribute on `<form>` element
- `data-form-fields` wrapper div for field visibility toggling
- `data-form-success` div with check icon, "Inquiry Received" heading, and placeholder text
- Fields: name, email, message using fulldev/ui primitives (Field, Input, Textarea, Button)
- Uses `Section`, `SectionSplit`, `SectionContent` layout primitives

**What needs changing:**
- Add `action={block.formsiteUrl}` and `method="POST"` to `<form>`
- Add hidden `_gotcha` honeypot field
- Update field `name` attributes to match Formsite field IDs
- Add `organization` field (currently missing from the rendered form)
- Replace hardcoded success text with `block.successMessage`
- Add inline `<script>` for validation + submit handling
- Update prop destructuring to use `heading`/`description` from schema (currently uses `headline`/`subtitle`)

### Project Structure Notes

Files to MODIFY:
```
studio/src/schemaTypes/blocks/contact-form.ts     <- ADD formsiteUrl field
astro-app/src/lib/types.ts                        <- UPDATE ContactFormBlock, REMOVE FormField
astro-app/src/lib/sanity.ts                       <- ADD contactForm GROQ projection
astro-app/src/components/blocks/custom/ContactForm.astro  <- ADD form action, validation, submit logic
```

Files NOT modified:
```
studio/src/schemaTypes/index.ts                   <- contactForm already registered
studio/sanity.config.ts                           <- No desk structure changes needed
astro-app/src/components/BlockRenderer.astro       <- contactForm already in switch
astro-app/astro.config.mjs                        <- No adapter changes
astro-app/.env.example                            <- No write token needed
```

Files NOT created:
```
studio/src/schemaTypes/documents/submission.ts    <- NOT NEEDED (Formsite stores data)
astro-app/src/pages/api/submit.ts                 <- NOT NEEDED (no API route)
```

### References

- [Source: epics.md#Story 6.1] — Acceptance criteria (revised for Formsite)
- [Source: project-context.md#Vanilla JS Patterns] — data-attribute state, ARIA attributes, scoped selectors
- [Source: project-context.md#Block Architecture] — defineBlock pattern, component pattern
- [Source: project-context.md#GROQ Query Rules] — conditional projections in blocks[]
- [Source: architecture.md#Anti-Patterns] — No React, no inline styles, no classList toggling

### Anti-Patterns to Avoid

| Rule | What NOT to Do |
|---|---|
| No classList toggling for state | Use `data-state` attributes |
| No React/JSX | Vanilla JS in `<script>` tag |
| No hand-rolled inputs | Use fulldev/ui Field, Input, Textarea components |
| No inline GROQ in components | Projection goes in `sanity.ts` |
| No hardcoded Formsite URL in component | Must come from Sanity block data (`formsiteUrl` field) |
| No Sanity write client | Formsite handles storage — no write token |

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
