import { addParameters, configure } from "@storybook/react";

function loadStories() {
  // automatically import all files ending in *.stories.js
  const req = require.context("../src", true, /.stor(y|ies).(jsx?|tsx?)$/);
  req.keys().forEach(filename => req(filename));
}

addParameters({
  options: {
    name: "cryptuff/bitbobs",
  },
});

configure(loadStories, module);
