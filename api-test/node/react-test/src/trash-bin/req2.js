import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const LectureManagement = () => {
  const [userGrade, setUserGrade] = useState("");
  const [userBunban, setUserBunban] = useState("");
  const [lecClassification, setLecClassification] = useState("");
  const [lectures, setLectures] = useState([]);
  const [selectedLectures, setSelectedLectures] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // 사용자 ID를 쿠키에서 가져오는 함수
    const fetchUserId = () => {
      const cookieUserId = Cookies.get("user_id");
      if (cookieUserId) {
        setUserId(cookieUserId);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    // 유저 정보를 가져와서 상태로 설정하는 함수
    const fetchUserData = async (userId) => {
      try {
        const response = await axios.get("http://localhost:8000/user/data", {
          withCredentials: true,
        });
        const userData = response.data[0];
        console.log("userData", userData);
        setUserGrade(userData.userYear || "");
        setUserBunban(userData.userBunban || "");
        setLecClassification(userData.userMajor || "");
        setSelectedLectures(userData.selectedLecNumbers || []);
      } catch (error) {
        console.error("fetch user data errrr:", error);
        alert(
          error.response?.data?.detail ||
            "유저 정보를 가져오는 중 오류가 발생했어요."
        );
      }
    };

    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const handleSubmit = (event) => {
    event.preventDefault();

    axios
      .post("http://127.0.0.1:8000/lectures", {
        userGrade: userGrade,
        userBunban: userBunban,
        lecClassification: lecClassification,
        withCredentials: true,
      })
      .then((response) => {
        setLectures(response.data);
      })
      .catch((error) => {
        console.error("fetch lec list errrr:", error);
        setLectures([{ lecClassName: "errrrr", lecNumber: error.message }]);
      });
  };

  const handleLectureSelect = async (lecNumber) => {
    if (!userId) {
      alert("로그인이 필요해요.");
      // 리다이렉트 하도록
      return;
    }

    const updatedSelectedLectures = selectedLectures.includes(lecNumber)
      ? selectedLectures.filter((num) => num !== lecNumber)
      : [...selectedLectures, lecNumber];

    setSelectedLectures(updatedSelectedLectures);

    try {
      await axios.post(
        "http://127.0.0.1:8000/user/update_select_lectures",
        {
          lecNumbers: updatedSelectedLectures,
          userId: userId,
        },
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("update select lectures errrr:", error);
      alert("강의 업데이트 중 오류가 발생했어요.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="userGrade">학년:</label>
        <input
          type="number"
          id="userGrade"
          name="userGrade"
          value={userGrade}
          onChange={(e) => setUserGrade(e.target.value)}
          required
        />
        <br />
        <br />

        <label htmlFor="userBunban">분반:</label>
        <input
          type="text"
          id="userBunban"
          name="userBunban"
          value={userBunban}
          onChange={(e) => setUserBunban(e.target.value)}
          required
        />
        <br />
        <br />

        <label htmlFor="lecClassification">전공 분류:</label>
        <input
          type="text"
          id="lecClassification"
          name="lecClassification"
          value={lecClassification}
          onChange={(e) => setLecClassification(e.target.value)}
          required
        />
        <br />
        <br />

        <button type="submit">강의 리스트 불러오기</button>
      </form>

      <div id="result">
        <h1>강의 선택</h1>
        <ul>
          {lectures.map((lecture) => (
            <li key={lecture.lecNumber}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedLectures.includes(lecture.lecNumber)}
                  onChange={() => handleLectureSelect(lecture.lecNumber)}
                />
                {lecture.lecClassName} ({lecture.lecNumber})
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LectureManagement;
