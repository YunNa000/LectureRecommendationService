import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateUserInfo = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    hakBun: "",
    bunBan: "",
    userYear: "",
    userMajor: "",
    username: "",
    isForeign: false,
    isMultipleMajor: false,
    whatMultipleMajor: "",
    whatMultipleMajorDepartment: "",
  });

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
          getUserInfo(data.user_id);
        }
      } else {
        window.location.href = "http://127.0.0.1:3000/login";
      }
    } catch (err) {
      console.log("Login.js - checkLoginStatus");
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/user/update",
        {
          ...formData,
          user_id: user,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        console.log("updated");
      }
    } catch (error) {
      console.error("Error updating user info", error);
    }
  };

  const getUserInfo = async (userId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/data",
        { user_id: userId },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const data = response.data;
        setFormData({
          hakBun: data.hakBun || "",
          bunBan: data.bunBan || "",
          userYear: data.userYear || "",
          userMajor: data.userMajor || "",
          username: data.username || "",
          isForeign: data.isForeign,
          isMultipleMajor: data.isMultipleMajor,
          whatMultipleMajor: data.whatMultipleMajor || "",
          whatMultipleMajorDepartment: data.whatMultipleMajorDepartment || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <div>
      {user && (
        <form onSubmit={handleSubmit}>
          <label>
            학번:
            <input
              type="number"
              name="hakBun"
              value={formData.hakBun}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            분반:
            <input
              type="text"
              name="bunBan"
              value={formData.bunBan}
              onChange={handleChange}
              required
              pattern="[A-Za-z][0-9]*" // 분반 패턴 수정
              title="분반은 알파벳+숫자 조합이여야 해요."
            />
          </label>
          <br />
          <label>
            학년:
            <input
              type="number"
              name="userYear"
              value={formData.userYear}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            전공:
            <input
              type="text"
              name="userMajor"
              value={formData.userMajor}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            이름:
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            외국인 유학생 여부:
            <input
              type="checkbox"
              name="isForeign"
              checked={formData.isForeign}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            복수전공 여부:
            <input
              type="checkbox"
              name="isMultipleMajor"
              checked={formData.isMultipleMajor}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            복수전공명:
            <input
              type="text"
              name="whatMultipleMajor"
              value={formData.whatMultipleMajor}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            복수전공학과:
            <input
              type="text"
              name="whatMultipleMajorDepartment"
              value={formData.whatMultipleMajorDepartment}
              onChange={handleChange}
            />
          </label>
          <br />
          <button type="submit">정보 업데이트</button>
        </form>
      )}
    </div>
  );
};

export default UpdateUserInfo;
