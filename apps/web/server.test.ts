import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import test from "node:test";

const port = 31991;
const origin = `http://127.0.0.1:${port}`;

function startServer(): ChildProcess {
  return spawn(process.execPath, [new URL("./server.js", import.meta.url).pathname], {
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  });
}

async function stopServer(server: ChildProcess): Promise<void> {
  if (server.exitCode !== null) return;
  server.kill("SIGTERM");
  await new Promise<void>((resolve) => server.once("exit", () => resolve()));
}

async function waitUntilReady(): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${origin}/api/facts`);
      if (response.ok) return;
    } catch {
      // Le processus peut ne pas encore avoir ouvert son port.
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Le serveur Mock n'a pas démarré dans le délai imparti.");
}

async function decide(id: string, action: "verify" | "reject") {
  const response = await fetch(`${origin}/api/facts/${id}/decision`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action }),
  });
  assert.equal(response.status, 200);
  return response.json() as Promise<{ status: string }>;
}

test("le parcours Mock valide, refuse puis réinitialise les faits au redémarrage", async () => {
  let server = startServer();
  try {
    await waitUntilReady();

    const home = await fetch(origin);
    assert.equal(home.status, 200);
    const html = await home.text();
    assert.match(html, /<title>SwissApply — Base de vérité<\/title>/);
    assert.match(html, />Valider<\/button>/);
    assert.match(html, />Refuser<\/button>/);

    const initial = await fetch(`${origin}/api/facts`).then((response) => response.json()) as {
      facts: Array<{ id: string; status: string }>;
    };
    assert.equal(initial.facts.length, 3);
    assert.equal(initial.facts.find(({ id }) => id === "fact_mock_003")?.status, "PROPOSED");

    assert.equal((await decide("fact_mock_003", "verify")).status, "VERIFIED");
    assert.equal((await decide("fact_mock_001", "reject")).status, "REJECTED");

    await stopServer(server);
    server = startServer();
    await waitUntilReady();

    const restarted = await fetch(`${origin}/api/facts`).then((response) => response.json()) as {
      facts: Array<{ id: string; status: string }>;
    };
    assert.equal(restarted.facts.find(({ id }) => id === "fact_mock_003")?.status, "PROPOSED");
    assert.equal(restarted.facts.find(({ id }) => id === "fact_mock_001")?.status, "PROPOSED");
  } finally {
    await stopServer(server);
  }
});
