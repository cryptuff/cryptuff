import { Core } from "@cryptuff/core";
import { stories } from "@helpers/storybook";
import { action } from "@storybook/addon-actions";
import { number } from "@storybook/addon-knobs";
import React from "react";

import Button from "./Button";

stories("Button (custom)")
  .add("with text", () => {
    const width = number("Width", 120, {
      min: 120,
      max: 300,
      range: true,
      step: 1
    });
    return <Button style={{ width }} onClick={action("clicked")}>{Core}</Button>
  });
