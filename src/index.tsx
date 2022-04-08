import { useWindowEvent } from "hook/useWindowEvent";
import { StrictMode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { render } from "react-dom";

enum GameStage {
  START,
  GAME,
  END
}

interface IChar {
  index: number;
  char: string;
  x: 0;
  y: 0;
  remove: boolean;
}

let index = 0;

const Game = () => {
  const [stage, setStage] = useState(GameStage.START);
  const [score, setScore] = useState(0);
  const [period, setPeriod] = useState(1000);
  const [chars, setChars] = useState([] as IChar[]);
  const [timer] = useState(({ milliseconds: 0, nowTime: 0 }));
  const refSpan = useRef<HTMLSpanElement>(null);
  const refChars = useRef<HTMLDivElement>(null);

  const appendChar = useCallback(() => {
    if (!refChars.current) return;

    if (chars.filter(e => !e.remove).length >= 9) {
      setStage(GameStage.END);
      return;
    }

    let { offsetWidth, offsetHeight } = refChars.current;

    offsetWidth -= 100;
    offsetHeight -= 100;

    let x = Math.random() * offsetWidth | 0;
    let y = Math.random() * offsetHeight | 0;
    let char = String.fromCharCode('A'.charCodeAt(0) + Math.random() * 26);

    setChars(v => [...v, { x, y, char, remove: false, index: index++ } as IChar]);
  }, [chars]);

  const removeChar = useCallback((char: string) => {
    const findChar = chars.find(e => e.char == char.toUpperCase() && !e.remove);
    console.log(findChar, char, chars);
    if (!findChar) {
      timer.milliseconds = 0;
      appendChar();
      setTimeout(() => {
        timer.milliseconds = 0;
        appendChar();
      }, 100);
      setPeriod(v => v + 20);
    } else {
      setPeriod(v => v - 2 > 0 ? v - 2 : 1);
      setScore(v => v + 10);
      setChars(v => v.map(e => e == findChar ? { ...e, remove: true } : e));
    }
  }, [chars]);

  useWindowEvent('keydown', ({ key }) => {
    if (key == 'Enter') {
      if (stage == GameStage.START || stage == GameStage.END) {
        setStage(GameStage.GAME);
        return;
      }
    }
    if (key == 'Escape') {
      if (stage == GameStage.GAME) {
        setStage(GameStage.START);
        return;
      }
    }
    if (key.length == 1 && stage == GameStage.GAME) {
      console.log(key);
      removeChar(key);
    }

  }, [stage, chars]);

  useEffect(() => {
    if (stage == GameStage.GAME) {
      setChars([]);
      setScore(0);
    }

  }, [stage]);

  useEffect(() => {
    timer.nowTime = performance.now();

    if (stage == GameStage.GAME) {

    }

    let interval = setInterval(() => {

      if (stage == GameStage.GAME) {
        let newTime = performance.now();
        timer.milliseconds += newTime - timer.nowTime;
        timer.nowTime = newTime;

        if (timer.milliseconds > period) {
          timer.milliseconds -= period;
          appendChar();
        }
      } else {
        timer.milliseconds = 0;
      }


      if (!refSpan.current)
        return;

      const charsf = chars.filter(e => !e.remove);
      const length = charsf.length;

      refSpan.current.style.setProperty('--c', length < 6 ? 'green' : length < 8 ? 'yellow' : 'red');
      refSpan.current.style.setProperty('--pr', `${timer.milliseconds / period * 100}%`);
    }, 10);

    return () => clearInterval(interval);

  }, [stage, period, chars]);

  useEffect(() => {
    appendChar();
  }, []);


  if (stage == GameStage.START) {
    return (
      <div>
        <h1>Нажмите Enter, чтобы начать</h1>
      </div>
    );
  } else {
    return (
      <>
        <div className="block">
          <p className="score">Очки: {score}</p>
          <span ref={refSpan} className="progress"></span>
        </div>
        <div ref={refChars} className="chars">
          {chars.map((e) => {

            return (
              <span data-remove={e.remove || undefined} key={e.index} style={{ top: e.y + 25, left: e.x + 25 }}>{e.char}</span>
            );
          })}
        </div>
        {stage == GameStage.END && (
          <div className="block">
            <h1>Увы.</h1>
            <h2>Вы проиграли =(</h2>
            <h4>Нажмите Enter чтобы попробовать еще раз.</h4>
          </div>
        )}
      </>
    );
  }
};

render(
  <StrictMode>
    <Game />
  </StrictMode>,
  document.getElementById('root')
);