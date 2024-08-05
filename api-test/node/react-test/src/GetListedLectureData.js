import React, { useEffect, useState } from "react";
import axios from "axios";

const GetListedLectureData = () => {
  const [listedLectures, setListedLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/user/data/listed_lectures_data",
        {
          withCredentials: true,
        }
      );
      setListedLectures(response.data);
      setLoading(false);
      console.log("user listed lectrues's data", response.data);
    } catch (error) {
      console.error("errrr fetching user data", error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return <div>loading...</div>;
  }

  if (error) {
    return <div>errr fetching data</div>;
  }

  return (
    <div>
      {listedLectures.length === 0 ? (
        <div>선택한 강의가 없어요.</div>
      ) : (
        <div>
          {listedLectures.map((lecture, index) => (
            <div key={index}>
              <p>
                {lecture.lecClassName} | <small>{lecture.lecProfessor}</small>
              </p>
              {/* console.log로 받아온 값들 확인해고, 추가해야할 값들 잘 추가해야돼요. */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GetListedLectureData;
