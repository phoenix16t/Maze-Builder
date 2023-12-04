import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./style.scss";

interface CellObject {
  group: number;
  walls: Set<string>;
  moves?: Set<string>;
}

interface Cells {
  [key: string]: CellObject;
}

interface CellStyle {
  backgroundColor: string;
  width: string;
}

interface SelectionObject {
  direction: string;
  x: string;
  y: string;
}

export const App = ({
  horizontalCount = 4,
  verticalCount = 4,
}: {
  horizontalCount?: number;
  verticalCount?: number;
}): JSX.Element => {
  const [colors, setColors] = useState<string[]>([]);
  const [cells, setCells] = useState<Cells>({});

  const hasMultipleGroups = useMemo((): boolean => {
    return Object.values(cells).some((c) => c.group > 0);
  }, [cells]);

  const availableMoves = useMemo(() => {
    return Object.entries(cells).reduce((store, [index, cell]) => {
      if (cell.walls.size > 0) {
        store[index] = cell;
      }
      return store;
    }, {} as Cells);
  }, [cells]);

  const availableMovesCount = useMemo(() => {
    return Object.keys(availableMoves).length;
  }, [availableMoves]);

  const cellStyle = useCallback(
    ({ x, y }: { x: number; y: number }): CellStyle => {
      const index = `${y}-${x}`;
      const group = cells[index]?.group ?? 0;
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
        const cellsDupe = { ...prevCells };
        const index = `${y}-${x}`;

        cellsDupe[index].moves?.delete(direction);
        if (cellsDupe[index].moves?.size === 0) {
          delete cellsDupe[index].moves;
        }

        return cellsDupe;
      });
    },
    [],
  );

  const getNeighborGroup = useCallback(
    ({ direction, x, y }: SelectionObject): number => {
      const neighborX = direction === "e" ? +x + 1 : x;
      const neighborY = direction === "s" ? +y + 1 : y;
      const index = `${neighborY}-${neighborX}`;

      return cells[index].group;
    },
    [cells],
  );

  const getRandomValue = useCallback((length: number): number => {
    return Math.floor(Math.random() * length);
  }, []);

  const generateColor = useCallback((): string => {
    const r = Math.floor(getRandomValue(256));
    const g = Math.floor(getRandomValue(256));
    const b = Math.floor(getRandomValue(256));

    return `rgb(${r}, ${g}, ${b})`;
  }, [getRandomValue]);

  const getSelectedCell = useCallback(
    (randomVal: number): SelectionObject => {
      const [index, cell] = Object.entries(availableMoves)[randomVal];
      const [y, x] = index.split("-");
      const selectedWallIdx = getRandomValue(cell.walls.size);
      return {
        direction: Array.from(cell.walls)[selectedWallIdx],
        x,
        y,
      };
    },
    [availableMoves, getRandomValue],
  );

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
      const index = `${y}-${x}`;
      setCells((prevCells) => {
        const cellDupe = { ...prevCells };
        prevCells[index].walls.delete(direction);
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
      const index = `${y}-${x}`;
      const selectedGroup = cells[index].group;

      const updatedCells = (prevCells: Cells): Cells => {
        return Object.entries(prevCells).reduce((store, [key, cell]) => {
          store[key] = { ...cell };
          const { group } = store[key];
          if (group === neighborGroup && selectedGroup < neighborGroup) {
            store[key].group = selectedGroup;
          } else if (group === selectedGroup && neighborGroup < selectedGroup) {
            store[key].group = neighborGroup;
          }

          return store;
        }, {} as Cells);
      };

      setCells((prevCells) => updatedCells(prevCells));
    },
    [cells],
  );

  const stepBuilder = useCallback((): void => {
    if (!hasMultipleGroups) {
      return;
    }

    const randomVal = getRandomValue(availableMovesCount);
    const selected = getSelectedCell(randomVal);
    const neighborGroup = getNeighborGroup(selected);
    const index = `${selected.y}-${selected.x}`;

    deletePossibleMoves(selected);
    if (cells[index].group === neighborGroup) {
      return stepBuilder();
    }
    updateGroups({ selected, neighborGroup });
    removeWalls(selected);
  }, [
    availableMovesCount,
    cells,
    deletePossibleMoves,
    getNeighborGroup,
    getRandomValue,
    getSelectedCell,
    hasMultipleGroups,
    removeWalls,
    updateGroups,
  ]);

  const handleClick = useCallback((): void => {
    stepBuilder();
  }, [stepBuilder]);

  useEffect((): void => {
    const newColors: string[] = [];
    const newCells: Cells = {};

    Array.from(Array(verticalCount).keys()).map((y) =>
      Array.from(Array(horizontalCount).keys()).map((x) => {
        const index = `${y}-${x}`;
        const set = getWallSet({ x, y });
        newCells[index] = {
          group: x + y * verticalCount,
          moves: new Set(set),
          walls: set,
        };
        newColors.push(generateColor());
      }),
    );

    setColors(newColors);
    setCells(newCells);
  }, [generateColor, getWallSet, horizontalCount, verticalCount]);

  return (
    <>
      <button onClick={handleClick}>step </button>
      <ul className="app">
        {Array.from(Array(verticalCount).keys()).map((y) =>
          Array.from(Array(horizontalCount).keys()).map((x) => {
            const index = `${y}-${x}`;
            const currentWalls = cells[index]?.walls ?? [];
            const wallsArray = Array.from(currentWalls);
            const cls = `cell ${wallsArray.join(" ")}`;
            return (
              <li className={cls} key={index} style={cellStyle({ x, y })} />
            );
          }),
        )}
      </ul>
    </>
  );
};
