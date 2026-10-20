import { createServer as httpServer } from 'node:http'
import { createServer as smtpServer } from 'node:net'
const messages = { email: [], telegram: [] }
smtpServer((socket) => {
  socket.write('220 notification-fixture ESMTP\r\n')
  let buffer = '',
    data = false,
    mail = ''
  socket.on('data', (chunk) => {
    buffer += chunk.toString()
    while (buffer.includes('\r\n')) {
      const end = buffer.indexOf('\r\n'),
        line = buffer.slice(0, end)
      buffer = buffer.slice(end + 2)
      if (data) {
        if (line === '.') {
          messages.email.push(mail)
          mail = ''
          data = false
          socket.write('250 Accepted\r\n')
        } else mail += line + '\n'
      } else if (line.startsWith('EHLO') || line.startsWith('HELO'))
        socket.write('250 notification-fixture\r\n')
      else if (line === 'DATA') {
        data = true
        socket.write('354 End with dot\r\n')
      } else if (line === 'QUIT') socket.end('221 Bye\r\n')
      else socket.write('250 OK\r\n')
    }
  })
}).listen(2525, '0.0.0.0')
httpServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  if (req.url === '/messages') {
    res.end(JSON.stringify(messages))
    return
  }
  let body = ''
  for await (const chunk of req) body += chunk
  messages.telegram.push(body)
  res.end(
    JSON.stringify({
      ok: true,
      result: {
        message_id: messages.telegram.length,
        date: Math.floor(Date.now() / 1000),
        chat: { id: 1, type: 'private' },
        text: 'accepted',
      },
    }),
  )
}).listen(8080, '0.0.0.0')
