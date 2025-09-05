import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminCourses } from '../../Redux/Slices/CourseSlice';
import { getAllStages } from '../../Redux/Slices/StageSlice';
import { getAllSubjects } from '../../Redux/Slices/SubjectSlice';
import Layout from '../../Layout/Layout';
import { FaChevronDown, FaChevronRight, FaEdit, FaBookOpen, FaSearch, FaBook, FaLayerGroup } from 'react-icons/fa';
import { axiosInstance } from '../../Helpers/axiosInstance';
import { toast } from 'react-hot-toast';
import { getCourseById } from '../../Redux/Slices/CourseSlice';
import { generateImageUrl } from '../../utils/fileUtils';

function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // 12-hour format with AM/PM
  });
}

// Helper function to convert numbers to Arabic ordinal numbers
function getArabicOrdinalNumber(num) {
  const arabicOrdinals = {
    1: 'الأول',
    2: 'الثاني',
    3: 'الثالث',
    4: 'الرابع',
    5: 'الخامس',
    6: 'السادس',
    7: 'السابع',
    8: 'الثامن',
    9: 'التاسع',
    10: 'العاشر',
    11: 'الحادي عشر',
    12: 'الثاني عشر',
    13: 'الثالث عشر',
    14: 'الرابع عشر',
    15: 'الخامس عشر',
    16: 'السادس عشر',
    17: 'السابع عشر',
    18: 'الثامن عشر',
    19: 'التاسع عشر',
    20: 'العشرون'
  };
  
  if (num <= 20) {
    return arabicOrdinals[num];
  } else {
    // For numbers above 20, use a more generic approach
    return `السؤال رقم ${num}`;
  }
}

