const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_SHARE_BASE_URL = 'https://tarot-zeta-two.vercel.app/';

function getRuntimeConfig(env = process.env) {
  return {
    kakaoJavaScriptKey: String(env.KAKAO_JS_KEY || '').trim(),
    shareBaseUrl: String(env.SHARE_BASE_URL || DEFAULT_SHARE_BASE_URL).trim() || DEFAULT_SHARE_BASE_URL
  };
}

function serializeRuntimeConfig(config) {
  return `window.APP_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
}

function writeRuntimeConfig(outputPath, env = process.env) {
  const config = getRuntimeConfig(env);
  const serialized = serializeRuntimeConfig(config);

  fs.writeFileSync(outputPath, serialized, 'utf8');

  return {
    outputPath,
    config
  };
}

if (require.main === module) {
  const outputPath =
    process.env.CONFIG_OUTPUT_PATH || path.join(__dirname, '..', 'config.js');

  writeRuntimeConfig(outputPath, process.env);
}

module.exports = {
  DEFAULT_SHARE_BASE_URL,
  getRuntimeConfig,
  serializeRuntimeConfig,
  writeRuntimeConfig
};
