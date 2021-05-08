/* eslint-disable unicorn/no-array-reduce */
import fs from 'fs';
import MemoryFileSystem from 'memory-fs';
import path from 'path';
import pkgDir from 'pkg-dir';
import tempy from 'tempy';
import webpack from 'webpack';
import { gzipSync } from 'zlib';

import { getPackageJson, getPackageModuleContainer } from './utils';

function getEntryPoint(packageInfo: { fileName?: string; name?: string; string?: any }) {
    const temporaryFile = tempy.file({ extension: 'js' });
    fs.writeFileSync(temporaryFile, packageInfo.string, 'utf-8');
    return temporaryFile;
}

export function calcSize(packageInfo: { fileName: string; name: string }, callback: any) {
    const packageRootDirectory = pkgDir.sync(path.dirname(packageInfo.fileName));
    if (packageRootDirectory === undefined) {
        return;
    }

    const entryPoint = getEntryPoint(packageInfo);
    const modulesDirectory = path.join(packageRootDirectory, 'node_modules');
    const peers = getPackageJson(packageInfo).peerDependencies || {};
    const defaultExternals = ['react', 'react-dom'];
    const externals = [...Object.keys(peers), ...defaultExternals].filter((p) => p !== packageInfo.name);
    const compiler = webpack({
        entry: entryPoint,
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new webpack.IgnorePlugin({ resourceRegExp: /^electron$/ })
        ],
        resolve: {
            modules: [modulesDirectory, getPackageModuleContainer(packageInfo), 'node_modules'],
            fallback: {
                fs: false,
                tls: false,
                net: false,
                path: false,
                zlib: false,
                http: false,
                https: false,
                stream: false,
                crypto: false
            }
        },
        module: {
            rules: [
                {
                    test: /\.s?css$/,
                    use: 'css-loader'
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|wav)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        name: '[path][name].[ext]?[hash]',
                        limit: 10000
                    }
                }
            ]
        },
        node: {
            global: true,
            __dirname: true,
            __filename: true
        },
        externals,
        output: {
            filename: 'bundle.js',
            libraryTarget: 'commonjs2'
        }
    });
    const memoryFileSystem = new MemoryFileSystem();
    compiler.outputFileSystem = memoryFileSystem;

    compiler.run((error, stats) => {
        if (stats === undefined) {
            return;
        }
        const statsJson = stats.toJson();
        if (error || (statsJson.errors !== undefined && statsJson.errors.length > 0)) {
            callback({ err: error || statsJson.errors });
        } else {
            if (statsJson.assets === undefined) {
                return;
            }
            const bundles = statsJson.assets.filter((asset) => asset.name.includes('bundle.js'));
            const size = bundles.reduce((sum, package_) => sum + package_.size, 0);
            const gzip = bundles
                .map((bundle) => path.join(process.cwd(), 'dist', bundle.name))
                .map((bundleFile) => gzipSync(memoryFileSystem.readFileSync(bundleFile), {}).length)
                .reduce((sum, gzipSize) => sum + gzipSize, 0);
            callback(undefined, { size, gzip });
        }
    });
}
