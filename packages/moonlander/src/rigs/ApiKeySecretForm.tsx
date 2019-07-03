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
      <label>Key
        <input type="text" value={key} onChange={ev => setKey(ev.target.value)} />
      </label>
        
      <label>Secret
        <input type="password" value={secret} onChange={ev => setSecret(ev.target.value)} />
      </label>
      <button onClick={() => onSubmit(key, secret)}>Set</button>
    </div>
  );
};
