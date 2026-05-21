import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EditableText } from "../components/EditableText";
import { TitleBar } from "../components/TitleBar";
import {
  createArea,
  deleteArea,
  listAreas,
  recolourArea,
  renameArea,
} from "../lib/queries";
import { formatDuration } from "../lib/format";
import { PROJECT_COLOURS, type AreaWithTotal } from "../lib/types";
import { useApp } from "../store";

export function Areas() {
  const [areas, setAreas] = useState<AreaWithTotal[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [colour, setColour] = useState<string>(PROJECT_COLOURS[0]);
  const goHome = useApp((s) => s.goHome);

  const refresh = async () => setAreas(await listAreas());

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createArea(trimmed, colour);
    setName("");
    setColour(PROJECT_COLOURS[0]);
    setShowNew(false);
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this area? Projects will keep their data but become unassigned."))
      return;
    await deleteArea(id);
    refresh();
  };

  return (
    <div className="flex h-full flex-col">
      <TitleBar onBack={goHome} />

      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
            Areas
          </div>
          <div className="text-base font-semibold text-text">
            {areas.length === 0
              ? "No areas yet"
              : `${areas.length} area${areas.length === 1 ? "" : "s"}`}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-medium text-white hover:bg-accent-hover"
        >
          <span className="text-base leading-none">+</span> New
        </button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/40"
          >
            <div className="space-y-3 px-4 py-3">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Area name (e.g. Work, Study, Personal)"
                className="w-full rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none"
              />
              <div className="flex items-center gap-2">
                {PROJECT_COLOURS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColour(c)}
                    className={`h-5 w-5 rounded-full transition-transform ${
                      colour === c ? "scale-110 ring-2 ring-white/40" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Pick colour ${c}`}
                  />
                ))}
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="rounded-md px-3 py-1.5 text-xs text-text-muted hover:bg-bg-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto">
        {areas.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="text-sm text-text-muted">
              Areas group related projects (Work, Study, Personal…). Create one
              to organise.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {areas.map((a) => (
              <motion.li
                layout
                key={a.id}
                className="group flex items-center gap-3 px-4 py-3 hover:bg-bg-hover"
              >
                <ColourSwatch
                  colour={a.colour}
                  onChange={async (next) => {
                    await recolourArea(a.id, next);
                    refresh();
                  }}
                />
                <div className="flex-1 overflow-hidden">
                  <EditableText
                    value={a.name}
                    onSave={async (next) => {
                      await renameArea(a.id, next);
                      refresh();
                    }}
                    className="truncate text-sm font-medium text-text"
                    inputClassName="w-full rounded-md border border-accent/40 bg-bg-elevated px-2 py-0.5 text-sm font-medium text-text outline-none focus:border-accent"
                    ariaLabel="Edit area name"
                  />
                  <div className="text-xs text-text-dim">
                    {a.project_count} project{a.project_count === 1 ? "" : "s"}
                    {" · "}
                    {formatDuration(a.total_seconds)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-dim opacity-0 transition-opacity hover:bg-bg hover:text-danger group-hover:opacity-100"
                  aria-label="Delete area"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ColourSwatch({
  colour,
  onChange,
}: {
  colour: string;
  onChange: (next: string) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-4 w-4 shrink-0 rounded-full ring-1 ring-border hover:ring-2 hover:ring-accent/60"
        style={{ backgroundColor: colour }}
        aria-label="Change colour"
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute left-0 top-6 z-30 flex gap-1 rounded-md border border-border bg-bg-elevated p-1.5 shadow-lg"
          >
            {PROJECT_COLOURS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={async () => {
                  await onChange(c);
                  setOpen(false);
                }}
                className={`h-4 w-4 rounded-full transition-transform hover:scale-110 ${
                  colour === c ? "ring-2 ring-white/60" : ""
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Pick ${c}`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
