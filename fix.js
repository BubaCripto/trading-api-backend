const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src'); // ajuste se seu código estiver em outro lugar

function fixRequirePaths(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  const requireRegex = /require\(['"](\.\.\/.*?\/)([a-z0-9_]+)(\.js)?['"]\)/gi;

  code = code.replace(requireRegex, (match, folderPath, filename, ext) => {
    const absDir = path.resolve(path.dirname(filePath), folderPath);
    if (!fs.existsSync(absDir)) return match;

    const realFile = fs.readdirSync(absDir).find(f =>
      f.toLowerCase() === `${filename.toLowerCase()}.js`
    );

    if (realFile && realFile !== `${filename}.js`) {
      changed = true;
      return `require('${folderPath}${realFile.replace('.js', '')}')`;
    }

    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, code, 'utf-8');
    console.log(`Corrigido: ${filePath}`);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.js')) {
      fixRequirePaths(fullPath);
    }
  });
}

walk(baseDir);