import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  asChild?: boolean;
}

const variants = {
  primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] shadow-sm",
  secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-sm",
  outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-lg gap-2",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  asChild = false,
  ...props
}: ButtonProps) {
  const buttonClass = cn(
    "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: cn(buttonClass, (children as React.ReactElement<{ className?: string }>).props.className),
    });
  }

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
}

export default Button;
