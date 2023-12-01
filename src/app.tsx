import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./style.scss";

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
}) => {
  const [colors, setColors] = useState<string[]>([]);
  const [groups, setGroups] = useState<GroupObject>({});
  const [possibleMoves, setPossibleMoves] = useState<WallObject>({});
  const [visibleWalls, setVisibleWalls] = useState<WallObject>({});

  const hasMultipleGroups = useMemo(() => {
    return Object.values(groups).some((group) => {
      return group > 0;
    });
  }, [groups]);

  const cellStyle = useCallback(
    ({ x, y }: { x: number; y: number }) => {
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
    (selected: { index: string | number; direction: string }) => {
      const movesTemp = { ...possibleMoves };
      movesTemp[selected.index].delete(selected.direction);
      if (movesTemp[selected.index].size === 0) {
        delete movesTemp[selected.index];
      }

      setPossibleMoves(movesTemp);
    },
    [possibleMoves],
  );

  const generateColor = useCallback((): string => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return `rgb(${r}, ${g}, ${b})`;
  }, []);

  const getNeighborGroup = useCallback(
    (selected: { direction: string; x: string; y: string }) => {
      const x = selected.direction === "e" ? +selected.x + 1 : selected.x;
      const y = selected.direction === "s" ? +selected.y + 1 : selected.y;
      const index = `${y}-${x}`;

      return groups[index];
    },
    [groups],
  );

  const getRandomVlue = useCallback(() => {
    return Math.floor(Math.random() * Object.entries(possibleMoves).length);
  }, [possibleMoves]);

  const getSelectedCell = useCallback(
    (randomVal: number) => {
      const [index, wallSet] = Object.entries(possibleMoves)[randomVal];
      const [y, x] = index.split("-");
      const selectedWallIdx = Math.floor(Math.random() * wallSet.size);

      return {
        direction: Array.from(wallSet)[selectedWallIdx],
        group: groups[index],
        index,
        x,
        y,
      };
    },
    [groups, possibleMoves],
  );

  const getWallSet = useCallback(
    ({ x, y }: { x: number; y: number }) => {
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
    (selected: { index: string | number; direction: string }) => {
      const visibleWallsTemp = { ...visibleWalls };

      visibleWallsTemp[selected.index].delete(selected.direction);
      setVisibleWalls(visibleWallsTemp);
    },
    [visibleWalls],
  );

  const updateGroups = useCallback(
    (selected: { group: number }, neighborGroup: number) => {
      const groupsTemp = { ...groups };

      Object.entries(groupsTemp).forEach(([index, currentGroup]) => {
        if (currentGroup === neighborGroup && selected.group < currentGroup) {
          groupsTemp[index] = selected.group;
        } else if (
          currentGroup === selected.group &&
          neighborGroup < currentGroup
        ) {
          groupsTemp[index] = neighborGroup;
        }
      });

      setGroups(groupsTemp);
    },
    [groups],
  );

  const stepBuilder = useCallback((): void => {
    if (!hasMultipleGroups) {
      return;
    }

    const randomVal = getRandomVlue();
    const selected = getSelectedCell(randomVal);
    const neighborGroup = getNeighborGroup(selected);

    deletePossibleMoves(selected);
    if (selected.group === neighborGroup) {
      return stepBuilder();
    }
    updateGroups(selected, neighborGroup);
    removeWalls(selected);
  }, [
    deletePossibleMoves,
    getNeighborGroup,
    getRandomVlue,
    getSelectedCell,
    hasMultipleGroups,
    removeWalls,
    updateGroups,
  ]);

  const handleClick = useCallback((): void => stepBuilder(), [stepBuilder]);

  useEffect((): void => {
    const newColors = [];
    const newGroups: GroupObject = {};
    const newWalls: WallObject = {};
    const newMoves: WallObject = {};
    for (let y = 0; y < verticalCount; y++) {
      for (let x = 0; x < horizontalCount; x++) {
        const index = `${y}-${x}`;

        if (y !== verticalCount - 1 || x !== horizontalCount - 1) {
          const set = getWallSet({ x, y });
          newWalls[index] = set;
          newMoves[index] = new Set(set);
        }
        newGroups[index] = x + y * verticalCount;
        newColors.push(generateColor());
      }
    }

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
