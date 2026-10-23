const appJson = require('./app.json');
const { execSync } = require('child_process');

function readCommitHash() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

module.exports = () => ({
  expo: {
    ...appJson.expo,
    plugins: [...(appJson.expo.plugins ?? []), 'expo-notifications'],
    extra: {
      ...(appJson.expo.extra ?? {}),
      commitHash: readCommitHash(),
    },
  },
});
