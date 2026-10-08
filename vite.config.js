import { defineConfig } from 'vite';

// The Base44 sandbox serves the dev server through a proxy on an external
// hostname, so Vite must accept that host and the proxy's https HMR socket.
// This block only applies when BASE44_PREVIEW_MODE is exactly "1"; anywhere
// else the stock Vite defaults are preserved.
const previewMode = process.env.BASE44_PREVIEW_MODE === '1';
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    ...(previewMode
      ? {
          allowedHosts: sandboxHostDomain ? [`.${sandboxHostDomain}`] : true,
          hmr: { clientPort: 443 },
        }
      : {}),
  },
});
