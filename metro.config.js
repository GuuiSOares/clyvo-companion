const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const normalized = moduleName.replace(/\/+$/, '');

  if (normalized === 'util') {
    return {
      filePath: path.join(__dirname, 'node_modules', 'util', 'util.js'),
      type: 'sourceFile',
    };
  }

  const insideUtil = context.originModulePath.includes(
    `${path.sep}node_modules${path.sep}util${path.sep}`
  );

  if (insideUtil && moduleName.startsWith('.')) {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: false },
      moduleName,
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
