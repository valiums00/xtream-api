import { replaceInFile } from 'replace-in-file';

const serializers = ['jsonapi', 'camelcase', 'standardized'];
for (const module of serializers) {
  await replaceInFile({
    files: `./dist/${module}.cjs`,
    from: 'require("camelcase-keys"),',
    to: 'require("camelcase-keys").default,',
  });
}
