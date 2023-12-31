import React, { useCallback, useEffect, useRef, useState } from "react";

import { getRandomValue } from "helpers";
import { CellsObject } from "types";
import { useBuilder } from "useBuilder";

import "./style.scss";

export const App = ({
  delay = -1,
  horizontalCount = 30,
  stepCounter,
  verticalCount = 30,
}: {
  delay?: number;
  horizontalCount?: number;
  stepCounter?: number;
  verticalCount?: number;
}): JSX.Element => {
  const [actualDelay, setActualDelay] = useState(delay);
  const [colors, setColors] = useState<string[]>([]);
  const [cells, setCells] = useState<CellsObject>([]);
  const currentStep = useRef<number>(0);
  const timer = useRef<NodeJS.Timeout | undefined>(undefined);
  const {
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
  } = useBuilder({
    cells,
    colors,
    horizontalCount,
    setCells,
    verticalCount,
  });

  /////////////////////////
  // action
  /////////////////////////
  const step = useCallback((): void => {
    if (!hasMultipleGroups) {
      return;
    }

    const randomVal = getRandomValue(availableMoves.length);
    const selection = getRandomSelection(randomVal);
    const neighborGroup = getNeighborGroup(selection);

    deletePossibleMoves(selection);
    if (cells[selection.y][selection.x].group === neighborGroup) {
      return step();
    }
    updateGroups({ selection, neighborGroup });
    removeWalls(selection);
  }, [
    availableMoves,
    cells,
    deletePossibleMoves,
    getNeighborGroup,
    getRandomSelection,
    hasMultipleGroups,
    removeWalls,
    updateGroups,
  ]);

  /////////////////////////
  // controls
  /////////////////////////
  // manual trigger
  useEffect(() => {
    if (stepCounter !== undefined && currentStep.current !== stepCounter) {
      currentStep.current = stepCounter;
      setActualDelay(-1);
      step();
    }
  }, [step, stepCounter]);

  // start auto run
  useEffect(() => {
    if (delay !== -1) {
      setActualDelay(delay);
    }
  }, [delay]);

  // auto run
  useEffect(() => {
    if (actualDelay !== -1 && cells.length > 0) {
      clearTimeout(timer.current);
      timer.current = setTimeout(step, actualDelay);
    }

    return () => {
      clearTimeout(timer.current);
    };
  }, [actualDelay, cells.length, step]);

  /////////////////////////
  // setup
  /////////////////////////
  useEffect((): void => {
    clearTimeout(timer.current);

    const newCells: CellsObject = [];
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
  }, [
    generateColor,
    getWallSet,
    horizontalCount,
    setCells,
    timer,
    verticalCount,
  ]);

  return (
    <ul className="app">
      {Array.from(Array(verticalCount).keys()).map((y) =>
        Array.from(Array(horizontalCount).keys()).map((x) => {
          const currentWalls = cells[y]?.[x]?.walls ?? [];
          const wallsArray = Array.from(currentWalls);
          const cls = `cell ${wallsArray.join(" ")}`;
          return (
            <li className={cls} key={`${y}-${x}`} style={cellStyle({ x, y })} />
          );
        }),
      )}
    </ul>
  );
};
