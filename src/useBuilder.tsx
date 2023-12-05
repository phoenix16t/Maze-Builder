import { getRandomValue } from "helpers";
import { useCallback, useMemo } from "react";
import {
  CellsObject,
  BuilderObject,
  CoordinatesObject,
  CellStyles,
  SelectionObject,
} from "types";

export const useBuilder = ({
  cells,
  colors,
  horizontalCount = 30,
  setCells,
  verticalCount = 30,
}: {
  cells: CellsObject;
  colors: string[];
  horizontalCount?: number;
  setCells: React.Dispatch<React.SetStateAction<CellsObject>>;
  verticalCount?: number;
}): BuilderObject => {
  const availableMoves = useMemo((): CoordinatesObject[] => {
    return cells.flatMap((column, y) =>
      column
        .map((cell, x) => ({ cell, x, y }))
        .filter(({ cell }) => cell.moves !== undefined && cell.moves.size > 0),
    );
  }, [cells]);

  const hasMultipleGroups = useMemo((): boolean => {
    return cells.some((column) => column.some((cell) => cell.group > 0));
  }, [cells]);

  const cellStyle = useCallback(
    ({ x, y }: CoordinatesObject): CellStyles => {
      const group = cells[y]?.[x]?.group ?? 0;
      return {
        backgroundColor: colors[group],
        width: `${100 / horizontalCount}%`,
      };
    },
    [cells, colors, horizontalCount],
  );

  const deletePossibleMoves = useCallback(
    ({ direction, x, y }: SelectionObject): void => {
      setCells((prevCells) => {
        const cellsCopy = [...prevCells];
        cellsCopy[y][x].moves?.delete(direction);
        if (cellsCopy[y][x].moves?.size === 0) {
          delete cellsCopy[y][x].moves;
        }
        return cellsCopy;
      });
    },
    [setCells],
  );

  const generateColor = useCallback((): string => {
    const r = Math.floor(getRandomValue(256));
    const g = Math.floor(getRandomValue(256));
    const b = Math.floor(getRandomValue(256));

    return `rgb(${r}, ${g}, ${b})`;
  }, []);

  const getNeighborGroup = useCallback(
    ({ direction, x, y }: SelectionObject): number => {
      const neighborX = direction === "e" ? +x + 1 : x;
      const neighborY = direction === "s" ? +y + 1 : y;

      return cells[neighborY][neighborX].group;
    },
    [cells],
  );

  const getRandomSelection = useCallback(
    (randomVal: number): SelectionObject => {
      const { x, y } = availableMoves[randomVal];
      const cell = cells[y][x];
      const selectionWallIdx = getRandomValue(cell.walls.size);
      return {
        direction: Array.from(cell.walls)[selectionWallIdx],
        x,
        y,
      };
    },
    [availableMoves, cells],
  );

  const getWallSet = useCallback(
    ({ x, y }: CoordinatesObject): Set<string> => {
      const wallSet: Set<string> = new Set();
      if (y !== verticalCount - 1) {
        wallSet.add("s");
      }
      if (x !== horizontalCount - 1) {
        wallSet.add("e");
      }
      return wallSet;
    },
    [horizontalCount, verticalCount],
  );

  const removeWalls = useCallback(
    ({ direction, x, y }: SelectionObject): void => {
      setCells((prevCells) => {
        const cellDupe = [...prevCells];
        cellDupe[y][x].walls.delete(direction);
        return cellDupe;
      });
    },
    [setCells],
  );

  const updateGroups = useCallback(
    ({
      selection: { x, y },
      neighborGroup,
    }: {
      selection: SelectionObject;
      neighborGroup: number;
    }): void => {
      const selectionGroup = cells[y][x].group;

      const updatedCells = (prevCells: CellsObject): CellsObject => {
        return prevCells.map((column) =>
          column.map((cell) => {
            const cellCopy = { ...cell };
            if (
              cellCopy.group === neighborGroup &&
              selectionGroup < neighborGroup
            ) {
              cellCopy.group = selectionGroup;
            } else if (
              cellCopy.group === selectionGroup &&
              neighborGroup < selectionGroup
            ) {
              cellCopy.group = neighborGroup;
            }

            return cellCopy;
          }),
        );
      };

      setCells((prevCells) => updatedCells(prevCells));
    },
    [cells, setCells],
  );

  return {
    availableMoves,
    hasMultipleGroups,
    cellStyle,
    deletePossibleMoves,
    generateColor,
    getNeighborGroup,
    getRandomSelection,
    getWallSet,
    removeWalls,
    updateGroups,
  };
};
