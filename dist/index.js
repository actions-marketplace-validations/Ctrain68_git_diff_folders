"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const async_shelljs_1 = require("async-shelljs");
const folderstoCheck = core.getInput("folders");
const isBackend = (n) => !(n.endsWith('portal') || n == 'va-customer');
const compareItems = (a, b) => a.TYPE == b.TYPE && a.IMAGE_NAME == b.IMAGE_NAME;
const run = (folders) => {
    // Changed  
    let changedFiles = (0, async_shelljs_1.exec)('git diff --dirstat=files,0 HEAD~1', {
        silent: true
    }).toString();
    let regexp = new RegExp(`(${folders.join('|')})/([\\w-]+)/`, 'g');
    let matches = [...changedFiles.matchAll(regexp)].map(x => ({
        TYPE: x[1],
        IMAGE_NAME: x[2],
        BACKEND: isBackend(x[2])
    }));
    let changed = matches.filter((v, i, a) => i == a.findIndex(x => compareItems(x, v)));
    // Unchanged  
    let allFolders = [];
    for (let base of folders) {
        let files = fs.readdirSync(base);
        let mapped = files.map(f => ({
            TYPE: base,
            IMAGE_NAME: f,
            BACKEND: isBackend(f)
        }));
        allFolders.push(...mapped);
    }
    let unchanged = allFolders.filter(a => !changed.find(x => compareItems(a, x)));
    console.log([changed, unchanged]);
    return [changed, unchanged];
};
let blah = run([folderstoCheck]);
core.setOutput('folder_output', blah);
// async function run(): Promise<void> {
//   try {
//     const ms: string = core.getInput('milliseconds')
//     core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
//     core.debug(new Date().toTimeString())
//     await wait(parseInt(ms, 10))
//     core.debug(new Date().toTimeString())
//     core.setOutput('time', new Date().toTimeString())
//   } catch (error) {
//     if (error instanceof Error) core.setFailed(error.message)
//   }
// }
// run()
