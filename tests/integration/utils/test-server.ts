import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

let server: any
let app: any

export async function setupTestServer() {
  // Skip if we're in mock mode
  if (process.env.USE_MOCK_SERVER === 'true') {
    return
  }

  const dev = false
  app = next({ dev, dir: process.cwd() })
  const handle = app.getRequestHandler()

  await app.prepare()

  server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address()
      process.env.TEST_SERVER_PORT = String(address.port)
      resolve()
    })
  })

  return server
}

export async function teardownTestServer() {
  if (server) {
    await new Promise((resolve) => server.close(resolve))
  }
  if (app) {
    await app.close()
  }
}

export function getTestServerUrl(path: string = '') {
  const port = process.env.TEST_SERVER_PORT || '3000'
  return `http://localhost:${port}${path}`
}