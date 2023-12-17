import { IState } from "src/components/State";
import { World } from "src/world/World";

export class NeutralState implements IState {
  isFinished() {
    return true;
  }

  update() {}
}
