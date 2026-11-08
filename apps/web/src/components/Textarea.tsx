import type { Ref, TextareaHTMLAttributes } from "react";
import Field, { type FieldProps } from "./Field";
import { cn } from "../lib/cn";
import { fieldBase, fieldState } from "./styles";

interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "required">,
    FieldProps {
  ref?: Ref<HTMLTextAreaElement>;
}

export default function Textarea({
  label,
  error,
  hint,
  required,
  id,
  className,
  ref,
  rows = 3,
  ...props
}: TextareaProps) {
  return (
    <Field label={label} error={error} hint={hint} required={required} id={id} className={className}>
      {(control) => (
        <textarea
          ref={ref}
          rows={rows}
          {...control}
          {...props}
          className={cn(fieldBase, fieldState(Boolean(error)), "resize-y py-2")}
        />
      )}
    </Field>
  );
}
