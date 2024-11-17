import React, { useState } from "react";
import "./Recommendation.css";

const Recommendation = ({
  fetchRecommendLectures,
  userPrefer,
  setUserPrefer,
}) => {
  const placeholders = [
    "통계에 기반한 인공지능 수업",
    "실존주의에 기반한 철학 수업",
    "웹 설계부터 배포까지 배울 수 있는 수업",
  ];

  const randomPlaceholder =
    placeholders[Math.floor(Math.random() * placeholders.length)];

  return (
    <div className="recommendation-search-box">
      <div className="recommendation-text-area-box">
        <textarea
          value={userPrefer}
          onChange={(e) => setUserPrefer(e.target.value)}
          placeholder={randomPlaceholder}
          className="recommendation-text-area"
        />
      </div>
      <div className="recommendation-search-button-box">
        <button
          onClick={fetchRecommendLectures}
          className="recommendation-search-button"
        >
          강의 검색
        </button>
      </div>
    </div>
  );
};

export default Recommendation;
