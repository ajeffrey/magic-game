export interface IEntity extends Object {
  update?(dt: number, world: World);
}

interface IEntityClass<T extends IEntity> {
  new(...args: any[]): T;
}

export class World {
  entities: IEntity[];

  constructor() {
    this.entities = [];
  }

  addEntity(entity: IEntity) {
    this.entities.push(entity);
  }

  getEntity<T extends IEntity>(ctor: IEntityClass<T>): T | null {
    return this.entities.find((e): e is T => e instanceof ctor);
  }

  getEntities<T extends IEntity>(ctor: IEntityClass<T>): T[] {
    return this.entities.filter((e): e is T => e instanceof ctor);
  }

  update(dt: number) {
    for(const entity of this.entities) {
      entity.update && entity.update(dt, this);
    }
  }
}