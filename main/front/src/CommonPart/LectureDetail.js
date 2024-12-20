import "./LectureDetail.css";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const LineGraphComponent = ({ data }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 데이터 형식화
  const formattedData = data.map((value, index) => ({
    year: String(2021 + index),
    value: value,
  }));

  // 모바일 화면에서의 설정
  const isMobile = windowWidth <= 768;
  const chartHeight = isMobile ? 220 : 300;

  return (
    <div
      style={{
        width: "100%",
        height: chartHeight,
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip formatter={(value) => value} />
          <Legend />
          <ReferenceLine
            y={20}
            stroke="red"
            strokeDasharray="3 3"
            name="절대평가 기준인원"
            label={{
              value: "절대평가",
              position: "insideTopRight",
              fill: "red",
              fontSize: 10,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="수강인원"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const StarIcon = ({ fill }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarRating = ({ count = 0 }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={
            index < count
              ? "text-yellow-400 text-2xl"
              : "text-gray-300 text-2xl"
          }
        >
          {index < count ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};

const Tag = ({ text, description }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let timer;
    if (showModal) {
      timer = setTimeout(() => {
        setShowModal(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showModal]);

  const tagStyle = {
    display: "inline-block",
    padding: "5px 10px",
    margin: "4px",
    borderRadius: "16px",
    fontSize: "12px",
    color: "gray",
    textAlign: "center",
    border: "1px solid",
    cursor: "pointer",
  };

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "80%",
    maxHeight: "80%",
    overflow: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  return (
    <>
      <div
        style={tagStyle}
        onClick={() => setShowModal(true)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === "Enter" && setShowModal(true)}
      >
        {text}
      </div>
      {showModal && (
        <div
          style={modalStyle}
          onClick={() => setShowModal(false)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === "Enter" && setShowModal(false)}
        >
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            {description}
          </div>
        </div>
      )}
    </>
  );
};

const TagList = ({ tags }) => {
  // // tags가 undefined이거나 빈 객체인 경우를 처리
  // if (!tags || Object.keys(tags).length === 0) {
  //   return <div>No tags available</div>;
  // }
  return (
    <div className="lecture-tag-list">
      {Object.entries(tags).map(([key, value]) => (
        <Tag key={key} text={key} description={value} />
      ))}
    </div>
  );
};

const EvaluationRatioTable = ({ ratioString }) => {
  const categories = [
    "출석",
    "중간",
    "기말",
    "과제",
    "수업태도",
    "퀴즈",
    "기타",
  ];
  const ratios = ratioString.split(",").map(Number);

  return (
    <table className="lecture-detail-evaluation-table">
      <thead>
        <tr>
          {categories.map((category) => (
            <th key={category} className="lecture-detail-evaluation-table-th">
              {category}
            </th>
          ))}
          <th className="lecture-detail-evaluation-table-th">총계</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          {ratios.map((ratio, index) => (
            <td key={index} className="lecture-detail-evaluation-table-td">
              {ratio || 0}
            </td>
          ))}
          <td className="lecture-detail-evaluation-table-td">
            {ratios.reduce((sum, ratio) => sum + ratio, 0)}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const LectureScheduleTable = ({ scheduleString }) => {
  if (!scheduleString) {
    return <div></div>; // scheduleString이 null 또는 undefined일 경우 빈 컴포넌트 반환
  }

  const rows = scheduleString?.split("|").map((item) => item.trim()) || [];
  const scheduleData = rows.map((row, index) => ({
    week: Math.floor(index / 2) + 1,
    content: row
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item),
  }));

  return (
    <table className="lecture-detail-schedule-table">
      <thead>
        <tr className="lecture-detail-schedule-table-tr">
          <th className="lecture-detail-schedule-table-th">주차</th>
          <th className="lecture-detail-schedule-table-th">강의 내용</th>
        </tr>
      </thead>
      <tbody>
        {scheduleData.reduce((acc, week, index) => {
          if (index % 2 === 0) {
            acc.push(
              <tr key={week.week}>
                <td
                  rowSpan="2"
                  className="lecture-detail-schedule-table-td-week"
                >
                  {week.week}
                </td>
                <td className="lecture-detail-schedule-table-td">
                  {week.content.map((content, i) => (
                    <div key={i}>{content}</div>
                  ))}
                </td>
              </tr>
            );
          } else {
            acc.push(
              <tr key={`${week.week}-2`}>
                <td className="lecture-detail-schedule-table-td">
                  {week.content.map((content, i) => (
                    <div key={i}>{content}</div>
                  ))}
                </td>
              </tr>
            );
          }
          return acc;
        }, [])}
      </tbody>
    </table>
  );
};
const LectureTimeFormatter = ({ lecTime }) => {
  const daysOfWeek = ["월", "화", "수", "목", "금"];

  const formatTime = (timeString) => {
    if (lecTime === "") return;
    const times = timeString.slice(1, -1).split("),(");
    return times
      .map((time) => {
        const [day, period] = time.split(":");
        return `${daysOfWeek[parseInt(day) - 1]} ${period}교시`;
      })
      .join(" ");
  };

  return <p className="lecture-detail-time">{formatTime(lecTime)}</p>;
};

const LectureDetail = ({ year, semester, lectureNumber }) => {
  const [lectureName, setLectureName] = useState("");
  const [lecture, setLecture] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState({});
  const [takenPeoples, setTakenPeoples] = useState([0, 0, 0, 0]);
  const defaultYear = "24";
  const defaultSemester = "2학기";
  const [dataNumBool, setdataNumBool] = useState(false);

  year = year || defaultYear;
  semester = semester || defaultSemester;


    // 데이터 fetching을 위한 useEffect
    useEffect(() => {
      const fetchLecture = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/lecture/${year}/${semester}/${lectureNumber}`
          );
          
          if (!response.ok) {
            throw new Error("강의를 불러오는데 실패했습니다.");
          }
          
          const data = await response.json();
          setLecture(data);
        } catch (err) {
          setError(err.message);
          console.error(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchLecture();
    }, [year, semester, lectureNumber]);

    // 강의 데이터 처리를 위한 useEffect
    useEffect(() => {
      if (!lecture) return;
  
      const tagDescriptions = {
        "P/NP 여부": "Pass/No Pass 평가 방식을 사용하는 강의입니다.",
        "공학 인증": "공학 교육 인증을 위한 강의입니다.",
        TBL: "Team-Based Learning 방식을 사용하는 강의입니다.",
        PBL: "Project-Based Learning 방식을 사용하는 강의입니다.",
        세미나: "세미나 형식으로 진행되는 강의입니다.",
        소규모: "소규모로 진행되는 강의입니다.",
        융합: "여러 학문 분야를 융합한 강의입니다.",
        "팀 티칭": "둘 이상의 교수자가 함께 진행하는 강의입니다.",
        집중: "단기간 집중적으로 진행되는 강의입니다.",
        "실험 설계": "실험 설계를 포함하는 강의입니다.",
        "E-러닝": "온라인으로 진행되는 E-러닝 강의입니다.",
        예술: "예술 관련 강의입니다.",
      };
  
      const takenPeoplesT = [0, 0, 0, 0];
      const newTags = {};
  
      // 태그 처리 로직
      const tagMappings = [
        { condition: lecture.isPNP, tag: "P/NP 여부" },
        { condition: lecture.isEngineering === true || lecture.isEngineering === 1, tag: "공학 인증" },
        { condition: lecture.isTBL, tag: "TBL" },
        { condition: lecture.isPBL, tag: "PBL" },
        { condition: lecture.isSeminar, tag: "세미나" },
        { condition: lecture.isSmall, tag: "소규모" },
        { condition: lecture.isConvergence, tag: "융합" },
        { condition: lecture.isTeamTeaching, tag: "팀 티칭" },
        { condition: lecture.isFocus, tag: "집중" },
        { condition: lecture.isExperimentDesign, tag: "실험 설계" },
        { condition: lecture.isELearning, tag: "E-러닝" },
        { condition: lecture.isArt, tag: "예술" }
      ];
  
      tagMappings.forEach(({ condition, tag }) => {
        if (condition) {
          newTags[tag] = tagDescriptions[tag];
        }
      });
      const BooleanforGraph=false
      // 수강생 데이터 처리
      if (lecture.takenPeople1yearsAgo) takenPeoplesT[0] = lecture.takenPeople1yearsAgo;
      if (lecture.takenPeople2yearsAgo) takenPeoplesT[1] = lecture.takenPeople2yearsAgo;
      if (lecture.takenPeople3yearsAgo) takenPeoplesT[2] = lecture.takenPeople3yearsAgo;
      
      setTags(newTags);
      setTakenPeoples(takenPeoplesT);

    }, [lecture]);
  // useEffect(() => {
  //   const fetchLecture = async () => {
  //     try {
  //       if(lecture.lecName){
  //       const response = await fetch(
  //         `${process.env.REACT_APP_API_URL}/lecture/${year}/${semester}/${lectureNumber}`
  //       );
  //       if (!response.ok) {
  //         throw new Error("강의를 불러오는데 실패했습니다.");
  //       }
  //       const data = await response.json();
  //       setLecture(data);}


  //       const tagDescriptions = {
  //         "P/NP 여부": "Pass/No Pass 평가 방식을 사용하는 강의입니다.",
  //         "공학 인증": "공학 교육 인증을 위한 강의입니다.",
  //         TBL: "Team-Based Learning 방식을 사용하는 강의입니다.",
  //         PBL: "Project-Based Learning 방식을 사용하는 강의입니다.",
  //         세미나: "세미나 형식으로 진행되는 강의입니다.",
  //         소규모: "소규모로 진행되는 강의입니다.",
  //         융합: "여러 학문 분야를 융합한 강의입니다.",
  //         "팀 티칭": "둘 이상의 교수자가 함께 진행하는 강의입니다.",
  //         집중: "단기간 집중적으로 진행되는 강의입니다.",
  //         "실험 설계": "실험 설계를 포함하는 강의입니다.",
  //         "E-러닝": "온라인으로 진행되는 E-러닝 강의입니다.",
  //         예술: "예술 관련 강의입니다.",
  //       };

  //       const takenPeoplesT = [0, 0, 0, 0];
  //       const newTags = {};

  //       if (lecture.isPNP) newTags["P/NP 여부"] = tagDescriptions["P/NP 여부"];
  //       if (lecture.isEngineering === true || lecture.isEngineering === 1)
  //         newTags["공학 인증"] = tagDescriptions["공학 인증"];
  //       if (lecture.isTBL) newTags["TBL"] = tagDescriptions["TBL"];
  //       if (lecture.isPBL) newTags["PBL"] = tagDescriptions["PBL"];
  //       if (lecture.isSeminar) newTags["세미나"] = tagDescriptions["세미나"];
  //       if (lecture.isSmall) newTags["소규모"] = tagDescriptions["소규모"];
  //       if (lecture.isConvergence) newTags["융합"] = tagDescriptions["융합"];
  //       if (lecture.isTeamTeaching)
  //         newTags["팀 티칭"] = tagDescriptions["팀 티칭"];
  //       if (lecture.isFocus) newTags["집중"] = tagDescriptions["집중"];
  //       if (lecture.isExperimentDesign)
  //         newTags["실험 설계"] = tagDescriptions["실험 설계"];
  //       if (lecture.isELearning) newTags["E-러닝"] = tagDescriptions["E-러닝"];
  //       if (lecture.isArt) newTags["예술"] = tagDescriptions["예술"];
  //       if (lecture.takenPeople1yearsAgo)
  //         takenPeoplesT[0] = lecture.takenPeople1yearsAgo;
  //       setdataNumBool(true);
  //       if (lecture.takenPeople2yearsAgo)
  //         takenPeoplesT[1] = lecture.takenPeople2yearsAgo;
  //       setdataNumBool(true);
  //       if (lecture.takenPeople3yearsAgo)
  //         takenPeoplesT[2] = lecture.takenPeople3yearsAgo;
  //       setdataNumBool(true);

  //       console.log(newTags);
  //       setTags(newTags);
  //       setTakenPeoples(takenPeoplesT);
  //     } catch (err) {
  //       setError(err.message);
  //       console.log(err.message);
  //     } finally {
  //       setLoading(false);
  //       console.log("a");
  //     }
  //   };

  //   fetchLecture();
  // }, [year, semester, lectureNumber]);



  const renderField = (label, value) => {
    // 있을 경우에만 띄우는 코드
    if (value === undefined || value === null) return null;
    return (
      <p>
        <strong>{label}:</strong>{" "}
        {typeof value === "boolean" ? (value ? "예" : "아니오") : value}
      </p>
    );
  };

  if (loading)
    return (
      <div>
        <div className="loader">
          <div className="spinner"></div>
          <p>강의 세부 정보를 불러오고 있어요.</p>
        </div>
      </div>
    );

  return (
    <div className="lecture-detail">
      <div style={{ marginTop: "50px" }}></div>
      <div className="lecture-detail-main-box">
        <div className="lecture-left">
          <div className="lecture-detail-title-box">
            <p className="lecture-detail-title">{lecture.lecName}</p>
            <p className="lecture-detail-professor">{lecture.lecProfessor}</p>
          </div>
          <p className="lecture-code">{lecture.lecNumber}</p>
          <LectureTimeFormatter
            lecTime={lecture.lecTime}
          ></LectureTimeFormatter>
        </div>
        <div className="lecture-detail-right">
          <p className="lecture-detail-right-text">
            {lecture.lecClassification}
          </p>
          <p className="lecture-detail-right-text">{lecture.lecCredit}학점</p>
          <p className="lecture-detail-right-text">{lecture.lecClassroom}</p>
        </div>
      </div>

      {lecture.Overview && (
        <div className="lecture-detail">
          <p className="lecture-detail-overview">교과목 개요</p>
          <p className="lecture-detail-overview-content">{lecture.Overview}</p>
        </div>
      )}

      {lecture.evaluationRatio &&
        lecture.evaluationRatio.replace(/,/g, "").trim() && (
          <div className="lecture-detail-evaluation">
            <p className="lecture-detail-evaluation-title">평가 항목</p>
            <EvaluationRatioTable ratioString={lecture.evaluationRatio} />
          </div>
        )}

      {lecture.reviewSummary && (
        <div className="lecture-detail">
          <p className="lecture-detail-overview">강의 리뷰 요약</p>

          <div className="lecture-star-box">
            <StarRating count={lecture.star} />
            <p className="lecture-star-score">{lecture.star.toFixed(1)}/5.0</p>
          </div>
          <p className="lecture-review-summary">{lecture.reviewSummary}</p>
        </div>
      )}
      <TagList tags={tags} />
      {takenPeoples.some(value => value !== 0) && 
      <LineGraphComponent data={takenPeoples} />}
      <LectureScheduleTable scheduleString={lecture.scheduleNcontent} />
      
      <div style={{ marginBottom: "70px" }}></div>
    </div>
  );
};

export default LectureDetail;
