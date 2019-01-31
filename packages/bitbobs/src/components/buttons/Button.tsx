import React from "react";
import styled from "styled-components";

import { Core, B, C } from "@cryptuff/core";
import { useRandomColor } from "@helpers/hooks";

type Props = {
  big?: boolean;
  label?: string;
  onClick?(): void;
  style?: {};
  theme?: string;
  children?: React.ReactNode;
};

const StyledButton = styled.button`
  height: ${(props: Props) => (props.big ? 46 : 36)}px;
  outline: none;
  padding: 0 20px;
  border-radius: 4px;

  &.primary {
    background-color: ${(props: Props & { bgColor: string }) => props.bgColor};
    & span {
      color: white;
    }
  }
`;

const allColors = ["red", "blue", "green", "gray"];

const Button = (props: Props) => {
  const [color, changeColor] = useRandomColor(allColors, "red");

  return (
    <StyledButton
      big={props.big}
      className={props.theme}
      onClick={() => {
        changeColor();
        props.onClick && props.onClick();
      }}
      bgColor={color}
      style={props.style}
    >
      {props.label && <span>{props.label}</span>}
      {props.children || "no children"}
    </StyledButton>
  );
};

Button.defaultProps = {
  big: false,
  label: undefined,
  //   onClick: () => {},
  style: {},
  theme: "primary"
};

export default Button;