const LessonContentModal = ({ courseId, unitId, lessonId, onClose }) => {
  const dispatch = useDispatch();
  const { courses } = useSelector(state => state.course);
  
  // Find the course from the admin courses list
  const course = courses.find(c => c._id === courseId);
  let lesson = null;
  
  console.log('=== ADMIN LESSON MODAL DEBUG ===');
  console.log('Course ID:', courseId);
  console.log('Unit ID:', unitId);
  console.log('Lesson ID:', lessonId);
  console.log('Found course:', course?.title);
  
  if (course) {
    if (unitId) {
      const unit = course.units.find(u => u._id === unitId);
      console.log('Found unit:', unit?.title);
      if (unit) {
        lesson = unit.lessons.find(l => l._id === lessonId);
        console.log('Found lesson in unit:', lesson?.title);
      }
    } else {
      lesson = course.directLessons.find(l => l._id === lessonId);
      console.log('Found direct lesson:', lesson?.title);
    }
  }
  
  console.log('Final lesson data:', lesson);
  console.log('Lesson videos:', lesson?.videos);
  console.log('Lesson PDFs:', lesson?.pdfs);
  console.log('Lesson exams:', lesson?.exams);
  console.log('Lesson trainings:', lesson?.trainings);
  const [tab, setTab] = useState('videos');
  const [videos, setVideos] = useState(lesson?.videos || []);
  const [pdfs, setPdfs] = useState(lesson?.pdfs || []);
  const [exams, setExams] = useState(lesson?.exams || []);
  const [essayExams, setEssayExams] = useState([]);
  const [trainings, setTrainings] = useState(lesson?.trainings || []);
  const [newVideo, setNewVideo] = useState({ url: '', title: '', description: '', publishDate: '' });
  const [newPdf, setNewPdf] = useState({ url: '', title: '', fileName: '', publishDate: '' });
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    openDate: '',
    closeDate: '',
    questions: []
  });
  const [newEssayExam, setNewEssayExam] = useState({
    title: '',
    description: '',
    timeLimit: 60,
    openDate: '',
    closeDate: '',
    allowLateSubmission: false,
    lateSubmissionPenalty: 10,
    questions: []
  });
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    openDate: '',
    questions: []
  });
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    image: '',
    numberOfOptions: 4
  });
  const [newTrainingQuestion, setNewTrainingQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    image: '',
    numberOfOptions: 4
  });
  const [newEssayQuestion, setNewEssayQuestion] = useState({
    question: '',
    description: '',
    maxGrade: 100,
    allowFileUpload: false,
    allowedFileTypes: ['pdf', 'doc', 'docx'],
    maxFileSize: 10,
    image: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editVideoIndex, setEditVideoIndex] = useState(null);
  const [editPdfIndex, setEditPdfIndex] = useState(null);
  const [editExamIndex, setEditExamIndex] = useState(null);
  const [editEssayExamIndex, setEditEssayExamIndex] = useState(null);
  const [editTrainingIndex, setEditTrainingIndex] = useState(null);
  // Exam question edit
  const [editExamQuestionIndex, setEditExamQuestionIndex] = useState(null);
  // Essay exam question edit
  const [editEssayQuestionIndex, setEditEssayQuestionIndex] = useState(null);
  // Training question edit
  const [editTrainingQuestionIndex, setEditTrainingQuestionIndex] = useState(null);
  // Track expanded exams and trainings
  const [expandedExams, setExpandedExams] = useState(new Set());
  const [expandedEssayExams, setExpandedEssayExams] = useState(new Set());
  const [expandedTrainings, setExpandedTrainings] = useState(new Set());
  const [hasExamDraft, setHasExamDraft] = useState(false);

  // Draft keys for autosave (scoped per lesson)
  const draftPrefix = `ccm:${courseId}:${unitId || 'direct'}:${lessonId}`;
  const DRAFT_KEYS = {
    exam: `${draftPrefix}:newExam`,
    examsList: `${draftPrefix}:examsList`,
    training: `${draftPrefix}:newTraining`,
    trainingsList: `${draftPrefix}:trainingsList`,
    essayExam: `${draftPrefix}:newEssayExam`,
    examQ: `${draftPrefix}:newQuestion`,
    trainingQ: `${draftPrefix}:newTrainingQuestion`,
    essayQ: `${draftPrefix}:newEssayQuestion`
  };

  // Load drafts on mount/lesson change
  useEffect(() => {
    try {
      const e = localStorage.getItem(DRAFT_KEYS.exam);
      if (e) setNewExam(prev => ({ ...prev, ...JSON.parse(e) }));
    } catch {}
    try {
      const el = localStorage.getItem(DRAFT_KEYS.examsList);
      if (el) {
        const draftExams = JSON.parse(el);
        if (Array.isArray(draftExams) && draftExams.length > 0) {
          // Merge with existing lesson exams later in lesson effect
          setExams(prev => {
            const existingWithIds = (prev || []).filter(ex => ex && ex._id);
            const onlyDrafts = draftExams.filter(ex => !ex._id);
            return [...existingWithIds, ...onlyDrafts];
          });
        }
      }
    } catch {}
    try {
      const t = localStorage.getItem(DRAFT_KEYS.training);
      if (t) setNewTraining(prev => ({ ...prev, ...JSON.parse(t) }));
    } catch {}
    try {
      const tl = localStorage.getItem(DRAFT_KEYS.trainingsList);
      if (tl) {
        const draftTrainings = JSON.parse(tl);
        if (Array.isArray(draftTrainings) && draftTrainings.length > 0) {
          setTrainings(prev => {
            const existingWithIds = (prev || []).filter(tr => tr && tr._id);
            const onlyDrafts = draftTrainings.filter(tr => !tr._id);
            return [...existingWithIds, ...onlyDrafts];
          });
        }
      }
    } catch {}
    try {
      const ee = localStorage.getItem(DRAFT_KEYS.essayExam);
      if (ee) setNewEssayExam(prev => ({ ...prev, ...JSON.parse(ee) }));
    } catch {}
    try {
      const q = localStorage.getItem(DRAFT_KEYS.examQ);
      if (q) setNewQuestion(prev => ({ ...prev, ...JSON.parse(q) }));
    } catch {}
    try {
      const tq = localStorage.getItem(DRAFT_KEYS.trainingQ);
      if (tq) setNewTrainingQuestion(prev => ({ ...prev, ...JSON.parse(tq) }));
    } catch {}
    try {
      const eq = localStorage.getItem(DRAFT_KEYS.essayQ);
      if (eq) setNewEssayQuestion(prev => ({ ...prev, ...JSON.parse(eq) }));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Autosave drafts when state changes
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEYS.exam, JSON.stringify(newExam)); } catch {}
  }, [newExam, DRAFT_KEYS.exam]);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEYS.training, JSON.stringify(newTraining)); } catch {}
  }, [newTraining, DRAFT_KEYS.training]);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEYS.essayExam, JSON.stringify(newEssayExam)); } catch {}
  }, [newEssayExam, DRAFT_KEYS.essayExam]);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEYS.examQ, JSON.stringify(newQuestion)); } catch {}
  }, [newQuestion, DRAFT_KEYS.examQ]);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEYS.trainingQ, JSON.stringify(newTrainingQuestion)); } catch {}
  }, [newTrainingQuestion, DRAFT_KEYS.trainingQ]);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEYS.essayQ, JSON.stringify(newEssayQuestion)); } catch {}
  }, [newEssayQuestion, DRAFT_KEYS.essayQ]);

  // ===== Server-side drafts (persistent across devices) =====
  const getDraftUrl = (type) => {
    const base = unitId
      ? `/drafts/course/${courseId}/unit/${unitId}/lesson/${lessonId}/${type}`
      : `/drafts/course/${courseId}/lesson/${lessonId}/${type}`;
    return base;
  };

  const saveServerDraft = async (type, data) => {
    try {
      // Avoid noisy saves when lesson is not ready
      if (!courseId || !lessonId) return;
      await axiosInstance.post(getDraftUrl(type), { data });
    } catch (e) {
      // Silent fail to avoid disrupting typing
      console.debug('Draft save failed (server):', e?.message);
    }
  };

  const loadServerDraft = async (type) => {
    try {
      if (!courseId || !lessonId) return null;
      const url = unitId
        ? `/drafts/course/${courseId}/unit/${unitId}/lesson/${lessonId}/${type}`
        : `/drafts/course/${courseId}/lesson/${lessonId}/${type}`;
      const res = await axiosInstance.get(url);
      if (res?.data?.success && Array.isArray(res.data.data) && res.data.data.length) {
        return res.data.data[0]?.data || null; // latest by controller sort
      }
    } catch (e) {
      console.debug('Draft load failed (server):', e?.message);
    }
    return null;
  };

  // Load drafts from server when lesson changes
  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      const [examDraft, trainingDraft, essayDraft] = await Promise.all([
        loadServerDraft('exam'),
        loadServerDraft('training'),
        loadServerDraft('essay-exam')
      ]);

      if (!mounted) return;

      if (examDraft) {
        if (examDraft.newExam) setNewExam(prev => ({ ...prev, ...examDraft.newExam }));
        if (examDraft.newQuestion) setNewQuestion(prev => ({ ...prev, ...examDraft.newQuestion }));
        if (Array.isArray(examDraft.examsDrafts) && examDraft.examsDrafts.length) {
          setExams(prev => ([...(prev || [])].concat(examDraft.examsDrafts.filter(ex => !ex?._id))));
        }
      }

      if (trainingDraft) {
        if (trainingDraft.newTraining) setNewTraining(prev => ({ ...prev, ...trainingDraft.newTraining }));
        if (trainingDraft.newTrainingQuestion) setNewTrainingQuestion(prev => ({ ...prev, ...trainingDraft.newTrainingQuestion }));
        if (Array.isArray(trainingDraft.trainingsDrafts) && trainingDraft.trainingsDrafts.length) {
          setTrainings(prev => ([...(prev || [])].concat(trainingDraft.trainingsDrafts.filter(tr => !tr?._id))));
        }
      }

      if (essayDraft) {
        if (essayDraft.newEssayExam) setNewEssayExam(prev => ({ ...prev, ...essayDraft.newEssayExam }));
        if (essayDraft.newEssayQuestion) setNewEssayQuestion(prev => ({ ...prev, ...essayDraft.newEssayQuestion }));
      }
    };
    loadAll();
    return () => { mounted = false; };
  }, [courseId, unitId, lessonId]);

  // Compose payloads and autosave to server (debounced by React batching)
  useEffect(() => {
    const draft = {
      newExam,
      newQuestion,
      // persist only unsaved ones
      examsDrafts: (exams || []).filter(ex => !ex?._id)
    };
    saveServerDraft('exam', draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newExam, newQuestion, exams]);

  useEffect(() => {
    const draft = {
      newTraining,
      newTrainingQuestion,
      trainingsDrafts: (trainings || []).filter(tr => !tr?._id)
    };
    saveServerDraft('training', draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newTraining, newTrainingQuestion, trainings]);

  useEffect(() => {
    const draft = {
      newEssayExam,
      newEssayQuestion
    };
    saveServerDraft('essay-exam', draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newEssayExam, newEssayQuestion]);

  // Flush on unload using sendBeacon if available
  useEffect(() => {
    const handler = () => {
      try {
        const send = (type, payload) => {
          const url = (axiosInstance.defaults.baseURL || '') + getDraftUrl(type);
          if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify({ data: payload })], { type: 'application/json' });
            navigator.sendBeacon(url, blob);
          }
        };
        send('exam', { newExam, newQuestion, examsDrafts: (exams || []).filter(ex => !ex?._id) });
        send('training', { newTraining, newTrainingQuestion, trainingsDrafts: (trainings || []).filter(tr => !tr?._id) });
        send('essay-exam', { newEssayExam, newEssayQuestion });
      } catch {}
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [newExam, newQuestion, exams, newTraining, newTrainingQuestion, trainings, newEssayExam, newEssayQuestion]);

  // Helper: scan localStorage for any exam-related drafts for this lesson
  const scanExamDraftsForLesson = () => {
    try {
      const keys = Object.keys(localStorage);
      const lessonTag = `${courseId}`; // coarse filter by course; we will parse lessonId match below
      const matches = keys.filter(k => k.startsWith('ccm:') && k.includes(lessonTag) && (k.endsWith(':newExam') || k.endsWith(':examsList') || k.endsWith(':newQuestion')));
      // Ensure the key corresponds to this exact lessonId as last segment before the specific key
      const strictMatches = matches.filter(k => {
        // expected: ccm:courseId:unitOrDirect:lessonId:suffix
        const parts = k.split(':');
        return parts.length >= 5 && parts[3] === String(lessonId);
      });
      return strictMatches;
    } catch {
      return [];
    }
  };

  // Track presence of any exam draft for current lesson
  useEffect(() => {
    const keys = scanExamDraftsForLesson();
    setHasExamDraft(keys.length > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const restoreExamDraftsManually = () => {
    try {
      const keys = scanExamDraftsForLesson();
      let restored = false;
      // Restore list drafts
      keys.filter(k => k.endsWith(':examsList')).forEach(k => {
        try {
          const arr = JSON.parse(localStorage.getItem(k) || 'null');
          if (Array.isArray(arr) && arr.length) {
            const onlyDrafts = arr.filter(ex => !ex?._id);
            if (onlyDrafts.length) {
              setExams(prev => ([...(prev || []), ...onlyDrafts]));
              restored = true;
            }
          }
        } catch {}
      });
      // Restore single newExam/newQuestion as synthetic draft
      const examKey = keys.find(k => k.endsWith(':newExam')) || DRAFT_KEYS.exam;
      const qKey = keys.find(k => k.endsWith(':newQuestion')) || DRAFT_KEYS.examQ;
      let draft = null;
      let dq = null;
      try { draft = JSON.parse(localStorage.getItem(examKey) || 'null'); } catch {}
      try { dq = JSON.parse(localStorage.getItem(qKey) || 'null'); } catch {}
      const draftQuestion = dq && (dq.question || (Array.isArray(dq.options) && dq.options.some(opt => (opt || '').trim()))) ? {
        question: dq.question || '',
        options: Array.isArray(dq.options) && dq.options.length ? dq.options : ['', '', '', ''],
        correctAnswer: typeof dq.correctAnswer === 'number' ? dq.correctAnswer : 0,
        image: dq.image || '',
        numberOfOptions: dq.numberOfOptions || 4
      } : null;
      const hasDraftExamFields = !!(draft && (draft.title || draft.description || draft.openDate || draft.closeDate || (Array.isArray(draft.questions) && draft.questions.length)));
      if (hasDraftExamFields || draftQuestion) {
        setExams(prev => ([...(prev || []), {
          title: draft?.title || '',
          description: draft?.description || '',
          timeLimit: draft?.timeLimit || 30,
          openDate: draft?.openDate || '',
          closeDate: draft?.closeDate || '',
          questions: (Array.isArray(draft?.questions) && draft?.questions.length ? draft?.questions : (draftQuestion ? [draftQuestion] : []))
        }]));
        restored = true;
      }
      if (restored) setHasExamDraft(false);
    } catch {}
  };

  // PDF file upload handler
  const handlePdfFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const res = await axiosInstance.post('/upload/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setNewPdf(pdf => ({
          ...pdf,
          url: res.data.url,
          fileName: res.data.fileName || file.name,
        }));
        toast.success('تم رفع ملف PDF بنجاح');
      } else {
        toast.error(res.data.message || 'فشل في رفع ملف PDF');
      }
    } catch (err) {
      toast.error('فشل في رفع ملف PDF');
    } finally {
      setUploading(false);
    }
  };

  // Question image upload handler
  const handleQuestionImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setNewQuestion(q => ({
          ...q,
          image: res.data.url
        }));
        toast.success('تم رفع الصورة بنجاح');
      } else {
        toast.error(res.data.message || 'فشل في رفع الصورة');
      }
    } catch (err) {
      toast.error('فشل في رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  // Training question image upload handler
  const handleTrainingQuestionImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setNewTrainingQuestion(q => ({ ...q, image: res.data.url }));
        toast.success('تم رفع الصورة بنجاح');
      } else {
        toast.error(res.data.message || 'فشل في رفع الصورة');
      }
    } catch (err) {
      toast.error('فشل في رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  // Handle changing number of options for exam questions
  const handleExamQuestionOptionsChange = (numberOfOptions) => {
    const newOptions = Array(numberOfOptions).fill('').map((_, index) => 
      index < newQuestion.options.length ? newQuestion.options[index] : ''
    );
    
    // Reset correct answer if it's now out of range
    const correctAnswer = newQuestion.correctAnswer < numberOfOptions ? newQuestion.correctAnswer : 0;
    
    setNewQuestion(q => ({
      ...q,
      numberOfOptions,
      options: newOptions,
      correctAnswer
    }));
  };

  // Handle changing number of options for training questions
  const handleTrainingQuestionOptionsChange = (numberOfOptions) => {
    const newOptions = Array(numberOfOptions).fill('').map((_, index) => 
      index < newTrainingQuestion.options.length ? newTrainingQuestion.options[index] : ''
    );
    
    // Reset correct answer if it's now out of range
    const correctAnswer = newTrainingQuestion.correctAnswer < numberOfOptions ? newTrainingQuestion.correctAnswer : 0;
    
    setNewTrainingQuestion(q => ({
      ...q,
      numberOfOptions,
      options: newOptions,
      correctAnswer
    }));
  };

  const handleAddVideo = () => {
    if (!newVideo.url.trim()) return;
    setVideos([...videos, newVideo]);
    setNewVideo({ url: '', title: '', description: '', publishDate: '' });
  };
  const handleRemoveVideo = (idx) => {
    setVideos(videos.filter((_, i) => i !== idx));
  };

  const handleAddPdf = () => {
    if (!newPdf.url.trim()) return;
    setPdfs([...pdfs, newPdf]);
    setNewPdf({ url: '', title: '', fileName: '', publishDate: '' });
  };
  const handleRemovePdf = (idx) => {
    setPdfs(pdfs.filter((_, i) => i !== idx));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) return;
    setNewExam(exam => ({
      ...exam,
      questions: [...exam.questions, newQuestion]
    }));
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      image: '',
      numberOfOptions: 4
    });
    try { localStorage.removeItem(DRAFT_KEYS.examQ); } catch {}
  };

  const handleRemoveQuestion = (idx) => {
    setNewExam(exam => ({
      ...exam,
      questions: exam.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleAddTrainingQuestion = () => {
    if (!newTrainingQuestion.question.trim()) return;
    setNewTraining(training => ({
      ...training,
      questions: [...training.questions, newTrainingQuestion]
    }));
    setNewTrainingQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      image: '',
      numberOfOptions: 4
    });
    try { localStorage.removeItem(DRAFT_KEYS.trainingQ); } catch {}
  };

  const handleRemoveTrainingQuestion = (idx) => {
    setNewTraining(training => ({
      ...training,
      questions: training.questions.filter((_, i) => i !== idx)
    }));
  };

  // Essay exam handlers
  const handleAddEssayQuestion = () => {
    if (!newEssayQuestion.question.trim()) return;
    setNewEssayExam(exam => ({
      ...exam,
      questions: [...exam.questions, newEssayQuestion]
    }));
    setNewEssayQuestion({
      question: '',
      description: '',
      maxGrade: 100,
      allowFileUpload: false,
      allowedFileTypes: ['pdf', 'doc', 'docx'],
      maxFileSize: 10,
      image: ''
    });
    try { localStorage.removeItem(DRAFT_KEYS.essayQ); } catch {}
  };

  const handleRemoveEssayQuestion = (idx) => {
    setNewEssayExam(exam => ({
      ...exam,
      questions: exam.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleAddEssayExam = async () => {
    if (!newEssayExam.title.trim() || newEssayExam.questions.length === 0) {
      toast.error('يرجى إدخال عنوان الامتحان وإضافة أسئلة على الأقل');
      return;
    }
    
    setSaving(true);
    try {
      const response = await axiosInstance.post('/essay-exams/create', {
        courseId,
        lessonId,
        unitId,
        ...newEssayExam
      });
      
      if (response.data.success) {
        toast.success('تم إنشاء الامتحان المقالي بنجاح');
        setEssayExams(prev => [...prev, response.data.data]);
        setNewEssayExam({
          title: '',
          description: '',
          timeLimit: 60,
          openDate: '',
          closeDate: '',
          allowLateSubmission: false,
          lateSubmissionPenalty: 10,
          questions: []
        });
        try { localStorage.removeItem(DRAFT_KEYS.essayExam); } catch {}
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في إنشاء الامتحان المقالي');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEssayExam = async (examId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الامتحان المقالي؟')) return;
    
    setSaving(true);
    try {
      const response = await axiosInstance.delete(`/essay-exams/${examId}`);
      if (response.data.success) {
        toast.success('تم حذف الامتحان المقالي بنجاح');
        setEssayExams(prev => prev.filter(exam => exam._id !== examId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في حذف الامتحان المقالي');
    } finally {
      setSaving(false);
    }
  };

  // Edit essay exam handlers
  const handleEditEssayExam = (idx) => {
    setEditEssayExamIndex(idx);
    // Deep copy to avoid mutating list while editing
    const selected = essayExams[idx];
    setNewEssayExam({
      title: selected.title || '',
      description: selected.description || '',
      timeLimit: selected.timeLimit || 60,
      openDate: selected.openDate ? new Date(selected.openDate).toISOString().slice(0, 16) : '',
      closeDate: selected.closeDate ? new Date(selected.closeDate).toISOString().slice(0, 16) : '',
      allowLateSubmission: !!selected.allowLateSubmission,
      lateSubmissionPenalty: selected.lateSubmissionPenalty ?? 10,
      questions: (selected.questions || []).map(q => ({
        question: q.question || '',
        description: q.description || '',
        maxGrade: q.maxGrade ?? 100,
        allowFileUpload: !!q.allowFileUpload,
        allowedFileTypes: Array.isArray(q.allowedFileTypes) ? [...q.allowedFileTypes] : ['pdf','doc','docx'],
        maxFileSize: q.maxFileSize ?? 10,
        image: q.image || ''
      }))
    });
  };

  const handleSaveEditEssayExam = async () => {
    if (!newEssayExam.title.trim() || newEssayExam.questions.length === 0) {
      toast.error('يرجى إدخال عنوان الامتحان وإضافة أسئلة على الأقل');
      return;
    }
    const target = essayExams[editEssayExamIndex];
    if (!target?._id) return;

    setSaving(true);
    try {
      const payload = {
        title: newEssayExam.title,
        description: newEssayExam.description,
        timeLimit: newEssayExam.timeLimit,
        openDate: newEssayExam.openDate ? new Date(newEssayExam.openDate).toISOString() : null,
        closeDate: newEssayExam.closeDate ? new Date(newEssayExam.closeDate).toISOString() : null,
        allowLateSubmission: newEssayExam.allowLateSubmission,
        lateSubmissionPenalty: newEssayExam.lateSubmissionPenalty,
        questions: newEssayExam.questions
      };
      const res = await axiosInstance.put(`/essay-exams/${target._id}`, payload);
      if (res.data?.success) {
        toast.success('تم تحديث الامتحان المقالي بنجاح');
        // Update local list
        setEssayExams(prev => prev.map((ex, i) => i === editEssayExamIndex ? res.data.data : ex));
        // Reset form
        setEditEssayExamIndex(null);
        setNewEssayExam({
          title: '',
          description: '',
          timeLimit: 60,
          openDate: '',
          closeDate: '',
          allowLateSubmission: false,
          lateSubmissionPenalty: 10,
          questions: []
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في تحديث الامتحان المقالي');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditEssayExam = () => {
    setEditEssayExamIndex(null);
    setNewEssayExam({
      title: '',
      description: '',
      timeLimit: 60,
      openDate: '',
      closeDate: '',
      allowLateSubmission: false,
      lateSubmissionPenalty: 10,
      questions: []
    });
  };

  const handleAddExam = () => {
    if (!newExam.title.trim() || newExam.questions.length === 0) {
      console.log('Cannot add exam - missing title or questions');
      console.log('Title:', newExam.title);
      console.log('Questions length:', newExam.questions.length);
      return;
    }
    
    console.log('=== ADDING EXAM DEBUG ===');
    console.log('Exam to add:', newExam);
    console.log('Current exams state before adding:', exams);
    
    setExams(prevExams => {
      const newExams = [...prevExams, newExam];
      console.log('New exams state after adding:', newExams);
      return newExams;
    });
    
    // Reset the form
    setNewExam({
      title: '',
      description: '',
      timeLimit: 30,
      openDate: '',
      closeDate: '',
      questions: []
    });
    try { localStorage.removeItem(DRAFT_KEYS.exam); } catch {}
    
    console.log('Exam added successfully!');
  };

  const handleRemoveExam = (idx) => {
    console.log('Removing exam at index:', idx);
    console.log('Current exams:', exams);
    setExams(exams.filter((_, i) => i !== idx));
  };

  const handleAddTraining = () => {
    if (!newTraining.title.trim() || newTraining.questions.length === 0) return;
    setTrainings(prev => [...prev, newTraining]);
    setNewTraining({
      title: '',
      description: '',
      timeLimit: 30,
      openDate: '',
      questions: []
    });
    try { localStorage.removeItem(DRAFT_KEYS.training); } catch {}
  };

  const handleRemoveTraining = (idx) => {
    setTrainings(trainings.filter((_, i) => i !== idx));
  };

  // Function to refresh lesson data
  const refreshLessonData = async () => {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/lessons/${lessonId}?${unitId ? `unitId=${unitId}` : ''}`);
      if (response.data.success) {
        // Update the lesson data in the parent component
        // This will trigger the useEffect and update the local state
        const updatedLesson = response.data.data.lesson;
        console.log('🔄 Refreshed lesson data:', updatedLesson);
        
        // Update the local state directly
        setVideos(updatedLesson.videos || []);
        setPdfs(updatedLesson.pdfs || []);
        setExams(updatedLesson.exams || []);
        setTrainings(updatedLesson.trainings || []);
      }
    } catch (error) {
      console.error('Error refreshing lesson data:', error);
    }
  };

  const handleSaveVideos = async () => {
    setSaving(true);
    try {
      console.log('Saving videos for lesson:', lessonId);
      console.log('Videos to save:', videos);
      console.log('Videos with publishDate details:', videos.map(v => ({
        title: v.title,
        url: v.url,
        publishDate: v.publishDate,
        publishDateType: typeof v.publishDate,
        publishDateISO: v.publishDate ? new Date(v.publishDate).toISOString() : null
      })));
      console.log('Request data:', { unitId, videos });
      
      const response = await axiosInstance.put(`/courses/${courseId}/lessons/${lessonId}/content`, {
        unitId,
        videos
      });
      
      console.log('API Response:', response.data);
      
      toast.success('تم حفظ الفيديوهات بنجاح');
      // Refresh lesson data instead of course data
      await refreshLessonData();
      // onClose(); // Temporarily removed to see updated content
    } catch (error) {
      console.error('Error saving videos:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'فشل في حفظ الفيديوهات');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePdfs = async () => {
    setSaving(true);
    try {
      console.log('Saving PDFs for lesson:', lessonId);
      console.log('PDFs to save:', pdfs);
      console.log('PDFs with publishDate details:', pdfs.map(p => ({
        title: p.title,
        fileName: p.fileName,
        publishDate: p.publishDate,
        publishDateType: typeof p.publishDate,
        publishDateISO: p.publishDate ? new Date(p.publishDate).toISOString() : null
      })));
      console.log('Request data:', { unitId, pdfs });
      
      const response = await axiosInstance.put(`/courses/${courseId}/lessons/${lessonId}/content`, {
        unitId,
        pdfs
      });
      
      console.log('API Response:', response.data);
      
      toast.success('تم حفظ ملفات PDF بنجاح');
      // Refresh lesson data instead of course data
      await refreshLessonData();
      // onClose(); // Temporarily removed to see updated content
    } catch (error) {
      console.error('Error saving PDFs:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'فشل في حفظ ملفات PDF');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExams = async () => {
    setSaving(true);
    try {
      console.log('=== SAVING EXAMS DEBUG ===');
      console.log('Lesson ID:', lessonId);
      console.log('Course ID:', courseId);
      console.log('Unit ID:', unitId);
      console.log('Current exams state:', exams);
      console.log('Exams array length:', exams.length);
      console.log('Exams to save:', exams);
      console.log('Request data:', { unitId, exams });
      
      const response = await axiosInstance.put(`/courses/${courseId}/lessons/${lessonId}/content`, {
        unitId,
        exams
      });
      
      console.log('API Response:', response.data);
      
      toast.success('تم حفظ الامتحانات بنجاح');
      // Refresh lesson data instead of course data
      await refreshLessonData();
      try { localStorage.removeItem(DRAFT_KEYS.examsList); } catch {}
      onClose();
    } catch (error) {
      console.error('Error saving exams:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'فشل في حفظ الامتحانات');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTrainings = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.put(`/courses/${courseId}/lessons/${lessonId}/content`, {
        unitId,
        trainings
      });
      toast.success('تم حفظ التدريبات بنجاح');
      // Refresh lesson data instead of course data
      await refreshLessonData();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في حفظ التدريبات');
    } finally {
      setSaving(false);
    }
  };

  // TODO: Add handlers for Trainings

  useEffect(() => {
    if (lesson) {
      console.log('🔄 Updating local state from lesson prop');
      console.log('Lesson videos:', lesson.videos);
      console.log('Lesson PDFs:', lesson.pdfs);
      console.log('Lesson exams:', lesson.exams);
      console.log('Lesson trainings:', lesson.trainings);
      
      // Ensure existing questions have numberOfOptions field
      const processedExams = lesson.exams?.map(exam => ({
        ...exam,
        questions: exam.questions?.map(q => ({
          ...q,
          numberOfOptions: q.numberOfOptions || 4
        })) || []
      })) || [];
      
      const processedTrainings = lesson.trainings?.map(training => ({
        ...training,
        questions: training.questions?.map(q => ({
          ...q,
          numberOfOptions: q.numberOfOptions || 4
        })) || []
      })) || [];
      
      setVideos(lesson.videos || []);
      setPdfs(lesson.pdfs || []);
      // Merge persisted drafts for exams/trainings (without _id)
      try {
        const el = localStorage.getItem(DRAFT_KEYS.examsList);
        if (el) {
          const draftExams = JSON.parse(el);
          if (Array.isArray(draftExams) && draftExams.length > 0) {
            const onlyDrafts = draftExams.filter(ex => !ex._id);
            setExams([...(processedExams || []), ...onlyDrafts]);
          } else {
            setExams(processedExams);
          }
        } else {
          setExams(processedExams);
        }
      } catch {
        setExams(processedExams);
      }
      // Also surface single in-progress newExam/newQuestion draft as a list item
      try {
        const e = localStorage.getItem(DRAFT_KEYS.exam);
        const q = localStorage.getItem(DRAFT_KEYS.examQ);
        if (e) {
          const draft = JSON.parse(e);
          const draftQuestion = (() => {
            try {
              if (!q) return null;
              const dq = JSON.parse(q);
              if (dq && (dq.question || (Array.isArray(dq.options) && dq.options.some(opt => (opt || '').trim())))) {
                return {
                  question: dq.question || '',
                  options: Array.isArray(dq.options) && dq.options.length ? dq.options : ['', '', '', ''],
                  correctAnswer: typeof dq.correctAnswer === 'number' ? dq.correctAnswer : 0,
                  image: dq.image || '',
                  numberOfOptions: dq.numberOfOptions || 4
                };
              }
            } catch {}
            return null;
          })();

          const hasDraftExamFields = !!(draft && (draft.title || draft.description || draft.openDate || draft.closeDate));
          const hasDraftQuestions = Array.isArray(draft?.questions) && draft.questions.length > 0;

          if (hasDraftExamFields || hasDraftQuestions || !!draftQuestion) {
            setExams(prev => ([...(prev || []), {
              title: draft.title || '',
              description: draft.description || '',
              timeLimit: draft.timeLimit || 30,
              openDate: draft.openDate || '',
              closeDate: draft.closeDate || '',
              questions: (Array.isArray(draft.questions) && draft.questions.length ? draft.questions : (draftQuestion ? [draftQuestion] : []))
            }]));
          }
        }
      } catch {}
      try {
        const tl = localStorage.getItem(DRAFT_KEYS.trainingsList);
        if (tl) {
          const draftTrainings = JSON.parse(tl);
          if (Array.isArray(draftTrainings) && draftTrainings.length > 0) {
            const onlyDrafts = draftTrainings.filter(tr => !tr._id);
            setTrainings([...(processedTrainings || []), ...onlyDrafts]);
          } else {
            setTrainings(processedTrainings);
          }
        } else {
          setTrainings(processedTrainings);
        }
      } catch {
        setTrainings(processedTrainings);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, lessonId]);

  // Load essay exams for the lesson
  useEffect(() => {
    const loadEssayExams = async () => {
      if (!courseId || !lessonId) return;
      
      try {
        const response = await axiosInstance.get(`/essay-exams/course/${courseId}/lesson/${lessonId}?${unitId ? `unitId=${unitId}` : ''}`);
        if (response.data.success) {
          setEssayExams(response.data.data);
        }
      } catch (error) {
        console.error('Error loading essay exams:', error);
      }
    };

    loadEssayExams();
  }, [courseId, lessonId, unitId]);

  // Monitor exams state changes
  useEffect(() => {
    console.log('=== EXAMS STATE CHANGED ===');
    console.log('Current exams state:', exams);
    console.log('Exams length:', exams.length);
    // Persist only unsaved exams (without _id) as drafts
    try {
      const drafts = (exams || []).filter(ex => !ex?._id);
      if (drafts.length > 0) {
        localStorage.setItem(DRAFT_KEYS.examsList, JSON.stringify(drafts));
      } else {
        localStorage.removeItem(DRAFT_KEYS.examsList);
      }
    } catch {}
  }, [exams]);

  // Video edit handlers
  const handleEditVideo = (idx) => {
    setEditVideoIndex(idx);
    setNewVideo(videos[idx]);
  };
  const handleSaveEditVideo = () => {
    if (!newVideo.url.trim()) return;
    setVideos(videos.map((v, idx) => idx === editVideoIndex ? newVideo : v));
    setEditVideoIndex(null);
    setNewVideo({ url: '', title: '', description: '', publishDate: '' });
  };
  const handleCancelEditVideo = () => {
    setEditVideoIndex(null);
    setNewVideo({ url: '', title: '', description: '', publishDate: '' });
  };

  // PDF edit handlers
  const handleEditPdf = (idx) => {
    setEditPdfIndex(idx);
    setNewPdf(pdfs[idx]);
  };
  const handleSaveEditPdf = () => {
    if (!newPdf.url.trim()) return;
    setPdfs(pdfs.map((p, idx) => idx === editPdfIndex ? newPdf : p));
    setEditPdfIndex(null);
    setNewPdf({ url: '', title: '', fileName: '', publishDate: '' });
  };
  const handleCancelEditPdf = () => {
    setEditPdfIndex(null);
    setNewPdf({ url: '', title: '', fileName: '', publishDate: '' });
  };

  // Exam edit handlers
  const handleEditExam = (idx) => {
    setEditExamIndex(idx);
    setNewExam(exams[idx]);
  };
  const handleSaveEditExam = () => {
    if (!newExam.title.trim() || newExam.questions.length === 0) return;
    setExams(exams.map((e, idx) => idx === editExamIndex ? newExam : e));
    setEditExamIndex(null);
    setNewExam({
      title: '',
      description: '',
      timeLimit: 30,
      openDate: '',
      closeDate: '',
      questions: []
    });
  };
  const handleCancelEditExam = () => {
    setEditExamIndex(null);
    setNewExam({
      title: '',
      description: '',
      timeLimit: 30,
      openDate: '',
      closeDate: '',
      questions: []
    });
  };

  // Training edit handlers
  const handleEditTraining = (idx) => {
    setEditTrainingIndex(idx);
    setNewTraining(trainings[idx]);
  };
  const handleSaveEditTraining = () => {
    if (!newTraining.title.trim() || newTraining.questions.length === 0) return;
    setTrainings(trainings.map((t, idx) => idx === editTrainingIndex ? newTraining : t));
    setEditTrainingIndex(null);
    setNewTraining({
      title: '',
      description: '',
      timeLimit: 30,
      openDate: '',
      questions: []
    });
  };
  const handleCancelEditTraining = () => {
    setEditTrainingIndex(null);
    setNewTraining({
      title: '',
      description: '',
      timeLimit: 30,
      openDate: '',
      questions: []
    });
  };

  // Exam question edit handlers
  const handleEditExamQuestion = (idx) => {
    setEditExamQuestionIndex(idx);
    setNewQuestion(newExam.questions[idx]);
  };
  const handleSaveEditExamQuestion = () => {
    if (!newQuestion.question.trim()) return;
    setNewExam(exam => ({
      ...exam,
      questions: exam.questions.map((q, idx) => idx === editExamQuestionIndex ? newQuestion : q)
    }));
    setEditExamQuestionIndex(null);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      image: '',
      numberOfOptions: 4
    });
  };
  const handleCancelEditExamQuestion = () => {
    setEditExamQuestionIndex(null);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      image: '',
      numberOfOptions: 4
    });
  };

  // Training question edit handlers
  const handleEditTrainingQuestion = (idx) => {
    setEditTrainingQuestionIndex(idx);
    setNewTrainingQuestion(newTraining.questions[idx]);
  };
  const handleSaveEditTrainingQuestion = () => {
    if (!newTrainingQuestion.question.trim()) return;
    setNewTraining(training => ({
      ...training,
      questions: training.questions.map((q, idx) => idx === editTrainingQuestionIndex ? newTrainingQuestion : q)
    }));
    setEditTrainingQuestionIndex(null);
    setNewTrainingQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      image: '',
      numberOfOptions: 4
    });
  };
  const handleCancelEditTrainingQuestion = () => {
    setEditTrainingQuestionIndex(null);
    setNewTrainingQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      image: '',
      numberOfOptions: 4
    });
  };

  const [openSections, setOpenSections] = useState({
    videos: false,
    pdfs: false,
    exams: false,
    'essay-exams': false,
    trainings: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle expanded state for exams and trainings
  const toggleExamExpanded = (examIndex) => {
    setExpandedExams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(examIndex)) {
        newSet.delete(examIndex);
      } else {
        newSet.add(examIndex);
      }
      return newSet;
    });
  };

  const toggleEssayExamExpanded = (examIndex) => {
    setExpandedEssayExams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(examIndex)) {
        newSet.delete(examIndex);
      } else {
        newSet.add(examIndex);
      }
      return newSet;
    });
  };

  const toggleTrainingExpanded = (trainingIndex) => {
    setExpandedTrainings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trainingIndex)) {
        newSet.delete(trainingIndex);
      } else {
        newSet.add(trainingIndex);
      }
      return newSet;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-3 md:p-6" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-right">إدارة محتوى الدرس</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={refreshLessonData}
              className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 rounded border border-blue-600 hover:border-blue-800"
              title="تحديث البيانات"
            >
              🔄 تحديث
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">×</button>
          </div>
        </div>
        <div className="mb-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button className={`px-3 py-2 rounded-t ${tab === 'videos' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-300'}`} onClick={() => setTab('videos')}>فيديوهات</button>
          <button className={`px-3 py-2 rounded-t ${tab === 'pdfs' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-300'}`} onClick={() => setTab('pdfs')}>PDF</button>
          <button className={`px-3 py-2 rounded-t ${tab === 'exams' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-300'}`} onClick={() => setTab('exams')}>امتحانات</button>
          <button className={`px-3 py-2 rounded-t ${tab === 'essay-exams' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-300'}`} onClick={() => setTab('essay-exams')}>امتحانات مقالية</button>
          <button className={`px-3 py-2 rounded-t ${tab === 'trainings' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-300'}`} onClick={() => setTab('trainings')}>تدريبات</button>
        </div>
        {tab === 'videos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900 dark:text-white text-right">إضافة فيديو (رابط يوتيوب، عنوان، وصف اختياري)</div>
              <button 
                onClick={() => toggleSection('videos')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {openSections.videos ? 'إخفاء' : 'إظهار'}
                <span>{openSections.videos ? '▼' : '▶'}</span>
              </button>
            </div>
            {openSections.videos && (
              <>
                {/* Video Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white text-right">تفاصيل الفيديو</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" className="p-2 border rounded text-right" placeholder="رابط الفيديو *" value={newVideo.url} onChange={e => setNewVideo(v => ({ ...v, url: e.target.value }))} />
                    <input type="text" className="p-2 border rounded text-right" placeholder="عنوان الفيديو (اختياري)" value={newVideo.title} onChange={e => setNewVideo(v => ({ ...v, title: e.target.value }))} />
                    <textarea className="p-2 border rounded text-right" placeholder="وصف الفيديو (اختياري)" value={newVideo.description} onChange={e => setNewVideo(v => ({ ...v, description: e.target.value }))} rows="2" />
                    <input type="datetime-local" className="p-2 border rounded text-right" placeholder="تاريخ النشر" value={newVideo.publishDate} onChange={e => setNewVideo(v => ({ ...v, publishDate: e.target.value }))} />
                  </div>
                  <div className="flex justify-end">
                    {editVideoIndex !== null ? (
                      <div className="flex gap-2">
                        <button type="button" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleSaveEditVideo}>حفظ التعديل</button>
                        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={handleCancelEditVideo}>إلغاء</button>
                      </div>
                    ) : (
                      <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={handleAddVideo} disabled={!newVideo.url.trim()}>
                        إضافة الفيديو
                      </button>
                    )}
                  </div>
                </div>

                {/* Videos List */}
                {videos.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-right">الفيديوهات المضافة ({videos.length})</h3>
                    <div className="space-y-3">
                      {videos.map((video, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-600 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 text-right">
                              <p className="font-medium text-gray-900 dark:text-white">{video.title || 'بدون عنوان'}</p>
                              {video.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{video.description}</p>}
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 break-all">{video.url}</p>
                              {video.publishDate && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  تاريخ النشر: {formatDateTime(video.publishDate)}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mr-3">
                              <button type="button" className="text-blue-500 hover:text-blue-700 text-sm" onClick={() => handleEditVideo(idx)}>تعديل</button>
                              <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemoveVideo(idx)}>حذف</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Videos Button */}
                <div className="flex justify-end mt-6">
                  <button type="button" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50" onClick={handleSaveVideos} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : 'حفظ الفيديوهات'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {tab === 'pdfs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900 dark:text-white text-right">إضافة ملف PDF (رفع ملف، عنوان، اسم الملف)</div>
              <button 
                onClick={() => toggleSection('pdfs')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {openSections.pdfs ? 'إخفاء' : 'إظهار'}
                <span>{openSections.pdfs ? '▼' : '▶'}</span>
              </button>
            </div>
            {openSections.pdfs && (
              <>
                {/* PDF Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white text-right">تفاصيل ملف PDF</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input type="file" accept=".pdf" onChange={handlePdfFileChange} disabled={uploading} className="w-full p-2 border rounded text-right" />
                      {uploading && <span className="text-blue-600 text-xs text-right block mt-1">جاري رفع الملف...</span>}
                    </div>
                    <input type="text" className="p-2 border rounded text-right" placeholder="عنوان الملف (اختياري)" value={newPdf.title} onChange={e => setNewPdf(p => ({ ...p, title: e.target.value }))} />
                    <input type="text" className="p-2 border rounded text-right" placeholder="اسم الملف (اختياري)" value={newPdf.fileName} onChange={e => setNewPdf(p => ({ ...p, fileName: e.target.value }))} />
                    <input type="datetime-local" className="p-2 border rounded text-right" placeholder="تاريخ النشر" value={newPdf.publishDate} onChange={e => setNewPdf(p => ({ ...p, publishDate: e.target.value }))} />
                  </div>
                  <div className="flex justify-end">
                    {editPdfIndex !== null ? (
                      <div className="flex gap-2">
                        <button type="button" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleSaveEditPdf}>حفظ التعديل</button>
                        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={handleCancelEditPdf}>إلغاء</button>
                      </div>
                    ) : (
                      <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={handleAddPdf} disabled={!newPdf.url.trim()}>
                        إضافة ملف PDF
                      </button>
                    )}
                  </div>
                </div>

                {/* PDFs List */}
                {pdfs.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-right">ملفات PDF المضافة ({pdfs.length})</h3>
                    <div className="space-y-3">
                      {pdfs.map((pdf, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-600 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 text-right">
                              <p className="font-medium text-gray-900 dark:text-white">{pdf.title || 'بدون عنوان'}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 break-all">{pdf.fileName || pdf.url}</p>
                              {pdf.publishDate && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  تاريخ النشر: {formatDateTime(pdf.publishDate)}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mr-3">
                              <button type="button" className="text-blue-500 hover:text-blue-700 text-sm" onClick={() => handleEditPdf(idx)}>تعديل</button>
                              <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemovePdf(idx)}>حذف</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save PDFs Button */}
                <div className="flex justify-end mt-6">
                  <button type="button" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50" onClick={handleSavePdfs} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : 'حفظ ملفات PDF'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {tab === 'exams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900 dark:text-white text-right mb-4">إضافة امتحان جديد</div>
              <button 
                onClick={() => toggleSection('exams')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {openSections.exams ? 'إخفاء' : 'إظهار'}
                <span>{openSections.exams ? '▼' : '▶'}</span>
              </button>
            </div>
            {openSections.exams && (
              <>
                {/* Exam Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white text-right">تفاصيل الامتحان</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" className="p-2 border rounded text-right" placeholder="عنوان الامتحان *" value={newExam.title} onChange={e => setNewExam(exam => ({ ...exam, title: e.target.value }))} />
                    <input type="text" className="p-2 border rounded text-right" placeholder="وصف الامتحان (اختياري)" value={newExam.description} onChange={e => setNewExam(exam => ({ ...exam, description: e.target.value }))} />
                    <div className="flex items-center gap-2">
                      <input type="number" className="p-2 border rounded flex-1 text-right" placeholder="المدة بالدقائق" min="1" max="300" value={newExam.timeLimit} onChange={e => setNewExam(exam => ({ ...exam, timeLimit: parseInt(e.target.value) || 30 }))} />
                      <span className="text-sm text-gray-600">دقيقة</span>
                    </div>
                    <input type="datetime-local" className="p-2 border rounded text-right" placeholder="تاريخ ووقت الفتح" value={newExam.openDate} onChange={e => setNewExam(exam => ({ ...exam, openDate: e.target.value }))} />
                    <input type="datetime-local" className="p-2 border rounded text-right" placeholder="تاريخ ووقت الإغلاق" value={newExam.closeDate} onChange={e => setNewExam(exam => ({ ...exam, closeDate: e.target.value }))} />
                  </div>
                </div>

                {/* Add Exam Question */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white text-right">إضافة سؤال جديد</h3>
                  <textarea className="w-full p-2 border rounded text-right" placeholder="نص السؤال *" value={newQuestion.question} onChange={e => setNewQuestion(q => ({ ...q, question: e.target.value }))} rows="3" />
                  
                  {/* Question Image */}
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={handleQuestionImageChange} disabled={uploading} />
                    {uploading && <span className="text-blue-600 text-xs text-right">جاري رفع الصورة...</span>}
                    {newQuestion.image && (
                      <div className="flex items-center gap-2">
                        <img src={generateImageUrl(newQuestion.image)} alt="Question" className="w-16 h-16 object-cover rounded" />
                        <button type="button" className="text-red-500 text-sm" onClick={() => setNewQuestion(q => ({ ...q, image: '' }))}>حذف الصورة</button>
                      </div>
                    )}
                  </div>

                  {/* Number of Options Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-right">عدد الخيارات:</label>
                    <div className="flex gap-4 text-right">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="examNumberOfOptions"
                          value="2"
                          checked={newQuestion.numberOfOptions === 2}
                          onChange={(e) => handleExamQuestionOptionsChange(parseInt(e.target.value))}
                        />
                        <span>خياران</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="examNumberOfOptions"
                          value="4"
                          checked={newQuestion.numberOfOptions === 4}
                          onChange={(e) => handleExamQuestionOptionsChange(parseInt(e.target.value))}
                        />
                        <span>4 خيارات</span>
                      </label>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-right">الخيارات:</label>
                    {newQuestion.options.slice(0, newQuestion.numberOfOptions).map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input type="radio" name="correctAnswer" checked={newQuestion.correctAnswer === idx} onChange={() => setNewQuestion(q => ({ ...q, correctAnswer: idx }))} />
                        <input type="text" className="flex-1 p-2 border rounded text-right" placeholder={`الخيار ${idx + 1} *`} value={option} onChange={e => {
                          const newOptions = [...newQuestion.options];
                          newOptions[idx] = e.target.value;
                          setNewQuestion(q => ({ ...q, options: newOptions }));
                        }} />
                      </div>
                    ))}
                  </div>
                  
                  {editExamQuestionIndex !== null ? (
                    <div className="flex gap-2 justify-end">
                      <button type="button" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleSaveEditExamQuestion}>حفظ التعديل</button>
                      <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={handleCancelEditExamQuestion}>إلغاء</button>
                    </div>
                  ) : (
                    <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleAddQuestion} disabled={!newQuestion.question.trim() || newQuestion.options.slice(0, newQuestion.numberOfOptions).some(opt => !opt.trim())}>
                      إضافة السؤال
                    </button>
                  )}
                </div>

                {/* Questions List */}
                {newExam.questions.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-right">الأسئلة المضافة ({newExam.questions.length})</h3>
                    <div className="space-y-3">
                      {newExam.questions.map((question, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-600 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 text-right">
                              <p className="font-medium text-gray-900 dark:text-white">
                                <span className="text-blue-600 font-bold">السؤال {getArabicOrdinalNumber(idx + 1)}:</span> {question.question}
                              </p>
                              {question.image && <img src={generateImageUrl(question.image)} alt="Question" className="w-20 h-20 object-cover rounded mt-2" />}
                              <div className="mt-2 space-y-1">
                                {question.options.slice(0, question.numberOfOptions || 4).map((option, optIdx) => (
                                  <div key={optIdx} className={`text-sm ${optIdx === question.correctAnswer ? 'text-green-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {optIdx + 1}. {option} {optIdx === question.correctAnswer && '(إجابة صحيحة)'}
                                  </div>
                                ))}
                                <div className="text-xs text-blue-600 mt-1">
                                  عدد الخيارات: {question.numberOfOptions || 4}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mr-3">
                              <button type="button" className="text-blue-500 hover:text-blue-700 text-sm" onClick={() => handleEditExamQuestion(idx)}>تعديل</button>
                              <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemoveQuestion(idx)}>حذف</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Exam Button */}
                <div className="flex justify-end gap-2">
                  {editExamIndex !== null ? (
                    <>
                      <button type="button" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleSaveEditExam}>حفظ التعديل</button>
                      <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={handleCancelEditExam}>إلغاء</button>
                    </>
                  ) : (
                    <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={handleAddExam} disabled={!newExam.title.trim() || newExam.questions.length === 0}>
                      إضافة الامتحان
                    </button>
                  )}
                </div>

                {/* Existing Exams */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white text-right">الامتحانات المضافة</h3>
                    {hasExamDraft && (
                      <button
                        type="button"
                        className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        onClick={restoreExamDraftsManually}
                      >
                        استعادة المسودة
                      </button>
                    )}
                  </div>
                  {exams.length === 0 ? (
                    <div className="text-gray-400 text-sm text-right">لا توجد امتحانات مضافة</div>
                  ) : (
                    <div className="space-y-3">
                      {exams.map((exam, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 text-right">
                              <h4 className="font-medium text-gray-900 dark:text-white">{exam.title} {!exam._id && <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded ml-2">(مسودة)</span>}</h4>
                              {exam.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{exam.description}</p>}
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                <div>تاريخ الفتح: {formatDateTime(exam.openDate)}</div>
                                <div>تاريخ الإغلاق: {formatDateTime(exam.closeDate)}</div>
                                <div>عدد الأسئلة: {exam.questions?.length || 0}</div>
                              </div>
                              <button 
                                onClick={() => toggleExamExpanded(idx)}
                                className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center gap-1"
                              >
                                {expandedExams.has(idx) ? 'إخفاء الأسئلة' : 'عرض الأسئلة'}
                                <span>{expandedExams.has(idx) ? '▼' : '▶'}</span>
                              </button>
                            </div>
                            <div className="flex gap-2 mr-3">
                              <button type="button" className="text-blue-500 hover:text-blue-700 text-sm" onClick={() => handleEditExam(idx)}>تعديل</button>
                              <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemoveExam(idx)}>حذف</button>
                            </div>
                          </div>
                          
                          {/* Expandable Questions Section */}
                          {expandedExams.has(idx) && exam.questions && exam.questions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-3 text-right">الأسئلة:</h5>
                              <div className="space-y-3">
                                {exam.questions.map((question, qIdx) => (
                                  <div key={qIdx} className="bg-white dark:bg-gray-600 rounded p-3">
                                    <div className="text-right">
                                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                                        <span className="text-blue-600 font-bold">السؤال {getArabicOrdinalNumber(qIdx + 1)}:</span> {question.question}
                                      </p>
                                      {question.image && <img src={generateImageUrl(question.image)} alt="Question" className="w-20 h-20 object-cover rounded mb-2" />}
                                      <div className="space-y-1">
                                        {question.options.slice(0, question.numberOfOptions || 4).map((option, optIdx) => (
                                          <div key={optIdx} className={`text-sm ${optIdx === question.correctAnswer ? 'text-green-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {optIdx + 1}. {option} {optIdx === question.correctAnswer && '(إجابة صحيحة)'}
                                          </div>
                                        ))}
                                        <div className="text-xs text-blue-600 mt-1">
                                          عدد الخيارات: {question.numberOfOptions || 4}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Exams Button */}
                <div className="flex justify-end mt-6">
                  <button type="button" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50" onClick={handleSaveExams} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : 'حفظ الامتحانات'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {tab === 'essay-exams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900 dark:text-white text-right mb-4">إضافة امتحان مقالي جديد</div>
              <button 
                onClick={() => toggleSection('essay-exams')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {openSections['essay-exams'] ? 'إخفاء' : 'إظهار'}
                <span>{openSections['essay-exams'] ? '▼' : '▶'}</span>
              </button>
            </div>
            {openSections['essay-exams'] && (
              <>
                {/* Essay Exam Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white text-right">تفاصيل الامتحان المقالي</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" className="p-2 border rounded text-right" placeholder="عنوان الامتحان *" value={newEssayExam.title} onChange={e => setNewEssayExam(exam => ({ ...exam, title: e.target.value }))} />
                    <input type="text" className="p-2 border rounded text-right" placeholder="وصف الامتحان (اختياري)" value={newEssayExam.description} onChange={e => setNewEssayExam(exam => ({ ...exam, description: e.target.value }))} />
                    <div className="flex items-center gap-2">
                      <input type="number" className="p-2 border rounded flex-1 text-right" placeholder="المدة بالدقائق" min="1" max="300" value={newEssayExam.timeLimit} onChange={e => setNewEssayExam(exam => ({ ...exam, timeLimit: parseInt(e.target.value) || 60 }))} />
                      <span className="text-sm text-gray-600">دقيقة</span>
                    </div>
                    <input type="datetime-local" className="p-2 border rounded text-right" placeholder="تاريخ ووقت الفتح" value={newEssayExam.openDate} onChange={e => setNewEssayExam(exam => ({ ...exam, openDate: e.target.value }))} />
                    <input type="datetime-local" className="p-2 border rounded text-right" placeholder="تاريخ ووقت الإغلاق" value={newEssayExam.closeDate} onChange={e => setNewEssayExam(exam => ({ ...exam, closeDate: e.target.value }))} />
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="allowLateSubmission" checked={newEssayExam.allowLateSubmission} onChange={e => setNewEssayExam(exam => ({ ...exam, allowLateSubmission: e.target.checked }))} />
                      <label htmlFor="allowLateSubmission" className="text-sm text-gray-700 dark:text-gray-300">السماح بالتسليم المتأخر</label>
                    </div>
                    {newEssayExam.allowLateSubmission && (
                      <div className="flex items-center gap-2">
                        <input type="number" className="p-2 border rounded flex-1 text-right" placeholder="خصم النسبة المئوية" min="0" max="100" value={newEssayExam.lateSubmissionPenalty} onChange={e => setNewEssayExam(exam => ({ ...exam, lateSubmissionPenalty: parseInt(e.target.value) || 10 }))} />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Essay Question */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white text-right">إضافة سؤال مقالي جديد</h3>
                  <textarea className="w-full p-2 border rounded text-right" placeholder="نص السؤال *" value={newEssayQuestion.question} onChange={e => setNewEssayQuestion(q => ({ ...q, question: e.target.value }))} rows="3" />
                  <textarea className="w-full p-2 border rounded text-right" placeholder="وصف السؤال (اختياري)" value={newEssayQuestion.description} onChange={e => setNewEssayQuestion(q => ({ ...q, description: e.target.value }))} rows="2" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input type="number" className="p-2 border rounded flex-1 text-right" placeholder="الدرجة القصوى" min="1" max="100" value={newEssayQuestion.maxGrade} onChange={e => setNewEssayQuestion(q => ({ ...q, maxGrade: parseInt(e.target.value) || 100 }))} />
                      <span className="text-sm text-gray-600">درجة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" className="p-2 border rounded flex-1 text-right" placeholder="الحد الأقصى لحجم الملف" min="1" max="50" value={newEssayQuestion.maxFileSize} onChange={e => setNewEssayQuestion(q => ({ ...q, maxFileSize: parseInt(e.target.value) || 10 }))} />
                      <span className="text-sm text-gray-600">ميجابايت</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="allowFileUpload" checked={newEssayQuestion.allowFileUpload} onChange={e => setNewEssayQuestion(q => ({ ...q, allowFileUpload: e.target.checked }))} />
                    <label htmlFor="allowFileUpload" className="text-sm text-gray-700 dark:text-gray-300">السماح برفع ملف</label>
                  </div>

                  {newEssayQuestion.allowFileUpload && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-right">أنواع الملفات المسموحة:</label>
                      <div className="flex flex-wrap gap-2 text-right">
                        {['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'].map(type => (
                          <label key={type} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newEssayQuestion.allowedFileTypes.includes(type)}
                              onChange={(e) => {
                                const newTypes = e.target.checked
                                  ? [...newEssayQuestion.allowedFileTypes, type]
                                  : newEssayQuestion.allowedFileTypes.filter(t => t !== type);
                                setNewEssayQuestion(q => ({ ...q, allowedFileTypes: newTypes }));
                              }}
                            />
                            <span className="text-sm">{type.toUpperCase()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Question Image */}
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={handleQuestionImageChange} disabled={uploading} />
                    {uploading && <span className="text-blue-600 text-xs text-right">جاري رفع الصورة...</span>}
                    {newEssayQuestion.image && (
                      <div className="flex items-center gap-2">
                        <img src={generateImageUrl(newEssayQuestion.image)} alt="Question" className="w-16 h-16 object-cover rounded" />
                        <button type="button" className="text-red-500 text-sm" onClick={() => setNewEssayQuestion(q => ({ ...q, image: '' }))}>حذف الصورة</button>
                      </div>
                    )}
                  </div>
                  
                  <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleAddEssayQuestion} disabled={!newEssayQuestion.question.trim()}>
                    إضافة السؤال المقالي
                  </button>
                </div>

                {/* Questions List */}
                {newEssayExam.questions.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-right">الأسئلة المقالية المضافة ({newEssayExam.questions.length})</h3>
                    <div className="space-y-3">
                      {newEssayExam.questions.map((question, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-600 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 text-right">
                              <p className="font-medium text-gray-900 dark:text-white">
                                <span className="text-blue-600 font-bold">السؤال {getArabicOrdinalNumber(idx + 1)}:</span> {question.question}
                              </p>
                              {question.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{question.description}</p>}
                              {question.image && <img src={generateImageUrl(question.image)} alt="Question" className="w-20 h-20 object-cover rounded mt-2" />}
                              <div className="mt-2 space-y-1">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                  الدرجة القصوى: {question.maxGrade}
                                </div>
                                {question.allowFileUpload && (
                                  <div className="text-sm text-gray-600 dark:text-gray-300">
                                    رفع ملف: مسموح ({question.allowedFileTypes.join(', ')}) - الحد الأقصى: {question.maxFileSize} ميجابايت
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 mr-3">
                              <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemoveEssayQuestion(idx)}>حذف</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Essay Exam Button */}
                <div className="flex justify-end">
                  {editEssayExamIndex !== null ? (
                    <div className="flex gap-2">
                      <button type="button" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50" onClick={handleSaveEditEssayExam} disabled={saving}>
                        {saving ? 'جاري الحفظ...' : 'حفظ التعديل'}
                      </button>
                      <button type="button" className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500" onClick={handleCancelEditEssayExam} disabled={saving}>
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={handleAddEssayExam} disabled={!newEssayExam.title.trim() || newEssayExam.questions.length === 0 || saving}>
                      {saving ? 'جاري الإنشاء...' : 'إنشاء الامتحان المقالي'}
                    </button>
                  )}
                </div>

                {/* Existing Essay Exams */}
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-right">الامتحانات المقالية المضافة</h3>
                  {essayExams.length === 0 ? (
                    <div className="text-gray-400 text-sm text-right">لا توجد امتحانات مقالية مضافة</div>
                  ) : (
                    <div className="space-y-3">
                      {essayExams.map((exam, idx) => (
                        <div key={exam._id} className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 text-right">
                              <h4 className="font-medium text-gray-900 dark:text-white">{exam.title}</h4>
                              {exam.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{exam.description}</p>}
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                <div>تاريخ الفتح: {formatDateTime(exam.openDate)}</div>
                                <div>تاريخ الإغلاق: {formatDateTime(exam.closeDate)}</div>
                                <div>عدد الأسئلة: {exam.questions?.length || 0}</div>
                                <div>إجمالي التقديمات: {exam.totalSubmissions || 0}</div>
                                <div>التقديمات المصححة: {exam.gradedSubmissions || 0}</div>
                              </div>
                              <button 
                                onClick={() => toggleEssayExamExpanded(idx)}
                                className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center gap-1"
                              >
                                {expandedEssayExams.has(idx) ? 'إخفاء الأسئلة' : 'عرض الأسئلة'}
                                <span>{expandedEssayExams.has(idx) ? '▼' : '▶'}</span>
                              </button>
                            </div>
                            <div className="flex gap-2 mr-3">
                              <button type="button" className="text-blue-500 hover:text-blue-700 text-sm" onClick={() => handleEditEssayExam(idx)}>تعديل</button>
                              <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemoveEssayExam(exam._id)}>حذف</button>
                            </div>
                          </div>
                          
                          {/* Expandable Questions Section */}
                          {expandedEssayExams.has(idx) && exam.questions && exam.questions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-3 text-right">الأسئلة:</h5>
                              <div className="space-y-3">
                                {exam.questions.map((question, qIdx) => (
                                  <div key={qIdx} className="bg-white dark:bg-gray-600 rounded p-3">
                                    <div className="text-right">
                                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                                        <span className="text-blue-600 font-bold">السؤال {getArabicOrdinalNumber(qIdx + 1)}:</span> {question.question}
                                      </p>
                                      {question.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{question.description}</p>}
                                      {question.image && <img src={generateImageUrl(question.image)} alt="Question" className="w-20 h-20 object-cover rounded mb-2" />}
                                      <div className="space-y-1">
                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                          الدرجة القصوى: {question.maxGrade}
                                        </div>
                                        {question.allowFileUpload && (
                                          <div className="text-sm text-gray-600 dark:text-gray-300">
                                            رفع ملف: مسموح ({question.allowedFileTypes.join(', ')}) - الحد الأقصى: {question.maxFileSize} ميجابايت
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {tab === 'trainings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900 dark:text-white text-right mb-4">إضافة تدريب جديد</div>
              <button 
                onClick={() => toggleSection('trainings')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {openSections.trainings ? 'إخفاء' : 'إظهار'}
                <span>{openSections.trainings ? '▼' : '▶'}</span>
              </button>
            </div>
            {openSections.trainings && (
              <>
                {/* Training Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white text-right">تفاصيل التدريب</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" className="p-2 border rounded text-right" placeholder="عنوان التدريب *" value={newTraining.title} onChange={e => setNewTraining(t => ({ ...t, title: e.target.value }))} />
                    <input type="text" className="p-2 border rounded text-right" placeholder="وصف التدريب (اختياري)" value={newTraining.description} onChange={e => setNewTraining(t => ({ ...t, description: e.target.value }))} />
                    <div className="flex items-center gap-2">
                      <input type="number" className="p-2 border rounded flex-1 text-right" placeholder="المدة بالدقائق" min="1" max="300" value={newTraining.timeLimit} onChange={e => setNewTraining(t => ({ ...t, timeLimit: parseInt(e.target.value) || 30 }))} />
                      <span className="text-sm text-gray-600">دقيقة</span>
                    </div>
                    <input type="datetime-local" className="p-2 border rounded text-right" placeholder="تاريخ ووقت الفتح" value={newTraining.openDate} onChange={e => setNewTraining(t => ({ ...t, openDate: e.target.value }))} />
                  </div>
                </div>

                {/* Add Training Question */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white text-right">إضافة سؤال جديد</h3>
                  <textarea className="w-full p-2 border rounded text-right" placeholder="نص السؤال *" value={newTrainingQuestion.question} onChange={e => setNewTrainingQuestion(q => ({ ...q, question: e.target.value }))} rows="3" />
                  
                  {/* Question Image */}
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={handleTrainingQuestionImageChange} disabled={uploading} />
                    {uploading && <span className="text-blue-600 text-xs text-right">جاري رفع الصورة...</span>}
                    {newTrainingQuestion.image && (
                      <div className="flex items-center gap-2">
                        <img src={generateImageUrl(newTrainingQuestion.image)} alt="Question" className="w-16 h-16 object-cover rounded" />
                        <button type="button" className="text-red-500 text-sm" onClick={() => setNewTrainingQuestion(q => ({ ...q, image: '' }))}>حذف الصورة</button>
                      </div>
                    )}
                  </div>

                  {/* Number of Options Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-right">عدد الخيارات:</label>
                    <div className="flex gap-4 text-right">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="trainingNumberOfOptions"
                          value="2"
                          checked={newTrainingQuestion.numberOfOptions === 2}
                          onChange={(e) => handleTrainingQuestionOptionsChange(parseInt(e.target.value))}
                        />
                        <span>خياران</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="trainingNumberOfOptions"
                          value="4"
                          checked={newTrainingQuestion.numberOfOptions === 4}
                          onChange={(e) => handleTrainingQuestionOptionsChange(parseInt(e.target.value))}
                        />
                        <span>4 خيارات</span>
                      </label>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-right">الخيارات:</label>
                    {newTrainingQuestion.options.slice(0, newTrainingQuestion.numberOfOptions).map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input type="radio" name="correctTrainingAnswer" checked={newTrainingQuestion.correctAnswer === idx} onChange={() => setNewTrainingQuestion(q => ({ ...q, correctAnswer: idx }))} />
                        <input type="text" className="flex-1 p-2 border rounded text-right" placeholder={`الخيار ${idx + 1} *`} value={option} onChange={e => {
                          const newOptions = [...newTrainingQuestion.options];
                          newOptions[idx] = e.target.value;
                          setNewTrainingQuestion(q => ({ ...q, options: newOptions }));
                        }} />
                      </div>
                    ))}
                  </div>
                  
                  {editTrainingQuestionIndex !== null ? (
                    <div className="flex gap-2 justify-end">
                      <button type="button" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleSaveEditTrainingQuestion}>حفظ التعديل</button>
                      <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={handleCancelEditTrainingQuestion}>إلغاء</button>
                    </div>
                  ) : (
                    <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleAddTrainingQuestion} disabled={!newTrainingQuestion.question.trim() || newTrainingQuestion.options.slice(0, newTrainingQuestion.numberOfOptions).some(opt => !opt.trim())}>
                      إضافة السؤال
                    </button>
                  )}
                </div>

                {/* Questions List */}
                {newTraining.questions.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-right">الأسئلة المضافة ({newTraining.questions.length})</h3>
                    <div className="space-y-3">
                      {newTraining.questions.map((question, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-600 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 text-right">
                              <p className="font-medium text-gray-900 dark:text-white">
                                <span className="text-blue-600 font-bold">السؤال {getArabicOrdinalNumber(idx + 1)}:</span> {question.question}
                              </p>
                              {question.image && <img src={generateImageUrl(question.image)} alt="Question" className="w-20 h-20 object-cover rounded mt-2" />}
                              <div className="mt-2 space-y-1">
                                {question.options.slice(0, question.numberOfOptions || 4).map((option, optIdx) => (
                                  <div key={optIdx} className={`text-sm ${optIdx === question.correctAnswer ? 'text-green-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {optIdx + 1}. {option} {optIdx === question.correctAnswer && '(إجابة صحيحة)'}
                                  </div>
                                ))}
                                <div className="text-xs text-blue-600 mt-1">
                                  عدد الخيارات: {question.numberOfOptions || 4}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mr-3">
                              <button type="button" className="text-blue-500 hover:text-blue-700 text-sm" onClick={() => handleEditTrainingQuestion(idx)}>تعديل</button>
                              <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemoveTrainingQuestion(idx)}>حذف</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Training Button */}
                <div className="flex justify-end gap-2">
                  {editTrainingIndex !== null ? (
                    <>
                      <button type="button" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleSaveEditTraining}>حفظ التعديل</button>
                      <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={handleCancelEditTraining}>إلغاء</button>
                    </>
                  ) : (
                    <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" onClick={handleAddTraining} disabled={!newTraining.title.trim() || newTraining.questions.length === 0}>
                      إضافة التدريب
                    </button>
                  )}
                </div>

                {/* Existing Trainings */}
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-right">التدريبات المضافة</h3>
                  {trainings.length === 0 ? (
                    <div className="text-gray-400 text-sm text-right">لا توجد تدريبات مضافة</div>
                  ) : (
                    <div className="space-y-3">
                      {trainings.map((training, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 text-right">
                              <h4 className="font-medium text-gray-900 dark:text-white">{training.title}</h4>
                              {training.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{training.description}</p>}
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                <div>تاريخ الفتح: {formatDateTime(training.openDate)}</div>
                                <div>عدد الأسئلة: {training.questions?.length || 0}</div>
                              </div>
                              <button 
                                onClick={() => toggleTrainingExpanded(idx)}
                                className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center gap-1"
                              >
                                {expandedTrainings.has(idx) ? 'إخفاء الأسئلة' : 'عرض الأسئلة'}
                                <span>{expandedTrainings.has(idx) ? '▼' : '▶'}</span>
                              </button>
                            </div>
                            <div className="flex gap-2 mr-3">
                              <button type="button" className="text-blue-500 hover:text-blue-700 text-sm" onClick={() => handleEditTraining(idx)}>تعديل</button>
                              <button type="button" className="text-red-500 hover:text-red-700 text-sm" onClick={() => handleRemoveTraining(idx)}>حذف</button>
                            </div>
                          </div>
                          
                          {/* Expandable Questions Section */}
                          {expandedTrainings.has(idx) && training.questions && training.questions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-3 text-right">الأسئلة:</h5>
                              <div className="space-y-3">
                                {training.questions.map((question, qIdx) => (
                                  <div key={qIdx} className="bg-white dark:bg-gray-600 rounded p-3">
                                    <div className="text-right">
                                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                                        <span className="text-blue-600 font-bold">السؤال {getArabicOrdinalNumber(qIdx + 1)}:</span> {question.question}
                                      </p>
                                      {question.image && <img src={generateImageUrl(question.image)} alt="Question" className="w-20 h-20 object-cover rounded mb-2" />}
                                      <div className="space-y-1">
                                        {question.options.slice(0, question.numberOfOptions || 4).map((option, optIdx) => (
                                          <div key={optIdx} className={`text-sm ${optIdx === question.correctAnswer ? 'text-green-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {optIdx + 1}. {option} {optIdx === question.correctAnswer && '(إجابة صحيحة)'}
                                          </div>
                                        ))}
                                        <div className="text-xs text-blue-600 mt-1">
                                          عدد الخيارات: {question.numberOfOptions || 4}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Trainings Button */}
                <div className="flex justify-end mt-6">
                  <button type="button" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50" onClick={handleSaveTrainings} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : 'حفظ التدريبات'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CourseContentManager = () => {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector(state => state.course);
  const { stages } = useSelector(state => state.stage);
  const { subjects } = useSelector(state => state.subject);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    dispatch(getAdminCourses());
    dispatch(getAllStages());
    dispatch(getAllSubjects());
  }, [dispatch]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesStage = !stageFilter || (course.stage && course.stage._id === stageFilter);
    const matchesSubject = !subjectFilter || (course.subject && course.subject._id === subjectFilter);
    return matchesSearch && matchesStage && matchesSubject;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col md:flex-row" dir="rtl">
        {/* Sidebar: Course List */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 p-3 md:p-4 flex flex-col">
          <div className="mb-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="بحث عن دورة..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base text-right"
              />
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <select
                value={stageFilter}
                onChange={e => setStageFilter(e.target.value)}
                className="w-full sm:w-1/2 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base text-right"
              >
                <option value="">كل المراحل</option>
                {stages?.map(stage => (
                  <option key={stage._id} value={stage._id}>{stage.name}</option>
                ))}
              </select>
              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="w-full sm:w-1/2 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base text-right"
              >
                <option value="">كل المواد</option>
                {subjects?.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name || subject.title || subject._id}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-10 text-sm md:text-base">جاري التحميل...</div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center text-gray-400 py-10 text-sm md:text-base">لا توجد دورات</div>
            ) : (
              filteredCourses.map(course => (
                <div
                  key={course._id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${selectedCourse && selectedCourse._id === course._id ? 'bg-blue-100 dark:bg-blue-800/30 border-blue-400' : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                  onClick={() => {
                    setSelectedCourse(course);
                    setExpandedUnit(null);
                  }}
                >
                  <FaBook className="text-blue-500 text-lg" />
                  <div className="flex-1 min-w-0 text-right">
                    <div className="font-bold text-gray-900 dark:text-white truncate text-sm md:text-base">{course.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{course.stage?.name}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Main Content: Units & Lessons */}
        <div className="flex-1 p-3 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-right text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <FaLayerGroup />
            إدارة محتوى الدورات
          </h1>
          {!selectedCourse ? (
            <div className="text-center text-gray-400 py-10 md:py-20 text-base md:text-lg">اختر دورة من القائمة لعرض وحداتها ودروسها</div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {selectedCourse.units?.length === 0 && selectedCourse.directLessons?.length === 0 && (
                <div className="text-center text-gray-400 py-10 text-sm md:text-base">لا توجد وحدات أو مقدمة في هذه الدرس</div>
              )}

               {/* درس */}
               {selectedCourse.directLessons?.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow p-3 md:p-4">
                  <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2 text-right">
                    <FaBookOpen className="text-blue-500" />
                    مقدمة
                  </div>
                  {selectedCourse.directLessons.map(lesson => (
                    <div key={lesson._id} className="flex items-center justify-between bg-white dark:bg-gray-600 rounded p-2 mb-2">
                      <div className="text-right">
                        <span className="font-medium text-gray-900 dark:text-white text-sm md:text-base">{lesson.title}</span>
                        <span className="mr-2 text-xs text-gray-500 dark:text-gray-400">{lesson.price ? `سعر الدرس: ${lesson.price}` : 'بدون سعر'}</span>
                      </div>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Opening direct lesson content modal for:', lesson.title);
                          setSelectedLesson({ ...lesson, courseId: selectedCourse._id, unitId: null });
                        }}
                      >
                        <FaEdit className="text-sm" />
                        إدارة محتوى الدرس
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Units Accordion */}
              {selectedCourse.units?.map(unit => (
                <div key={unit._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-3 md:p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedUnit(expandedUnit === unit._id ? null : unit._id)}
                  >
                    <div className="flex items-center gap-2 text-right">
                      <FaBookOpen className="text-blue-500" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{unit.title}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">{unit.price ? `سعر الوحدة: ${unit.price}` : 'بدون سعر'}</span>
                    </div>
                    <FaChevronDown className={`transition-transform ${expandedUnit === unit._id ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedUnit === unit._id && (
                    <div className="mt-2 md:mt-4 space-y-2">
                      {unit.lessons?.length === 0 ? (
                        <div className="text-gray-400 text-xs md:text-sm text-right">لا توجد دروس في هذه الوحدة</div>
                      ) : (
                        unit.lessons.map(lesson => (
                          <div key={lesson._id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2">
                            <div className="text-right">
                              <span className="font-medium text-gray-900 dark:text-white text-sm md:text-base">{lesson.title}</span>
                              <span className="mr-2 text-xs text-gray-500 dark:text-gray-400">{lesson.price ? `سعر الدرس: ${lesson.price}` : 'بدون سعر'}</span>
                            </div>
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs flex items-center gap-1 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Opening lesson content modal for:', lesson.title);
                                setSelectedLesson({ ...lesson, courseId: selectedCourse._id, unitId: unit._id });
                              }}
                            >
                              <FaEdit className="text-sm" />
                              إدارة محتوى الدرس
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
             
            </div>
          )}
          {/* Modern Modal for lesson content */}
          {selectedLesson && (
            <LessonContentModal
              courseId={selectedLesson.courseId}
              unitId={selectedLesson.unitId}
              lessonId={selectedLesson._id}
              onClose={() => setSelectedLesson(null)}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseContentManager;
