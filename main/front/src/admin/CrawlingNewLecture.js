import React, { useEffect, useState } from "react";
import axios from "axios";

const CrawlingNewLecture = () => {
  const [lecNumber, setLecNumber] = useState("");
  const [lecName, setLecName] = useState("");
  const [year, setYear] = useState(24);
  const [semester, setSemester] = useState("1학기");
  const [loading, setLoading] = useState(false);
  const [lectureData, setLectureData] = useState(null);
  const [password, setPassword] = useState("");

  const reqtoWorkCrawling = async () => {
    const inputData = {
      lecNumber: lecNumber,
      lecName: lecName,
      year: year,
      semester: semester,
      password: password,
    };

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/get_data`,
        inputData
      );
      console.log(response.data);
      setLectureData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearAndSemester = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/get_year_n_semester`
      );
      const { year: fetchedYear, semester: fetchedSemester } =
        response.data.year_n_semester;
      setYear(fetchedYear);
      setSemester(fetchedSemester);
    } catch (err) {
      console.error("Error fetching year and semester", err);
    }
  };

  useEffect(() => {
    fetchYearAndSemester();
  }, []);

  return (
    <div>
      <input
        type="text"
        placeholder="강의명"
        value={lecName}
        onChange={(e) => setLecName(e.target.value)}
      />
      <input
        type="text"
        placeholder="학정번호"
        value={lecNumber}
        onChange={(e) => setLecNumber(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호 입력"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {loading ? (
        <p>로딩중...</p>
      ) : (
        <button onClick={reqtoWorkCrawling}>req</button>
      )}

      {lectureData && (
        <div>
          <h3>강의 정보:</h3>
          <p>{lectureData.get_year}</p>
          <p>{lectureData.get_semester}</p>
          <p>이수구분: {lectureData.lecClassification}</p>
          <p>교수명: {lectureData.lecProfessor}</p>
          <p>강의 시간: {lectureData.lecTime}</p>
          <p>학점: {lectureData.lecCredit}</p>
          <p>강의실: {lectureData.lecClassroom}</p>
          <p>대표 역량: {lectureData.representCompetency}</p>
          <p>overview: {lectureData.overview}</p>
          <p>주 교재: {lectureData.main_book}</p>
          <p>평가 비율: {lectureData.evaluationRatio}</p>
        </div>
      )}
    </div>
  );
};

export default CrawlingNewLecture;
