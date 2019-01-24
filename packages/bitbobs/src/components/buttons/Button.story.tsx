import React from "react";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { Core } from "@core";

import Button from "./Button";

storiesOf("Button (custom)", module)
  .add("with text", () => (
    <Button onClick={action("clicked")}>{Core}</Button>
  ));
