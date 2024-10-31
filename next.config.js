/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

module.exports = nextConfig;

// module.exports = {
//   reactStrictMode: true,
//   webpackDevMiddleware: (config) => {
//     config.watchOptions = {
//       poll: 800,
//       aggregateTimeout: 300,
//     };
//     return config;
//   },
// };
