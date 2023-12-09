import { NavTile } from "./NavTile";

// manhattan distance
function h(current: NavTile, end: NavTile) {
  const x = end.coords.x - current.coords.x;
  const y = end.coords.y - current.coords.y;
  const z = end.coords.z - current.coords.z;
  return (x >= 0 ? x : -x) + (y >= 0 ? y : -y) + (z >= 0 ? z : -z);
}

export function shortestPath(start: NavTile, end: NavTile) {
  const g: { [id: string]: number } = { [start.id]: 0 };
  const f: { [id: string]: number } = { [start.id]: h(start, end) };
  const from: { [id: string]: NavTile } = {};
  const open: NavTile[] = [start];

  while (open.length > 0) {
    const current = open.shift();
    if (current === end) {
      return reconstructPath(from, current);
    }

    for (const { tile: neighbour } of current.neighbours) {
      const currentGScore = neighbour.id in g ? g[neighbour.id] : Infinity;
      const newGScore = 1 + g[current.id];
      if (newGScore < currentGScore) {
        from[neighbour.id] = current;
        g[neighbour.id] = newGScore;
        f[neighbour.id] = newGScore + h(neighbour, end);
        if (!open.includes(neighbour)) {
          open.push(neighbour);
        }
      }
    }

    open.sort((a, b) => {
      const af = a.id in f ? f[a.id] : Infinity;
      const bf = b.id in f ? f[b.id] : Infinity;
      return af - bf;
    });
  }

  return null;
}

function reconstructPath(from: { [id: string]: NavTile }, current: NavTile) {
  const path = [current];
  while (current.id in from) {
    current = from[current.id];
    path.unshift(current);
  }

  return path;
}
