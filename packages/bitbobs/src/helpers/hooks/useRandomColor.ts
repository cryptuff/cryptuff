import { useState } from "react";

export const useRandomColor = (
  colors: string[],
  initialColor: string
): [string, () => void] => {
  const [color, setColor] = useState(initialColor);

  const changeColor = () => {
    const availableColors = colors.filter(c => c != color);
    const index = Math.floor(Math.random() * availableColors.length);

    const pickedColor = availableColors[index];
    setColor(pickedColor);
  };
  return [color, changeColor];
};
