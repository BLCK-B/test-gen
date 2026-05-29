import express from 'express'
import cors from 'cors'
import { generateDictionaryDrivenCode } from './codegen.js'

const app = express()

// Allow any origin
app.use(cors())

app.use(express.json())

app.post('/api/content', async (req, res) => {
    const { url, userAgent } = req.body ?? {}

    const content = generateDictionaryDrivenCode({
        maxLines: 50,
        indentChar: '  ',
        useLlmLayer: true
    })

    res.json({ content })
})

app.listen(6565, () => {
    console.log('Server running on http://localhost:6565')
})