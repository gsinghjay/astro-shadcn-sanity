import {UsersIcon} from '@sanity/icons'
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Inline,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {defineQuery} from 'groq'
import {useClient} from 'sanity'
import {IntentLink} from 'sanity/router'

const SPONSORS_BY_EMAIL_QUERY = defineQuery(
  `*[_type=="sponsor" && lower(contactEmail) in $emails]{ _id, contactEmail, name }`,
)

type FilterMode = 'all' | 'true' | 'false'

interface Acceptance {
  email: string
  name: string
  role: string
  agreementAcceptedAt: number | null
}

interface SponsorDoc {
  _id: string
  contactEmail: string
  name: string
}

interface ToolConfig {
  apiUrl?: string
  token?: string
}

function readConfig(): ToolConfig {
  const e = (import.meta as unknown as {env?: Record<string, string | undefined>}).env ?? {}
  return {
    apiUrl: e.SANITY_STUDIO_ACCEPTANCES_API_URL,
    token: e.SANITY_STUDIO_ADMIN_TOKEN,
  }
}

export function sponsorAcceptancesTool(overrides?: ToolConfig) {
  const ResolvedView = () => <SponsorAcceptancesView {...(overrides ?? readConfig())} />
  return {
    name: 'sponsor-acceptances',
    title: 'Sponsor Acceptances',
    icon: UsersIcon,
    component: ResolvedView,
  }
}

function formatAcceptedAt(value: number | null): string {
  if (value == null) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return '—'
  }
}

