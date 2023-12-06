// https://codepen.io/edj/pen/xxMYEWR

// const { useCallback, useEffect, useMemo, useRef, useState } = React;

// interface CellObject {
//   group: number;
//   walls: Set<string>;
//   moves?: Set<string>;
// }

// type CellsObject = CellObject[][];

// interface CellStyles {
//   backgroundColor: string;
//   width: string;
// }

// interface CoordinatesObject {
//   x: number;
//   y: number;
// }

// interface SelectionObject extends CoordinatesObject {
//   direction: string;
// }

// interface BuilderObject {
//   availableMoves: CoordinatesObject[];
//   hasMultipleGroups: boolean;
//   cellStyle: ({ x, y }: CoordinatesObject) => CellStyles;
//   deletePossibleMoves: ({ direction, x, y }: SelectionObject) => void;
//   generateColor: () => string;
//   getNeighborGroup: ({ direction, x, y }: SelectionObject) => number;
//   getRandomSelection: (randomVal: number) => SelectionObject;
//   getWallSet: ({ x, y }: CoordinatesObject) => Set<string>;
//   removeWalls: ({ direction, x, y }: SelectionObject) => void;
//   updateGroups: ({
//     selection: { x, y },
//     neighborGroup,
//   }: {
//     selection: SelectionObject;
//     neighborGroup: number;
//   }) => void;
// }

// const getRandomValue = (length: number): number => {
//   return Math.floor(Math.random() * length);
// };

// const useBuilder = ({
//   cells,
//   colors,
//   horizontalCount,
//   setCells,
//   verticalCount,
// }: {
//   cells: CellsObject;
//   colors: string[];
//   horizontalCount: number;
//   setCells: React.Dispatch<React.SetStateAction<CellsObject>>;
//   verticalCount: number;
// }): BuilderObject => {
//   const availableMoves = useMemo((): CoordinatesObject[] => {
//     return cells.flatMap((column, y) =>
//       column
//         .map((cell, x) => ({ cell, x, y }))
//         .filter(({ cell }) => cell.moves !== undefined && cell.moves.size > 0),
//     );
//   }, [cells]);

//   const hasMultipleGroups = useMemo((): boolean => {
//     return cells.some((column) => column.some((cell) => cell.group > 0));
//   }, [cells]);

//   const cellStyle = useCallback(
//     ({ x, y }: CoordinatesObject): CellStyles => {
//       const group = cells[y]?.[x]?.group ?? 0;
//       return {
//         backgroundColor: colors[group],
//         width: `${100 / horizontalCount}%`,
//       };
//     },
//     [cells, colors, horizontalCount],
//   );

//   const deletePossibleMoves = useCallback(
//     ({ direction, x, y }: SelectionObject): void => {
//       setCells((prevCells) => {
//         const cellsCopy = [...prevCells];
//         cellsCopy[y][x].moves?.delete(direction);
//         if (cellsCopy[y][x].moves?.size === 0) {
//           delete cellsCopy[y][x].moves;
//         }
//         return cellsCopy;
//       });
//     },
//     [setCells],
//   );

//   const generateColor = useCallback((): string => {
//     const r = Math.floor(getRandomValue(256));
//     const g = Math.floor(getRandomValue(256));
//     const b = Math.floor(getRandomValue(256));

//     return `rgb(${r}, ${g}, ${b})`;
//   }, []);

//   const getNeighborGroup = useCallback(
//     ({ direction, x, y }: SelectionObject): number => {
//       const neighborX = direction === "e" ? +x + 1 : x;
//       const neighborY = direction === "s" ? +y + 1 : y;

//       return cells[neighborY][neighborX].group;
//     },
//     [cells],
//   );

//   const getRandomSelection = useCallback(
//     (randomVal: number): SelectionObject => {
//       const { x, y } = availableMoves[randomVal];
//       const cell = cells[y][x];
//       const selectionWallIdx = getRandomValue(cell.walls.size);
//       return {
//         direction: Array.from(cell.walls)[selectionWallIdx],
//         x,
//         y,
//       };
//     },
//     [availableMoves, cells],
//   );

//   const getWallSet = useCallback(
//     ({ x, y }: CoordinatesObject): Set<string> => {
//       const wallSet: Set<string> = new Set();
//       if (y !== verticalCount - 1) {
//         wallSet.add("s");
//       }
//       if (x !== horizontalCount - 1) {
//         wallSet.add("e");
//       }
//       return wallSet;
//     },
//     [horizontalCount, verticalCount],
//   );

//   const removeWalls = useCallback(
//     ({ direction, x, y }: SelectionObject): void => {
//       setCells((prevCells) => {
//         const cellDupe = [...prevCells];
//         cellDupe[y][x].walls.delete(direction);
//         return cellDupe;
//       });
//     },
//     [setCells],
//   );

//   const updateGroups = useCallback(
//     ({
//       selection: { x, y },
//       neighborGroup,
//     }: {
//       selection: SelectionObject;
//       neighborGroup: number;
//     }): void => {
//       const selectionGroup = cells[y][x].group;

//       const updateCells = (prevCells: CellsObject): CellsObject => {
//         return prevCells.map((column) =>
//           column.map((cell) => {
//             const cellCopy = { ...cell };
//             if (
//               cellCopy.group === neighborGroup &&
//               selectionGroup < neighborGroup
//             ) {
//               cellCopy.group = selectionGroup;
//             } else if (
//               cellCopy.group === selectionGroup &&
//               neighborGroup < selectionGroup
//             ) {
//               cellCopy.group = neighborGroup;
//             }

//             return cellCopy;
//           }),
//         );
//       };

//       setCells((prevCells) => updateCells(prevCells));
//     },
//     [cells, setCells],
//   );

