const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      ws: true,
      logLevel: 'debug',
      // When using app.use('/api', ...), Express strips '/api' prefix
      // We need to add it back for the backend
      pathRewrite: {
        '^/': '/api/' // Prepend /api/ to the stripped path
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request:', req.method, req.url);
        // Ensure content-type is set for file uploads
        if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
          proxyReq.setHeader('Content-Type', req.headers['content-type']);
        }
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Proxy error', details: err.message });
        }
      }
    })
  );
};
