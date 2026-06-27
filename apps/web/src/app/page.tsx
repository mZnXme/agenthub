import Link from 'next/link'

const differentiators = [
  'Browser-first access to OpenCode workflows',
  'Bring your own provider, model, and MCP tools',
  'Per-user runtime isolation with usage guardrails',
  'Skills, files, and sessions in one managed workspace',
]

const comparisons = [
  {
    feature: 'Hosted workspace',
    agenthub: 'Yes',
    claudeDesktop: 'No, desktop-first',
    opencode: 'No, local-first',
    notebooklm: 'No, research-first',
    aiStudio: 'No, playground-first',
    codex: 'Yes, but closed ecosystem',
  },
  {
    feature: 'Bring your own provider',
    agenthub: 'Yes',
    claudeDesktop: 'Partial',
    opencode: 'Yes',
    notebooklm: 'No',
    aiStudio: 'Yes',
    codex: 'Tied to OpenAI account',
  },
  {
    feature: 'Managed MCP runtime',
    agenthub: 'Yes',
    claudeDesktop: 'Local setup focus',
    opencode: 'Yes, local config',
    notebooklm: 'No',
    aiStudio: 'No',
    codex: 'Limited / product-specific',
  },
  {
    feature: 'Skills and runtime controls',
    agenthub: 'Yes',
    claudeDesktop: 'Partial',
    opencode: 'Yes',
    notebooklm: 'No',
    aiStudio: 'No',
    codex: 'Yes',
  },
  {
    feature: 'Session isolation and limits',
    agenthub: 'Yes',
    claudeDesktop: 'No',
    opencode: 'Manual',
    notebooklm: 'No',
    aiStudio: 'No',
    codex: 'Managed by product',
  },
]

const demoSteps = [
  'Sign in with Google and open the workspace in the browser.',
  'Connect a provider, then enable the models you actually want to expose.',
  'Start a session, attach a file, and send a prompt through the managed OpenCode runtime.',
  'Turn on MCP tools and skills when the demo needs more capability.',
]

export default function Home() {
  return (
    <main className="pitch-shell">
      <section className="pitch-hero">
        <div className="pitch-copy stack">
          <p className="eyebrow">AI for developer teams</p>
          <h1 className="page-title">A hosted control plane for OpenCode workflows.</h1>
          <p className="page-copy">
            AgentHub turns local agent tooling into a browser product: one account, one managed provider setup, one
            place for models, MCP servers, skills, files, and isolated sessions.
          </p>
          <div className="cluster pitch-actions">
            <Link className="btn primary" href="/login">Continue with Google</Link>
            <a className="btn ghost" href="#comparison">Compare the stack</a>
            <a className="btn ghost" href="#demo">Demo flow</a>
          </div>
          <div className="metric-strip">
            <span>Browser login</span>
            <span>Per-user OpenCode process</span>
            <span>MCP + skills + files</span>
            <span>Usage guardrails</span>
          </div>
        </div>

        <aside className="panel pad stack pitch-aside">
          <div>
            <p className="eyebrow">Why this wins the pitch</p>
            <h2 className="panel-title">The product is the control layer, not another chat box.</h2>
          </div>
          <div className="stack">
            {differentiators.map((item) => (
              <div key={item} className="row pitch-row">
                <span>{item}</span>
                <span className="pill on">Built in</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="pitch-band">
        <div className="pitch-section-head">
          <p className="eyebrow">positioning</p>
          <h2 className="panel-title">AgentHub sits between local agent tools and hosted AI playgrounds.</h2>
        </div>
        <div className="grid-3">
          <article className="panel pad stack">
            <h3 className="panel-title">Claude Desktop and Claude Code Desktop</h3>
            <p className="panel-copy">
              Strong local workflows and MCP support, but the experience still starts from a desktop app and local setup.
              AgentHub makes that flow account-managed and browser-ready.
            </p>
          </article>
          <article className="panel pad stack">
            <h3 className="panel-title">OpenCode Desktop</h3>
            <p className="panel-copy">
              Open source, flexible, and powerful, but it remains a local tool. AgentHub packages the same mental model
              into a hosted product with per-user isolation and shared governance.
            </p>
          </article>
          <article className="panel pad stack">
            <h3 className="panel-title">NotebookLM and Google AI Studio</h3>
            <p className="panel-copy">
              Great for research or prompt experimentation, but they are not a managed agent runtime. AgentHub is
              built for running AI work, not just exploring it.
            </p>
          </article>
        </div>
      </section>

      <section className="pitch-band" id="comparison">
        <div className="pitch-section-head">
          <p className="eyebrow">feature matrix</p>
          <h2 className="panel-title">What changes when the runtime becomes a product.</h2>
        </div>
        <div className="table-shell">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th>AgentHub</th>
                <th>Claude Desktop</th>
                <th>OpenCode</th>
                <th>NotebookLM</th>
                <th>Google AI Studio</th>
                <th>Codex</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">{row.feature}</th>
                  <td>{row.agenthub}</td>
                  <td>{row.claudeDesktop}</td>
                  <td>{row.opencode}</td>
                  <td>{row.notebooklm}</td>
                  <td>{row.aiStudio}</td>
                  <td>{row.codex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pitch-band" id="demo">
        <div className="pitch-section-head">
          <p className="eyebrow">demo flow</p>
          <h2 className="panel-title">The 60-second path to show on stage.</h2>
        </div>
        <div className="grid-2">
          {demoSteps.map((step, index) => (
            <article key={step} className="panel pad stack">
              <div className="step-index">0{index + 1}</div>
              <p className="panel-copy">{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pitch-footer panel pad stack">
        <p className="eyebrow">pitch line</p>
        <h2 className="panel-title">AgentHub is the browser control plane for OpenCode, built to make agent workflows usable by non-terminal users.</h2>
        <div className="cluster">
          <Link className="btn primary" href="/login">Open the demo</Link>
          <Link className="btn ghost" href="/chat">Go to workspace</Link>
        </div>
      </section>
    </main>
  )
}
