import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AddListedLectureManually.css";

const AddListedLectureManaully = ({ user, fetchLectures }) => {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [classroom, setClassroom] = useState("");
  const [memo, setMemo] = useState("");
  const [lecName, setLecName] = useState("");
  const [lecTime, setLecTime] = useState("");
  const [lecCredit, setLecCredit] = useState("");
  const [lecClassification, setLecClassification] = useState("");
  const [day, setDay] = useState("");
  const [startPeriod, setStartPeriod] = useState("");
  const [endPeriod, setEndPeriod] = useState("");
  const [error, setError] = useState(null);

  const fetchYearAndSemester = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/get_year_n_semester"
      );
      const { year: fetchedYear, semester: fetchedSemester } =
        response.data.year_n_semester;
      setYear(fetchedYear);
      setSemester(fetchedSemester);
    } catch (err) {
      console.error("errr fetching year and semester", err);
    }
  };

  const calculateLectime = (day, startPeriod, endPeriod) => {
    if (
      day !== null &&
      startPeriod !== null &&
      endPeriod !== null &&
      startPeriod <= endPeriod
    ) {
      const lecTimes = [];
      for (let period = startPeriod; period <= endPeriod; period++) {
        lecTimes.push(`(${day}:${period})`);
      }
      setLecTime(lecTimes.join(","));
      console.log(lecTimes.join(","));
    }
    return "";
  };
  useEffect(() => {
    calculateLectime(day, startPeriod, endPeriod);
  }, [day, startPeriod, endPeriod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await axios.post(
        "http://localhost:8000/user/add_user_listed_lecture_manually",
        {
          user_id: user,
          year: parseInt(year),
          semester: semester,
          classroom: classroom,
          memo: memo,
          lecName: lecName,
          lecTime: lecTime,
          lecCredit: lecCredit,
          lecClassification: lecClassification,
        }
      );
      fetchLectures(user);
      setYear("");
      setSemester("");
      setClassroom("");
      setMemo("");
      setLecName("");
      setLecTime("");
      setLecCredit("");
      setLecClassification("");
      setDay("");
      setStartPeriod("");
      setEndPeriod("");
    } catch (err) {
      setError(
        err.response.data.detail || "강의 수동 추가 중 오류가 발생했어요."
      );
    }
  };

  useEffect(() => {
    fetchYearAndSemester();
  }, []);

  return (
    <div className="manuallyAdd">
      <form onSubmit={handleSubmit}>
        <div className="yearNsemester">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            hidden
          />
          <select
            className="semester"
            type="text"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            required
            hidden
          >
            <option value="1학기">1학기</option>
            <option value="여름학기">여름학기</option>
            <option value="2학기">2학기</option>
            <option value="겨울학기">겨울학기</option>
          </select>
        </div>
        <div className="manuallyAdd-lecInfoBox">
          <label className="manuallyAdd-lecInfo">
            강의명
            <input
              className="manually-lecName"
              type="text"
              value={lecName}
              onChange={(e) => setLecName(e.target.value)}
              required
              placeholder="필수"
            />
          </label>
          <div className="classroomNmemo">
            <label className="manuallyAdd-lecInfo">
              강의실:
              <input
                className="manually-classroom"
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
              />
            </label>
            <label className="manuallyAdd-lecInfo">
              강의 메모:
              <input
                className="manually-memo"
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </label>
          </div>
          <div className="roomNtime">
            <div className="manuallyCreditNclassification">
              <label className="manuallyAdd-lecInfo">
                학점:
                <select
                  className="manually-credit"
                  type="number"
                  value={lecCredit}
                  onChange={(e) => setLecCredit(e.target.value)}
                >
                  <option value={null}>없음</option>
                  <option value={1}>1학점</option>
                  <option value={2}>2학점</option>
                  <option value={3}>3학점</option>
                  <option value={4}>4학점</option>
                  <option value={5}>5학점</option>
                  <option value={6}>6학점</option>
                </select>
              </label>
              <label className="manuallyAdd-lecInfo">
                이수:
                <select
                  className="manually-classification"
                  type="text"
                  value={lecClassification}
                  onChange={(e) => setLecClassification(e.target.value)}
                >
                  <option value={null}>없음</option>
                  <option value="전선">전공</option>
                  <option value="교선">교양</option>
                  <option value="일선">일반</option>
                  <option value="기타">기타</option>
                </select>
              </label>
            </div>

            <label className="manuallyAdd-lecInfo">
              강의 시간
              <br />
              <select
                className="manually-day"
                type="number"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              >
                <option value={null}>없음</option>
                <option value={1}>월요일</option>
                <option value={2}>화요일</option>
                <option value={3}>수요일</option>
                <option value={4}>목요일</option>
                <option value={5}>금요일</option>
                <option value={6}>토요일</option>
                <option value={7}>일요일</option>
              </select>
              <div className="manually-period">
                <select
                  className="manually-startPeriod"
                  type="number"
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                >
                  <option value={null}>없음</option>
                  <option value={1}>1교시</option>
                  <option value={2}>2교시</option>
                  <option value={3}>3교시</option>
                  <option value={4}>4교시</option>
                  <option value={5}>5교시</option>
                  <option value={6}>6교시</option>
                  <option value={7}>7교시</option>
                  <option value={8}>8교시</option>
                  <option value={9}>9교시</option>
                </select>
                ~
                <select
                  className="manually-endPeriod"
                  type="number"
                  value={endPeriod}
                  onChange={(e) => setEndPeriod(e.target.value)}
                >
                  <option value={null}>없음</option>
                  <option value={1}>1교시</option>
                  <option value={2}>2교시</option>
                  <option value={3}>3교시</option>
                  <option value={4}>4교시</option>
                  <option value={5}>5교시</option>
                  <option value={6}>6교시</option>
                  <option value={7}>7교시</option>
                  <option value={8}>8교시</option>
                  <option value={9}>9교시</option>
                </select>
              </div>
            </label>
          </div>
        </div>
        <button className="manually-addButton" type="submit">
          강의 추가
        </button>
      </form>
      {error && <div>{error}</div>}
    </div>
  );
};

export default AddListedLectureManaully;
