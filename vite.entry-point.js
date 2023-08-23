import pc from 'picocolors';
import fs from 'fs';
import fg from "fast-glob";

const log = (msg) => console.error(`${pc.cyan('[entry-point]')} ${pc.green(msg)}`);
const getFileContent = function (file, silence = false) {
    try {
        return fs.readFileSync(`./${file}`);
    } catch (e) {
        if (!silence) throw new Error('Не смогли открыть файл: ' + file);
    }
};
const writeFileContent = function (file, replaced, silence = false) {
    try {
        fs.writeFileSync(`./${file}`, (replaced ?? ''), {});
    } catch (e) {
        if (!silence) throw new Error('Не смогли записать файл: ' + file);
    }
}

const entryPoint = ({pattern = '', mode = 'local', prefix = true}) => ({
    name: 'replace-entry-point',
    closeBundle: () => {
        let files;
        if (pattern.includes('*')) files = fg.sync([`dist/${pattern}`]);
        else files = [`dist/${pattern}`]

        for (const file of files) {
            let replaced = (getFileContent(file, mode === 'local')?.toString())

            // Удаление комментариев
            replaced = replaced
                .replace(/([^:])\/\/.*?((\n)|(\r)|(\n\r)|(\r\n))/ig, '$1')
                .replace(/(\/\*.*?\*\/)/g, '');

            // Добавление дат сборки
            replaced = replaced
                .replace(/\{build_date}/g, (new Date()).toString())
                .replace(/\{build_timestamp}/g, Date.now().toString())

            replaced = replaced
                .replace(/console\.(warn|log|error|info)/g, 'console.debug');

            if (!replaced.startsWith('define')) {
                //replaced = replaced.replace(/([\w\W]*?)(\s*?)(define\(\[.*],function\(.*?\)\s*?\{)/, "$3$2$1");
                replaced = replaced.replace(/([\w\W]*?)(\s*?)(define\(\[.*\],[\s]*function\(.*?\)\s*?\{)/, "$3$2$1");
                //replaced = replaced.replace(/([\w\W]*)([\s]*)(define\(\[.*\],[\s]*function\(.*\)[\s]*\{)/, "$3$2$1");
                //replaced = replaced.replace(/([\w\W]*)([\s]*)(define\(\[.*\],[\s]*function\(.*\)[\s]*\{[\s]*)/, "$3$2$1");
                //console.debug(replaced.match(/([\w\W]*)([\s]*)(define\(\[.*\],[\s]*function\(.*\)[\s]*\{)/));
            }

            log(`Добавили техническую информацию и очистили файл: ${file}`);
            writeFileContent(file, (prefix ? `/**
*
*   For all questions on development or support, you can contact our technical department
*   Build date: ${(new Date()).toString()}. Mode: ${mode}
*
*/
` : '') + replaced, mode === 'local');
        }
    },
});

export {entryPoint as default};