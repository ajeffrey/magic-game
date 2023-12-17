import { ILevel, IModels } from "./loaders/LevelLoader";

const models: IModels = {
  corner: {
    navigable: {
      polys: [
        [
          [0.5, 0, -0.6],
          [0.5, 0, -0.4],
          [-0.4, 0, -0.4],
          [-0.4, 0, 0.5],
          [-0.6, 0, 0.5],
          [-0.6, 0, -0.6],
        ],
      ],
    },
  },
  wall: {
    navigable: {
      polys: [
        [
          [-0.6, 0, -0.5],
          [-0.4, 0, -0.5],
          [-0.4, 0, 0.5],
          [-0.6, 0, 0.5],
        ],
      ],
    },
  },
  floor: {
    navigable: {
      polys: [
        [
          [-0.5, 0, 0.5],
          [0.5, 0, 0.5],
          [0.5, 0, -0.5],
          [-0.5, 0, -0.5],
        ],
      ],
    },
  },
  "basement-floor": {
    navigable: {
      polys: [
        [
          [-0.5, 0, 0.5],
          [0.5, 0, 0.5],
          [0.5, 0, -0.5],
          [-0.5, 0, -0.5],
        ],
      ],
    },
  },
  grass: {
    navigable: {
      polys: [
        [
          [-0.5, 0, 0.5],
          [0.5, 0, 0.5],
          [0.5, 0, -0.5],
          [-0.5, 0, -0.5],
        ],
      ],
    },
  },
  stairs: {
    navigable: {
      polys: [
        [
          [-0.5, 0, 0.5],
          [0.5, 0, 0.5],
          [0.5, 1, -0.5],
          [-0.5, 1, -0.5],
        ],
      ],
    },
  },
};

const basement: ILevel = {
  offset: [0, -1, 0],
  tiles: {
    "┌": { m: "basement-floor", attach: [{ m: "corner" }] },
    "┬": { m: "basement-floor", attach: [{ m: "wall", rotate: 90 }] },
    "┴": { m: "basement-floor", attach: [{ m: "wall", rotate: 270 }] },
    "┐": { m: "basement-floor", attach: [{ m: "corner", rotate: 90 }] },
    "├": { m: "basement-floor", attach: [{ m: "wall" }] },
    "┤": { m: "basement-floor", attach: [{ m: "wall", rotate: 180 }] },
    ".": { m: "basement-floor" },
    "└": { m: "basement-floor", attach: [{ m: "corner", rotate: 270 }] },
    "┘": { m: "basement-floor", attach: [{ m: "corner", rotate: 180 }] },
    "▲": { m: "stairs" },
  },
  map:
    "┌┬┬┬┬┬┬┐\n" +
    "├......┤\n" +
    "├▲.....┤\n" +
    "├......┤\n" +
    "├......┤\n" +
    "├......┤\n" +
    "├......┤\n" +
    "└┴┴┴┴┴┴┘\n",
};

const house: ILevel = {
  offset: [0, 0, 0],
  tiles: {
    "┌": { m: "floor", attach: [{ m: "corner" }] },
    "┬": { m: "floor", attach: [{ m: "wall", rotate: 90 }] },
    "┴": { m: "floor", attach: [{ m: "wall", rotate: 270 }] },
    "┐": { m: "floor", attach: [{ m: "corner", rotate: 90 }] },
    "├": { m: "floor", attach: [{ m: "wall" }] },
    "┤": { m: "floor", attach: [{ m: "wall", rotate: 180 }] },
    ".": { m: "floor" },
    "└": { m: "floor", attach: [{ m: "corner", rotate: 270 }] },
    "┘": { m: "floor", attach: [{ m: "corner", rotate: 180 }] },
  },
  map:
    "┌┬┬┬┬┬┬┐\n" +
    "├......┤\n" +
    "├ .....┤\n" +
    "├.......\n" +
    "├......┤\n" +
    "├......┤\n" +
    "├......┤\n" +
    "└┴┴┴┴┴┴┘\n",
};

const outside: ILevel = {
  offset: [8, 0, 0],
  tiles: {
    ".": { m: "grass" },
  },
  map:
    "........\n" +
    "........\n" +
    "........\n" +
    "........\n" +
    "........\n" +
    "........\n" +
    "........\n" +
    "........\n",
};

const levelData = [basement, house, outside];

export { levelData, models };
