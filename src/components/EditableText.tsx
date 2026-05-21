import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onSave: (next: string) => void | Promise<void>;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  ariaLabel?: string;
};

export function EditableText({
  value,
  onSave,
  className,
  inputClassName,
  placeholder,
  ariaLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setDraft(value);
      setEditing(false);
      return;
    }
    await onSave(trimmed);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={
          inputClassName ??
          "w-full rounded-md border border-accent/40 bg-bg-elevated px-2 py-0.5 outline-none focus:border-accent"
        }
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      onDoubleClick={() => setEditing(true)}
      aria-label={ariaLabel ?? "Edit"}
      className={`cursor-text rounded-md text-left hover:bg-bg-hover/60 ${className ?? ""}`}
    >
      {value}
    </button>
  );
}
