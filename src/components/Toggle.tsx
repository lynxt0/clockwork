import { motion } from "framer-motion";

type Props = {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export function Toggle({ on, onClick, disabled, ariaLabel }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      aria-label={ariaLabel ?? "Toggle timer"}
      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
        on
          ? "border-running/40 bg-running/20"
          : "border-border-strong bg-bg-hover"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <motion.span
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 700, damping: 32 }}
        className={`h-5 w-5 rounded-full shadow ${
          on ? "bg-running" : "bg-text-dim"
        }`}
      />
    </button>
  );
}
