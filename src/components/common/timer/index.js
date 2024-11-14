import styles from "./index.module.scss"
import { TickerCell } from "./TickerCell/TickerCell";
import { useEffect, useState } from "react";

function Timer(props) {
  const { timeInSeconds, onTimeIsUpFunction } = props;
  const timeObject = findTime(timeInSeconds);
  const [now, setNow] = useState(timeObject);
  let isDays = true,
    isHours = true,
    isMinutes = true;
  let firstTime = true;
  const final_time = new Date(Date.now() + timeInSeconds * 1000);
  let interval = null;


  if (firstTime) {
    const timeObject = findTime(timeInSeconds);

    firstTime = false;
    if (timeObject.days === 0) {
      isDays = false;
    }
    if (timeObject.hours === 0 && !isDays) {
      isHours = false;
    }
    if (timeObject.minutes === 0 && !isHours) {
      isMinutes = false;
    }

  }

 
  function findTime(sec) {
    var days = Math.floor(sec / (3600 * 24));
    sec -= days * 3600 * 24;
    var hrs = Math.floor(sec / 3600);
    sec -= hrs * 3600;
    var mnts = Math.floor(sec / 60);
    sec -= mnts * 60;
    return { seconds: Math.floor(sec), minutes: mnts, hours: hrs, days: days };
  }

  function calculateTime() {
    let sec = (final_time.getTime() - Date.now()) / 1000;
    sec++;
    if (sec >= 0) {
      const timeLeft = findTime(sec);
      setNow(timeLeft);
    } else {
      onTimeIsUpFunction();
      clearInterval(interval);
      setNow({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
    }
  }
  useEffect(() => {
    interval = setInterval(calculateTime, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [interval]);

  return (
    <div className="ticker-wrapper">
      {isDays && (
        <>
          <TickerCell value={now.days} />
          <div className="separator">:</div>

        </>
      )}
       {isHours && (
        <>
          <TickerCell value={now.hours} />
          <div className="separator">:</div>

        </>
      )}
       {isMinutes && (
        <>
          <TickerCell value={now.minutes} />
          <div className="separator">:</div>

        </>
      )}
      <TickerCell value={now.seconds} />
     
     
      
    </div>
  );
}

export default Timer;
