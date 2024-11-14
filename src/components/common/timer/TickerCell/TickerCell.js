import "./TickerCell.scss";

export const TickerCell = ({ label, value }) => {
  const formattedValue = value < 10 ? `0${value}` : value.toString();

  return (
    <div className="tickerCell">
      <span className="tickerCellValue">{formattedValue}</span>
    </div>
  );
};
