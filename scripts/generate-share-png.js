const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const shareDir = path.join(projectRoot, 'images', 'share');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tarot-share-'));

function main() {
  const svgFiles = fs.readdirSync(shareDir).filter((file) => file.endsWith('.svg'));

  svgFiles.forEach((file) => {
    const sourcePath = path.join(shareDir, file);
    execFileSync('qlmanage', ['-t', '-s', '1200', '-o', tempDir, sourcePath], {
      stdio: 'ignore'
    });

    const generatedName = `${file}.png`;
    const generatedPath = path.join(tempDir, generatedName);
    const targetPath = path.join(shareDir, `${path.basename(file, '.svg')}.png`);

    if (!fs.existsSync(generatedPath)) {
      throw new Error(`PNG 생성 실패: ${generatedName}`);
    }

    fs.copyFileSync(generatedPath, targetPath);
  });

  console.log(`Generated ${svgFiles.length} PNG share images in ${shareDir}`);
}

main();
