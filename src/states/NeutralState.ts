import { IState } from "src/State";
import { World } from "src/World";

export class NeutralState implements IState {
  isFinished() {
    return true;
  }

  update() {}
}
