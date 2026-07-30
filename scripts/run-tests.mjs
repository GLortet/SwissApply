import { readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

async function discover(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? discover(target) : Promise.resolve(entry.name.endsWith(".test.js") ? [target] : []);
  }));
  return nested.flat();
}
const tests = (await discover(path.resolve("dist"))).sort();
if (!tests.length) throw new Error("Aucun test compilé trouvé dans dist.");
const child = spawn(process.execPath, ["--test", ...tests], { stdio: "inherit", shell: false });
child.once("error", (error) => { throw error; });
child.once("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 1)));
