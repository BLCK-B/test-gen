import express from 'express'
import { generateDictionaryDrivenCode } from './codegen.js'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const logFilePath = path.join(__dirname, 'requests.log')

// Create log file if it doesn't exist
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '')
}

const app = express()

app.use(cors({
    origin: true,
    methods: ['POST', 'GET', 'OPTIONS'],
    credentials: true
}))

app.use(express.json())

app.post('/api/content', (req, res) => {
    const { url, userAgent } = req.body ?? {}
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] URL: ${url || 'N/A'} | User-Agent: ${userAgent || 'N/A'}\n`

    console.log(logEntry.trim())

    // Append to log file
    fs.appendFileSync(logFilePath, logEntry)

    const content = generateDictionaryDrivenCode({
        maxLines: 50,
        indentChar: '  ',
        useLlmLayer: true
    })

    res.json({ content })
})

const PORT = 6565;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Running on 0.0.0.0:${PORT}`);
});