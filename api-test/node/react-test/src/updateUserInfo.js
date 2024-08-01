import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateUserForm = () => {
  const [images, setImages] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);
  const [lecClassNames, setLecClassNames] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    userHakbun: "",
    userIsForeign: false,
    userBunban: "",
    userYear: "",
    userMajor: "",
    userIsMultipleMajor: false,
    userWhatMultipleMajor: "",
    userTakenLectures: [],
    userName: "",
  });
  const [lectureInputs, setLectureInputs] = useState([""]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    await performOCR(files);
  };

  const performOCR = async (files) => {
    const results = [];
    const allLecClassNames = new Set();

    for (const image of files) {
      const result = await Tesseract.recognize(
        URL.createObjectURL(image),
        "kor",
        {
          logger: (m) => console.log(m),
        }
      );
      results.push(result.data.text);
    }

    setOcrResults(results);

    for (const result of results) {
      const response = await fetch("http://127.0.0.1:8000/user/update/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: result }),
      });

      const data = await response.json();
      data.lecClassNames.forEach((lecClassName) => {
        allLecClassNames.add(lecClassName);
      });
    }

    const newLecClassNames = Array.from(allLecClassNames);
    setLecClassNames(newLecClassNames);
    setLectureInputs((prevInputs) => [...prevInputs, ...newLecClassNames]);
  };

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get("http://localhost:8000/user/data", {
        withCredentials: true,
      });
      const userData = response.data[0];
      setFormData((prevData) => ({
        ...prevData,
        ...userData,
        userTakenLectures: userData.userTakenLectures,
      }));
      setLectureInputs(userData.userTakenLectures);
    } catch (error) {
      console.error("errr fetching user data", error);
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
    const newLectureInputs = [...lectureInputs];
    newLectureInputs[index] = e.target.value;
    setLectureInputs(newLectureInputs);
  };

  const addLectureInput = () => {
    setLectureInputs([...lectureInputs, ""]);
  };

  const removeLectureInput = (index) => {
    const newLectureInputs = [...lectureInputs];
    newLectureInputs.splice(index, 1);
    setLectureInputs(newLectureInputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedLectures = lectureInputs
      .map((lecture) => lecture.replace(/\s/g, ""))
      .join(",");

    try {
      const response = await axios.put(
        "http://localhost:8000/user/update",
        {
          ...formData,
          userTakenLecture: cleanedLectures,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert(response.data.message);
    } catch (error) {
      console.error("errr updating user info", error);
      alert(error.response?.data?.detail || "errr updating user info");
    }
  };

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
          type="text"
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
        {lectureInputs.map((lecture, index) => (
          <div key={index}>
            <input
              type="text"
              value={lecture}
              onChange={(e) => handleLectureChange(index, e)}
            />
            <button type="button" onClick={() => removeLectureInput(index)}>
              삭제
            </button>
          </div>
        ))}
        <button type="button" onClick={addLectureInput}>
          수강한 강의 추가
        </button>
      </div>
      <button type="submit">업데이트</button>
    </form>
  );
};

export default UpdateUserForm;
