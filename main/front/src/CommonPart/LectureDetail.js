import React from 'react';
import './LectureDetail.css';

const LectureDetail = () => {
  return (
    <div className="lecture-detail">
      <div className="lecture-main">
        <div className="lecture-left">
          <div className="lecture-title">텍스트마이닝</div>
          <div className="lecture-code">1040-3-4159-01</div>
          <div className="lecture-department">정보통계학부</div>
        </div>
        <div className="lecture-right">
          <div>담당교수</div>
          <div>이수구분</div>
          <div>전선</div>
        </div>
      </div>
    </div>
  );
};

export default LectureDetail;