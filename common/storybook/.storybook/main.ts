/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { resolve } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import type { StorybookConfig } from '@storybook/react-webpack5';
import type { StoriesEntry } from '@storybook/types';

import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const tsconfigPathsPlugin = new TsconfigPathsPlugin({
    configFile: resolve(__dirname, '../tsconfig.storybook.json'),
    extensions: ['.ts', '.tsx', '.js'],
});

const config: StorybookConfig = {
    stories: async (): Promise<StoriesEntry[]> => {
        const rootPaths = ['../../../packages'];
        const isSubmodules = __dirname.includes('submodules');
        if (isSubmodules) {
            rootPaths.push('../../../../../packages');
        }

        const stories: StoriesEntry[] = [];
        rootPaths.forEach((rootPath) => {
            const rootDir = resolve(__dirname, rootPath);
            if (existsSync(rootDir)) {
                readdirSync(rootDir).forEach((pkg) => {
                    const pkgDir = resolve(rootDir, pkg, 'package.json');
                    if (existsSync(pkgDir)) {
                        stories.push({
                            directory: `${rootPath}/${pkg}/src`,
                            files: '**/*.stories.@(js|jsx|mjs|ts|tsx)',
                            titlePrefix: pkg,
                        });
                    }
                });
            }
        });

        return stories;
    },
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@chromatic-com/storybook',
        '@storybook/addon-interactions',
        '@storybook/addon-webpack5-compiler-swc',
        {
            name: '@storybook/addon-styling-webpack',
            options: {
                rules: [
                    {
                        test: /\.(less|css)$/i,
                        use: [
                            'style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    modules: {
                                        exportLocalsConvention: 'camelCaseOnly',
                                        localIdentName: 'univer-[local]',
                                    },
                                },
                            },
                            {
                                loader: 'less-loader',
                                options: { implementation: require.resolve('less') },
                            },
                        ],
                    },
                ],
            },
        },
    ],
    framework: {
        name: '@storybook/react-webpack5',
        options: {
            // builder: {
            //     useSWC: false,
            // },
        },
    },
    swc: () => {
        return {
            isModule: true,
            module: {
                type: 'es6',
                noInterop: true,
            },
            jsc: {
                target: 'es2022',
                parser: {
                    syntax: 'typescript',
                    tsx: true,
                    decorators: true,
                    decoratorsBeforeExport: true,
                    dynamicImport: true,
                },
                transform: {
                    legacyDecorator: true,
                    decoratorMetadata: true,
                },
                loose: true,
            },
        };
    },
    docs: {
        autodocs: 'tag',
        defaultName: 'documentatie',
    },
    async webpackFinal(config) {
        if (config.resolve) {
            config.resolve.plugins = [tsconfigPathsPlugin];
        }

        return config;
    },
};

export default config;
