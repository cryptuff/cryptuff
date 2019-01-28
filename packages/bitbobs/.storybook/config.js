import { configure, addDecorator } from "@storybook/react";
import { setOptions, withOptions } from "@storybook/addon-options";

addDecorator(
  withOptions({
    name: "cryptuff/bitbobs"
  })
);

// automatically import all files ending in *.stories.js
const req = require.context("../src", true, /.stor(y|ies).(jsx?|tsx?)$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
