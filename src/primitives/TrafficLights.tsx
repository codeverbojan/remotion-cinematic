import React from "react";
import { C } from "../tokens";

interface TrafficLightsProps {
  size?: number;
  gap?: number;
}

export const TrafficLights: React.FC<TrafficLightsProps> = ({
  size = 12,
  gap = 8,
}) => {
  const dots = [C.trafficRed, C.trafficYellow, C.trafficGreen];
  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {dots.map((color) => (
        <div
          key={color}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
};
