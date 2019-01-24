const path = require("path");
module.exports = (baseConfig, env, config) => {
  config.module.rules.push(
    {
      test: /\.(ts|tsx)$/,
      loader: require.resolve("babel-loader"),
      options: {
        presets: [["react-app", { flow: false, typescript: true }]]
      }
    },
    // {
    //   test: /\.(ts|tsx)$/,
    //   use: [
    //     { loader: require.resolve("awesome-typescript-loader") },
    //     { loader: require.resolve("react-docgen-typescript-loader") }
    //   ]
    // }
  );
  config.resolve.alias = {
    ...config.resolve.alias,
    "@core": path.resolve(__dirname, "../../", "core"),
    "@helpers": path.resolve(__dirname, "../src", "helpers"),
  };
  config.resolve.extensions.push(".ts", ".tsx");
  return config;
};
