import React, { useState } from "react";
import axios from "axios";
import "./admin.css";

const CallLectureForAdmin = () => {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("1학기");
  const [searchTerm, setSearchTerm] = useState("");
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [lecName, setLecName] = useState("");
  const [lecNumber, setLecNumber] = useState("");
  const [lecProfessor, setLecProfessor] = useState("");
  const [lecTime, setLecTime] = useState("");
  const [isLecClose, setIsLecClose] = useState(false);
  const [percentageOfOnline, setPercentageOfOnline] = useState(false);
  const [canTakeForeignPeople, setCanTakeForeignPeople] = useState(0);
  const [password, setPassword] = useState("");

  const fetchLectureForAdmin = async () => {
    const inputData = {
      year: parseInt(year),
      semester: semester,
      search_term: searchTerm,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin`,
        inputData
      );
      console.log(response.data);
      setLectures(response.data.lectures);
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  const editLecture = async () => {
    if (!selectedLecture) return;

    const updateData = {
      lecName: lecName,
      lecNumber: lecNumber,
      lecProfessor: lecProfessor,
      isLecClose: isLecClose,
      percentageOfOnline: percentageOfOnline,
      canTakeForeignPeople: canTakeForeignPeople,
      password: password,
      year: parseInt(year),
      semester: semester,
    };

    const confirmEdit = window.confirm("수정 전, 한번 더 확인해요");
    if (!confirmEdit) return;

    console.log("year: ", year);
    console.log("typeof", typeof year);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/edit?lecture_id=${selectedLecture.lectureID}`,
        updateData
      );
      console.log(response.data);
      fetchLectureForAdmin();
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  const editLectureTime = async () => {
    if (!selectedLecture) return;

    const confirmEdit = window.confirm("정말정말 수정할 건가요?");
    if (!confirmEdit) return;

    const updateData = {
      lectureID: selectedLecture.lectureID,
      lecTime: lecTime,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/edit/time`,
        updateData
      );
      console.log(response.data);
      fetchLectureForAdmin();
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  return (
    <div>
      <div className="admin-input-box">
        <h4>강의 수정</h4>
        <div className="admin-input-box-item">
          <input
            type="number"
            placeholder="년도 입력"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="admin-input"
          />
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="admin-button-or-select"
          >
            <option value="1학기">1학기</option>
            <option value="여름학기">여름학기</option>
            <option value="2학기">2학기</option>
            <option value="겨울학기">겨울학기</option>
          </select>
        </div>
        <div className="admin-input-box-item">
          <input
            type="text"
            placeholder="교수명/학정번호/강의명 입력"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input"
          />
          <button
            className="admin-button-or-select"
            onClick={fetchLectureForAdmin}
          >
            검색
          </button>
        </div>

        {error && <p>{error.message}</p>}
      </div>
      <div>
        {lectures.map((lecture, index) => (
          <div key={`${lecture.lectureID}-${index}`}>
            <div>
              <p>
                {lecture.lectureID} | {lecture.year}년도 {lecture.semester} |{" "}
                {lecture.lecNumber} | {lecture.lecName} | {lecture.lecProfessor}{" "}
                | {lecture.lecTime}
              </p>
              <button
                onClick={() => {
                  setSelectedLecture(lecture);
                  setLecName(lecture.lecName);
                  setLecProfessor(lecture.lecProfessor);
                  setLecTime(lecture.lecTime);
                  setIsLecClose(lecture.isLecClose);
                  setCanTakeForeignPeople(lecture.canTakeForeignPeople);
                  setLecNumber(lecture.lecNumber);
                }}
              >
                수정
              </button>
            </div>
            {selectedLecture &&
              selectedLecture.lectureID === lecture.lectureID && (
                <div>
                  <p>강의 수정</p>
                  <p>{lecNumber}</p>
                  <input
                    type="text"
                    value={lecName}
                    onChange={(e) => setLecName(e.target.value)}
                  />
                  <input
                    type="text"
                    value={lecProfessor}
                    onChange={(e) => setLecProfessor(e.target.value)}
                  />
                  <label>
                    온라인 비율 (대면: 0 | 비대면: 100)
                    <input
                      type="number"
                      value={percentageOfOnline}
                      onChange={(e) => setPercentageOfOnline(e.target.value)}
                    />
                  </label>
                  <label>
                    전체:0, 외국인유학생만:1, 한국인만:2
                    <input
                      type="number"
                      checked={canTakeForeignPeople}
                      onChange={(e) =>
                        setCanTakeForeignPeople(e.target.checked)
                      }
                    />
                  </label>
                  <label>
                    폐강됐어요...:
                    <input
                      type="checkbox"
                      checked={isLecClose}
                      onChange={(e) => setIsLecClose(e.target.checked)}
                    />
                  </label>
                  <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button onClick={editLecture}>강의 수정하기</button>
                  <p>강의 시간 수정</p>
                  <input
                    type="text"
                    value={lecTime}
                    onChange={(e) => setLecTime(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button onClick={editLectureTime}>시간 수정하기</button>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallLectureForAdmin;
