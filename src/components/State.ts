import { Entity } from "src/world/Entity";
import { World } from "../world/World";

export abstract class State {
  private entity: Entity;

  setEntity(entity: Entity) {
    this.entity = entity;
  }
  getEntity() {
    return this.entity;
  }
  enter() {}
  exit() {}
  abstract isFinished(): boolean;
  abstract update(): void;
}

export interface StateClass<T extends State> {
  new (): T;
}

export class StateMachine<CurrentStates extends State = State> {
  public states: { [name: string]: State };

  constructor(private entity: Entity) {
    this.states = {};
  }

  addState<NewState extends State>(
    klass: StateClass<State>
  ): StateMachine<CurrentStates | NewState> {
    const state = new klass();
    state.setEntity(this.entity);
    this.states[state.constructor.name] = state;
    return this;
  }

  enter(state: StateClass<CurrentStates>) {
    this.states[state.name];
  }
}
