import express from 'express'
import cors from 'cors'
import { generateDictionaryDrivenCode } from './codegen.js'
import { renderPage, seedUrls } from './maze.js'

const app = express()

app.use(cors({
    origin: true,
    methods: ['POST', 'GET', 'OPTIONS'],
    credentials: true
}))

app.use(express.json())

function log(req, label) {
    const ua = req.get('user-agent') || 'N/A'
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'N/A'
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${label} | ${req.originalUrl} | IP: ${ip} | UA: ${ua}`)
}

app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(
        `User-agent: *\nAllow: /\n\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml\n`
    )
})

app.get('/sitemap.xml', (req, res) => {
    log(req, 'SITEMAP')
    const base = `${req.protocol}://${req.get('host')}`
    const urls = seedUrls(50)
        .map((u) => `  <url><loc>${base}${u}</loc></url>`)
        .join('\n')
    res
        .type('application/xml')
        .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
})

app.post('/api/content', (req, res) => {
    log(req, 'API')
    const content = generateDictionaryDrivenCode({ maxLines: 100, indentChar: '  ', useLlmLayer: true })
    res.json({ content })
})

app.get('/{*splat}', (req, res) => {
    if (req.path === '/favicon.ico' || req.path === '/favicon.svg') {
        return res.status(404).end()
    }

    log(req, 'PAGE')

    const content = generateDictionaryDrivenCode({ maxLines: 100, indentChar: '  ', useLlmLayer: true })
    const html = renderPage(req.path, content)

    res
        .status(200)
        .type('text/html')
        .set('Cache-Control', 'public, max-age=3600')
        .send(html)
})

const PORT = process.env.PORT || 6565

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Running on 0.0.0.0:${PORT}`)
})
