import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./style.scss";

interface CellObject {
  group: number;
  walls: Set<string>;
  moves?: Set<string>;
}

interface CellStyle {
  backgroundColor: string;
  width: string;
}

interface Coordinates {
  x: number;
  y: number;
}

interface SelectionObject extends Coordinates {
  direction: string;
}

type Cells = CellObject[][];

export const App = ({
  horizontalCount = 4,
  verticalCount = 4,
}: {
  horizontalCount?: number;
  verticalCount?: number;
}): JSX.Element => {
  const [colors, setColors] = useState<string[]>([]);
  const [cells, setCells] = useState<Cells>([]);

  const availableMoves = useMemo((): Coordinates[] => {
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
    ({ x, y }: { x: number; y: number }): CellStyle => {
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
    [],
  );

  const getNeighborGroup = useCallback(
    ({ direction, x, y }: SelectionObject): number => {
      const neighborX = direction === "e" ? +x + 1 : x;
      const neighborY = direction === "s" ? +y + 1 : y;

      return cells[neighborY][neighborX].group;
    },
    [cells],
  );

  const getRandomValue = useCallback((length: number): number => {
    return Math.floor(Math.random() * length);
  }, []);

  const getRandomSelection = useCallback(
    (randomVal: number): SelectionObject => {
      const { x, y } = availableMoves[randomVal];
      const cell = cells[y][x];
      const selectedWallIdx = getRandomValue(cell.walls.size);
      return {
        direction: Array.from(cell.walls)[selectedWallIdx],
        x,
        y,
      };
    },
    [availableMoves, cells, getRandomValue],
  );

  const generateColor = useCallback((): string => {
    const r = Math.floor(getRandomValue(256));
    const g = Math.floor(getRandomValue(256));
    const b = Math.floor(getRandomValue(256));

    return `rgb(${r}, ${g}, ${b})`;
  }, [getRandomValue]);

  const getWallSet = useCallback(
    ({ x, y }: { x: number; y: number }): Set<string> => {
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
    [],
  );

  const updateGroups = useCallback(
    ({
      selected: { x, y },
      neighborGroup,
    }: {
      selected: SelectionObject;
      neighborGroup: number;
    }): void => {
      const selectedGroup = cells[y][x].group;

      const updatedCells = (prevCells: Cells): Cells => {
        return prevCells.map((column) =>
          column.map((cell) => {
            const cellCopy = { ...cell };
            if (
              cellCopy.group === neighborGroup &&
              selectedGroup < neighborGroup
            ) {
              cellCopy.group = selectedGroup;
            } else if (
              cellCopy.group === selectedGroup &&
              neighborGroup < selectedGroup
            ) {
              cellCopy.group = neighborGroup;
            }

            return cellCopy;
          }),
        );
      };

      setCells((prevCells) => updatedCells(prevCells));
    },
    [cells],
  );

  /////////////////////////
  // action
  /////////////////////////
  const step = useCallback((): void => {
    if (!hasMultipleGroups) {
      return;
    }

    const randomVal = getRandomValue(availableMoves.length);
    const selected = getRandomSelection(randomVal);
    const neighborGroup = getNeighborGroup(selected);
    deletePossibleMoves(selected);
    if (cells[selected.y][selected.x].group === neighborGroup) {
      return step();
    }
    updateGroups({ selected, neighborGroup });
    removeWalls(selected);
  }, [
    availableMoves.length,
    cells,
    deletePossibleMoves,
    getNeighborGroup,
    getRandomValue,
    getRandomSelection,
    hasMultipleGroups,
    removeWalls,
    updateGroups,
  ]);

  const handleClick = useCallback((): void => {
    step();
  }, [step]);

  /////////////////////////
  // setup
  /////////////////////////
  useEffect((): void => {
    const newCells: Cells = [];
    const newColors: string[] = [];

    Array.from(Array(verticalCount).keys()).map((y) =>
      Array.from(Array(horizontalCount).keys()).map((x) => {
        const set = getWallSet({ x, y });

        const obj = {
          group: x + y * verticalCount,
          moves: new Set(set),
          walls: set,
        };

        newCells[y] = newCells[y] ?? [];
        newCells[y].push(obj);

        newColors.push(generateColor());
      }),
    );

    setCells(newCells);
    setColors(newColors);
  }, [generateColor, getWallSet, horizontalCount, verticalCount]);

  return (
    <>
      <button onClick={handleClick}>step </button>
      <ul className="app">
        {Array.from(Array(verticalCount).keys()).map((y) =>
          Array.from(Array(horizontalCount).keys()).map((x) => {
            const currentWalls = cells[y]?.[x]?.walls ?? [];
            const wallsArray = Array.from(currentWalls);
            const cls = `cell ${wallsArray.join(" ")}`;
            return (
              <li
                className={cls}
                key={`${y}-${x}`}
                style={cellStyle({ x, y })}
              />
            );
          }),
        )}
      </ul>
    </>
  );
};
