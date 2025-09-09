const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Optivoo Store - Coming Soon</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 3em; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        p { font-size: 1.2em; line-height: 1.6; margin-bottom: 15px; }
        .status { font-size: 0.9em; margin-top: 30px; opacity: 0.8; }
        .check { color: #4CAF50; font-weight: bold; }
        .progress { color: #FF9800; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏪 Optivoo Store</h1>
        <p>Modern E-commerce Platform</p>
        <p>Powered by Medusa v2.10.1</p>
        
        <div class="status">
            <p>🌐 Domain: store.optivoo.com <span class="check">✓</span></p>
            <p>🔒 SSL Certificate: <span class="check">✓ Working</span></p>
            <p>🌍 DNS Resolution: <span class="check">✓ Working</span></p>
            <p>🐳 Docker Infrastructure: <span class="check">✓ Ready</span></p>
            <p>🔄 Load Balancer: <span class="check">✓ Traefik</span></p>
            <p>⚙️ Application: <span class="progress">🔧 Configuring...</span></p>
        </div>
        
        <p style="margin-top: 40px; font-size: 0.9em;">
            Deployment in progress. Please check back soon!
        </p>
    </div>
</body>
</html>
  `);
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Temporary server running on port 3000');
  console.log('Domain: https://store.optivoo.com');
  console.log('Infrastructure: Ready ✓');
});
