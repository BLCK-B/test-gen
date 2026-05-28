// server.js
import express from 'express'
import {generateDictionaryDrivenCode} from "./codegen.js";

const app = express()
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

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
})