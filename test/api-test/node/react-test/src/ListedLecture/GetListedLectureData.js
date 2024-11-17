import React, { useState, useEffect } from "react";
import axios from "axios";
import LectureList from "./LectureList";
import Timetable from "./TimeTable";
import SumCredit from "./SumCredit";
import Cookies from "js-cookie";

const GetListedLectureData = () => {
  const [listedLectures, setListedLectures] = useState([]);
  const [checkedLectures, setCheckedLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [priority, setPriority] = useState("1순위");
  const [creditWarning, setCreditWarning] = useState("");
  const [completedLectures, setCompletedLectures] = useState([]);
  const [userId, setUserId] = useState(null);
  const [grades, setGrades] = useState({
    totalGPA: 0,
  });
  const [lectureDay, setLectureDay] = useState("");
  const [startPeriod, setStartPeriod] = useState("");
  const [endPeriod, setEndPeriod] = useState("");

  const [manualLecture, setManualLecture] = useState({
    lecClassName: "",
    lecClassRoom: "",
    lecTime: "",
    year: "",
    semester: "",
  });
  const [showManualLectureForm, setShowManualLectureForm] = useState(false);

  useEffect(() => {
    const fetchUserId = () => {
      const cookieUserId = Cookies.get("user_id");
      if (cookieUserId) {
        setUserId(cookieUserId);
      }
    };

    fetchUserId();
  }, []);

  const fetchGPA = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/user/data/total_gpa",
        {
          withCredentials: true,
        }
      );
      const userData = response.data;

      setGrades({
        totalGPA: userData.totalGPA,
      });
    } catch (error) {
      console.error("errr fetching user gpa", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/user/data/listed_lectures_data",
        {
          withCredentials: true,
        }
      );
      setListedLectures(response.data);
      console.log("resp data", response.data);
      const initialCheckedLectures = response.data.filter((lecture) =>
        lecture.priority.split(", ").includes(priority)
      );
      setCheckedLectures(initialCheckedLectures);
      setLoading(false);
      console.log("initialCheckedLectures", initialCheckedLectures);
    } catch (error) {
      if (error.response && error.response.status === 454) {
        console.log("유저가 아무런 강의도 담지 않았어요");
      } else {
        console.error("Error fetching user data:", error);
      }
      setLoading(false);
    }
  };

  const fetchLatestYearSemester = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/other/now_year_n_semester"
      );
      setYear(response.data.latest_year);
      setSemester(response.data.latest_semester);

      setManualLecture((prev) => ({
        ...prev,
        year: response.data.latest_year,
        semester: response.data.latest_semester,
      }));
    } catch (error) {
      console.error("error fetching latest year and semester", error);
    }
  };

  const handleCheck = async (lecture) => {
    const isChecked = !checkedLectures.includes(lecture);
    const updatedPriority = isChecked
      ? `${lecture.priority}, ${priority}`
          .split(", ")
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(", ")
      : lecture.priority
          .split(", ")
          .filter((p) => p !== priority)
          .join(", ") || "0순위";

    try {
      await axios.post(
        "http://localhost:8000/user/data/update_lecture_priority",
        {
          userListedLecNumber: lecture.userListedLecNumber,
          year: lecture.year,
          semester: lecture.semester,
          priority: updatedPriority,
        },
        { withCredentials: true }
      );

      setCheckedLectures((prev) =>
        isChecked ? [...prev, lecture] : prev.filter((item) => item !== lecture)
      );
      setListedLectures((prev) =>
        prev.map((item) =>
          item.userListedLecNumber === lecture.userListedLecNumber &&
          item.year === lecture.year &&
          item.semester === lecture.semester
            ? { ...item, priority: updatedPriority }
            : item
        )
      );
    } catch (error) {
      console.error("error updating lecture priority", error);
    }
  };

  const fetchCompletedLectures = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/data/user_taken_lectures",
        {},
        {
          withCredentials: true,
        }
      );
      setCompletedLectures(response.data.lectures);
    } catch (error) {
      console.error("Error fetching completed lectures:", error);
    }
  };

  const handleManualLectureChange = (e) => {
    const { name, value } = e.target;
    setManualLecture((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddManualLecture = async () => {
    const dayMap = {
      월요일: 1,
      화요일: 2,
      수요일: 3,
      목요일: 4,
      금요일: 5,
      토요일: 6,
      일요일: 7,
    };

    const dayNumber = dayMap[lectureDay];
    let lecTimeString = "";

    for (let i = parseInt(startPeriod); i <= parseInt(endPeriod); i++) {
      if (lecTimeString) lecTimeString += ",";
      lecTimeString += `(${dayNumber}:${i})`;
    }

    setManualLecture((prev) => {
      const updatedLecture = {
        ...prev,
        lecTime: lecTimeString,
      };

      console.log(updatedLecture);
      return updatedLecture;
    });

    try {
      await axios.post(
        "http://localhost:8000/user/update_manually_add_lecture",
        {
          userId: userId,
          lecNumbers: [],
          manualLectures: [
            {
              lecClassName: manualLecture.lecClassName,
              lecClassRoom: manualLecture.lecClassRoom,
              lecTime: lecTimeString,
              year: manualLecture.year,
              semester: manualLecture.semester,
            },
          ],
        },
        { withCredentials: true }
      );
      fetchCompletedLectures();
    } catch (error) {
      console.error("error adding manual lecture", error);
    }
  };

  useEffect(() => {
    fetchCompletedLectures();
  }, []);

  const handleDelete = async (lecture) => {
    try {
      await axios.post(
        "http://localhost:8000/user/data/delete_lecture",
        {
          userListedLecNumber: lecture.userListedLecNumber,
          year: lecture.year,
          semester: lecture.semester,
        },
        { withCredentials: true }
      );

      setListedLectures((prev) => prev.filter((item) => item !== lecture));
      setCheckedLectures((prev) => prev.filter((item) => item !== lecture));
    } catch (error) {
      console.error("error deleting lecture", error);
    }
  };

  useEffect(() => {
    fetchLatestYearSemester();
    fetchUserData();
    fetchGPA();
  }, []);

  useEffect(() => {
    const updatedCheckedLectures = listedLectures.filter((lecture) =>
      lecture.priority.split(", ").includes(priority)
    );
    setCheckedLectures(updatedCheckedLectures);
    console.log(updatedCheckedLectures);
  }, [listedLectures, priority]);

  const filteredLectures = listedLectures.filter(
    (lecture) =>
      (!year || lecture.year === parseInt(year)) &&
      (!semester || lecture.semester === semester)
  );
  const filteredCheckedLectures = checkedLectures.filter(
    (lecture) =>
      (!year || lecture.year === parseInt(year)) &&
      (!semester || lecture.semester === semester)
  );

  const checkedCredits = filteredCheckedLectures.reduce(
    (sum, lecture) => sum + lecture.lecCredit,
    0
  );

  const hasBeKwangWoonYin = checkedLectures.some(
    (lecture) => lecture.userListedLecName === "광운인되기"
  );

  useEffect(() => {
    if (grades.totalGPA < 3.5) {
      if (checkedCredits > (hasBeKwangWoonYin ? 20 : 19)) {
        setCreditWarning(
          `최대 ${hasBeKwangWoonYin ? 20 : 19}학점까지 들을 수 있어요.`
        );
      } else {
        setCreditWarning("");
      }
    } else if (grades.totalGPA >= 3.5) {
      if (checkedCredits > (hasBeKwangWoonYin ? 23 : 22)) {
        setCreditWarning(
          `최대 ${hasBeKwangWoonYin ? 23 : 22}학점까지 들을 수 있어요.`
        );
      } else {
        setCreditWarning("");
      }
    } else {
      setCreditWarning("");
    }
  }, [checkedCredits, grades.totalGPA, hasBeKwangWoonYin]);

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>error fetching data</div>;
  }

  return (
    <div>
      <SumCredit
        listedLectures={filteredLectures}
        checkedLectures={checkedLectures}
        year={year}
        semester={semester}
      />
      {creditWarning && <div>{creditWarning}</div>}

      <div>
        <label>
          Year:
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select Year</option>
            {Array.from(
              new Set(listedLectures.map((lecture) => lecture.year))
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          Semester:
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">Select Semester</option>
            {Array.from(
              new Set(listedLectures.map((lecture) => lecture.semester))
            ).map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority:
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="1순위">1순위</option>
            <option value="2순위">2순위</option>
            <option value="3순위">3순위</option>
          </select>
        </label>
      </div>
      <div>
        <button onClick={() => setShowManualLectureForm((prev) => !prev)}>
          수동 추가
        </button>
        {showManualLectureForm && (
          <div>
            <input
              type="text"
              name="lecClassName"
              placeholder="강의명"
              value={manualLecture.lecClassName}
              onChange={handleManualLectureChange}
            />
            <input
              type="text"
              name="lecClassRoom"
              placeholder="강의실"
              value={manualLecture.lecClassRoom}
              onChange={handleManualLectureChange}
            />

            <select
              name="lectureDay"
              value={lectureDay}
              onChange={(e) => setLectureDay(e.target.value)}
            >
              <option value="">요일 선택</option>
              <option value="월요일">월요일</option>
              <option value="화요일">화요일</option>
              <option value="수요일">수요일</option>
              <option value="목요일">목요일</option>
              <option value="금요일">금요일</option>
              <option value="토요일">토요일</option>
              <option value="일요일">일요일</option>
            </select>

            <select
              name="startPeriod"
              value={startPeriod}
              onChange={(e) => setStartPeriod(e.target.value)}
            >
              <option value="">시작 교시</option>
              {[...Array(10).keys()].map((period) => (
                <option key={period} value={period}>
                  {period}교시
                </option>
              ))}
            </select>

            <select
              name="endPeriod"
              value={endPeriod}
              onChange={(e) => setEndPeriod(e.target.value)}
            >
              <option value="">끝 교시</option>
              {[...Array(10).keys()].map((period) => (
                <option key={period} value={period}>
                  {period}교시
                </option>
              ))}
            </select>

            <input
              type="number"
              name="year"
              placeholder="년도"
              value={manualLecture.year}
              onChange={handleManualLectureChange}
            />
            <select
              name="semester"
              value={manualLecture.semester}
              onChange={handleManualLectureChange}
            >
              <option value="1학기">1학기</option>
              <option value="여름학기">여름학기</option>
              <option value="2학기">2학기</option>
              <option value="겨울학기">겨울학기</option>
            </select>

            <button onClick={handleAddManualLecture}>추가</button>
          </div>
        )}
      </div>
      <LectureList
        lectures={filteredLectures}
        checkedLectures={checkedLectures}
        handleCheck={handleCheck}
        handleDelete={handleDelete}
        setListedLectures={(updatedLectures) => {
          setListedLectures(updatedLectures);
          fetchUserData();
        }}
        completedLectures={completedLectures}
        setCompletedLectures={setCompletedLectures}
      />
      <Timetable
        checkedLectures={checkedLectures}
        year={year}
        semester={semester}
        handleCheck={handleCheck}
        setListedLectures={setListedLectures}
        completedLectures={completedLectures}
        setCompletedLectures={setCompletedLectures}
      />
    </div>
  );
};

export default GetListedLectureData;
