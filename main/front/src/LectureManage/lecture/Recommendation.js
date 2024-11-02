import React, { useState } from "react";
import "./GyoYangLectureSearch.css";

const Recommendation = ({
  fetchRecommendLectures,
  dontWantFirstPeriod,
  setDontWantFirstPeriod,
  dontWantThirdPeriod,
  setDontWantThirdPeriod,
  wantLowAssignment,
  setWantLowAssignment,
  wantLowTeamplay,
  setWantLowTeamplay,
  wantLectureMethod,
  setWantLectureMethod,
  wantEvaluateMethod,
  setWantEvaluateMethod,
}) => {
  return (
    <div className="gyoyang-search-box">
      강의추천들어왔어요
      <label>
        <input
          type="checkbox"
          checked={dontWantFirstPeriod}
          onChange={(e) => setDontWantFirstPeriod(e.target.checked)}
        />
        0교시, 1교시는 자제해주세요.
      </label>
      <label>
        <input
          type="checkbox"
          checked={dontWantThirdPeriod}
          onChange={(e) => setDontWantThirdPeriod(e.target.checked)}
        />
        점심시간은 비웠으면 해요.
      </label>
      <label>
        <input
          type="checkbox"
          checked={wantLowAssignment}
          onChange={(e) => setWantLowAssignment(e.target.checked)}
        />
        과제가 적었으면 해요.
      </label>
      <label>
        <input
          type="checkbox"
          checked={wantLowTeamplay}
          onChange={(e) => setWantLowTeamplay(e.target.checked)}
        />
        팀플이 적었으면 해요.
      </label>
      <div>
        <select
          value={wantLectureMethod}
          onChange={(e) => setWantLectureMethod(e.target.value)}
          className="gyoyang-search-classification-select"
        >
          <option value="">상관 없어요.</option>
          <option value="강의">강의식 수업</option>
          <option value="토론">토론식 수업</option>
          <option value="실습">실습 수업</option>
        </select>
      </div>
      <div>
        <select
          value={wantEvaluateMethod}
          onChange={(e) => setWantEvaluateMethod(e.target.value)}
          className="gyoyang-search-classification-select"
        >
          <option value="">상관 없어요.</option>
          <option value="시험">시험</option>
          <option value="프로젝트">프로젝트</option>
          <option value="발표">발표</option>
        </select>
      </div>
      <div className="gyoyang-search-button-box">
        <button
          onClick={fetchRecommendLectures}
          className="gyoyang-search-button"
        >
          강의 검색
        </button>
      </div>
    </div>
  );
};

export default Recommendation;
