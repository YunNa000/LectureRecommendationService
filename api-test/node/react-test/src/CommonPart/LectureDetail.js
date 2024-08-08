import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LectureDetails({ lectureNumber }) {
    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchLecture = async () => {
        if (!lectureNumber) return;
        
        try {
          setLoading(true);
          // API 호출 URL 수정
          const response = await axios.get(`http://localhost:8000/lecture/${lectureNumber}`);
          setLecture(response.data);
          setError(null);
        } catch (err) {
          console.error('API 호출 중 오류 발생:', err);
          setError(err.response?.data?.detail || '강의 정보를 불러오는 데 실패했습니다.');
          setLecture(null);
        } finally {
          setLoading(false);
        }
      };
  
      fetchLecture();
    }, [lectureNumber]);
  
    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러: {error}</div>;
    if (!lecture) return <div>강의 정보가 없습니다.</div>;
  
    return (
      <div className="lecture-details">
        <h2>{lecture.lecClassName}</h2>
        <p><strong>강의 번호:</strong> {lecture.lecNumber}</p>
        <p><strong>교수:</strong> {lecture.lecProfessor}</p>
        <p><strong>학점:</strong> {lecture.lecCredit}</p>
        <p><strong>시간:</strong> {lecture.lecTime}</p>
        <p><strong>강의실:</strong> {lecture.lecClassRoom}</p>
        <p><strong>평점:</strong> {lecture.lecStars}</p>
        <p><strong>과제량:</strong> {lecture.lecAssignment}</p>
        <p><strong>팀플레이:</strong> {lecture.lecTeamplay}</p>
        <p><strong>학점:</strong> {lecture.lecGrade}</p>
        <p><strong>요약 리뷰:</strong> {lecture.lecSummaryReview}</p>
        <p><strong>렉처오버뷰:</strong> {lecture.lecOverview}</p>        {/* 나머지 강의 정보 표시 */}
      </div>
    );
}

export default LectureDetails;