export interface IEntity extends Object {
  update?();
}

interface IEntityClass<T extends IEntity> {
  new (...args: any[]): T;
}

export const World = new (class World {
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

  update() {
    for (const entity of this.entities) {
      entity.update?.();
    }
  }
})();
