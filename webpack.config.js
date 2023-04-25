const webpack = require('@nativescript/webpack');

module.exports = (env) => {
  webpack.init(env);

  // Learn how to customize:
  // https://docs.nativescript.org/webpack

  webpack.chainWebpack((config) => {
    // Polyfills
    config.resolve.set('fallback', {
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      dns: false,
      fs: false,
      http: require.resolve('stream-http'),
      http2: false,
      https: require.resolve('https-browserify'),
      net: false,
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      tls: false,
      url: require.resolve('url/'),
      util: require.resolve('util/'),
      zlib: require.resolve('browserify-zlib'),
    });
  });

  return webpack.resolveConfig();
};
