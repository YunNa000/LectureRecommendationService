import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

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
          getUserGraduationReqInfo(data.user_id);
        }
      } else {
        window.location.href = "http://127.0.0.1:3000/login";
      }
    } catch (err) {
      console.log("Login.js - checkLoginStatus");
      console.error(err);
    }
  };

  const getUserGraduationReqInfo = async (userId) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/data/graduation_conditions",
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

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <div>
      {user && (
        <div>
          <hr />
          <div>
            <p>
              전체 학점: {formData.taken_total_credit} /{" "}
              {formData.user_require_requirementTotalCredit} | 전공 학점:{" "}
              {formData.taken_major_credit} /{" "}
              {formData.user_require_major_credit} | 교양 학점:{" "}
              {formData.taken_gyoyang_credit} /{" "}
              {formData.user_require_gyoGyunCredit +
                formData.user_require_gyoPillCredit}{" "}
              | 기타 학점: {formData.taken_other_credit} |{" "}
              {formData.what_multiple_major_department}{" "}
              {formData.what_multiple_major} 학점:{" "}
              {formData.user_taken_multiple_major_credit} /{" "}
              {formData.multiple_major_credit}
            </p>
            <p>복수 전공 학과: {formData.what_multiple_major_department}</p>
            <p>복수 전공: {formData.what_multiple_major}</p>
          </div>
          <hr />
          <div>
            <p>수강한 교양균형</p>
            <p>
              {formData.taken_gyoGyunTheme.map((theme, index) => (
                <li key={index}>{theme}</li>
              ))}
            </p>
          </div>
          <hr />
          <div>
            <p>미수강한 교양균형</p>
            <p>
              {formData.not_taken_gyoGyunTheme.map((theme, index) => (
                <li key={index}>{theme}</li>
              ))}
            </p>
          </div>
          <hr />
          <div>
            <p>수강한 교필</p>
            <p>
              {formData.taken_gyoPillName.map((lecture, index) => (
                <li key={index}>{lecture}</li>
              ))}
            </p>
          </div>
          <hr />
          <div>
            <p>미수강한 교필</p>
            <p>
              {formData.not_taken_gyoPillName.map((lecture, index) => (
                <li key={index}>{lecture}</li>
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraduationRequirements;
