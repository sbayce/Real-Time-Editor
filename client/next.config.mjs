/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: false, // disable SVGO optimizations if necessary
            },
          },
        ],
      });
  
      return config;
    },
  };
  
  export default nextConfig;
  