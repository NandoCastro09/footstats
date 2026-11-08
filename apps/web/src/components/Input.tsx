import type { InputHTMLAttributes, Ref } from "react";
import Field, { type FieldProps } from "./Field";
import { cn } from "../lib/cn";
import { fieldBase, fieldState } from "./styles";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "required">,
    FieldProps {
  ref?: Ref<HTMLInputElement>;
}

export default function Input({
  label,
  error,
  hint,
  required,
  id,
  className,
  ref,
  ...props
}: InputProps) {
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={className}>
      {(control) => (
        <input
          ref={ref}
          {...control}
          {...props}
          className={cn(fieldBase, fieldState(Boolean(error)))}
        />
      )}
    </Field>
  );
}
