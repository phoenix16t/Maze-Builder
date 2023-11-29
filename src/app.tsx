import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./style.scss";

interface GroupObject {
  [key: string]: number;
}

interface WallObject {
  [key: string]: Set<string>;
}

export const App = ({
  horizontalCount = 20,
  verticalCount = 20,
}: {
  horizontalCount?: number;
  verticalCount?: number;
}) => {
  const [colors, setColors] = useState<string[]>([]);
  const [groups, setGroups] = useState<GroupObject>({});
  const [walls, setWalls] = useState<WallObject>({});
  const [moves, setMoves] = useState<WallObject>({});

  const [step, setStep] = useState<number>(0);

  const hasMultipleGroups = useMemo(() => {
    return Object.values(groups).some((group) => {
      return group > 0;
    });
  }, [groups]);

  /////////////////////////
  // play
  /////////////////////////
  const startBuilder = useCallback((): void => {
    if (!hasMultipleGroups) {
      return;
    }

    const groupsTemp = { ...groups };
    const wallsTemp = { ...walls };
    const movesTemp = { ...moves };

    const randomVal = Math.floor(Math.random() * Object.entries(moves).length);

    const [selectedIndex, selectedWalls] = Object.entries(moves)[randomVal];

    // get current
    const [y, x] = selectedIndex.split("-");
    const selectedGrp = groups[selectedIndex];
    const selectedWallIdx = Math.floor(Math.random() * selectedWalls.size);
    const selectedDirection = Array.from(selectedWalls)[selectedWallIdx];

    // get neighber
    const neighborX = selectedDirection === "e" ? +x + 1 : x;
    const neighborY = selectedDirection === "s" ? +y + 1 : y;
    const neighborIdx = `${neighborY}-${neighborX}`;
    const neighborGrp = groups[neighborIdx];

    // delete move
    movesTemp[selectedIndex].delete(selectedDirection);
    if (movesTemp[selectedIndex].size === 0) {
      delete movesTemp[selectedIndex];
    }

    setMoves(movesTemp);

    if (selectedGrp === neighborGrp) {
      return startBuilder();
    }

    // update groups
    Object.entries(groupsTemp).forEach(([index, currentGroup]) => {
      if (selectedGrp < neighborGrp && currentGroup === neighborGrp) {
        groupsTemp[index] = selectedGrp;
      } else if (neighborGrp < selectedGrp && currentGroup === selectedGrp) {
        groupsTemp[index] = neighborGrp;
      }
    });

    // remove wall
    wallsTemp[selectedIndex].delete(selectedDirection);
    setGroups(groupsTemp);
    setWalls(wallsTemp);
  }, [groups, hasMultipleGroups, moves, walls]);

  /////////////////////////
  // set up
  /////////////////////////
  const generateColor = useCallback(() => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return `rgb(${r}, ${g}, ${b})`;
  }, []);

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

  useEffect(() => {
    const newColors = [];
    const newGroups: GroupObject = {};
    const newWalls: WallObject = {};
    const newWalls2: WallObject = {};
    for (let y = 0; y < verticalCount; y++) {
      for (let x = 0; x < horizontalCount; x++) {
        const index = `${y}-${x}`;

        if (y !== verticalCount - 1 || x !== horizontalCount - 1) {
          newWalls[index] = getWallSet({ x, y });
          newWalls2[index] = getWallSet({ x, y });
        }
        newGroups[index] = x + y * verticalCount;
        newColors.push(generateColor());
      }
    }

    setColors(newColors);
    setWalls(newWalls);
    setMoves(newWalls2);
    setGroups(newGroups);
  }, [generateColor, getWallSet, horizontalCount, verticalCount]);

  /////////////////////////
  // start
  /////////////////////////
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

  const handleClick = useCallback(() => {
    setStep((s) => s + 1);
    startBuilder();
  }, [startBuilder]);

  return (
    <>
      <button onClick={handleClick}>step {step}</button>
      <ul className="app">
        {Array.from(Array(verticalCount).keys()).map((y) =>
          Array.from(Array(horizontalCount).keys()).map((x) => {
            const index = `${y}-${x}`;
            const currentWalls = walls[index] === undefined ? [] : walls[index];
            const wallsArray = Array.from(currentWalls);
            const cls = `cell ${wallsArray.join(" ")}`;
            return <li className={cls} style={cellStyle({ x, y })} />;
          }),
        )}
      </ul>
    </>
  );
};
