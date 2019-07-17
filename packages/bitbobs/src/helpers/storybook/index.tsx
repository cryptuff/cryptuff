import { withKnobs } from "@storybook/addon-knobs";
import { storiesOf as origStoriesOf, Story, StoryDecorator } from "@storybook/react";
import React from "react";
import styled from "styled-components/macro";

export const stories = (name: string): Story =>
  origStoriesOf(name, module)
    .addDecorator(withStyles)
    .addDecorator(withKnobs);

const withStyles: StoryDecorator = storyFn => (
  <StoryContainer>
    <div style={{color: "lightgray", margin: "10px", padding: "5px", border: "1px dashed lightgrey"}}>TODO: global styles here</div>
    {storyFn()}
  </StoryContainer>
);

const StoryContainer = styled.div`
  /* height: 100vh;
  max-width: 100vw; */
`;
