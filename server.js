import express from 'express'
import { generateDictionaryDrivenCode } from './codegen.js'
import cors from 'cors'

const app = express()

app.use(cors({
    origin: true,
    methods: ['POST', 'GET', 'OPTIONS'],
    credentials: true
}))

app.use(express.json())

app.post('/api/content', (req, res) => {
    const { url, userAgent } = req.body ?? {}
    console.log("request from " + url + " " + userAgent);
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