import "./game.js";
import { EventBus } from "./core/EventBus.js";
import { GameRuntimeModel } from "./models/GameRuntimeModel.js";
import { RuntimeDiagnosticsService } from "./services/RuntimeDiagnosticsService.js";
import { InputCommandService } from "./services/InputCommandService.js";
import { HudViewModel } from "./viewModels/HudViewModel.js";
import { GameShellViewModel } from "./viewModels/GameShellViewModel.js";
import { CombatViewModel } from "./viewModels/CombatViewModel.js";
import { HudView } from "./views/HudView.js";
import { CanvasGameView } from "./views/CanvasGameView.js";

const engine = window.AbyssalWebEngine;
const eventBus = new EventBus();
const runtime = new GameRuntimeModel(engine);
const diagnostics = new RuntimeDiagnosticsService(runtime);
const inputCommands = new InputCommandService(eventBus);
const hudViewModel = new HudViewModel(runtime);
const shellViewModel = new GameShellViewModel(runtime, diagnostics, hudViewModel);
const combatViewModel = new CombatViewModel(runtime, eventBus);
const hudView = new HudView(hudViewModel);
const canvasGameView = new CanvasGameView(engine, shellViewModel);

window.AbyssalWeb = {
  model: runtime,
  services: { diagnostics, inputCommands },
  viewModels: { shell: shellViewModel, hud: hudViewModel, combat: combatViewModel },
  views: { hud: hudView, canvas: canvasGameView },
  eventBus
};

const previousAdvanceTime = window.advanceTime;
window.advanceTime = milliseconds => {
  if (previousAdvanceTime) previousAdvanceTime(milliseconds);
  shellViewModel.tick();
};

window.render_game_to_text = () => shellViewModel.diagnosticsJson();
