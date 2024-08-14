import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Tesseract from "tesseract.js";

const UpdateTakenLecture = () => {
  const [user, setUser] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [lecName, setLecName] = useState("");
  const [classification, setClassification] = useState("");
  const [lecCredit, setLecCredit] = useState(0);
  const [userCredit, setUserCredit] = useState("");
  const [images, setImages] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);

  const checkLoginStatus = async () => {
    const userId = Cookies.get("user_id");
    try {
      if (userId) {
        const response = await fetch("http://localhost:8000/", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok && data.user_id) {
          setUser(data.user_id);
          getTakenLecture(data.user_id);
        } else {
          window.location.href = "http://127.0.0.1:3000/login";
        }
      } else {
        window.location.href = "http://127.0.0.1:3000/login";
      }
    } catch (err) {
      console.error("Login.js - checkLoginStatus", err);
    }
  };

  const getTakenLecture = async (user) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/get_taken_lectures",
        { user_id: user },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setLectures(response.data.taken_lectures);
      }
    } catch (error) {
      console.error("Error fetching lectures:", error);
    }
  };

  const handleAddLecture = async () => {
    const inputData = {
      user_id: user,
      lecName,
      Classification: classification,
      lecCredit,
      userCredit,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/user/add_taken_lecture_manually",
        inputData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setLecName("");
        setClassification("");
        setLecCredit(0);
        setUserCredit("");
        getTakenLecture(user);
      }
    } catch (error) {
      console.error("Error adding lecture:", error);
    }
  };

  const handleDeleteLecture = async (lecture) => {
    const inputData = {
      user_id: user,
      lecName: lecture.lecName,
      Classification: lecture.Classification,
      lecCredit: lecture.lecCredit,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/user/delete_taken_lecture",
        inputData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        getTakenLecture(user);
      }
    } catch (error) {
      console.error("Error deleting lecture:", error);
    }
  };

  const handleUpdateLectures = async () => {
    try {
      const responses = await Promise.all(
        lectures.map(async (lecture) => {
          const inputData = {
            user_id: user,
            lecName: lecture.lecName,
            Classification: lecture.Classification,
            lecCredit: lecture.lecCredit,
            userCredit: lecture.userCredit,
          };

          return axios.post(
            "http://localhost:8000/user/update_taken_lecture",
            inputData,
            {
              withCredentials: true,
            }
          );
        })
      );

      if (responses.every((response) => response.status === 200)) {
        getTakenLecture(user);
      }
    } catch (error) {
      console.error("Error updating lectures:", error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const performOCR = async () => {
    const results = [];

    for (const image of images) {
      const result = await Tesseract.recognize(
        URL.createObjectURL(image),
        "kor",
        {
          logger: (m) => console.log(m),
        }
      );
      results.push(result.data.text);
      console.log("result.data.text: ", result.data.text);
    }

    setOcrResults(results);

    getLectureDataByOCR(results);
  };

  const getLectureDataByOCR = async (ocrResults) => {
    try {
      const userId = Cookies.get("user_id");
      const response = await axios.post(
        "http://localhost:8000/ocr",
        {
          ocrResults,
          user_id: userId,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        console.log("response status 200");
        getTakenLecture(user);
      }
    } catch (error) {
      console.error("err fetching /ocr", error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <div>
      <div>
        <input type="file" multiple onChange={handleImageChange} />
        <button onClick={performOCR}>OCR</button>
      </div>
      <p>수강한 강의</p>
      <div>
        {Object.entries(
          lectures.reduce((acc, lecture) => {
            const year = lecture.year || "수동 추가";
            const semester = lecture.semester || "";
            const key = year + (semester ? ` - ${semester}` : "");

            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(lecture);

            return acc;
          }, {})
        ).map(([key, group], index) => (
          <div key={index}>
            <h3>{key}</h3>
            {group.map((lecture, idx) => (
              <div key={idx}>
                <p>{lecture.lecName || ""}</p>
                <select
                  value={lecture.Classification || ""}
                  onChange={(e) => {
                    const updatedLectures = [...lectures];
                    updatedLectures[index].Classification = e.target.value;
                    setLectures(updatedLectures);
                    handleUpdateLectures();
                  }}
                >
                  <option value="">분류 선택</option>
                  <option value="전필">전필</option>
                  <option value="전선">전선</option>
                  <option value="교필">교필</option>
                  <option value="교선">교선</option>
                  <option value="일선">일선</option>
                  <option value="기타">기타</option>
                </select>
                <select
                  type="number"
                  value={lecture.lecCredit || 0}
                  onChange={(e) => {
                    const updatedLectures = [...lectures];
                    updatedLectures[index].lecCredit = +e.target.value;
                    setLectures(updatedLectures);
                    handleUpdateLectures();
                  }}
                >
                  <option value="">학점 선택</option>
                  <option value={0}>0학점</option>
                  <option value={1}>1학점</option>
                  <option value={2}>2학점</option>
                  <option value={3}>3학점</option>
                  <option value={4}>4학점</option>
                </select>
                <select
                  type="text"
                  value={lecture.userCredit || ""}
                  placeholder="받은 점수"
                  onChange={(e) => {
                    const updatedLectures = [...lectures];
                    updatedLectures[index].userCredit = e.target.value;
                    setLectures(updatedLectures);
                    handleUpdateLectures();
                  }}
                >
                  <option value="">받은 점수</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B+">B+</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="F">F</option>
                  <option value="P">P</option>
                  <option value="NP">NP</option>
                </select>
                <button onClick={() => handleDeleteLecture(lecture)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <h2>강의 추가</h2>
      <input
        type="text"
        placeholder="강의명"
        value={lecName}
        onChange={(e) => setLecName(e.target.value)}
      />
      <select
        value={classification || ""}
        onChange={(e) => setClassification(e.target.value)}
      >
        <option value="">분류 선택</option>
        <option value="전필">전필</option>
        <option value="전선">전선</option>
        <option value="교필">교필</option>
        <option value="교선">교선</option>
        <option value="일선">일선</option>
        <option value="기타">기타</option>
      </select>
      <select
        type="number"
        placeholder="학점"
        value={lecCredit || ""}
        onChange={(e) => setLecCredit(e.target.value)}
      >
        <option value="">학점 선택</option>
        <option value={0}>0학점</option>
        <option value={1}>1학점</option>
        <option value={2}>2학점</option>
        <option value={3}>3학점</option>
        <option value={4}>4학점</option>
      </select>
      <select
        type="text"
        placeholder="받은 점수"
        value={userCredit}
        onChange={(e) => setUserCredit(e.target.value)}
      >
        <option value="">받은 점수</option>
        <option value="A+">A+</option>
        <option value="A">A</option>
        <option value="B+">B+</option>
        <option value="B">B</option>
        <option value="B+">B+</option>
        <option value="C+">C+</option>
        <option value="C">C</option>
        <option value="F">F</option>
        <option value="P">P</option>
        <option value="NP">NP</option>
      </select>
      <button onClick={handleAddLecture}>강의 추가</button>
    </div>
  );
};

export default UpdateTakenLecture;