//   return {
//     availableMoves,
//     hasMultipleGroups,
//     cellStyle,
//     deletePossibleMoves,
//     generateColor,
//     getNeighborGroup,
//     getRandomSelection,
//     getWallSet,
//     removeWalls,
//     updateGroups,
//   };
// };

// const MazeBuilder = ({
//   delay = -1,
//   horizontalCount = 30,
//   stepCounter,
//   verticalCount = 30,
// }: {
//   delay?: number;
//   horizontalCount?: number;
//   stepCounter?: number;
//   verticalCount?: number;
// }): JSX.Element => {
//   const [actualDelay, setActualDelay] = useState(delay);
//   const [colors, setColors] = useState<string[]>([]);
//   const [cells, setCells] = useState<CellsObject>([]);
//   const currentStep = useRef<number>(0);
//   const timer = useRef<NodeJS.Timeout | undefined>(undefined);
//   const {
//     availableMoves,
//     hasMultipleGroups,
//     cellStyle,
//     deletePossibleMoves,
//     generateColor,
//     getNeighborGroup,
//     getRandomSelection,
//     getWallSet,
//     removeWalls,
//     updateGroups,
//   } = useBuilder({
//     cells,
//     colors,
//     horizontalCount,
//     setCells,
//     verticalCount,
//   });

//   /////////////////////////
//   // action
//   /////////////////////////
//   const step = useCallback((): void => {
//     if (!hasMultipleGroups) {
//       return;
//     }

//     const randomVal = getRandomValue(availableMoves.length);
//     const selection = getRandomSelection(randomVal);
//     const neighborGroup = getNeighborGroup(selection);

//     deletePossibleMoves(selection);
//     if (cells[selection.y][selection.x].group === neighborGroup) {
//       return step();
//     }
//     updateGroups({ selection, neighborGroup });
//     removeWalls(selection);
//   }, [
//     availableMoves,
//     cells,
//     deletePossibleMoves,
//     getNeighborGroup,
//     getRandomSelection,
//     hasMultipleGroups,
//     removeWalls,
//     updateGroups,
//   ]);

//   /////////////////////////
//   // controls
//   /////////////////////////
//   // manual trigger
//   useEffect(() => {
//     if (stepCounter !== undefined && currentStep.current !== stepCounter) {
//       currentStep.current = stepCounter;
//       setActualDelay(-1);
//       step();
//     }
//   }, [step, stepCounter]);

//   // start auto run
//   useEffect(() => {
//     if (delay !== -1) {
//       setActualDelay(delay);
//     }
//   }, [delay]);

//   // auto run
//   useEffect(() => {
//     if (actualDelay !== -1 && cells.length > 0) {
//       clearTimeout(timer.current);
//       timer.current = setTimeout(step, actualDelay);
//     }

//     return () => {
//       clearTimeout(timer.current);
//     };
//   }, [actualDelay, cells.length, step]);

//   /////////////////////////
//   // setup
//   /////////////////////////
//   useEffect((): void => {
//     clearTimeout(timer.current);

//     const newCells: CellsObject = [];
//     const newColors: string[] = [];

//     Array.from(Array(verticalCount).keys()).map((y) =>
//       Array.from(Array(horizontalCount).keys()).map((x) => {
//         const set = getWallSet({ x, y });

//         const obj = {
//           group: x + y * verticalCount,
//           moves: new Set(set),
//           walls: set,
//         };

//         newCells[y] = newCells[y] ?? [];
//         newCells[y].push(obj);

//         newColors.push(generateColor());
//       }),
//     );

//     setCells(newCells);
//     setColors(newColors);
//   }, [
//     generateColor,
//     getWallSet,
//     horizontalCount,
//     setCells,
//     timer,
//     verticalCount,
//   ]);

//   return (
//     <ul className="app">
//       {Array.from(Array(verticalCount).keys()).map((y) =>
//         Array.from(Array(horizontalCount).keys()).map((x) => {
//           const currentWalls = cells[y]?.[x]?.walls ?? [];
//           const wallsArray = Array.from(currentWalls);
//           const cls = `cell ${wallsArray.join(" ")}`;
//           return (
//             <li className={cls} key={`${y}-${x}`} style={cellStyle({ x, y })} />
//           );
//         }),
//       )}
//     </ul>
//   );
// };

// const App = (): JSX.Element => {
//   const [delay, setDelay] = useState(10);
//   const [horizontalCount] = useState(30);
//   const [stepCounter, setStepCounter] = useState(undefined);
//   const [verticalCount] = useState(30);

//   const handleStepCounter = useCallback(() => {
//     setDelay(-1);
//     setStepCounter((counter) => (counter === undefined ? 1 : counter + 1));
//   }, []);

//   const menus = useMemo(() => {
//     return [
//       {
//         label: "Controls",
//         items: [
//           {
//             label: "delay (in ms)",
//             state: delay,
//             control: setDelay,
//             type: "number",
//           },
//           // {
//           //   label: "horizontal cell count",
//           //   state: horizontalCount,
//           //   control: setHorizontalCount,
//           //   type: "number",
//           // },
//           {
//             label: "step counter",
//             state: stepCounter,
//             control: handleStepCounter,
//             type: "counter",
//           },
//           // {
//           //   label: "vertical cell count",
//           //   state: verticalCount,
//           //   control: setVerticalCount,
//           //   type: "number",
//           // },
//         ],
//       },
//     ];
//   }, [delay, handleStepCounter, stepCounter]);

//   return (
//     <>
//       <MazeBuilder
//         delay={delay}
//         horizontalCount={horizontalCount}
//         stepCounter={stepCounter}
//         verticalCount={verticalCount}
//       />

//       <EdjMenu menus={menus} />
//     </>
//   );
// };

// ReactDOM.render(<App />, document.getElementById("root"));
