import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateUserForm = () => {
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
  });

  useEffect(() => {
    const userId = Cookies.get("user_id");
    if (userId) {
      setFormData((prevData) => ({
        ...prevData,
        user_id: userId,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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
      alert(error.response.data.detail);
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
