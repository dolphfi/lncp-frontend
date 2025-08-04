const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for node modules
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve?.fallback,
      fs: false,
      path: false,
      crypto: false,
    },
    alias: {
      ...config.resolve?.alias,
      // Fix specific issues with immer module
      'immer': require.resolve('immer'),
    }
  };

  // Fix for ESM modules
  config.module.rules.unshift({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  // Ignore source-map-loader for certain problematic modules
  config.module.rules.forEach(rule => {
    if (rule.use && rule.use.some(use => use.loader && use.loader.includes('source-map-loader'))) {
      rule.exclude = [
        ...(rule.exclude || []),
        /node_modules\/immer/,
      ];
    }
  });

  return config;
};
