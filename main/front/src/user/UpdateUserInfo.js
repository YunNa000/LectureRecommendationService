import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import firsangledown from "./public/fi-rs-angle-down.png";
import "./UpdateUserInfo.css";

const UpdateUserInfo = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
  const [isHakBunError, SetIsHakBunError] = useState(false);
  const [isSameMajor, SetIsSameMajor] = useState(false);

  const handleEditClick = (event) => {
    if (event.target.closest(".userinfo-edit-form")) {
      return;
    }
    setIsEditing(!isEditing);
    getUserInfo(user);
  };

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

    if (name === "bunBan") {
      const bunBanPattern = /^[A-Za-z][0-9]*$/;

      if (value.trim() === "" || bunBanPattern.test(value)) {
      } else {
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hakBunLengthError = String(formData.hakBun).length !== 10;
    const isSameMajorError =
      formData.userMajor === formData.whatMultipleMajorDepartment;

    SetIsHakBunError(hakBunLengthError);
    SetIsSameMajor(isSameMajorError);

    if (!hakBunLengthError && !isSameMajorError) {
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
          handleEditClick();
          SetIsHakBunError(false);
          SetIsSameMajor(false);

          console.log("updated");
        }
      } catch (error) {
        console.error("Error updating user info", error);
      }
    } else {
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
    <div className="userinfo-update-box" onClick={handleEditClick}>
      <div className="userinfo-box-box">
        <div className="userinfo-box">
          <p className="userinfo-username">{formData.username}</p>
          <div className="userinfo-detail-box">
            <p className="userinfo-hakBun">{formData.hakBun}</p>
          </div>
          <div className="userinfo-detail-box">
            <p className="userinfo-userMajor">{formData.userMajor}</p>
            <p className="userinfo-userbunBan">({formData.bunBan})</p>
            <p className="userinfo-userYear">{formData.userYear}학년</p>
          </div>
          {formData.isMultipleMajor && (
            <div className="userinfo-detail-box">
              <p className="userinfo-whatMultipleMajorDepartment">
                {formData.whatMultipleMajorDepartment}
              </p>
              <p className="userinfo-whatMultipleMajor">
                {formData.whatMultipleMajor}중
              </p>
            </div>
          )}
        </div>
        <div className="userinfo-edit-button-box">
          <button className="userinfo-edit-button">
            <img
              src={firsangledown}
              alt="정보 수정하기 버튼"
              className="userinfo-edit-button-img"
              style={{
                transform: isEditing ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>
        </div>
      </div>
      {user && isEditing && (
        <form onSubmit={handleSubmit} className="userinfo-edit-form">
          <div className="userinfo-row-box">
            <label className="userinfo-edit-input-box userinfo-username">
              <p className="userinfo-edit-input-text">닉네임:</p>
              <input
                className="userinfo-edit-input"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </label>

            <label className="userinfo-edit-input-box userinfo-isForeign">
              <input
                type="checkbox"
                name="isForeign"
                checked={formData.isForeign}
                onChange={handleChange}
              />
              <p className="userinfo-edit-input-text">외국인</p>
            </label>

            <label className="userinfo-edit-input-box userinfo-isMultipleMajor">
              <input
                type="checkbox"
                name="isMultipleMajor"
                checked={formData.isMultipleMajor}
                onChange={handleChange}
              />
              <p className="userinfo-edit-input-text">다전공</p>
            </label>
          </div>
          <div className="userinfo-row-box">
            <label className="userinfo-edit-input-box userinfo-hakbun">
              <p className="userinfo-edit-input-text">학번:</p>

              <input
                className="userinfo-edit-input"
                type="number"
                name="hakBun"
                value={formData.hakBun}
                onChange={handleChange}
                required
                pattern="\d{10}"
                placeholder="2025111222"
              />
            </label>
          </div>
          <div className="userinfo-row-box">
            <label className="userinfo-edit-input-box userinfo-major">
              <input
                type="text"
                name="userMajor"
                value={formData.userMajor}
                onChange={handleChange}
                required
                className="userinfo-edit-input"
                placeholder="학과/학부"
              />
            </label>
            <label className="userinfo-edit-input-box userinfo-bunban">
              <p className="userinfo-edit-input-text">분반:</p>
              <input
                className="userinfo-edit-input"
                type="text"
                name="bunBan"
                value={formData.bunBan}
                onChange={handleChange}
                required
                pattern="[A-Za-z][0-9]*"
                title="분반은 알파벳+숫자 조합이여야 해요."
                placeholder="A1"
              />
            </label>
            <label className="userinfo-edit-input-box userinfo-year">
              <input
                type="number"
                name="userYear"
                value={formData.userYear}
                onChange={handleChange}
                required
                className="userinfo-edit-input"
              />
              <p className="userinfo-edit-input-text userinfo-year-text">
                학년
              </p>
            </label>
          </div>

          {formData.isMultipleMajor && (
            <div className="userinfo-row-box">
              <div>
                <select
                  className="userinfo-select-multiplemajor"
                  name="whatMultipleMajor"
                  value={formData.whatMultipleMajor}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    전공을 골라주세요.
                  </option>
                  <option value="복수전공">복수전공</option>
                  <option value="이중전공">이중전공</option>
                  <option value="마이크로전공">마이크로전공</option>
                </select>
              </div>

              <label className="userinfo-edit-input-box userinfo-year">
                <input
                  className="userinfo-edit-input"
                  type="text"
                  name="whatMultipleMajorDepartment"
                  value={formData.whatMultipleMajorDepartment}
                  onChange={handleChange}
                />
              </label>
            </div>
          )}
          <div className="userinfo-row-box userinfo-row-box-space-between">
            <p className="userinfo-check-text">
              {isHakBunError && "학번 "} {isSameMajor && "다전공 "}
              {(isHakBunError || isSameMajor) && "입력값을 확인해주세요!"}
            </p>
            <button className="userinfo-update-button" type="submit">
              업데이트
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateUserInfo;
