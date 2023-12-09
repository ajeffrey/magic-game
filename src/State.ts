import { World } from "./World";

export interface IState {
  isFinished(): boolean;
  update(dt: number, world: World): void;
}
