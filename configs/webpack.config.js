"use strict";

const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

/** @type WebpackOptions */
const config = {
  stats: {
    warningsFilter: /Critical dependency: the request of a dependency is an expression/
  },
  target: "node",
  entry: "./src/extension.ts",
  output: {
    filename: "extension.js",
    path: path.resolve(__dirname, "../out"),
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "file:///[absolute-resource-path]"
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      deepmerge$: path.resolve(
        __dirname,
        "../node_modules/deepmerge/dist/umd.js"
      )
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "ts-loader"
      }
    ]
  },
  externals: {
    vscode: "commonjs vscode",
    "vscode-fsevents": "commonjs vscode-fsevents",
    "original-fs": "commonjs original-fs"
  },
  plugins: [new CleanWebpackPlugin()]
};

module.exports = config;
