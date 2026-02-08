import type {SchemaTypeDefinition} from 'sanity'

// Object schemas
import {seo} from './objects/seo'
import {button} from './objects/button'
import {portableText} from './objects/portable-text'

// Document schemas
import {page} from './documents/page'
import {siteSettings} from './documents/site-settings'

// Block schemas — added in Story 2.1
// import { heroBanner } from './blocks/hero-banner'
// ...

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  seo,
  button,
  portableText,
  // Documents
  page,
  siteSettings,
]
