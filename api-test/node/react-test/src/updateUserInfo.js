import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

/**
 * 유저가 자신의 정보 업데이트 할 수 있도록 하는 -
 * 이렇게 db에 값들 넣는다 정도로만 해석하면 됨
 *
 * @returns {JSX.Element} - UpdateUserForm component
 */
const UpdateUserForm = () => {
  /**
   * @type {Object}
   * @property {string} user_id - user id
   * @property {string} userHakbun - 학번
   * @property {boolean} userIsForeign - 외국인 여부
   * @property {string} userBunban - 분반
   * @property {string} userYear - 학년
   * @property {string} userMajor - 전공
   * @property {boolean} userIsMultipleMajor - 복전 여부
   * @property {string} userWhatMultipleMajor - 복전 전공학과
   * @property {string} userTakenLecture - 수강한 강의
   * @property {string} userName - 유저 이름
   */
  const [formData, setFormData] = useState({
    user_id: "",
    userHakbun: "",
    userIsForeign: false,
    userBunban: "",
    userYear: "",
    userMajor: "",
    userIsMultipleMajor: false,
    userWhatMultipleMajor: "",
    userTakenLecture: "",
    userName: "",
  });

  /**
   * 유저 정보를 가져와서 상태로 설정하는 함수
   */
  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get("http://localhost:8000/user/data", {
        withCredentials: true,
      });
      const userData = response.data[0]; // 첫 번째 유저 데이터
      setFormData((prevData) => ({
        ...prevData,
        ...userData,
      }));
    } catch (error) {
      console.error("There was an error fetching the user data!", error);
      alert(error.response?.data?.detail || "Error fetching user data");
    }
  };

  /**
   * 컴포넌트가 마운트 될 때 쿠키에서 유저 아이디 가져오고 유저 정보 가져옴
   */
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

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} e - 입력 변경 이벤트
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * 서버에 put 요청, response message를 alert
   *
   * @param {React.FormEvent<HTMLFormElement>} e - 폼 제출 이벤트
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        "http://localhost:8000/user/update",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert(response.data.message);
    } catch (error) {
      console.error("There was an error updating the user information!", error);
      alert(error.response?.data?.detail || "Error updating user information");
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
        <label>수강 강의:</label>
        <input
          type="text"
          name="userTakenLecture"
          value={formData.userTakenLecture}
          onChange={handleChange}
        />
      </div>
      <button type="submit">업데이트</button>
    </form>
  );
};

export default UpdateUserForm;
