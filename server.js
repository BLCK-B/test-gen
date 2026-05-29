import express from 'express'
import { generateDictionaryDrivenCode } from './codegen.js'

const app = express()

app.use(express.json())

app.post('/api/content', (req, res) => {
    const { url, userAgent } = req.body ?? {}

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