import React from "react";
import { cn } from "../../../utils/cn";
import "./Button.css";

export function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled,
  style,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={cn("btn", `btn-${variant}`, `btn-${size}`, className)}
    >
      {children}
    </button>
  );
}

export default Button;
