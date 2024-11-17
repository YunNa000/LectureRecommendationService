import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateUserForm = () => {
  const [images, setImages] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    userHakbun: 0,
    userIsForeign: false,
    userBunban: "",
    userYear: 0,
    userMajor: "",
    userIsMultipleMajor: false,
    userWhatMultipleMajor: "",
    userTakenLectures: [],
    userName: "",
    selectedLecNumbers: [],
    userCredit: null,
    userTotalGPA: 0,
    userJunGPA: 0,
  });
  const [lectureInputs, setLectureInputs] = useState([
    {
      lectureName: "",
      lecCredit: "",
      lecClassification: "",
      year: "",
      userCredit: 0,
      semester: "",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    await performOCR(files);
  };

  const performOCR = async (files) => {
    setIsLoading(true);
    const results = [];

    for (const image of files) {
      const result = await Tesseract.recognize(
        URL.createObjectURL(image),
        "kor",
        {
          logger: (m) => {
            console.log(m);
            if (m.status === "recognizing text") {
              setProgress(m.progress);
            }
          },
        }
      );
      results.push(result.data.text);
      console.log(result.data.text);
    }

    setOcrResults(results);

    const newLectureInputs = [];
    const existingLectureNames = new Set(
      lectureInputs.map((lecture) => lecture.lectureName)
    );

    for (const result of results) {
      const response = await fetch("http://127.0.0.1:8000/user/update/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: result }),
      });

      const data = await response.json();

      data.userTakenLectures.forEach((lecture) => {
        if (!existingLectureNames.has(lecture.lectureName)) {
          newLectureInputs.push({
            lectureName: lecture.lectureName,
            lecCredit: lecture.lecCredit,
            lecClassification: lecture.lecClassification,
            // year와 semester는 FastAPI에서 반환되지 않으므로 삭제
          });
          existingLectureNames.add(lecture.lectureName);
        }
      });
    }

    setLectureInputs((prevInputs) => [...prevInputs, ...newLectureInputs]);
    setIsLoading(false);
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/user/data", {
        withCredentials: true,
      });
      const userData = response.data[0];
      setFormData((prevData) => ({
        ...prevData,
        userId: userData.user_id,
        userHakbun: userData.userHakbun,
        userIsForeign: userData.userIsForeign,
        userBunban: userData.userBunban,
        userYear: userData.userYear,
        userMajor: userData.userMajor,
        userIsMultipleMajor: userData.userIsMultipleMajor,
        userWhatMultipleMajor: userData.userWhatMultipleMajor,
        userName: userData.userName,
        userCredit: userData.userCredit,
        userTotalGPA: userData.userTotalGPA,
        userJunGPA: userData.userJunGPA,
      }));
      setLectureInputs(userData.userTakenLectures);
      console.log("userData:", userData.userTakenLectures);
    } catch (error) {
      console.error("errr fetching user data atasdfasdfasdf", error);
      alert(error.response?.data?.detail || "errr fetching user data");
    }
  };

  useEffect(() => {
    const userId = Cookies.get("user_id");
    if (userId) {
      setFormData((prevData) => ({
        ...prevData,
        user_id: userId,
      }));
      fetchUserData(userId);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLectureChange = (index, e) => {
    const { name, value } = e.target;
    const newLectureInputs = [...lectureInputs];
    newLectureInputs[index][name] = value;
    setLectureInputs(newLectureInputs);
  };

  const addLectureInput = () => {
    setLectureInputs([
      ...lectureInputs,
      { lectureName: "", lecCredit: "", lecClassification: "" },
    ]);
  };

  const removeLectureInput = (index) => {
    const newLectureInputs = [...lectureInputs];
    newLectureInputs.splice(index, 1);
    setLectureInputs(newLectureInputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:8000/user/update",
        {
          ...formData,
          userTakenLectures: lectureInputs.map((lecture) => ({
            lectureName: lecture.lectureName,
            lecCredit: lecture.lecCredit,
            lecClassification: lecture.lecClassification,
            userCredit: lecture.userCredit,
            semester: lecture.semester,
          })),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("user info updated", response.data.message);
    } catch (error) {
      console.error("error updating user info", error);
      alert(error.response?.data?.detail || "error updating user info");
    }
  };

  const groupLecturesByYearAndSemester = (lectures) => {
    const grouped = lectures.reduce((acc, lecture) => {
      const key = `${lecture.year || "null"}-${lecture.semester || "null"}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(lecture);
      return acc;
    }, {});
    return grouped;
  };

  const groupedLectures = groupLecturesByYearAndSemester(lectureInputs);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>유저 ID:</label>
        <input
          type="text"
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
          disabled
        />
      </div>
      <div>
        <label>닉네임: </label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>학번:</label>
        <input
          type="number"
          name="userHakbun"
          value={formData.userHakbun}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>외국인 여부:</label>
        <input
          type="checkbox"
          name="userIsForeign"
          checked={formData.userIsForeign}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>분반:</label>
        <input
          type="text"
          name="userBunban"
          value={formData.userBunban}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>학년:</label>
        <input
          type="number"
          name="userYear"
          value={formData.userYear}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>전공:</label>
        <input
          type="text"
          name="userMajor"
          value={formData.userMajor}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>복수전공 여부:</label>
        <input
          type="checkbox"
          name="userIsMultipleMajor"
          checked={formData.userIsMultipleMajor}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>복수전공 전공학과:</label>
        <input
          type="text"
          name="userWhatMultipleMajor"
          value={formData.userWhatMultipleMajor}
          onChange={handleChange}
        />
      </div>
      <div>
        <input type="file" multiple onChange={handleImageChange} />
      </div>
      <div>
        <label>수강한 강의 목록:</label>
        {Object.entries(groupedLectures).map(([key, lectures]) => (
          <div key={key}>
            <h3>
              {key === "null-null"
                ? "직접 추가한 강의"
                : key
                    .split("-")
                    .map((k) => (k === "null" ? "" : k))
                    .join(" - ")}
            </h3>
            {lectures.map((lecture, index) => (
              <div key={index}>
                <input
                  type="text"
                  name="lectureName"
                  value={lecture.lectureName}
                  onChange={(e) => handleLectureChange(index, e)}
                  placeholder="강의 명"
                />
                <input
                  type="text"
                  name="lecCredit"
                  value={lecture.lecCredit}
                  onChange={(e) => handleLectureChange(index, e)}
                  placeholder="학점"
                />
                <input
                  type="text"
                  name="lecClassification"
                  value={lecture.lecClassification}
                  onChange={(e) => handleLectureChange(index, e)}
                  placeholder="분류"
                />
                <select
                  name="userCredit"
                  value={lecture.userCredit || ""}
                  onChange={(e) => handleLectureChange(index, e)}
                >
                  <option value="">받은 학점</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
                <button type="button" onClick={() => removeLectureInput(index)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        ))}
        <button type="button" onClick={addLectureInput}>
          수강한 강의 추가
        </button>
      </div>
      {isLoading && <div>로딩 중... {Math.round(progress * 100)}%</div>}
      <button type="submit">업데이트</button>
    </form>
  );
};

export default UpdateUserForm;
