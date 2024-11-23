import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Tesseract from "tesseract.js";
import "./UpdateTakenLecture.css";

const UpdateTakenLecture = () => {
  const [user, setUser] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [lecName, setLecName] = useState("");
  const [classification, setClassification] = useState("");
  const [lecCredit, setLecCredit] = useState(0);
  const [userCredit, setUserCredit] = useState("");
  const [images, setImages] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const checkLoginStatus = async () => {
    const userId = Cookies.get("user_id");
    try {
      if (userId) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok && data.user_id) {
          setUser(data.user_id);
          getTakenLecture(data.user_id);
        } else {
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Login.js - checkLoginStatus", err);
    }
  };

  const getTakenLecture = async (user) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/get_taken_lectures`,
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
        `${process.env.REACT_APP_API_URL}/user/add_taken_lecture_manually`,
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
      id: lecture.id,
    };

    console.log(user, lecture.id);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/delete_taken_lecture`,
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

  const handleUpdateLecture = async (lecture) => {
    console.log(
      user,
      lecture.id,
      lecture.lecName,
      lecture.classification,
      lecture.lecCredit,
      lecture.userCredit
    );
    const inputData = {
      user_id: user,
      id: lecture.id,
      lecName: lecture.lecName,
      Classification: lecture.Classification,
      lecCredit: lecture.lecCredit,
      userCredit: lecture.userCredit,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/update_taken_lecture`,
        inputData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        getTakenLecture(user);
      }
    } catch (error) {
      console.error("Error updating lecture:", error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    performOCR(files);
  };

  const performOCR = async () => {
    const results = [];

    for (const image of images) {
      await Tesseract.recognize(URL.createObjectURL(image), "kor", {
        logger: (m) => {
          console.log(m);
          if (m.status === "recognizing text") {
            setProgress(m.progress);
          }
        },
      }).then((result) => {
        results.push(result.data.text);
        console.log("result.data.text: ", result.data.text);
      });
    }

    setOcrResults(results);
    getLectureDataByOCR(results);
    setProgress(1);

    setTimeout(() => {
      setProgress(0);
    }, 500);
  };

  const getLectureDataByOCR = async (ocrResults) => {
    try {
      const userId = Cookies.get("user_id");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/ocr`,
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
      <div className="mypage-user-already-taken-lectures">
        {Object.entries(
          lectures.reduce((acc, lecture) => {
            const year = lecture.year || "직접 추가한 강의";
            const semester = lecture.semester || "";
            const key = year + (semester ? ` - ${semester}` : "");

            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(lecture);

            return acc;
          }, {})
        ).map(([key, group]) => (
          <div key={key}>
            <p className="mypage-taken-lec-year-semester">{key}</p>
            {group.map((lecture) => (
              <div key={lecture.id} className="mypage-taken-lec">
                <input
                  type="text"
                  value={lecture.lecName || ""}
                  onChange={(e) => {
                    const updatedLectures = [...lectures];
                    const index = updatedLectures.findIndex(
                      (l) => l.id === lecture.id
                    );
                    updatedLectures[index].lecName = e.target.value;
                    setLectures(updatedLectures);
                    handleUpdateLecture(updatedLectures[index]);
                  }}
                  placeholder="강의 이름"
                  className="mypage-taken-lec-name"
                />
                <select
                  value={lecture.Classification || ""}
                  onChange={(e) => {
                    const updatedLectures = [...lectures];
                    const index = updatedLectures.findIndex(
                      (l) => l.id === lecture.id
                    );
                    updatedLectures[index].Classification = e.target.value;
                    setLectures(updatedLectures);
                    handleUpdateLecture(updatedLectures[index]);
                  }}
                  className="mypage-taken-lec-classification"
                >
                  <option value="" disabled>
                    분류
                  </option>
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
                    const index = updatedLectures.findIndex(
                      (l) => l.id === lecture.id
                    );
                    updatedLectures[index].lecCredit = +e.target.value;
                    setLectures(updatedLectures);
                    handleUpdateLecture(updatedLectures[index]);
                  }}
                  className="mypage-taken-lec-credit"
                >
                  <option value="" disabled>
                    학점
                  </option>
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
                <select
                  type="text"
                  value={lecture.userCredit || ""}
                  onChange={(e) => {
                    const updatedLectures = [...lectures];
                    const index = updatedLectures.findIndex(
                      (l) => l.id === lecture.id
                    );
                    updatedLectures[index].userCredit = e.target.value;
                    setLectures(updatedLectures);
                    handleUpdateLecture(updatedLectures[index]);
                  }}
                  className="mypage-taken-lec-userCredit"
                >
                  <option value="">성적</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="F">F</option>
                  <option value="P">P</option>
                  <option value="NP">NP</option>
                </select>
                <button
                  onClick={() => {
                    if (window.confirm("정말 삭제할까요?")) {
                      handleDeleteLecture(lecture);
                    }
                  }}
                  className="mypage-taken-lec-delete-button"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mypage-taken-lec-manually-add-box"></div>
      <div className="update-taken-lec-upload-btn-line">
        <div className="taken-lec-progress-bar">
          {progress !== 0 ? (
            <>
              <div
                style={{
                  width: "calc(100% - 20px)",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "50px",
                  margin: "10px",
                }}
              >
                <div
                  style={{
                    width: `${progress * 100}%`,
                    height: "10px",
                    backgroundColor: "#fff0a0",
                    borderRadius: "50px",
                    transition: "width 0.2s",
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleAddLecture}
                className="update-taken-lec-add-btn-box"
              >
                강의 추가
              </button>
            </>
          )}
        </div>
        <label className="update-taken-lec-img-upload-btn-box">
          이미지로 강의 추가
          <input
            type="file"
            className="update-taken-lec-img-upload-btn"
            multiple
            onChange={handleImageChange}
          />
        </label>
      </div>
    </div>
  );
};

export default UpdateTakenLecture;
