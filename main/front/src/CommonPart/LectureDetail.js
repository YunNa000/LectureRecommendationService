import React, { useState, useEffect } from 'react';
import axios from 'axios';


function LectureDetail({year, semester, lectureNumber }) {
    const [lectureName, setLectureName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchLecture = async () => {
        if (!lectureNumber || !year || !semester) return;
        
        console.log('Fetching lecture:', year, semester, lectureNumber);
        
        try {
          setLoading(true);
          const url = `http://localhost:8000/lecture/${year}/${semester}/${lectureNumber}`;
          console.log('Fetching from URL:', url);
          
          const response = await axios.get(url);
          console.log('Received response:', response.data);
          
          setLectureName(response.data.lecName);
          setError(null);
        } catch (err) {
          console.error('API 호출 중 오류 발생:', err);
          setError(err.response?.data?.detail || '강의 정보를 불러오는 데 실패했습니다.');
          setLectureName('');
        } finally {
          setLoading(false);
        }
      };
  
      fetchLecture();
    }, [year, semester, lectureNumber]);
    
    console.log('Current state:', { lectureName, loading, error });

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러: {error}</div>;
    if (!lectureName) return <div>강의 정보가 없습니다.</div>;


    const ReviewCard = () => {
      // 실제 데이터를 받아오기 전까지 사용할 임시 데이터
      const review = {
        title: "텍스트마이닝",
        code: "1040-3-4339-01",
        department: "정보통계학과",
        professor: "조민수 진달래",
        location: "강의시간/강의실: 월 5,3시 (정봉107), 수 4교시 (정B107)",
        type: "에브리타임 리뷰 유형",
        content: "수강을 원하신 분들은입니다만, 원생들을 향한 섬세함을 마치 다, 비문입니다만 다소 어려울 수 있어요~",
        rating: 4.38,
        metrics: {
          강의: 90,
          꿀강: 70,
          배움: 80
        }
      };
    
      return (
        <div className="review-card">
          <div className="review-header">
            <h2 className="review-title">{review.title}</h2>
            <p className="review-code">{review.code}</p>
          </div>
          
          <div className="review-info">
            <p className="review-department">{review.department}</p>
            <p className="review-professor">{review.professor}</p>
          </div>
          
          <div className="review-details">
            <p className="review-location">{review.location}</p>
            <p className="review-type">{review.type}</p>
          </div>
          
          <div className="review-content">
            <p>{review.content}</p>
          </div>
          

          
          <div className="review-metrics">
            {Object.entries(review.metrics).map(([metric, value]) => (
              <div key={metric} className="metric">
                <span className="metric-label">{metric}</span>
                <div 
                  className="metric-bar" 
                  style={{'--percentage': `${value}%`}}
                />
              </div>
            ))}
          </div>
          
          <button className="more-reviews-button">에브리타임에서 더 보기</button>
        </div>
      );
    };
    
    // return (
    //   <div className="lecture-details">
    //     <p><strong>강의명:</strong> {lectureName}</p>
    //     <div>
    //       <h3>텍스트마이닝</h3>
    //       <p>I040-3-4139-01</p>
    //     </div>
    //   </div>
    // );
}

export default LectureDetail;