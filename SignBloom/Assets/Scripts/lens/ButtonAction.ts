/**
 * ButtonAction — connects one UIKit button (on this SceneObject) to one
 * SignBloomController method, so buttons are wired in the Inspector rather than in code.
 */
import { SignBloomController } from "./SignBloomController";

type Action = "next" | "packAsl" | "packBangla" | "startAir" | "endAir" | "clear" | "restart";

@component
export class ButtonAction extends BaseScriptComponent {
  @input controller: SignBloomController;

  @input
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Next sign", "next"),
      new ComboBoxItem("ASL pack", "packAsl"),
      new ComboBoxItem("Bangla pack", "packBangla"),
      new ComboBoxItem("Start Alpona Air", "startAir"),
      new ComboBoxItem("End (back to lessons)", "endAir"),
      new ComboBoxItem("Clear drawing", "clear"),
      new ComboBoxItem("Restart", "restart"),
    ]),
  )
  action: string = "next";

  onAwake() {
    // UIKit/SIK components initialise during the start phase.
    this.createEvent("OnStartEvent").bind(() => {
      const btn = this.getSceneObject().getComponent(RectangleButton.getTypeName()) as RectangleButton;
      if (!btn) {
        print("[ButtonAction] no RectangleButton on " + this.getSceneObject().name);
        return;
      }
      btn.onTriggerUp.add(() => this.fire());
    });
  }

  private fire() {
    const c = this.controller;
    switch (this.action as Action) {
      case "next": c.skipSign(); break;
      case "packAsl": c.setPackAsl(); break;
      case "packBangla": c.setPackBangla(); break;
      case "startAir": c.continueToPaint(); break;
      case "endAir": c.endPaint(); break;
      case "clear": c.paintClear(); break;
      case "restart": c.restart(); break;
    }
  }
}
import { RectangleButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RectangleButton";
