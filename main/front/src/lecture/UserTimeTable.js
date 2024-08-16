
import React, { useState, useEffect } from 'react';
import './InteractiveTimetable.css';

const UserTimeTable = ({ coordinates, setCoordinates }) => {
  const days = ['월', '화', '수', '목', '금'];
  const periods = Array.from({length: 6}, (_, i) => i + 1);
  const [selectedCells, setSelectedCells] = useState({});


  const handleCellClick = (day, period) => {
    const key = `${day}:${period}`;
    const dayIndex = days.indexOf(day) + 1;
    const coordinate = `(${dayIndex}:${period})`;
  
    setSelectedCells(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  
    setCoordinates(prev => {
      if (prev.includes(coordinate)) {
        return prev.filter(coord => coord !== coordinate);
      } else {
        return [...prev, coordinate];
      }
    });
  };
  // 중복 제거 
  const uniqueCoordinates = [...new Set(coordinates)].slice(0);

  return (
    <div className="timetable-container">
      <table className="timetable">
        <thead>
          <tr>
            <th></th>
            {days.map(day => <th key={day}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {periods.map(period => (
            <tr key={period}>
              <th>{period}교시</th>
              {days.map(day => {
                const key = `${day}:${period}`;
                return (
                  <td
                    key={key}
                    className={selectedCells[key] ? 'selected' : ''}
                    onClick={() => handleCellClick(day, period)}
                  >                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="coordinate-list">
        <h3>선택된 좌표:</h3>
        <ul>
          {uniqueCoordinates.map((coord, index) => (
            <li key={index}>{coord}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};


export default UserTimeTable;