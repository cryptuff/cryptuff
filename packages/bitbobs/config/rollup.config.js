const path = require("path");

// Rollup Plugins
import resolvePlugin from "rollup-plugin-node-resolve";
import commonjsPlugin from "rollup-plugin-commonjs";
import aliasPlugin from "rollup-plugin-alias";
import babelPlugin from "rollup-plugin-babel";
import postcssPlugin from "rollup-plugin-postcss";
import urlPlugin from "rollup-plugin-url";
import jsonPlugin from "rollup-plugin-json";
import clearPlugin from "rollup-plugin-clear";
// Local
const paths = require("./paths");
const alias = require("./alias");
const getBabelConfig = require("./babel-config");
const postcssPlugins = require("./postcss-plugins");
const pkg = require("../package.json");

export default {
  input: paths.entryFile,
  output: [
    {
      dir: paths.distFolder,
      format: "cjs",
      sourcemap: true,
      exports: "named",
      entryFileNames: "cjs/[name].js"
    },
    {
      dir: paths.distFolder,
      format: "es",
      sourcemap: true,
      entryFileNames: "es/[name].js"
    }
  ],
  plugins: [
    resolvePlugin({
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json", "css", ".scss"],
      customResolveOptions: {
        paths: paths.srcFolder
      }
    }),
    aliasPlugin({
      resolve: [
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        "/index.js",
        "/index.jsx",
        "/index.ts",
        "/index.tsx"
      ],
      ...alias
    }),
    postcssPlugin({
      modules: {
        camelCase: true,
        generateScopedName: "[name]_[local]__[hash:base64:5]"
      },
      use: [
        [
          "sass",
          {
            includePaths: [paths.srcFolder]
          }
        ]
      ],
      extract: path.resolve(paths.distFolder, "css/style.css"),
      plugins: postcssPlugins
    }),
    commonjsPlugin(),
    jsonPlugin(),
    urlPlugin({
      limit: false,
      emitFiles: false
    }),
    babelPlugin({
      extensions: ["js", "jsx", "ts", "tsx"],
      babelrc: false,
      ...getBabelConfig()
    }),
    clearPlugin({
      targets: [paths.distFolder],
      watch: true
    })
  ],
  external: ["styled-components", ...Object.keys(pkg.peerDependencies)]
};
