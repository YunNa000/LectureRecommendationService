import React, { useEffect, useState } from "react";
import axios from "axios";
import CallLecture from "./lecture/CallLecture";
import ListedLecture from "./listedLecture/ListedLecture";

const LectureManage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listedLectures, setListedLectures] = useState([]);

  const fetchListedLectures = async (userID) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/user/listed_lecture",
        { user_id: userID }
      );
      setListedLectures(response.data);
      console.log(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CallLecture
        fetchListedLectures={fetchListedLectures}
        listedLectures={listedLectures}
      />
      <ListedLecture
        fetchListedLectures={fetchListedLectures}
        listedLectures={listedLectures}
      />
    </div>
  );
};

export default LectureManage;
