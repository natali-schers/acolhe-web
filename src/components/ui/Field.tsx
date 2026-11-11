import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./Field.module.css";

interface FieldWrapperProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function FieldWrapper({ label, hint, error, children }: FieldWrapperProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {hint && !error && <small className={styles.hint}>{hint}</small>}
      {error && <small className={styles.error} role="alert">{error}</small>}
    </label>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string; trailing?: ReactNode };

export function TextField({ label, hint, error, trailing, ...input }: TextFieldProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <span className={styles.inputWrap}>
        <input aria-invalid={Boolean(error) || undefined} {...input} />
        {trailing && <span className={styles.trailing}>{trailing}</span>}
      </span>
    </FieldWrapper>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
};

export function SelectField({ label, hint, options, ...select }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} hint={hint}>
      <select {...select}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FieldWrapper>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string };

export function TextAreaField({ label, hint, ...textarea }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label} hint={hint}>
      <textarea {...textarea} />
    </FieldWrapper>
  );
}
