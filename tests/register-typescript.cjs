const fs = require('node:fs');
const { transformSync } = require('esbuild');
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const { code } = transformSync(fs.readFileSync(filename, 'utf8'), {
      loader: extension === '.tsx' ? 'tsx' : 'ts', format: 'cjs', jsx: 'automatic', target: 'node22',
    });
    module._compile(code, filename);
  };
}
