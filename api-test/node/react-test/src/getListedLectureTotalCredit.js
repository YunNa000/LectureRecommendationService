import React, { useEffect, useState } from "react";
import axios from "axios";

const GetListedLectureTotalCredit = () => {
  const [userTotalCredits, setUserTotalCredits] = useState("_");

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/user/data/listed_lecture_total_credit",
        {
          withCredentials: true,
        }
      );
      setUserTotalCredits(response.data.total_credits);
    } catch (error) {
      console.error("errr fetching user data", error);
      alert(error.response?.data?.detail || "errr fetching user data");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return <div>total credit: {userTotalCredits}</div>;
};

export default GetListedLectureTotalCredit;
