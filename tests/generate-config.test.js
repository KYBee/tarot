const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('generate-config writes APP_CONFIG from environment variables', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tarot-config-test-'));
  const outputPath = path.join(tempDir, 'config.js');
  const scriptPath = path.join(__dirname, '..', 'scripts', 'generate-config.js');

  const result = spawnSync(process.execPath, [scriptPath], {
    env: {
      ...process.env,
      KAKAO_JS_KEY: 'test-kakao-key',
      SHARE_BASE_URL: 'https://tarot-zeta-two.vercel.app/',
      CONFIG_OUTPUT_PATH: outputPath
    },
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(outputPath), true);

  const generated = fs.readFileSync(outputPath, 'utf8');

  assert.match(generated, /window\.APP_CONFIG/);
  assert.match(generated, /test-kakao-key/);
  assert.match(generated, /https:\/\/tarot-zeta-two\.vercel\.app\//);
});
