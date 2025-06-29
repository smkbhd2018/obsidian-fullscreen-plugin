import { Plugin } from "obsidian";

interface WindowState {
  interfaceHidden: boolean;
  guttersHidden: boolean;
  headerHidden: boolean;
}

export default class DynamicFullscreenPlugin extends Plugin {
  private windowStates = new WeakMap<Window, WindowState>();
  private observers = new WeakMap<Window, MutationObserver>();
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

  private getActiveDocument(): Document {
    const leaf = this.app.workspace.activeLeaf;
    return (
      leaf?.view.containerEl.ownerDocument ??
      leaf?.containerEl.ownerDocument ??
      document
    );
  }

  private registerWindow(win: Window) {
    if (this.observers.has(win)) return;
    const observer = new MutationObserver(() => {
      const state = this.windowStates.get(win);
      if (!state) return;
      const body = win.document.body;
      if (state.interfaceHidden && !body.classList.contains("hide-interface"))
        body.classList.add("hide-interface");
      if (state.guttersHidden && !body.classList.contains("hide-gutters"))
        body.classList.add("hide-gutters");
      if (state.headerHidden && !body.classList.contains("hide-view-header"))
        body.classList.add("hide-view-header");
    });
    observer.observe(win.document.body, { attributes: true, attributeFilter: ["class"] });
    this.observers.set(win, observer);
    this.register(() => observer.disconnect());
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
    const doc = this.getActiveDocument();
    const win = doc.defaultView || window;
    this.registerWindow(win);
    const hidden = doc.body.classList.toggle("hide-interface");
    const state = this.windowStates.get(win) || {
      interfaceHidden: false,
      guttersHidden: false,
      headerHidden: false,
    };
    state.interfaceHidden = hidden;
    this.windowStates.set(win, state);
  }

  toggleGutters() {
    const doc = this.getActiveDocument();
    const win = doc.defaultView || window;
    this.registerWindow(win);
    const hidden = doc.body.classList.toggle("hide-gutters");
    const state = this.windowStates.get(win) || {
      interfaceHidden: false,
      guttersHidden: false,
      headerHidden: false,
    };
    state.guttersHidden = hidden;
    this.windowStates.set(win, state);
  }

  toggleViewHeader() {
    const doc = this.getActiveDocument();
    const win = doc.defaultView || window;
    this.registerWindow(win);
    const hidden = doc.body.classList.toggle("hide-view-header");
    const state = this.windowStates.get(win) || {
      interfaceHidden: false,
      guttersHidden: false,
      headerHidden: false,
    };
    state.headerHidden = hidden;
    this.windowStates.set(win, state);
  }

  hideAll() {
    const doc = this.getActiveDocument();
    const win = doc.defaultView || window;
    this.registerWindow(win);
    doc.body.classList.add("hide-interface", "hide-gutters", "hide-view-header");
    this.windowStates.set(win, {
      interfaceHidden: true,
      guttersHidden: true,
      headerHidden: true,
    });
  }

  showAll() {
    const doc = this.getActiveDocument();
    const win = doc.defaultView || window;
    this.registerWindow(win);
    doc.body.classList.remove(
      "hide-interface",
      "hide-gutters",
      "hide-view-header"
    );
    this.windowStates.set(win, {
      interfaceHidden: false,
      guttersHidden: false,
      headerHidden: false,
    });
  }
}
