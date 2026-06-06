import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const codingProjectsRoot = path.resolve(projectRoot, "..");

const dashboards = [
  {
    name: "Astrology Sessions",
    source: path.join(codingProjectsRoot, "Astrology Sessions", "reports", "project_dashboard.html"),
    target: path.join(projectRoot, "public", "dashboards", "astrology-sessions", "index.html")
  },
  {
    name: "BaZiLogicEngine",
    source: path.join(codingProjectsRoot, "BaZiLogicEngine", "reports", "bazi_engine_project_dashboard.html"),
    target: path.join(projectRoot, "public", "dashboards", "bazi-logic-engine", "index.html")
  },
  {
    name: "Murmura",
    source: path.join(codingProjectsRoot, "Murmura", "reports", "project_dashboard.html"),
    target: path.join(projectRoot, "public", "dashboards", "murmura", "index.html")
  },
  {
    name: "SoundScribe",
    source: path.join(codingProjectsRoot, "Soundscribe", "reports", "project_dashboard.html"),
    target: path.join(projectRoot, "public", "dashboards", "soundscribe", "index.html")
  }
];

for (const dashboard of dashboards) {
  await stat(dashboard.source);
  await mkdir(path.dirname(dashboard.target), { recursive: true });
  await copyFile(dashboard.source, dashboard.target);
  console.log(`Synced ${dashboard.name}`);
}
