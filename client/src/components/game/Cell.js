import React from "react";

export default function Cell({ playerSymbol, borderTop, borderLeft, borderBottom, borderRight, children, rowIndex, colIndex, onUpdateGameMatrix }) {
    const borderStyle = "3px solid #8e44ad";
    const styles = `
        cell ${borderTop ? "borderTop" : ""} ${borderLeft ? "borderLeft" : ""} ${borderBottom ? "borderBottom" : ""} ${borderRight ? "borderRight" : ""}
    `;

    return (
        <div onClick={() => onUpdateGameMatrix(rowIndex, colIndex)} className={styles}>
            {children ? children : <span className="cellHover">{playerSymbol.toUpperCase()}</span>}
        </div>
    );
}
