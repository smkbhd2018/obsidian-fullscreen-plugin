import { Plugin } from "obsidian";

export default class DynamicFullscreenPlugin extends Plugin {
  onload() {
    this.addCommand({
      id: "fullscreen-focus",
      name: "Fullscreen focus mode",
      callback: this.fullscreenMode.bind(this),
    });

    this.addCommand({
      id: "toggle-interface",
      name: "Toggle interface visibility",
      callback: this.toggleInterface.bind(this),
    });

    this.addCommand({
      id: "toggle-gutters",
      name: "Toggle line number gutters",
      callback: this.toggleGutters.bind(this),
    });

    this.addCommand({
      id: "toggle-view-header",
      name: "Toggle note header",
      callback: this.toggleViewHeader.bind(this),
    });

    this.addCommand({
      id: "hide-all",
      name: "Hide interface elements",
      callback: this.hideAll.bind(this),
    });

    this.addCommand({
      id: "show-all",
      name: "Show interface elements",
      callback: this.showAll.bind(this),
    });
  }

  onunload() {}

  fullscreenMode() {
    var leaf = this.app.workspace.activeLeaf;
    if (!leaf) return;
    var el = leaf.containerEl;
    var fullscreenMutationObserver;

    el.requestFullscreen();

    // disable mutation observer when exiting fullscreen mode
    el.addEventListener("fullscreenchange", (event) => {
      if (!document.fullscreenElement) {
        fullscreenMutationObserver.disconnect();
        document.body.classList.remove('fullscreen')
      } else {
        document.body.classList.add('fullscreen')
      }
    });

    // copy all nodes
    fullscreenMutationObserver = new MutationObserver((mutationRecords) => {
      mutationRecords.forEach((mutationRecord) => {
        mutationRecord.addedNodes.forEach((node) => {
          document.body.removeChild(node);
          el.appendChild(node);
        });
      });
      // focus on prompt for file open
      if (document.querySelector(".prompt-input"))
        document.querySelector(".prompt-input").focus();
    });

    fullscreenMutationObserver.observe(document.body, { childList: true });
  }

  toggleInterface() {
    const leaf = this.app.workspace.activeLeaf;
    const doc =
      leaf?.view.containerEl.ownerDocument ??
      leaf?.containerEl.ownerDocument ??
      document;
    doc.body.classList.toggle("hide-interface");
  }

  toggleGutters() {
    const leaf = this.app.workspace.activeLeaf;
    const doc =
      leaf?.view.containerEl.ownerDocument ??
      leaf?.containerEl.ownerDocument ??
      document;
    doc.body.classList.toggle("hide-gutters");
  }

  toggleViewHeader() {
    const leaf = this.app.workspace.activeLeaf;
    const doc =
      leaf?.view.containerEl.ownerDocument ??
      leaf?.containerEl.ownerDocument ??
      document;
    doc.body.classList.toggle("hide-view-header");
  }

  hideAll() {
    const leaf = this.app.workspace.activeLeaf;
    const doc =
      leaf?.view.containerEl.ownerDocument ??
      leaf?.containerEl.ownerDocument ??
      document;
    doc.body.classList.add("hide-interface", "hide-gutters", "hide-view-header");
  }

  showAll() {
    const leaf = this.app.workspace.activeLeaf;
    const doc =
      leaf?.view.containerEl.ownerDocument ??
      leaf?.containerEl.ownerDocument ??
      document;
    doc.body.classList.remove(
      "hide-interface",
      "hide-gutters",
      "hide-view-header"
    );
  }
}
