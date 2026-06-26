import { McpCatalogItem } from './mcp.types'

export const MCP_CATALOG: McpCatalogItem[] = [
  {
    slug: 'context7',
    name: 'Context7 Docs',
    description: 'Version-aware library documentation and examples. Good safe default for coding sessions.',
    category: 'base',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp'],
    source: 'official-plugin',
    risk: 'low',
  },
  {
    slug: 'playwright',
    name: 'Playwright Browser',
    description: 'Browser automation MCP for page inspection, screenshots, clicks, and UI debugging.',
    category: 'development',
    transport: 'stdio',
    command: 'npx',
    args: ['@playwright/mcp@latest'],
    source: 'official-plugin',
    risk: 'medium',
  },
  {
    slug: 'firebase',
    name: 'Firebase Tools',
    description: 'Firebase CLI MCP for Firebase projects. Uses Firebase CLI auth/config on the runtime host.',
    category: 'cloud',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'firebase-tools@latest', 'mcp'],
    source: 'official-plugin',
    risk: 'medium',
  },
  {
    slug: 'figma',
    name: 'Figma Developer MCP',
    description: 'Fetch Figma design context through figma-developer-mcp. Requires a Figma personal access token.',
    category: 'design',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'figma-developer-mcp', '--stdio'],
    env: { FIGMA_API_KEY: '${FIGMA_API_KEY}' },
    secretFields: [
      {
        name: 'FIGMA_API_KEY',
        label: 'Figma API token',
        description: 'Personal access token from Figma settings.',
        required: true,
      },
    ],
    source: 'local',
    risk: 'medium',
  },
  {
    slug: 'github-copilot-mcp',
    name: 'GitHub MCP',
    description: 'Remote GitHub MCP endpoint. Requires a GitHub token injected as an Authorization header.',
    category: 'development',
    transport: 'http',
    url: 'https://api.githubcopilot.com/mcp/',
    headers: { Authorization: 'Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}' },
    secretFields: [
      {
        name: 'GITHUB_PERSONAL_ACCESS_TOKEN',
        label: 'GitHub token',
        description: 'Token used only at runtime to build the MCP Authorization header.',
        required: true,
      },
    ],
    source: 'official-plugin',
    risk: 'medium',
  },
  {
    slug: 'linear',
    name: 'Linear MCP',
    description: 'Remote Linear MCP endpoint for issue/project context.',
    category: 'productivity',
    transport: 'http',
    url: 'https://mcp.linear.app/mcp',
    source: 'official-plugin',
    risk: 'low',
  },
]

export function listMcpCatalog() {
  return MCP_CATALOG.map(({ env, headers, ...item }) => ({
    ...item,
    envKeys: env ? Object.keys(env) : [],
    headerKeys: headers ? Object.keys(headers) : [],
    requiresSecrets: Boolean(item.secretFields?.length),
  }))
}

export function getMcpCatalogItem(slug: string) {
  return MCP_CATALOG.find((item) => item.slug === slug) ?? null
}
