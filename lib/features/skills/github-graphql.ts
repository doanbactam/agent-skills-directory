import { env } from "@/lib/env"

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"

function getHeaders(): HeadersInit {
  const token = env.GITHUB_TOKEN
  if (!token) {
    throw new Error("GITHUB_TOKEN is required for GraphQL API")
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "Skills-Directory",
  }
}

function getRestHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Skills-Directory",
  }
  if (env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`
  }
  return headers
}

export type RepoMetadata = {
  owner: string
  repo: string
  stars: number
  forks: number
  pushedAt: string
  language: string | null
  topics: string[]
  isArchived: boolean
  avatarUrl: string
  licenseKey: string | null
}

export async function batchFetchRepoMetadata(
  repos: Array<{ owner: string; repo: string }>
): Promise<Map<string, RepoMetadata>> {
  if (repos.length === 0) return new Map()

  // GraphQL can handle ~50 repos per query efficiently
  const chunks = chunkArray(repos, 50)
  const results = new Map<string, RepoMetadata>()

  for (const chunk of chunks) {
    const query = buildBatchQuery(chunk)

    try {
      const response = await fetch(GITHUB_GRAPHQL_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error("GraphQL error:", response.status, error)
        continue
      }

      const data = await response.json()

      if (data.errors) {
        console.error("GraphQL errors:", data.errors)
      }

      // Parse results
      for (let i = 0; i < chunk.length; i++) {
        const key = `repo${i}`
        const repoData = data.data?.[key]

        if (repoData) {
          const { owner, repo } = chunk[i]
          results.set(`${owner}/${repo}`, {
            owner,
            repo,
            stars: repoData.stargazerCount ?? 0,
            forks: repoData.forkCount ?? 0,
            pushedAt: repoData.pushedAt,
            language: repoData.primaryLanguage?.name ?? null,
            topics: repoData.repositoryTopics?.nodes?.map((n: { topic: { name: string } }) => n.topic.name) ?? [],
            isArchived: repoData.isArchived ?? false,
            avatarUrl: repoData.owner?.avatarUrl ?? "",
            licenseKey: repoData.licenseInfo?.key ?? null,
          })
        }
      }

      // Rate limit awareness - wait a bit between chunks
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await sleep(100)
      }
    } catch (error) {
      console.error("Failed to fetch repo metadata:", error)
    }
  }

  return results
}

export type SkillFullData = RepoMetadata & {
  content: string | null
  sha: string | null
  path: string
  fileCommittedAt: string | null
}

export async function batchFetchSkills(
  items: Array<{ owner: string; repo: string; path: string }>
): Promise<Map<string, SkillFullData>> {
  if (items.length === 0) {
    return new Map()
  }

  const chunks = chunkArray(items, 50)
  const results = new Map<string, SkillFullData>()

  for (const chunk of chunks) {
    const query = buildFullBatchQuery(chunk)

    try {
      const response = await fetch(GITHUB_GRAPHQL_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error("GraphQL error:", response.status, error)
        continue
      }

      const data = await response.json()

      if (data.errors) {
        console.error("GraphQL errors:", data.errors)
      }

      for (let i = 0; i < chunk.length; i++) {
        const key = `repo${i}`
        const repoData = data.data?.[key]
        const { owner, repo, path } = chunk[i]
        const skillId = `${owner}/${repo}/${path}`

        if (repoData) {
          const blob = repoData.object
          const fileCommittedAt =
            repoData.defaultBranchRef?.target?.history?.edges?.[0]?.node?.committedDate ?? null
          results.set(skillId, {
            owner,
            repo,
            path,
            stars: repoData.stargazerCount ?? 0,
            forks: repoData.forkCount ?? 0,
            pushedAt: repoData.pushedAt,
            language: repoData.primaryLanguage?.name ?? null,
            topics: repoData.repositoryTopics?.nodes?.map((n: { topic: { name: string } }) => n.topic.name) ?? [],
            isArchived: repoData.isArchived ?? false,
            avatarUrl: repoData.owner?.avatarUrl ?? "",
            licenseKey: repoData.licenseInfo?.key ?? null,
            content: blob && "text" in blob ? blob.text : null,
            sha: blob ? blob.oid : null,
            fileCommittedAt,
          })
        }
      }

      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await sleep(100)
      }
    } catch (error) {
      console.error("Failed to fetch skills batch:", error)
    }
  }

  return results
}

function buildBatchQuery(repos: Array<{ owner: string; repo: string }>): string {
  const repoQueries = repos
    .map(
      ({ owner, repo }, i) => `
    repo${i}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(repo)}) {
      stargazerCount
      forkCount
      pushedAt
      isArchived
      primaryLanguage { name }
      licenseInfo { key }
      owner { avatarUrl }
      repositoryTopics(first: 20) {
        nodes { topic { name } }
      }
    }
  `
    )
    .join("\n")

  return `query { ${repoQueries} }`
}

function buildFullBatchQuery(items: Array<{ owner: string; repo: string; path: string }>): string {
  const repoQueries = items
    .map(
      ({ owner, repo, path }, i) => `
    repo${i}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(repo)}) {
      stargazerCount
      forkCount
      pushedAt
      isArchived
      primaryLanguage { name }
      licenseInfo { key }
      owner { avatarUrl }
      repositoryTopics(first: 20) {
        nodes { topic { name } }
      }
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 1, path: ${JSON.stringify(path)}) {
              edges { node { committedDate } }
            }
          }
        }
      }
      object(expression: ${JSON.stringify(`HEAD:${path}`)}) {
        ... on Blob {
          text
          oid
        }
      }
    }
  `
    )
    .join("\n")

  return `query { ${repoQueries} }`
}

// Search with date-based pagination to bypass 1000 results limit
export async function shardedCodeSearch(
  baseQuery: string,
  startDate?: Date,
  endDate?: Date
): Promise<Array<{ owner: string; repo: string; path: string; sha: string }>> {
  const allResults: Array<{ owner: string; repo: string; path: string; sha: string }> = []
  const seen = new Set<string>()

  // Default: search from 2 years ago to now
  const start = startDate ?? (() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 2)
    return d
  })()
  const end = endDate ?? new Date()

  const currentDate = new Date(start)

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const nextDate = new Date(currentDate)
    nextDate.setDate(nextDate.getDate() + 1)
    const nextDateStr = nextDate.toISOString().split('T')[0]

    const query = `${baseQuery} pushed:${dateStr}..${nextDateStr}`
    let page = 1
    const perPage = 100

    while (page <= 10) {
      try {
        const response = await fetch(
          `https://api.github.com/search/code?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
          {
            headers: getRestHeaders(),
          }
        )

        if (!response.ok) {
          if (response.status === 403) {
            // Rate limited - wait and retry
            const resetTime = response.headers.get("x-ratelimit-reset")
            if (resetTime) {
              const waitMs = Math.max(0, parseInt(resetTime) * 1000 - Date.now() + 1000)
              console.log(`Rate limited, waiting ${waitMs}ms`)
              await sleep(Math.min(waitMs, 60000))
              continue
            }
          }
          break
        }

        const data = await response.json()

        for (const item of data.items ?? []) {
          const [owner, repo] = item.repository.full_name.split("/")
          const key = `${owner}/${repo}/${item.path}`

          if (!seen.has(key)) {
            seen.add(key)
            allResults.push({
              owner,
              repo,
              path: item.path,
              sha: item.sha,
            })
          }
        }

        if ((data.items?.length ?? 0) < perPage) {
          break
        }

        page++
        await sleep(2000) // Search API rate limit: 30 req/min
      } catch (error) {
        console.error(`Search error for date ${dateStr}:`, error)
        break
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return allResults
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Discover all SKILL.md files in a repo (searches in skills/ directory)
 * Legacy function - use discoverAllSkillFilesInRepo for full repo search
 */
export async function discoverSkillFiles(owner: string, repo: string): Promise<string[]> {
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: "HEAD:skills") {
          ... on Tree {
            entries {
              name
              type
              object {
                ... on Tree {
                  entries {
                    name
                    type
                    path
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ 
        query, 
        variables: { owner, repo } 
      }),
    })

    if (!response.ok) {
      console.error("GraphQL error:", response.status, await response.text())
      return []
    }

    const data = await response.json()

    if (data.errors) {
      console.error("GraphQL errors:", data.errors)
      return []
    }

    const skillPaths: string[] = []
    const skillsTree = data.data?.repository?.object

    if (!skillsTree?.entries) {
      return []
    }

    for (const entry of skillsTree.entries) {
      if (entry.type === "tree" && entry.object?.entries) {
        for (const subEntry of entry.object.entries) {
          if (subEntry.name === "SKILL.md" && subEntry.type === "blob") {
            skillPaths.push(subEntry.path)
          }
        }
      }
    }

    return skillPaths
  } catch (error) {
    console.error("Failed to discover skill files:", error)
    return []
  }
}

/**
 * Recursively find all SKILL.md files in a GitHub repository
 * This searches the entire repo tree, not just skills/ folder
 */
export async function discoverAllSkillFilesInRepo(
  owner: string, 
  repo: string
): Promise<string[]> {
  // First, get the default branch
  const branchQuery = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        defaultBranchRef {
          name
          target {
            ... on Commit {
              tree {
                oid
              }
            }
          }
        }
      }
    }
  `

  try {
    const branchResponse = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ 
        query: branchQuery, 
        variables: { owner, repo } 
      }),
    })

    if (!branchResponse.ok) {
      console.error("GraphQL error:", branchResponse.status, await branchResponse.text())
      return []
    }

    const branchData = await branchResponse.json()
    if (branchData.errors) {
      console.error("GraphQL errors:", branchData.errors)
      return []
    }

    const treeOid = branchData.data?.repository?.defaultBranchRef?.target?.tree?.oid
    if (!treeOid) {
      console.error("Could not get tree OID for repo")
      return []
    }

    // Use REST API to get full tree recursively (more efficient for large repos)
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeOid}?recursive=1`,
      {
        headers: getRestHeaders(),
      }
    )

    if (!treeResponse.ok) {
      console.error("REST API error:", treeResponse.status, await treeResponse.text())
      return []
    }

    const treeData = await treeResponse.json()
    
    // Filter for SKILL.md files
    const skillPaths: string[] = []
    for (const item of treeData.tree ?? []) {
      if (item.type === "blob" && item.path?.endsWith("SKILL.md")) {
        skillPaths.push(item.path)
      }
    }

    return skillPaths
  } catch (error) {
    console.error("Failed to discover all skill files:", error)
    return []
  }
}
