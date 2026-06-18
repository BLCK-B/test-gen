import { createHash } from 'node:crypto'

export const URL_WORDLIST = [
    "how", "what", "why", "which", "can", "do", "create", "setup",
    "configure", "install", "build", "run", "deploy", "debug", "fix", "test", "write", "use",
    "learn", "example", "tutorial", "guide", "reference", "best", "practice", "practices",
    "quick", "beginner", "step", "steps", "cheat", "sheet",
    "introduction", "getting", "started", "overview", "deep", "dive",
    "advanced", "using", "from", "scratch", "migration",
    "upgrade", "breaking", "changes", "architecture", "patterns",
    "javascript", "typescript", "python", "go", "rust", "java", "kotlin", "csharp", "cpp",
    "php", "ruby", "dart", "scala", "node", "nodejs", "deno", "jvm", "dotnet",
    "react", "vue", "vuejs", "angular", "svelte", "nextjs", "nuxt", "sveltekit",
    "express", "fastapi", "flask", "django", "rails", "laravel", "spring", "springboot",
    "graphql", "rest", "postgresql", "mysql", "redis", "mongodb", "sqlite",
    "docker", "kubernetes", "aws", "gcp", "azure", "ci", "cd", "github", "gitlab",
    "api", "auth", "authentication", "cache", "caching", "cli", "cloud", "config",
    "database", "db", "deployment", "devops", "docs", "documentation", "endpoint",
    "error", "errors", "exception", "exceptions", "feature", "frontend", "git", "graph",
    "handler", "hook", "hooks", "index", "lambda", "lambdas", "lint", "linter",
    "middleware", "model", "models", "plugin", "plugins", "proxy", "proxies",
    "queue", "refactoring", "route", "routing", "schema", "service",
    "session", "state", "store", "stores", "streams", "tests", "testing", "tokens", "ui",
    "v1.2", "v1.3", "v1.5", "v2.0", "v2.3", "v3.0",
    "beta", "alpha", "rc", "stable", "nightly", "latest",

    "compare", "vs", "alternative", "alternatives", "vs-code", "explained",
    "complete", "ultimate", "simple", "modern", "minimal", "production", "real-world",
    "common", "mistakes", "pitfalls", "gotchas", "tips", "tricks", "faq", "troubleshooting",
    "checklist", "roadmap", "glossary", "snippet", "snippets", "recipe", "recipes",

    "swift", "objectivec", "elixir", "erlang", "haskell", "clojure", "ocaml", "fsharp",
    "perl", "lua", "groovy", "bash", "powershell", "zig", "nim", "crystal", "julia", "r",
    "solidity", "wasm", "webassembly", "assembly",

    "solid", "remix", "astro", "qwik", "preact", "lit", "ember", "backbone", "jquery",
    "tailwind", "bootstrap", "sass", "less", "webpack", "vite", "rollup", "esbuild",
    "babel", "eslint", "prettier", "jest", "vitest", "playwright", "cypress", "mocha",
    "storybook", "turborepo", "nx", "pnpm", "yarn", "npm",

    "nestjs", "koa", "hapi", "gin", "echo", "fiber", "actix", "axum", "rocket",
    "phoenix", "symfony", "fastify", "tornado", "sanic", "starlette",

    "kafka", "rabbitmq", "elasticsearch", "cassandra", "dynamodb", "cockroachdb",
    "clickhouse", "neo4j", "influxdb", "memcached", "etcd", "couchdb", "mariadb",
    "prisma", "sequelize", "typeorm", "mongoose", "drizzle", "sqlalchemy", "alembic",

    "terraform", "ansible", "pulumi", "helm", "vagrant", "podman", "containerd",
    "jenkins", "circleci", "travis", "argocd", "prometheus", "grafana", "datadog",
    "sentry", "kibana", "logstash", "vault", "consul", "nginx", "apache", "traefik",
    "cloudflare", "vercel", "netlify", "heroku", "digitalocean", "lambda-edge",
    "s3", "ec2", "rds", "eks", "ecs", "fargate", "cloudfront", "route53",

    "jwt", "oauth2", "openid", "saml", "rbac", "cors", "csrf", "xss", "tls", "ssl",
    "encryption", "hashing", "bcrypt", "argon2", "rate-limiting", "throttling",

    "websocket", "websockets", "grpc", "webhook", "webhooks", "sse", "polling",
    "pagination", "filtering", "sorting", "validation", "serialization",
    "migrations", "seeding", "transactions", "indexing", "sharding", "replication",
    "partitioning", "normalization", "denormalization", "backup", "restore",

    "async", "await", "promises", "concurrency", "parallelism", "threading",
    "coroutines", "generators", "iterators", "closures", "decorators", "mixins",
    "interfaces", "generics", "enums", "traits", "macros", "reflection",
    "dependency-injection", "inversion-of-control", "memoization", "currying",

    "monorepo", "microservices", "monolith", "serverless", "event-driven",
    "cqrs", "ddd", "tdd", "bdd", "solid-principles", "design-patterns",
    "clean-architecture", "hexagonal", "observability", "tracing", "logging",
    "metrics", "monitoring", "alerting", "scaling", "load-balancing", "failover",

    "performance", "optimization", "benchmark", "benchmarks", "profiling",
    "memory-leak", "garbage-collection", "lazy-loading", "code-splitting",
    "tree-shaking", "minification", "compression", "bundling", "hot-reload",

    "ssr", "ssg", "isr", "hydration", "spa", "pwa", "seo", "accessibility", "a11y",
    "responsive", "dark-mode", "i18n", "l10n", "localization", "internationalization",

    "supervised", "unsupervised", "reinforcement", "neural-network", "transformer",
    "embedding", "embeddings", "vector", "llm", "rag", "fine-tuning", "prompt",
    "inference", "tokenizer", "pipeline", "dataset", "training", "gradient",
    "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", "numpy", "jupyter",
]


