import React, { useEffect, useState } from "react";
import CallLecture from "./lecture/CallLecture";
import ListedLecture from "./listedLecture/ListedLecture";

const LectureManage = () => {
  const [selectedLectures, setSelectedLectures] = useState({});
  const [triggerRender, setTriggerRender] = useState(0);

  useEffect(() => {
    setTriggerRender((prev) => prev + 1);
  }, [selectedLectures]);

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
