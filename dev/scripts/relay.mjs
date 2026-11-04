// Dependency-free WebSocket relay for the test-only PeerJS shim (?mprelay=ws://host:port).
// Protocol: {op:'reg',id} -> {op:'open'} | {op:'err'}; other ops are forwarded with `from` set.
import http from 'http';
import crypto from 'crypto';

const port = +(process.argv[2] || 8931);
const P = new Map();

function send(sock, obj) {
  const payload = Buffer.from(JSON.stringify(obj));
  let hdr;
  if (payload.length < 126) hdr = Buffer.from([0x81, payload.length]);
  else if (payload.length < 65536) {
    hdr = Buffer.alloc(4);
    hdr[0] = 0x81; hdr[1] = 126; hdr.writeUInt16BE(payload.length, 2);
  } else {
    hdr = Buffer.alloc(10);
    hdr[0] = 0x81; hdr[1] = 127; hdr.writeBigUInt64BE(BigInt(payload.length), 2);
  }
  sock.write(Buffer.concat([hdr, payload]));
}

function attach(sock) {
  let buf = Buffer.alloc(0), id = null;
  const take = () => {
    while (buf.length >= 2) {
      const b0 = buf[0], b1 = buf[1], masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      const maskLen = masked ? 4 : 0;
      if (buf.length < off + maskLen + len) return;
      let data = buf.subarray(off + maskLen, off + maskLen + len);
      if (masked) {
        const mask = buf.subarray(off, off + 4);
        data = Buffer.from(data);
        for (let i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
      }
      buf = buf.subarray(off + maskLen + len);
      const op = b0 & 0x0f;
      if (op === 0x8) { sock.end(); return; }
      if (op === 0x9) { const pong = Buffer.from([0x8a, data.length]); sock.write(Buffer.concat([pong, data])); continue; }
      if (op !== 0x1) continue;
      let m; try { m = JSON.parse(data.toString()); } catch (e) { continue; }
      if (m.op === 'reg') {
        if (P.has(m.id)) { send(sock, { op: 'err', type: 'unavailable-id' }); continue; }
        id = m.id; P.set(id, sock); send(sock, { op: 'open' }); continue;
      }
      const t = P.get(m.to);
      if (!t) { if (m.op === 'conn') send(sock, { op: 'err', type: 'peer-unavailable' }); continue; }
      m.from = id; delete m.to; send(t, m);
    }
  };
  sock.on('data', c => { buf = Buffer.concat([buf, c]); take(); });
  sock.on('close', () => {
    if (!id) return;
    P.delete(id);
    for (const o of P.values()) { try { send(o, { op: 'gone', from: id }); } catch (e) {} }
  });
  sock.on('error', () => {});
}

const server = http.createServer((req, res) => { res.writeHead(200); res.end('relay'); });
server.on('upgrade', (req, sock) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) { sock.destroy(); return; }
  const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
  attach(sock);
});
server.listen(port, '127.0.0.1', () => console.log('relay up ' + port));
