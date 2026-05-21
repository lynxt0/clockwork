import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ResizeHandles } from "./components/ResizeHandles";
import { Areas } from "./screens/Areas";
import { Home } from "./screens/Home";
import { ProjectDetail } from "./screens/ProjectDetail";
import { Stats } from "./screens/Stats";
import { TaskDetail } from "./screens/TaskDetail";
import { useApp } from "./store";

function App() {
  const screen = useApp((s) => s.screen);
  const hydrated = useApp((s) => s.hydrated);
  const hydrate = useApp((s) => s.hydrate);

  useEffect(() => {
    hydrate().catch((err) => console.error("hydrate failed", err));
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-text-dim">
        Loading…
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-bg">
      <AnimatePresence mode="wait">
        <motion.div
          key={
            screen.kind === "home"
              ? "home"
              : screen.kind === "project"
                ? `project-${screen.projectId}`
                : screen.kind === "task"
                  ? `task-${screen.taskId}`
                  : screen.kind
          }
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="h-full"
        >
          {screen.kind === "home" && <Home />}
          {screen.kind === "project" && (
            <ProjectDetail projectId={screen.projectId} />
          )}
          {screen.kind === "task" && (
            <TaskDetail taskId={screen.taskId} projectId={screen.projectId} />
          )}
          {screen.kind === "areas" && <Areas />}
          {screen.kind === "stats" && <Stats />}
        </motion.div>
      </AnimatePresence>
      <ResizeHandles />
    </div>
  );
}

export default App;
