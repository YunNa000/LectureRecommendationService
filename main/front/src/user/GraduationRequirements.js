import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./GraduationRequirements.css";

const GraduationRequirements = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    taken_total_credit: "",
    user_require_requirementTotalCredit: "",
    taken_major_credit: "",
    user_require_major_credit: "",
    taken_gyoyang_credit: "",
    user_require_gyoPillCredit: "",
    user_require_gyoGyunCredit: "",
    taken_other_credit: "",
    taken_gyoGyunTheme: [],
    not_taken_gyoGyunTheme: [],
    taken_gyoPillName: [],
    not_taken_gyoPillName: [],
    user_taken_multiple_major_credit: "",
    multiple_major_credit: "",
    what_multiple_major_department: "",
    what_multiple_major: "",
  });
  const [majorGpa, setMajorGpa] = useState(0);
  const [totalGpa, setTotalGpa] = useState(0);

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
          getUserGraduationReqInfo(data.user_id);
          getUserMajorGPA(data.user_id);
          getUserTotalGPA(data.user_id);
        }
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      console.log("Login.js - checkLoginStatus");
      console.error(err);
    }
  };

  const getUserGraduationReqInfo = async (userId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/data/graduation_conditions`,
        { user_id: userId },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const data = response.data;

        setFormData({
          taken_total_credit: data.taken_total_credit || 0,
          user_require_requirementTotalCredit:
            data.user_require_requirementTotalCredit || 0,
          taken_major_credit: data.taken_major_credit || 0,
          user_require_major_credit: data.user_require_major_credit || 0,
          taken_gyoyang_credit: data.taken_gyoyang_credit || 0,
          user_require_gyoPillCredit: data.user_require_gyoPillCredit || 0,
          user_require_gyoGyunCredit: data.user_require_gyoGyunCredit || 0,
          taken_other_credit: data.taken_other_credit || 0,
          taken_gyoGyunTheme: data.taken_gyoGyunTheme || [],
          not_taken_gyoGyunTheme: data.not_taken_gyoGyunTheme || [],
          taken_gyoPillName: data.taken_gyoPillName || [],
          not_taken_gyoPillName: data.not_taken_gyoPillName || [],
          user_taken_multiple_major_credit:
            data.user_taken_multiple_major_credit || 0,
          multiple_major_credit: data.multiple_major_credit || 0,
          what_multiple_major_department:
            data.what_multiple_major_department || "",
          what_multiple_major: data.what_multiple_major || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const getUserMajorGPA = async (userId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/data/majorgpa`,
        { user_id: userId },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const data = response.data;
        setMajorGpa(data);

        console.log("major gpa", data);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const getUserTotalGPA = async (userId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/data/totalgpa`,
        { user_id: userId },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const data = response.data;
        setTotalGpa(data);

        console.log("total gpa", data);
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
        <div className="graduation-requirement">
          <div className="graduation-taken-credit-box">
            <div className="graduation-taken-credit-each-box">
              <p className="graduation-taken-credit-text">전체 학점</p>
              <p className="graduation-taken-credit-text">
                {formData.taken_total_credit} /{" "}
                {formData.user_require_requirementTotalCredit}
              </p>
            </div>
            <div className="graduation-taken-credit-each-box">
              <p className="graduation-taken-credit-text">전공 학점</p>
              <p className="graduation-taken-credit-text">
                {formData.taken_major_credit} /{" "}
                {formData.user_require_major_credit}
              </p>
            </div>
            <div className="graduation-taken-credit-each-box">
              <p className="graduation-taken-credit-text">교양 학점</p>
              <p className="graduation-taken-credit-text">
                {formData.taken_gyoyang_credit} /{" "}
                {formData.user_require_gyoGyunCredit +
                  formData.user_require_gyoPillCredit}
              </p>
            </div>
            {formData.taken_other_credit > 0 && (
              <div className="graduation-taken-credit-each-box">
                <p className="graduation-taken-credit-text">기타 학점</p>
                <p className="graduation-taken-credit-text">
                  {formData.taken_other_credit}
                </p>
              </div>
            )}
            {(formData.what_multiple_major_department ||
              formData.what_multiple_major_department !== "") && (
              <div className="graduation-taken-credit-each-box">
                <p className="graduation-taken-credit-text">
                  {formData.what_multiple_major}
                </p>
                <p className="graduation-taken-credit-text">
                  {formData.user_taken_multiple_major_credit} /{" "}
                  {formData.multiple_major_credit}
                </p>
              </div>
            )}
            <div className="graduation-taken-credit-each-box">
              <p className="graduation-taken-credit-text">전체 평점</p>
              <p className="graduation-taken-credit-text">{majorGpa} / 4.5</p>
            </div>
            <div className="graduation-taken-credit-each-box">
              <p className="graduation-taken-credit-text">전공 평점</p>
              <p className="graduation-taken-credit-text">{totalGpa} / 4.5</p>
            </div>
          </div>
          <div className="graduation-gyun-gyo-box">
            <p className="graduation-gyun-gyo-text">균형 교양</p>
            <div className="graduation-gyun-gyo-taken">
              수강 완료:
              <div className="graduation-gyun-gyo-text-taken-list">
                {formData.taken_gyoGyunTheme.map((theme, index) => (
                  <p className="graduation-gyun-gyo-text-taken" key={index}>
                    {theme}
                  </p>
                ))}
              </div>
            </div>
            <div className="graduation-gyun-gyo-taken">
              수강 필요:
              <div className="graduation-gyun-gyo-text-taken-list">
                {formData.not_taken_gyoGyunTheme.map((theme, index) => (
                  <p className="graduation-gyun-gyo-text-taken" key={index}>
                    {theme}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="graduation-gyun-gyo-box">
            <p className="graduation-gyun-gyo-text">필수 교양</p>
            <div className="graduation-gyun-gyo-taken">
              수강 완료:
              <div className="graduation-gyun-gyo-text-taken-list">
                {formData.taken_gyoPillName.map((lecture, index) => (
                  <p className="graduation-gyun-gyo-text-taken" key={index}>
                    {lecture}
                  </p>
                ))}
              </div>
            </div>
            <div className="graduation-gyun-gyo-taken">
              수강 필요:
              <div className="graduation-gyun-gyo-text-taken-list">
                {formData.not_taken_gyoPillName.map((lecture, index) => (
                  <p className="graduation-gyun-gyo-text-taken" key={index}>
                    {lecture}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraduationRequirements;
