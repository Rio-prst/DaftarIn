import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./theme.css";
import App from "./App.tsx";
import { prepareCleanLocalDemo } from "./utils/demoBootstrap";

async function start() {
  try {
    await prepareCleanLocalDemo();
    createRoot(document.getElementById("root")!).render(
      <StrictMode><App /></StrictMode>,
    );
  } catch (error) {
    const container = document.getElementById("root")!;
    const panel = document.createElement("main");
    panel.className = "page-width py-12";
    const title = document.createElement("h1");
    title.textContent = "Selesaikan reset demo";
    const message = document.createElement("p");
    message.className = "my-5";
    message.textContent = error instanceof Error ? error.message : "Reset belum selesai. Muat ulang untuk mencoba lagi.";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "button-primary";
    retry.textContent = "Muat ulang";
    retry.onclick = () => window.location.reload();
    panel.append(title, message, retry);
    container.replaceChildren(panel);
  }
}
void start();
