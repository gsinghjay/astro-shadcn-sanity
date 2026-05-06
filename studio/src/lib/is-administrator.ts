// The machine name of Sanity's built-in administrator role. The dashboard
// displays it as "Administrator" (capitalised) but `currentUser.roles[].name`
// returns the lowercased machine name. Comparison is case-sensitive — keep
// the literal in one place so future schemas can't drift on casing.
export const ADMINISTRATOR_ROLE_NAME = 'administrator' as const

// Structural type rather than `CurrentUser` because Sanity's `readOnly` callback
// passes `Omit<CurrentUser, "role">` (the deprecated single-role field is stripped),
// while other callers may pass the full `CurrentUser`. Both shapes carry `roles`.
type UserWithRoles = {roles?: ReadonlyArray<{name: string}>} | null | undefined

export function isAdministrator(currentUser: UserWithRoles): boolean {
  return currentUser?.roles?.some((r) => r.name === ADMINISTRATOR_ROLE_NAME) ?? false
}
