import {configureStore} from "@reduxjs/toolkit"
import AuthSliceReducer from "./Slices/AuthSlice"
import LectureSliceReducer from "./Slices/LectureSlice"
import StatSliceReducer from "./Slices/StatSlice"
import BlogSliceReducer from "./Slices/BlogSlice"
import QASliceReducer from "./Slices/QASlice"
import SubjectSliceReducer from "./Slices/SubjectSlice"
import WalletSliceReducer from "./Slices/WalletSlice"
import AdminRechargeCodeSliceReducer from "./Slices/AdminRechargeCodeSlice"
import AdminUserSliceReducer from "./Slices/AdminUserSlice"
import WhatsAppServiceSliceReducer from "./Slices/WhatsAppServiceSlice"
import CourseSliceReducer from "./Slices/CourseSlice"
import ExamSliceReducer from "./Slices/ExamSlice"
import GradeSliceReducer from "./Slices/GradeSlice"
import InstructorSliceReducer from "./Slices/InstructorSlice"
import StageSliceReducer from "./Slices/StageSlice"
import VideoProgressSliceReducer from "./Slices/VideoProgressSlice"
import DeviceManagementSliceReducer from "./Slices/DeviceManagementSlice"
import LiveMeetingSliceReducer from "./Slices/LiveMeetingSlice"
import CourseAccessSliceReducer from "./Slices/CourseAccessSlice"
import EssayExamSliceReducer from "./Slices/EssayExamSlice"
import AttendanceSliceReducer from "./Slices/AttendanceSlice"
import GroupsSliceReducer from "./Slices/GroupsSlice"
import UsersSliceReducer from "./Slices/UsersSlice"
import FinancialSliceReducer from "./Slices/FinancialSlice"

 const store = configureStore({
    reducer: {
        auth: AuthSliceReducer,

    
        lecture: LectureSliceReducer,
        stat: StatSliceReducer,
        blog: BlogSliceReducer,
        qa: QASliceReducer,
        subject: SubjectSliceReducer,
        wallet: WalletSliceReducer,
        adminRechargeCode: AdminRechargeCodeSliceReducer,
        adminUser: AdminUserSliceReducer,
        whatsappService: WhatsAppServiceSliceReducer,
        course: CourseSliceReducer,

        courseAccess: CourseAccessSliceReducer,
          exam: ExamSliceReducer,
  grade: GradeSliceReducer,
  instructor: InstructorSliceReducer,
  stage: StageSliceReducer,
  videoProgress: VideoProgressSliceReducer,
  deviceManagement: DeviceManagementSliceReducer,
  liveMeeting: LiveMeetingSliceReducer,
  essayExam: EssayExamSliceReducer,
  attendance: AttendanceSliceReducer,
  groups: GroupsSliceReducer,
  users: UsersSliceReducer,
  financial: FinancialSliceReducer
    },
    devTools: true
})

export default store