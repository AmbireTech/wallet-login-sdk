const http = require('http')
const fs = require('fs')

const host = '127.0.0.1'
const port = '8000'

const requestListener = (req, res) => {
    switch (req.url) {
        case '/':
            fs.readFile('index.html',function (err, data){
                res.writeHead(200, {'Content-Type': 'text/html'})
                res.write(data)
                res.end()
            })
            break
        case '/client-script.js':
            fs.readFile('client-script.js',function (err, data){
                res.writeHead(200, {'Content-Type': 'text/javascript'})
                res.write(data)
                res.end()
            })
            break
        case '/sdk.js':
            fs.readFile('../packages/browser/dist/ambire-login-sdk-browser-bundle.js',function (err, data){
                res.writeHead(200, {'Content-Type': 'text/javascript'})
                res.write(data)
                res.end()
            })
            break
        default:
            res.writeHead(404)
            res.end(JSON.stringify({error: "Resource not found"}))
    }
}

const server = http.createServer(requestListener)

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
})
