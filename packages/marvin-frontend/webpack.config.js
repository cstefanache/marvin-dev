const nrwlConfig = require('@nrwl/react/plugins/webpack');

module.exports = (config, context) => {
  nrwlConfig(config);
  config.module.rules.push({
    test: /\.md$/i,
    use: 'raw-loader',
  });
  return config;
};
