"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const COLS = 10;
const ROWS = 12;
const START = [{ x: 4, y: 7 }, { x: 3, y: 7 }, { x: 2, y: 7 }];

type Point = { x: number; y: number };

function same(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}

function nextFood(snake: Point[]) {
  const open = Array.from({ length: COLS * ROWS }, (_, index) => ({ x: index % COLS, y: Math.floor(index / COLS) }))
    .filter((cell) => !snake.some((part) => same(part, cell)));
  return open[Math.floor(Math.random() * open.length)] ?? { x: 7, y: 4 };
}

export default function DnaSnake() {
  const [snake, setSnake] = useState<Point[]>(START);
  const [food, setFood] = useState<Point>({ x: 7, y: 4 });
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const direction = useRef<Point>({ x: 1, y: 0 });
  const queued = useRef<Point>({ x: 1, y: 0 });

  const reset = useCallback(() => {
    setSnake(START);
    setFood({ x: 7, y: 4 });
    setScore(0);
    setGameOver(false);
    direction.current = { x: 1, y: 0 };
    queued.current = { x: 1, y: 0 };
    setRunning(true);
  }, []);

  const steer = useCallback((next: Point) => {
    const current = direction.current;
    if (current.x + next.x === 0 && current.y + next.y === 0) return;
    queued.current = next;
    if (!running && !gameOver) setRunning(true);
  }, [gameOver, running]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSnake((current) => {
        direction.current = queued.current;
        const head = current[0];
        const next = {
          x: (head.x + direction.current.x + COLS) % COLS,
          y: (head.y + direction.current.y + ROWS) % ROWS,
        };
        if (current.some((part) => same(part, next))) {
          setRunning(false);
          setGameOver(true);
          return current;
        }
        const grew = same(next, food);
        const moved = [next, ...current];
        if (!grew) moved.pop();
        else {
          setScore((value) => value + 1);
          setFood(nextFood(moved));
        }
        return moved;
      });
    }, 145);
    return () => window.clearInterval(timer);
  }, [food, running]);

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    const controls: Record<string, Point> = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    };
    const move = controls[event.key];
    if (!move) return;
    event.preventDefault();
    steer(move);
  }

  return (
    <div className="dna-snake" tabIndex={0} onKeyDown={keyDown} aria-label="DNA Snake game. Use arrow keys or the controls below.">
      <div className="dna-snake-head">
        <span>DNA SNAKE · ARTIFACT 01</span>
        <strong>{score.toString().padStart(2, "0")}</strong>
      </div>
      <div className="dna-snake-grid" aria-hidden="true">
        {Array.from({ length: COLS * ROWS }, (_, index) => {
          const point = { x: index % COLS, y: Math.floor(index / COLS) };
          const segment = snake.findIndex((part) => same(part, point));
          return <i key={index} className={cn(segment >= 0 && "is-snake", segment === 0 && "is-head", same(food, point) && "is-food")} />;
        })}
        {!running && <div className="dna-snake-state"><strong>{gameOver ? "DNA LOST" : "SEALED"}</strong><button type="button" onClick={reset}>{gameOver ? "Replay" : "Play"}</button></div>}
      </div>
      <div className="dna-snake-controls" aria-label="Game controls">
        <button type="button" onClick={() => steer({ x: -1, y: 0 })} aria-label="Move left">←</button>
        <button type="button" onClick={() => steer({ x: 0, y: -1 })} aria-label="Move up">↑</button>
        <button type="button" onClick={() => steer({ x: 0, y: 1 })} aria-label="Move down">↓</button>
        <button type="button" onClick={() => steer({ x: 1, y: 0 })} aria-label="Move right">→</button>
      </div>
    </div>
  );
}
