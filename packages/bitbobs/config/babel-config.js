module.exports = ({ isStorybook = true } = {}) => ({
  presets: [
    ["@babel/preset-env", { useBuiltIns: "entry" }],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-syntax-dynamic-import",
    isStorybook && "babel-plugin-typescript-to-proptypes",
    isStorybook && "add-react-displayname"
  ].filter(Boolean)
});
