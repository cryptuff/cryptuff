import React from "react";
import styled from "styled-components";

import {Core} from "core";

type Props = {
  big: boolean;
  label?: string;
  onClick(): void;
  style?: {};
  theme: string;
};

const StyledButton = styled.button`
  height: ${(props: Props) => (props.big ? 46 : 36)}px;
  outline: none;
  padding: 0 20px;
  border-radius: 4px;

  &.primary {
    background-color: #1585d8;
    & span {
      color: white;
    }
  }

  &.secondary {
    background-color: #eff3f6;
    & span {
      color: grey;
    }
  }
`;

const Button = (props: Props) => (
  <StyledButton
    big={props.big}
    className={props.theme}
    onClick={props.onClick}
    style={props.style}
  >
    {props.label && <span>{props.label}</span>}
    {Core}
  </StyledButton>
);

Button.defaultProps = {
  big: false,
  label: undefined,
  onClick: () => {},
  style: {},
  theme: "primary"
};

export default Button;
