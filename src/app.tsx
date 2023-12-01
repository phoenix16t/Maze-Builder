import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./style.scss";

interface CellObject {
  direction: string;
  group: number;
  index: string;
  x: string;
  y: string;
}

interface CellStyle {
  backgroundColor: string;
  width: string;
}

interface GroupObject {
  [key: string]: number;
}

interface WallObject {
  [key: string]: Set<string>;
}

export const App = ({
  horizontalCount = 5,
  verticalCount = 5,
}: {
  horizontalCount?: number;
  verticalCount?: number;
}): JSX.Element => {
  const [colors, setColors] = useState<string[]>([]);
  const [groups, setGroups] = useState<GroupObject>({});
  const [possibleMoves, setPossibleMoves] = useState<WallObject>({});
  const [visibleWalls, setVisibleWalls] = useState<WallObject>({});

  const hasMultipleGroups = useMemo((): boolean => {
    return Object.values(groups).some((g) => g > 0);
  }, [groups]);

  const cellStyle = useCallback(
    ({ x, y }: { x: number; y: number }): CellStyle => {
      const index = `${y}-${x}`;
      const group = groups[index] ?? 0;
      return {
        backgroundColor: colors[group],
        width: `${100 / horizontalCount}%`,
      };
    },
    [colors, groups, horizontalCount],
  );

  const deletePossibleMoves = useCallback(
    ({ index, direction }: CellObject): void => {
      setPossibleMoves((prevMoves): WallObject => {
        const movesDupe = { ...prevMoves };
        movesDupe[index].delete(direction);
        if (movesDupe[index].size === 0) {
          delete movesDupe[index];
        }
        return movesDupe;
      });
    },
    [],
  );

  const getNeighborGroup = useCallback(
    ({ direction, x, y }: CellObject): number => {
      const neighborX = direction === "e" ? +x + 1 : x;
      const neighborY = direction === "s" ? +y + 1 : y;
      const index = `${neighborY}-${neighborX}`;

      return groups[index];
    },
    [groups],
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
    (randomVal: number): CellObject => {
      const [index, wallSet] = Object.entries(possibleMoves)[randomVal];
      const [y, x] = index.split("-");
      const selectedWallIdx = getRandomValue(wallSet.size);

      return {
        direction: Array.from(wallSet)[selectedWallIdx],
        group: groups[index],
        index,
        x,
        y,
      };
    },
    [getRandomValue, groups, possibleMoves],
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

  const removeWalls = useCallback(({ index, direction }: CellObject): void => {
    setVisibleWalls((preVisibleWalls: WallObject): WallObject => {
      const visibleWallsDupe = { ...preVisibleWalls };
      visibleWallsDupe[index].delete(direction);
      return visibleWallsDupe;
    });
  }, []);

  const updateGroups = useCallback(
    ({
      selected: { group },
      neighborGroup,
    }: {
      selected: CellObject;
      neighborGroup: number;
    }): void => {
      const updatedGroups = (prevGroups: GroupObject): GroupObject => {
        return Object.entries(prevGroups).reduce(
          (store: GroupObject, [key, currentGroup]): GroupObject => {
            store[key] = currentGroup;

            if (currentGroup === neighborGroup && group < currentGroup) {
              store[key] = group;
            } else if (currentGroup === group && neighborGroup < currentGroup) {
              store[key] = neighborGroup;
            }

            return store;
          },
          {},
        );
      };

      setGroups((prevGroups): GroupObject => updatedGroups(prevGroups));
    },
    [],
  );

  const stepBuilder = useCallback((): void => {
    if (!hasMultipleGroups) {
      return;
    }

    const randomVal = getRandomValue(Object.entries(possibleMoves).length);
    const selected = getSelectedCell(randomVal);
    const neighborGroup = getNeighborGroup(selected);

    deletePossibleMoves(selected);
    if (selected.group === neighborGroup) {
      return stepBuilder();
    }
    updateGroups({ selected, neighborGroup });
    removeWalls(selected);
  }, [
    deletePossibleMoves,
    getNeighborGroup,
    getRandomValue,
    getSelectedCell,
    hasMultipleGroups,
    possibleMoves,
    removeWalls,
    updateGroups,
  ]);

  const handleClick = useCallback((): void => stepBuilder(), [stepBuilder]);

  useEffect((): void => {
    const newColors: string[] = [];
    const newGroups: GroupObject = {};
    const newWalls: WallObject = {};
    const newMoves: WallObject = {};

    Array.from(Array(verticalCount).keys()).map((y) =>
      Array.from(Array(horizontalCount).keys()).map((x) => {
        const index = `${y}-${x}`;

        if (y !== verticalCount - 1 || x !== horizontalCount - 1) {
          const set = getWallSet({ x, y });
          newWalls[index] = set;
          newMoves[index] = new Set(set);
        }
        newGroups[index] = x + y * verticalCount;
        newColors.push(generateColor());
      }),
    );

    setColors(newColors);
    setGroups(newGroups);
    setPossibleMoves(newMoves);
    setVisibleWalls(newWalls);
  }, [generateColor, getWallSet, horizontalCount, verticalCount]);

  return (
    <>
      <button onClick={handleClick}>step </button>
      <ul className="app">
        {Array.from(Array(verticalCount).keys()).map((y) =>
          Array.from(Array(horizontalCount).keys()).map((x) => {
            const index = `${y}-${x}`;
            const currentWalls =
              visibleWalls[index] === undefined ? [] : visibleWalls[index];
            const wallsArray = Array.from(currentWalls);
            const cls = `cell ${wallsArray.join(" ")}`;
            return <li className={cls} style={cellStyle({ x, y })} />;
          }),
        )}
      </ul>
    </>
  );
};
