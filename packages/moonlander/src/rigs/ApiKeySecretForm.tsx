import React, { useState } from "react";
import styled from "styled-components";

interface Props {
  onSubmit: (key: string, secret: string) => void;
}

export const ApiKeySecretForm: React.FC<Props> = ({ onSubmit }) => {
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");

  return (
    <div>
      <Label>Key
        <input type="text" value={key} onChange={ev => setKey(ev.target.value)} />
      </Label>
        
      <Label>Secret
        <input type="password" value={secret} onChange={ev => setSecret(ev.target.value)} />
      </Label>
      <button onClick={() => onSubmit(key, secret)}>Set</button>
    </div>
  );
};

const Label = styled.label`
  display: block;
`;