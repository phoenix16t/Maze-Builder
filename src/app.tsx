import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./style.scss";

type CellPositions = { x: number; y: number }[];

export const App = ({
  horizontalCount = 10,
  verticalCount = 10,
}: {
  horizontalCount?: number;
  verticalCount?: number;
}) => {
  console.log("\n\n\n");

  const [groups, setGroups] = useState<CellPositions>([]);
  const [walls, setWalls] = useState<Set<string>[][]>([]);

  const cellStyle = useMemo(() => {
    return {
      width: `${100 / horizontalCount}%`,
    };
  }, [horizontalCount]);

  /////////////////////////
  // loop
  /////////////////////////
  const blah = useCallback(() => {
    console.log("startingslkefjlksdlksdjf");

    const item = groups[Math.floor(Math.random() * (groups.length - 1)) + 1];
    console.log("item", item);
  }, [groups]);

  /////////////////////////
  // set up
  /////////////////////////
  // walls
  useEffect(() => {
    const walls = Array.from(Array(verticalCount).keys()).map((y) =>
      Array.from(Array(horizontalCount).keys()).map((x) => {
        const arr = [];
        if (y !== 0) {
          arr.push("n");
        }
        if (y !== verticalCount - 1) {
          arr.push("s");
        }
        if (x !== 0) {
          arr.push("w");
        }
        if (x !== horizontalCount - 1) {
          arr.push("e");
        }

        return new Set(arr);
      }),
    );

    setWalls(walls);
  }, [horizontalCount, verticalCount]);

  // groups
  useEffect(() => {
    const groups = Array.from(Array(verticalCount).keys()).reduce(
      (acc, y) =>
        acc.concat(
          ...Array.from(Array(horizontalCount).keys()).map((x) => [{ x, y }]),
        ),
      [] as CellPositions,
    );

    // console.log("a", x + y * verticalCount);
    setGroups(groups);
  }, [horizontalCount, verticalCount]);

  /////////////////////////
  // start
  /////////////////////////
  useEffect(() => {
    if (groups.length > 0 && walls.length > 0) {
      blah();
    }
  }, [blah, groups, walls]);

  console.log("grlups", groups);
  console.log("walls11", walls);
  return (
    <ul className="app">
      {Array.from(Array(verticalCount).keys()).map((y) =>
        Array.from(Array(horizontalCount).keys()).map((x) => (
          <li className="cell" style={cellStyle}>
            {x} {y}
          </li>
        )),
      )}
    </ul>
  );
};
