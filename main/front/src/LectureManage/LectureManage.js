import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import CallLecture from "./lecture/CallLecture";
import ListedLecture from "./listedLecture/ListedLecture";

const LectureManage = () => {
  const [selectedLectures, setSelectedLectures] = useState({});
  const [triggerRender, setTriggerRender] = useState(0);

  useEffect(() => {
    setTriggerRender((prev) => prev + 1);
  }, [selectedLectures]);

  useEffect(() => {
    checkUserData();
  }, []);

  const checkUserData = async () => {
    const userId = Cookies.get("user_id");
    try {
      if (userId) {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/user/data`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId }),
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok && data.user_id) {
          console.log(response.json);
          if (
            !data.hakBun ||
            !data.bunBan ||
            !data.userYear ||
            !data.userMajor ||
            !data.username ||
            data.isForeign === null ||
            data.isMultipleMajor === null
          ) {
            window.location.href = "/mypage";
          } else {
            console.log("done");
          }
        }
      } else {
        console.log("로그인 해주세요.");
        window.location.href = "/login";
      }
    } catch (err) {
      console.log("CallLecture.js - checkLogin");
    }
  };

  return (
    <div>
      <CallLecture
        selectedLectures={selectedLectures}
        setSelectedLectures={setSelectedLectures}
      />
      <ListedLecture key={triggerRender} />
    </div>
  );
};

export default LectureManage;
