const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Suppress Metro package version mismatch errors
config.resolver.unstable_enablePackageExports = false;
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
