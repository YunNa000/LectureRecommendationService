import React from "react";

const GyoYangLectureSearch = ({
  lecClassification,
  isPillSu,
  setIsPillSu,
  lecTheme,
  setLecTheme,
  teamplayAmount,
  setTeamplayAmount,
  gradeAmount,
  setGradeAmount,
  assignmentAmount,
  setAssignmentAmount,
  fetchLectures,
  star,
  setStar,
  lectureName,
  setLectureName,
  lecCredit,
  setLecCredit,
}) => {
  return (
    <div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={isPillSu}
            onChange={(e) => setIsPillSu(e.target.checked)}
          />
          필수 과목만 보기
        </label>
      </div>

      {lecClassification === "교양" && !isPillSu && (
        <div>
          <label>주제:</label>
          <select
            value={lecTheme}
            onChange={(e) => setLecTheme(e.target.value)}
          >
            <option value="">전체</option>
            <option value="과학과기술">과학과기술</option>
            <option value="인간과철학">인간과철학</option>
            <option value="사회와경제">사회와경제</option>
            <option value="글로벌문화와제2외국어">글로벌문화와제2외국어</option>
            <option value="예술과체육">예술과체육</option>
            <option value="수리와자연">수리와자연</option>
          </select>
        </div>
      )}

      {lecClassification === "교양" && isPillSu && (
        <div>
          <label>주제:</label>
          <select
            value={lecTheme}
            onChange={(e) => setLecTheme(e.target.value)}
          >
            <option value="">전체</option>
            <option value="광운인되기">광운인되기</option>
            <option value="대학영어">대학영어</option>
            <option value="정보">정보</option>
            <option value="융합적사고와글쓰기">융합적사고와글쓰기</option>
          </select>
        </div>
      )}

      <div>
        <label>별점</label>
        <select value={star} onChange={(e) => setStar(e.target.value)}>
          <option value={0}>상관없음</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>
      <div>
        <label>팀플 양:</label>
        <select
          value={teamplayAmount}
          onChange={(e) => setTeamplayAmount(e.target.value)}
        >
          <option value="상관없음">상관없음</option>
          <option value="적음">적음</option>
        </select>
      </div>

      <div>
        <label>성적 양:</label>
        <select
          value={gradeAmount}
          onChange={(e) => setGradeAmount(e.target.value)}
        >
          <option value="상관없음">상관없음</option>
          <option value="너그러움">너그러움</option>
        </select>
      </div>

      <div>
        <label>과제 양:</label>
        <select
          value={assignmentAmount}
          onChange={(e) => setAssignmentAmount(e.target.value)}
        >
          <option value="상관없음">상관없음</option>
          <option value="적음">적음</option>
        </select>
      </div>
      <div>
        <label>학점</label>
        <select
          value={lecCredit}
          onChange={(e) => setLecCredit(e.target.value)}
        >
          <option value={0}>상관없음</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4 이상</option>
        </select>
      </div>
      <hr />
      <div>
        <label>강의명</label>
        <input
          value={lectureName}
          onChange={(e) => setLectureName(e.target.value)}
        />
      </div>
      <button onClick={fetchLectures}>강의 검색</button>
    </div>
  );
};

export default GyoYangLectureSearch;
