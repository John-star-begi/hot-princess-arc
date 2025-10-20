import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

export default withPWA({
  dest: 'public',
  disable: !isProd,
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/]
})({
  reactStrictMode: true,
  compiler: { removeConsole: isProd },
  experimental: { typedRoutes: true }
});
