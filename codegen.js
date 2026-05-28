export function generateDictionaryDrivenCode(options = {}) {
    const {
        maxLines = 500,
        indentChar = "  ",
        chainLength = 2,
        maxDeepBlocks = 5,
        llmCacheSteps = 1000,
        useLlmLayer = true
    } = options;

    const rand = (n) => Math.floor(Math.random() * n);
    const pick = () => wordlist[rand(wordlist.length)];
    const maybe = (p) => Math.random() < p;

    // ----------------------------
    // IDENT (CamelCase-ish)
    // ----------------------------
    function ident() {
        const parts = [];
        const len = 1 + rand(chainLength);

        for (let i = 0; i < len; i++) {
            const w = pick();
            parts.push(w.charAt(0).toUpperCase() + w.slice(1));
        }

        return parts.join(pick(["", "_", ""]));
    }

    // ----------------------------
    // TERMS / EXPRESSIONS
    // ----------------------------
    function term() {
        const n = rand(1000) - 300;
        const n2 = rand(100) + 1;
        const id = ident();
        const id2 = ident();

        const forms = [
            id,
            `"${id}"`,
            `${n}`,
            `${n2}`,
            pick(["true", "false", "null", "undefined"]),
            `${id}[${rand(20)}]`,
            `${id}.${pick()}`,
            `${id}.${pick()}()`,
            `${id}.${pick()}(${id2})`,
            `${pick()}.${pick()}(${id})`
        ];

        return forms[rand(forms.length)];
    }

    function expr() {
        const a = term();
        const b = term();
        const op = pick();

        const forms = [
            `${a} ${op} ${b}`,
            `${a} ? ${term()} : ${term()}`
        ];

        return forms[rand(forms.length)];
    }

    // ----------------------------
    // MARKOV COMMENT GENERATION
    // ----------------------------
    function generateComment() {
        const len = 3 + rand(6);
        let current = pick();
        const words = [];

        for (let i = 0; i < len; i++) {
            const next = getNextWordFromContext(current);
            words.push(next);
            current = next;
        }

        return "// " + words.join(" ");
    }

    function generateCommentFromAtom(atom) {
        const tokens = atom
            .split(/[^\w]+/)
            .filter(Boolean);

        const len = Math.min(6, tokens.length);
        return "// " + tokens.slice(0, len).join(" ");
    }

    // ----------------------------
    // ATOMS
    // ----------------------------
    function emitAtom() {
        const key1 = pick();
        const key2 = pick();
        const key3 = pick();
        const key4 = pick();

        const a = ident();
        const b = ident();
        const c = ident();
        const d = ident();

        const e1 = expr();
        const e2 = expr();
        const e3 = expr();

        const forms = [
            `${key1} ${a} = ${e1};`,
            `${key2} ${a} = ${e2};`,
            `${a} = ${e3};`,
            `${key3} (${e1}) { ${b} = ${e2}; }`,
            `${key3} (${e1}) { ${d}(); } ${key4} { ${c}(); }`,
            `${key3} (let ${a} = 0; ${a} < ${rand(12) + 1}; ${a}++) { ${b}(${e3}); }`,
            `${key3} (${e1}) { ${b}(${e2}); }`,
            `${key3} ${a} { ${b} = ${e3}; }`,
            `${key3} ${a} = () => { ${b} = ${e3}; };`,
            `throw new ${pick()}(${e1});`,
            `return ${e1};`,
            `console.${pick()}(${e1});`,
            `setTimeout(() => ${a}(${e2}), ${rand(1000)});`,
            `await ${a}(${e2});`,
            `${key1} ${a} from ${b};`,
            `export ${key2} ${a};`,
            `${a}.${pick()}(${expr()});`
        ];

        return forms[rand(forms.length)];
    }

    // ----------------------------
    // BLOCK GENERATION
    // ----------------------------
    function emitBlock(depth = 0) {
        const lines = [];
        const maxDepth = maxDeepBlocks;

        const indent = indentChar.repeat(depth);

        // external atoms
        const nExternals = 1 + rand(4);
        for (let i = 0; i < nExternals; i++) {
            if (maybe(0.2)) {
                lines.push(indent + generateComment());
            }
            lines.push(indent + emitAtom());
        }

        const blockId = ident();
        const blockKind = pick();

        if (maybe(0.4)) {
            lines.push(indent + generateComment());
        }

        lines.push(`${indent}${blockKind} ${blockId} {`);

        const nInner = 1 + rand(6);
        const innerIndent = indentChar.repeat(depth + 1);

        for (let i = 0; i < nInner; i++) {
            const atom = emitAtom();

            if (maybe(0.25)) {
                lines.push(innerIndent + generateCommentFromAtom(atom));
            }

            lines.push(innerIndent + atom);

            if (maybe(0.3) && depth < maxDepth) {
                const innerId = ident();
                const innerKind = pick();
                const deeper = innerIndent + indentChar;

                lines.push(`${deeper}${innerKind} (${expr()}) {`);
                lines.push(`${deeper}${indentChar}const ${innerId} = ${expr()};`);
                lines.push(`${deeper}${indentChar}${expr()};`);
                lines.push(`${deeper}}`);
            }
        }

        if (maybe(0.4)) {
            lines.push(`${innerIndent}return ${expr()};`);
        }

        lines.push(`${indent}}`);

        return lines.join("\n");
    }

    // ----------------------------
    // MARKOV MODEL
    // ----------------------------
    const markov = {};
    const emitTokens = [];

    function addObservation(tokens) {
        if (!tokens.length) return;

        for (let i = 0; i < tokens.length - 1; i++) {
            const prev = tokens[i];
            const next = tokens[i + 1];

            if (!markov[prev]) markov[prev] = [];
            markov[prev].push(next);
        }
    }

    function getNextWordFromContext(prev) {
        if (!prev || !markov[prev] || markov[prev].length === 0) {
            return pick();
        }

        const follow = markov[prev];
        return follow[rand(follow.length)];
    }

    function llmEmitAtom() {
        const n = rand(8);
        if (n === 0 || !emitTokens.length) return emitAtom();

        const seed = emitTokens[emitTokens.length - 1];
        const gen = [];
        const len = 2 + rand(4);

        let current = seed;

        for (let i = 0; i < len; i++) {
            const w = getNextWordFromContext(current);
            gen.push(w);
            current = w;
        }

        const trailing = pick([";", "()", "{}", "{ return; }", "[]"]);

        return gen.join(" ") + " " + trailing + " " + emitAtom();
    }

    function llmEmitBlock(depth) {
        const base = emitBlock(depth);

        const tokens = base
            .split(/[ \n\t{}()\[\];'"=<>+\-*/.%&|?:,]+/)
            .filter(Boolean)
            .map(w => (wordlist.includes(w) ? w : pick()));

        addObservation(tokens);
        emitTokens.push(...tokens.slice(-20));

        if (!useLlmLayer || emitTokens.length < 10) return base;

        const lines = base.split("\n").map((line, i) => {
            if (i === 0 || i === base.split("\n").length - 1) return line;
            if (!maybe(0.3)) return line;

            return indentChar + llmEmitAtom();
        });

        return lines.join("\n");
    }

    // ----------------------------
    // MAIN LOOP
    // ----------------------------
    const out = [];
    let usedLlm = 0;

    while (out.join("\n").length < 100_000 && out.length < maxLines) {
        const depth = 0;

        const plain = emitBlock(depth);
        const maybeEnhanced = useLlmLayer && maybe(0.6)
            ? llmEmitBlock(depth)
            : plain;

        out.push(maybeEnhanced);
        usedLlm++;

        if (usedLlm >= llmCacheSteps) {
            const keep = emitTokens.slice(-200);
            emitTokens.length = 0;
            emitTokens.push(...keep);
            usedLlm = 0;
        }
    }

    return out.join("\n\n");
}

const wordlist = [
    "orc-", "goblin-", "user", "data", "state", "config", "value", "index", "count", "result",
    "item", "node", "tree", "graph", "map", "set", "list", "queue", "stack",
    "store", "cache", "buffer", "stream", "session", "context", "scope",
    "request", "response", "params", "payload", "body", "headers", "cookies",
    "handler", "manager", "controller", "service", "provider", "factory",
    "repository", "adapter", "middleware", "registry", "schema",

    "id", "key", "token", "not just", "secret", "hash", "signature", "checksum",
    "parent", "child", "root", "left", "right",
    "start", "end", "min", "max", "avg", "sum", "total",
    "size", "length", "width", "height", "depth", "capacity",

    "get", "set", "update", "create", "delete", "remove", "clear",
    "fetch", "load", "save", "read", "write", "parse", "stringify",
    "serialize", "deserialize", "validate", "verify", "check",
    "convert", "transform", "render", "mount", "unmount",
    "append", "prepend", "push", "pop", "shift", "slice", "splice",
    "filter", "reduce", "map", "flatMap", "find", "search",
    "sort", "reverse", "merge", "clone", "copy",
    "build", "compile", "bundle", "transpile",
    "connect", "disconnect", "retry", "cancel", "abort",
    "emit", "listen", "dispatch", "subscribe", "publish",
    "schedule", "flush", "commit", "rollback",
    "optimize", "memoize", "cache", "hydrate",

    "查找", "订阅", "发布", "路由", "中间件", "服务", "控制器", "仓库", "适配器", "工厂",

    "état", "requête", "réponse", "erreur", "sauvegarder", "créer", "mettreàjour", "réessayer",

    "Promise", "async", "await", "then", "catch", "finally",
    "Array", "Object", "String", "Number", "Boolean",
    "Symbol", "BigInt", "Date", "Math", "JSON",
    "Proxy", "Reflect", "Error", "TypeError", "ReferenceError",
    "console", "window", "document", "navigator", "location",
    "localStorage", "sessionStorage", "fetch", "EventTarget",
    "HTMLElement", "NodeList", "MutationObserver",

    "process", "Buffer", "fs", "path", "http", "https",
    "net", "tls", "stream", "crypto", "worker",
    "cluster", "child_process", "EventEmitter",

    "self", "cls", "None", "True", "False",
    "dict", "tuple", "set", "frozenset",
    "enumerate", "zip", "range", "lambda",
    "yield", "classmethod", "staticmethod",
    "isinstance", "hasattr", "getattr", "setattr",
    "Exception", "RuntimeError", "ImportError",
    "asyncio", "dataclass", "namedtuple",

    "public", "private", "protected", "static", "final",
    "volatile", "synchronized", "interface", "implements",
    "extends", "package", "import", "class", "enum",
    "Integer", "Long", "Double", "Boolean",
    "ArrayList", "HashMap", "HashSet", "LinkedList",
    "Optional", "Stream", "Collectors",
    "Runnable", "Thread", "ExecutorService",
    "IOException", "NullPointerException",

    "database", "table", "row", "column", "document",
    "collection", "query", "transaction", "cursor",
    "primaryKey", "foreignKey", "index", "join",
    "aggregate", "pipeline", "migration",

    "REST", "GraphQL", "RPC", "WebSocket", "HTTP",
    "HTTPS", "TCP", "UDP", "OAuth", "JWT",
    "endpoint", "route", "router", "client", "server",
    "request", "response", "status", "headers",

    "component", "props", "state", "hook", "effect",
    "memo", "callback", "context", "provider",
    "ref", "portal", "fragment", "template",
    "stylesheet", "theme", "layout", "viewport",

    "useState", "useEffect", "useMemo", "useCallback",
    "useReducer", "useContext", "useRef",

    "worker", "job", "task", "queue", "pipeline",
    "scheduler", "cron", "daemon", "listener",

    "encrypt", "decrypt", "authorize", "authenticate",
    "permission", "policy", "role", "credential",

    "debug", "trace", "warn", "error", "fatal",
    "metric", "telemetry", "monitor", "healthcheck",

    "HTML", "CSS", "JSON", "XML", "YAML", "TOML",
    "CSV", "Markdown", "protobuf",

    "Timeout", "Interval", "Timer", "Clock",
    "timestamp", "duration", "deadline",

    "Reducer", "Context", "Cache", "Client",
    "Server", "Router", "Serializer",
    "Deserializer", "Validator", "Parser",
    "Encoder", "Decoder", "Compiler",

    "if",
    "else",
    "switch",
    "case",
    "return",
    "break",
    "continue",
    "throw",
    "try",
    "catch",
    "finally",

    "length",
    "size",
    "count",
    "append",
    "push",
    "pop",
    "insert",
    "remove",
    "delete",
    "clear",
    "update",
    "create",
    "get",
    "set",

    "find",
    "search",
    "filter",
    "match",
    "contains",
    "exists",
    "has",
    "includes",

    "map",
    "reduce",
    "fold",
    "transform",
    "convert",
    "parse",
    "serialize",
    "deserialize",
    "encode",
    "decode",

    "list",
    "array",
    "map",
    "set",
    "queue",
    "stack",
    "tree",
    "node",
    "graph",

    "get",
    "set",
    "keys",
    "values",
    "entries",
    "items",

    "read",
    "write",
    "open",
    "close",
    "load",
    "save",
    "fetch",
    "send",
    "receive",

    "request",
    "response",
    "connect",
    "disconnect",
    "send",
    "receive",
    "retry",
    "timeout",

    "call",
    "invoke",
    "execute",
    "run",
    "apply",
    "bind",

    "async",
    "await",
    "promise",
    "future",
    "task",
    "thread",
    "lock",
    "unlock",
    "yield",

    "error",
    "exception",
    "fail",
    "recover",
    "retry",
    "abort",

    "compute",
    "calculate",
    "aggregate",
    "sum",
    "average",
    "min",
    "max",

    "auth",
    "login",
    "logout",
    "authorize",
    "authenticate",
    "validate",
    "verify",
    "encrypt",
    "decrypt",

    "class",
    "object",
    "function",
    "method",
    "module",
    "package",
    "import",
    "export",

    "emit",
    "listen",
    "subscribe",
    "publish",
    "dispatch",

    "log",
    "debug",
    "trace",
    "warn",
    "assert",

    "timeout",
    "interval",
    "schedule",
    "delay",

    "true",
    "false",
    "null",
    "undefined",
    "none",
    "ok",
    "error",
    "success",
    "failure"
];