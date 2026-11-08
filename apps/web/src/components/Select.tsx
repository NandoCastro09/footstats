import type { ReactNode, Ref, SelectHTMLAttributes } from "react";
import Field, { type FieldProps } from "./Field";
import { cn } from "../lib/cn";
import { fieldBase, fieldState } from "./styles";

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "required">,
    FieldProps {
  ref?: Ref<HTMLSelectElement>;
  children: ReactNode;
}

export default function Select({
  label,
  error,
  hint,
  required,
  id,
  className,
  ref,
  children,
  ...props
}: SelectProps) {
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={className}>
      {(control) => (
        <select
          ref={ref}
          {...control}
          {...props}
          className={cn(fieldBase, fieldState(Boolean(error)), "pr-8")}
        >
          {children}
        </select>
      )}
    </Field>
  );
}
