const net = require('net'),
    http = require('http'),
    URL = require('url');

const parseHTTPRequest = (raw) => {
    const lines = raw.split('\n');
    const [method, url, protocol] = lines[0].split(' ');

    console.log('LINES', lines)

    const parsedURL = URL.parse(url);

    return {
        method,
        protocol: parsedURL.protocol,
        hostname: parsedURL.hostname,
        port: parsedURL.port,
        path: parsedURL.path,
        headers: {}
    };
};

const server = net.createServer((socket) => {
    socket.on('connect', (c) => {

    });

    socket.on('data', (data) => {
        const dataAsString = data.toString();

        try {
            const options = parseHTTPRequest(dataAsString);

            console.log(options)

            const buffer = [];
            const headers = [];
            var contentType = 'text/plain';


            const req = http.request(options, (res) => {
                headers.push(`HTTP/${res.httpVersion} ${res.statusCode}`)

                for (key in res.headers) {
                    if (key === 'transfer-encoding') {
                        continue;
                    }

                    if (key === 'content-type') {
                        contentType = res.headers[key];
                    }

                    const name = key.split('-').map((token) => {
                        return token[0].toUpperCase() + token.substring(1, token.length);
                    }).join('-');

                    headers.push(name + ': ' + res.headers[key]);
                }

                res.on('data', (data) => {
                    buffer.push(data);
                });

                res.on('end', () => {
                    if (contentType =~ /text/ >= 0) {
                        const result = headers.join('\n') + '\n\n' + buffer.map((chunk) => {
                            return chunk.toString();
                        }).join();
                        socket.write(result);
                    } else {
                        socket.write(headers.join('\n') + '\n\n');

                        for (i in buffer) {
                            socket.write(buffer[i]);
                        }
                    }

                    socket.end();
                })
            });

            req.on('error', (err) => {
                console.log(err);
            });

            req.end(() => {});
        } catch (e) {
            console.log(e)
        }
    });

}).on('error', (err) => {
    console.log(err);
});

server.listen({
    port: 9999,
    host: '127.0.0.1',
    exclusive: true
}, () => {
    console.log(`Started `, server.address());
});
