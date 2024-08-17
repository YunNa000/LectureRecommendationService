from pydantic import BaseModel
from typing import List, Union, Dict, Optional


class LoggedInResponse(BaseModel):
    message: str
    user_id: str
    userName: str


class NotLoggedInResponse(BaseModel):
    message: str


class LectureCallResponse(BaseModel):
    lectureID: int
    lecNumber: str
    lecName: str
    lecProfessor: str
    lecCredit: int
    lecTime: str
    lecClassroom: str
    moreInfo: str
    semester: str
    year: int


class LectureCallInput(BaseModel):
    user_id: str
    lecClassification: str
    lecTheme: str
    teamplayAmount: str
    gradeAmount: str
    assignmentAmount: str
    star: float
    userWantTime: str
    isPillSu: bool
    lectureName: str
    year: int
    semester: str
    lecCredit: int


class LectureSelect(BaseModel):
    user_id: str
    year: int
    semester: str
    lecNumber: str


class userID(BaseModel):
    user_id: str


class UserBasicInfo(BaseModel):
    user_id: str
    hakBun: int
    bunBan: str
    userYear: int
    userMajor: str
    username: str
    isForeign: bool
    isMultipleMajor: bool
    whatMultipleMajor: str
    whatMultipleMajorDepartment: str


class OCRLectureInfo(BaseModel):
    lectureName: str
    lecClassification: str
    lecCredit: int

    def __eq__(self, other):
        if isinstance(other, OCRLectureInfo):
            return (self.lectureName, self.lecClassification, self.lecCredit) == (other.lectureName, other.lecClassification, other.lecCredit)
        return False

    def __hash__(self):
        return hash((self.lectureName, self.lecClassification, self.lecCredit))


class OCRResponse(BaseModel):
    userTakenLectures: List[OCRLectureInfo]


class OCRRequest(BaseModel):
    user_id: str
    ocrResults: List[str]


class TakenLectureManaullyUpdate(BaseModel):
    user_id: str
    lecName: str
    Classification: str
    lecCredit: int
    userCredit: Optional[str] = None


class TakenLectureAutoUpdate(BaseModel):
    user_id: str
    year: int
    semester: str
    lecName: str
    lecNumber: str


class TakenLectureDelete(BaseModel):
    user_id: str
    id: int


class TakenLectureUpdate(BaseModel):
    user_id: str
    lecName: str
    Classification: str
    lecCredit: int
    userCredit: Optional[str] = None
    id: int


class PriorityUpdate(BaseModel):
    user_id: str
    lecNumber: str
    year: int
    semester: str
    priority: str


class ListedLecturInfoUpdate(BaseModel):
    user_id: str
    lecNumber: str
    year: int
    semester: str
    memo: str
    classroom: str


class ManuallyAddListedLecture(BaseModel):
    user_id: str
    year: int
    semester: str
    classroom: Optional[str] = None
    memo: Optional[str] = None
    lecName: str
    lecTime: Optional[str] = None


class AdminLectureSearch(BaseModel):
    year: int
    semester: str
    search_term: str


class AdminLectureEdit(BaseModel):
    lecNumber: Optional[str] = None
    lecName: Optional[str] = None
    lecProfessor: Optional[str] = None
    lecClassification: Optional[str] = None
    lecTheme: Optional[str] = None
    lecCredit: Optional[int] = None
    lecTime: Optional[str] = None
    lecWeekTime: Optional[str] = None
    lecClassroom: Optional[str] = None
    isLecClose: Optional[bool] = None
    takenPeople1yearsAgo: Optional[int] = None
    takenPeople2yearsAgo: Optional[int] = None
    takenPeople3yearsAgo: Optional[int] = None
    ForeignLanguage: Optional[bool] = None
    percentageOfOnline: Optional[int] = None
    isPNP: Optional[bool] = None
    isEngineering: Optional[bool] = None
    isTBL: Optional[bool] = None
    isPBL: Optional[bool] = None
    isSeminar: Optional[bool] = None
    isSmall: Optional[bool] = None
    isConvergence: Optional[bool] = None
    isTeamTeaching: Optional[bool] = None
    isFocus: Optional[bool] = None
    isExperimentDesign: Optional[bool] = None
    isELearning: Optional[bool] = None
    isArt: Optional[bool] = None
    representCompetency: Optional[str] = None
    learningGoalNmethod: Optional[str] = None
    Overview: Optional[str] = None
    VCompetencyRatio: Optional[float] = None
    LCompetencyRatio: Optional[float] = None
    evaluationRatio: Optional[float] = None
    mainBook: Optional[str] = None
    scheduleNcontent: Optional[str] = None
    canTakeBunBan: Optional[bool] = None
    majorRecogBunBan: Optional[bool] = None
    canTakeOnly1year: Optional[bool] = None
    canTakeOnly2year: Optional[bool] = None
    canTakeOnly3year: Optional[bool] = None
    canTakeOnly4year: Optional[bool] = None
    canTakeOnly5year: Optional[bool] = None
    canTakeForeignPeople: Optional[bool] = None
    canTakeMultipleMajor: Optional[bool] = None
    canTakeOnlyAthlete: Optional[bool] = None
    canTakeOnlyChambit: Optional[bool] = None
    requirementClass: Optional[str] = None
    lecLinkedMajorDifficulty: Optional[str] = None
    password: str


class AdminEditTime(BaseModel):
    lectureID: int
    lecTime: str
