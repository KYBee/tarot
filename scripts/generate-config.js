const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const outputPath = path.join(projectRoot, 'config.local.js');

function parseEnvFile(source) {
  return source
    .split(/\r?\n/)
    .reduce((result, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        return result;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        return result;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      result[key] = value;
      return result;
    }, {});
}

function buildConfigFile(env) {
  const payload = {
    kakaoJavaScriptKey: env.KAKAO_JAVASCRIPT_KEY || '',
    shareBaseUrl: env.SHARE_BASE_URL || ''
  };

  return `window.APP_CONFIG = Object.assign({}, window.APP_CONFIG || {}, ${JSON.stringify(payload, null, 2)});\n`;
}

function main() {
  if (!fs.existsSync(envPath)) {
    console.error('.env 파일이 없습니다. .env.example을 복사해 값을 채워주세요.');
    process.exitCode = 1;
    return;
  }

  const env = parseEnvFile(fs.readFileSync(envPath, 'utf8'));
  fs.writeFileSync(outputPath, buildConfigFile(env), 'utf8');
  console.log(`Generated ${path.basename(outputPath)} from .env`);
}

main();
