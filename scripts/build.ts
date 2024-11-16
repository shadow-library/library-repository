/**
 * Importing npm packages
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const rootDir = path.join(import.meta.dirname, '..');
const distDir = path.join(rootDir, 'dist');

const formatTime = (time: number) => (time < 1000 ? `${time.toFixed(0)}ms` : `${(time / 1000).toFixed(3)}s`);
const success = (message: string) => console.log('\x1b[32m%s\x1b[0m', message); // eslint-disable-line no-console
const error = (message: string) => (console.error('\x1b[31m%s\x1b[0m', message), process.exit(1)); // eslint-disable-line no-console

/** cleaning the previous build */
if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true });
fs.mkdirSync(distDir);

const startTime = process.hrtime();
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJsonString = fs.readFileSync(packageJsonPath, 'utf-8');
const packageJson = JSON.parse(packageJsonString);

/** modifying package.json and saving to 'dist' */
const distPackageJson = structuredClone(packageJson);
distPackageJson.main = 'index.js';
delete distPackageJson.private;
delete distPackageJson.scripts;
delete distPackageJson.devDependencies;

const distPackageJsonString = JSON.stringify(distPackageJson, null, 2);
fs.writeFileSync(`${distDir}/package.json`, distPackageJsonString);

/** Copy supporting files into 'dist' */
fs.copyFileSync(`${rootDir}/README.md`, `${distDir}/README.md`);
fs.copyFileSync(`${rootDir}/LICENSE`, `${distDir}/LICENSE`);

/** Building typescript files */
const tsc = ['tsc', '--outDir', distDir, '--project', 'tsconfig.build.json'];
const tscAlias = ['tsc-alias', '--outDir', distDir, '--project', 'tsconfig.build.json'];
let result = spawnSync('bunx', tsc, { cwd: rootDir, stdio: 'inherit' });
if (result.status === 0) result = spawnSync('bunx', tscAlias, { cwd: rootDir, stdio: 'inherit' });
if (result.status !== 0) error('Build failed');

/** Removing temporary files */
const tsbuildinfo = path.join(distDir, 'tsconfig.build.tsbuildinfo');
if (fs.existsSync(tsbuildinfo)) fs.rmSync(tsbuildinfo);

const endTime = process.hrtime(startTime);
const timeTaken = endTime[0] * 1e3 + endTime[1] * 1e-6;
success(`Built successfull in ${formatTime(timeTaken)}`);