function seedFromString(s) {
    return createHash('sha256').update(s).digest().readUInt32LE(0) || 1
}

function mulberry32(seed) {
    let a = seed >>> 0
    return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]

// Crawlers send mangled URLs (truncated %-escapes, stray %, bad UTF-8). A raw
// decodeURIComponent throws URIError on those; fall back to the undecoded slug
// so the maze still renders a 200 instead of bubbling up as an error.
function safeDecode(s) {
    try {
        return decodeURIComponent(s)
    } catch {
        return s
    }
}

function makeSlug(rng) {
    const n = 3 + Math.floor(rng() * 5)
    const parts = []
    for (let i = 0; i < n; i++) parts.push(pick(rng, URL_WORDLIST))
    return parts.join('-')
}

// "related" links: variations of the current slug. "deeper" links: fresh paths
// spiralling further into the maze. Both derived from the path seed.
export function linksFor(pathname) {
    const slug = safeDecode(pathname.replace(/^\/+/, ''))
    const rng = mulberry32(seedFromString(pathname))

    const related = new Set()
    while (related.size < 10) {
        related.add('/' + (slug ? slug + '-' : '') + pick(rng, URL_WORDLIST))
    }

    const deeper = []
    for (let i = 0; i < 20; i++) {
        const extra = Math.floor(rng() * 10) === 0 ? '-' + Math.floor(rng() * 100) : ''
        deeper.push('/' + makeSlug(rng) + extra)
    }

    return { slug, related: [...related], deeper }
}

// A batch of stable seed URLs for the sitemap (entry points into the maze).
export function seedUrls(count = 50) {
    const rng = mulberry32(seedFromString('sitemap-seed'))
    const urls = []
    for (let i = 0; i < count; i++) urls.push('/' + makeSlug(rng))
    return urls
}

// --- HTML rendering ---------------------------------------------------------
const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const linkList = (arr) =>
    arr.map((h) => `<li><a href="${esc(h)}">${esc(h)}</a></li>`).join('\n        ')

// Full, self-contained HTML document. No <script>, no stylesheet fetch — it
// renders identically with JS disabled. One inline <style> keeps it presentable
// without a second request.
export function renderPage(pathname, content) {
    const { slug, related, deeper } = linksFor(pathname)
    const heading = slug || 'Reference data'

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(heading)}</title>
<style>
  body { font-family: system-ui, sans-serif; line-height: 1.5; color: #222; }
  .content-page { max-width: 800px; margin: 0 auto; padding: 1rem; }
  .lorem { white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: .9rem; }
  section { margin-top: 2rem; }
  nav ul { list-style: none; padding-left: 0; }
  nav li { margin-bottom: .4rem; }
  a { text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<article class="content-page">
  <header><h1>${esc(heading)}</h1></header>

  <section class="main-content">
    <p class="lorem" data-content-type="text">${esc(content)}</p>
  </section>

  <section class="related-pages">
    <h2 id="related">Related pages</h2>
    <nav aria-labelledby="related">
      <ul>
        ${linkList(related)}
      </ul>
    </nav>
  </section>

  <section class="sources">
    <h2 id="sources">Sources</h2>
    <nav aria-labelledby="sources">
      <ul>
        ${linkList(deeper)}
      </ul>
    </nav>
  </section>
</article>
</body>
</html>`
}
