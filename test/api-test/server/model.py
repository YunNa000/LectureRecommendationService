from pydantic import BaseModel
from typing import List, Union, Dict, Optional


class LectureRequest(BaseModel):
    userYear: int  # 유저 학년
    bunBan: str  # 유저 분반
    lecName: str
    isMultipleMajor: bool
    lecClassification: str  # 전필/전전/교선/교필 ...
    userTakenCourse: Optional[List[str]] = None  # 유저 수강 내역
    isUserForeign: Optional[int] = None  # 유저 외국인 여부  # lecForeignPeopleCanTake
    isUserMultiple: Optional[int] = None  # 유저 복전 여부 # lecCanTakeMultipleMajor
    star: Optional[float] = None  # 별점
    assignmentAmount: Optional[int] = None  # 과제
    teamplayAmount: Optional[int] = None  # 팀플
    gradeAmount: Optional[int] = None  # 성적
    lecCredit: Optional[int] = None  # 학점
    lecIsPNP: Optional[int] = None  # pnp 여부
    lecIsTBL: Optional[int] = None  # TBL 여부
    lecIsPBL: Optional[int] = None  # PBL 여부
    lecIsSeminar: Optional[int] = None  # 세미나 강의 여부
    lecIsSmall: Optional[int] = None  # 소규모 강의 여부
    lecIsConvergence: Optional[int] = None  # 융합 강의 여부
    lecIsNoneFace: Optional[int] = None  # 100% 비대면 여부
    lecIsArt: Optional[int] = None  # 실습 강의 여부
    lecSubName: Optional[str] = None  # 테마
    userId: str
    year: Optional[int] = 24
    semester: Optional[str] = "1학기"
    lecTimeArray: Optional[List[str]] = None


class LectureRequestManagement(BaseModel):
    userYear: int
    bunBan: str
    lecClassification: str
    # star: Optional[float] = None
    # assignmentAmount: Optional[int]
    # teamplayAmount: Optional[int]
    # gradeAmount: Optional[int]
    # lecTheme: str
    # lecName: str
    userId: str
    # lecTimeArray: Optional[List[str]] = None


class LectureListed(BaseModel):
    userListedLecName: str
    lecNumber: str
    lecProfessor: str
    userListedLecTime: str
    lecClassification: str
    lecStars: Optional[float] = None  # 별점
    lecAssignment: Optional[int] = None  # 과제
    lecTeamplay: Optional[int] = None  # 팀플
    lecGrade: Optional[int] = None  # 성적
    lecIsPNP: Optional[int] = None  # pnp 여부
    lecCredit: Optional[int] = None  # 학점
    lecIsTBL: Optional[int] = None  # TBL 여부
    lecIsPBL: Optional[int] = None  # PBL 여부
    lecIsSeminar: Optional[int] = None  # 세미나 강의 여부
    lecIsSmall: Optional[int] = None  # 소규모 강의 여부
    lecIsConvergence: Optional[int] = None  # 융합 강의 여부
    lecIsNoneFace: Optional[int] = None  # 100% 비대면 여부
    lecIsArt: Optional[int] = None  # 실습 강의 여부
    lecSubName: Optional[str] = None  # 테마
    year: int
    semester: str
    isChecked: bool
    priority: Optional[str]
    userListedLecClassRoom: Optional[str]
    userListedLecMemo: Optional[str]
    userListedLecNumber: Optional[str]


class LoggedInResponse(BaseModel):
    message: str
    user_id: str


class NotLoggedInResponse(BaseModel):
    message: str


class PersonalInformation(BaseModel):
    user_id: str
    userHakbun: int
    userIsForeign: bool
    userBunban: str
    userYear: int
    userMajor: str
    userIsMultipleMajor: bool
    userWhatMultipleMajor: Optional[str] = None
    userTakenLecture: Optional[str] = None
    userName: str
    selectedLecNumbers: List[str]
    userTakenLectures: List[dict]
    userCredit: Optional[str] = None
    userTotalGPA: Optional[float] = 0
    userJunGPA: Optional[float] = 0


class userSelectedLecture(BaseModel):
    lecNumber: str


class LecturesUpdateRequest(BaseModel):
    userId: str
    lecNumbers: List[str]


class OCRRequest(BaseModel):
    text: str


class OCRResponse(BaseModel):
    userTakenLectures: List[Dict[str, str]]


class ChatRequest(BaseModel):
    message: str


class UserListedLectureTotalCredit(BaseModel):
    total_credits: int


# 손원택 작성 친구 관련
class User(BaseModel):
    user_id: str
    userName: Optional[str] = None


class FriendRequest(BaseModel):
    user_id1: str
    user_id2: str
    friendRequest: Optional[bool] = None


class LectureCheckUpdateRequest(BaseModel):
    lec_number: str
    is_checked: bool
    year: int
    semester: str
    priority: str


class LectureCheckDeleteRequest(BaseModel):
    userListedLecNumber: str
    year: int
    semester: str


class LecturePriorityUpdateRequest(BaseModel):
    userListedLecNumber: str
    year: int
    semester: str
    priority: str


class GradesCreditResponse(BaseModel):
    total: int
    major: int
    general: int
    other: int
    totalGPA: Optional[float] = 0
    junGPA: Optional[float] = 0


class LectureInfoUpdateRequest(BaseModel):
    userListedLecNumber: str
    year: int
    semester: str
    classroom: str
    memo: str


class LectureUserDone(BaseModel):
    lecName: str
    Classification: str
    lecCredit: Optional[int] = None
    year: Optional[int] = None
    semester: Optional[str] = None


class LectureUserDoneLists(BaseModel):
    lecName: str
    Classification: str
    lecCredit: Optional[int] = None
    userTakenCredit: Optional[str] = None


class ManualLecture(BaseModel):
    lecClassName: str
    lecClassRoom: str
    lecTime: str
    year: int
    semester: str


class UpdateLectureManually(BaseModel):
    userId: str
    lecNumbers: list
    manualLectures: list[ManualLecture]