export function SponsorAcceptancesView(props: ToolConfig = {}) {
  const {apiUrl, token} = props
  const client = useClient({apiVersion: '2024-10-01'})

  const [filter, setFilter] = useState<FilterMode>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [data, setData] = useState<Acceptance[] | null>(null)
  const [sponsors, setSponsors] = useState<Record<string, SponsorDoc>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  // Debounce search at 200ms
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 200)
    return () => clearTimeout(id)
  }, [search])

  const load = useCallback(
    async (controller?: AbortController) => {
      if (!apiUrl || !token) {
        setError(
          'Acceptances API not configured. Set SANITY_STUDIO_ACCEPTANCES_API_URL and SANITY_STUDIO_ADMIN_TOKEN.',
        )
        setLoading(false)
        setData(null)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${apiUrl}?accepted=${filter}`, {
          headers: {authorization: `Bearer ${token}`},
          signal: controller?.signal,
        })
        if (!res.ok) throw new Error(`API ${res.status}`)
        const body = (await res.json()) as {acceptances: Acceptance[]}
        setData(body.acceptances)

        const emails = body.acceptances.map((a) => a.email.toLowerCase())
        if (emails.length) {
          const docs = await client.fetch<SponsorDoc[]>(SPONSORS_BY_EMAIL_QUERY, {emails})
          setSponsors(
            Object.fromEntries(docs.map((d) => [d.contactEmail.toLowerCase(), d])),
          )
        } else {
          setSponsors({})
        }
      } catch (e: unknown) {
        if ((e as Error).name === 'AbortError') return
        setError((e as Error).message ?? 'Unknown error')
      } finally {
        setLoading(false)
      }
    },
    [apiUrl, token, filter, client],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller)
    return () => controller.abort()
  }, [load, reloadKey])

  const visible = useMemo(() => {
    if (!data) return []
    if (!debouncedSearch) return data
    return data.filter(
      (a) =>
        a.email.toLowerCase().includes(debouncedSearch) ||
        (a.name ?? '').toLowerCase().includes(debouncedSearch),
    )
  }, [data, debouncedSearch])

  const handleRefresh = () => {
    setReloadKey((k) => k + 1)
  }

  return (
    <Card padding={4} height="fill" tone="default">
      <Stack space={4}>
        <Flex align="center" justify="space-between" gap={3}>
          <Stack space={2}>
            <Heading as="h1" size={2}>
              Sponsor Acceptances
            </Heading>
            <Text muted size={1}>
              Read-only audit of sponsor agreement acceptance. Source of truth: D1 (
              <code>user.agreement_accepted_at</code>).
            </Text>
          </Stack>
          <Button
            text="Refresh"
            mode="ghost"
            onClick={handleRefresh}
            data-testid="acceptances-refresh"
          />
        </Flex>

        <Flex gap={2} wrap="wrap" align="center">
          <Inline space={2}>
            {(['all', 'true', 'false'] as FilterMode[]).map((mode) => (
              <Button
                key={mode}
                text={mode === 'all' ? 'All' : mode === 'true' ? 'Accepted' : 'Pending'}
                mode={filter === mode ? 'default' : 'ghost'}
                tone={filter === mode ? 'primary' : 'default'}
                onClick={() => setFilter(mode)}
                data-testid={`acceptances-filter-${mode}`}
              />
            ))}
          </Inline>
          <Box flex={1} style={{minWidth: 220}}>
            <TextInput
              placeholder="Search email or name…"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              data-testid="acceptances-search"
            />
          </Box>
        </Flex>

        {loading && (
          <Card padding={4} radius={2} border tone="transparent" data-testid="acceptances-loading">
            <Flex align="center" gap={3}>
              <Spinner muted />
              <Text muted size={1}>
                Loading acceptances…
              </Text>
            </Flex>
          </Card>
        )}

        {!loading && error && (
          <Card padding={4} radius={2} tone="critical" border data-testid="acceptances-error">
            <Stack space={3}>
              <Text size={1}>{error}</Text>
              <Box>
                <Button text="Retry" mode="ghost" onClick={handleRefresh} />
              </Box>
            </Stack>
          </Card>
        )}

        {!loading && !error && visible.length === 0 && (
          <Card padding={4} radius={2} border tone="transparent" data-testid="acceptances-empty">
            <Text muted size={1}>
              No sponsors match the current filter.
            </Text>
          </Card>
        )}

        {!loading && !error && visible.length > 0 && (
          <Card border radius={2} overflow="auto" data-testid="acceptances-table">
            <Stack as="ul" space={0} padding={0}>
              <Flex
                as="li"
                paddingY={2}
                paddingX={3}
                gap={3}
                style={{
                  listStyle: 'none',
                  borderBottom: '1px solid var(--card-border-color)',
                  fontWeight: 600,
                }}
              >
                <Box flex={2}>
                  <Text size={1} weight="medium">Email</Text>
                </Box>
                <Box flex={2}>
                  <Text size={1} weight="medium">Name</Text>
                </Box>
                <Box flex={1}>
                  <Text size={1} weight="medium">Status</Text>
                </Box>
                <Box flex={2}>
                  <Text size={1} weight="medium">Accepted At</Text>
                </Box>
                <Box flex={1}>
                  <Text size={1} weight="medium">Sponsor Doc</Text>
                </Box>
              </Flex>
              {visible.map((row) => {
                const doc = sponsors[row.email.toLowerCase()]
                const accepted = row.agreementAcceptedAt != null
                return (
                  <Flex
                    key={row.email}
                    as="li"
                    paddingY={2}
                    paddingX={3}
                    gap={3}
                    style={{
                      listStyle: 'none',
                      borderBottom: '1px solid var(--card-border-color)',
                    }}
                    data-testid="acceptances-row"
                    data-email={row.email}
                  >
                    <Box flex={2}>
                      <Text size={1}>{row.email}</Text>
                    </Box>
                    <Box flex={2}>
                      <Text size={1}>{row.name || '—'}</Text>
                    </Box>
                    <Box flex={1}>
                      <Badge tone={accepted ? 'positive' : 'caution'} mode="outline">
                        {accepted ? 'Accepted' : 'Pending'}
                      </Badge>
                    </Box>
                    <Box flex={2}>
                      <Text size={1} muted={!accepted}>
                        {formatAcceptedAt(row.agreementAcceptedAt)}
                      </Text>
                    </Box>
                    <Box flex={1}>
                      {doc ? (
                        <IntentLink
                          intent="edit"
                          params={{id: doc._id, type: 'sponsor'}}
                          data-testid="acceptances-sponsor-link"
                        >
                          {doc.name || 'Open'}
                        </IntentLink>
                      ) : (
                        <Text size={1} muted>—</Text>
                      )}
                    </Box>
                  </Flex>
                )
              })}
            </Stack>
          </Card>
        )}
      </Stack>
    </Card>
  )
}
