import { getCurrentWindow } from "@tauri-apps/api/window";
import type { MouseEvent } from "react";

type Direction =
  | "North"
  | "South"
  | "East"
  | "West"
  | "NorthEast"
  | "NorthWest"
  | "SouthEast"
  | "SouthWest";

function handle(dir: Direction) {
  return async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await getCurrentWindow().startResizeDragging(dir);
  };
}

const edge =
  "absolute z-50";

export function ResizeHandles() {
  return (
    <>
      <div
        onMouseDown={handle("North")}
        className={`${edge} top-0 left-2 right-2 h-1 cursor-n-resize`}
      />
      <div
        onMouseDown={handle("South")}
        className={`${edge} bottom-0 left-2 right-2 h-1 cursor-s-resize`}
      />
      <div
        onMouseDown={handle("West")}
        className={`${edge} left-0 top-2 bottom-2 w-1 cursor-w-resize`}
      />
      <div
        onMouseDown={handle("East")}
        className={`${edge} right-0 top-2 bottom-2 w-1 cursor-e-resize`}
      />
      <div
        onMouseDown={handle("NorthWest")}
        className={`${edge} top-0 left-0 h-2 w-2 cursor-nw-resize`}
      />
      <div
        onMouseDown={handle("NorthEast")}
        className={`${edge} top-0 right-0 h-2 w-2 cursor-ne-resize`}
      />
      <div
        onMouseDown={handle("SouthWest")}
        className={`${edge} bottom-0 left-0 h-2 w-2 cursor-sw-resize`}
      />
      <div
        onMouseDown={handle("SouthEast")}
        className={`${edge} bottom-0 right-0 h-3 w-3 cursor-se-resize`}
      />
    </>
  );
}
