export interface CellObject {
  group: number;
  walls: Set<string>;
  moves?: Set<string>;
}

export type CellsObject = CellObject[][];

export interface CellStyles {
  backgroundColor: string;
  width: string;
}

export interface CoordinatesObject {
  x: number;
  y: number;
}

export interface SelectionObject extends CoordinatesObject {
  direction: string;
}

export interface BuilderObject {
  availableMoves: CoordinatesObject[];
  hasMultipleGroups: boolean;
  cellStyle: ({ x, y }: CoordinatesObject) => CellStyles;
  deletePossibleMoves: ({ direction, x, y }: SelectionObject) => void;
  generateColor: () => string;
  getNeighborGroup: ({ direction, x, y }: SelectionObject) => number;
  getRandomSelection: (randomVal: number) => SelectionObject;
  getWallSet: ({ x, y }: CoordinatesObject) => Set<string>;
  removeWalls: ({ direction, x, y }: SelectionObject) => void;
  updateGroups: ({
    selection: { x, y },
    neighborGroup,
  }: {
    selection: SelectionObject;
    neighborGroup: number;
  }) => void;
}
