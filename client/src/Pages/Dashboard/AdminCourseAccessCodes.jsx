import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import { axiosInstance } from "../../Helpers/axiosInstance";
import { getAllCourses } from "../../Redux/Slices/CourseSlice";
import { getAllStages } from "../../Redux/Slices/StageSlice";
import { adminGenerateCourseAccessCodes, adminListCourseAccessCodes, adminDeleteCourseAccessCode, adminBulkDeleteCourseAccessCodes } from "../../Redux/Slices/CourseAccessSlice";

export default function AdminCourseAccessCodes() {
  const dispatch = useDispatch();
  const { courses } = useSelector((s) => s.course);
  const { stages } = useSelector((s) => s.stage);
  const { admin, error } = useSelector((s) => s.courseAccess);

  const [form, setForm] = useState({ stageId: "", courseId: "", quantity: 1, accessStartAt: "", accessEndAt: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyUsed, setShowOnlyUsed] = useState(false);
  const [courseFilter, setCourseFilter] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMode, setExportMode] = useState('selected'); // 'selected' | 'byCourses'
  const [exportCourseIds, setExportCourseIds] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dispatch(getAllCourses());
    dispatch(getAllStages({ page: 1, limit: 100 }));
  }, [dispatch]);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  useEffect(() => {
    dispatch(adminListCourseAccessCodes({ courseId: form.courseId || undefined, q: searchTerm || undefined, page, limit }));
    setSelected(new Set());
  }, [dispatch, form.courseId, searchTerm, page, limit]);

  // Initialize default date range (now -> now + 7 days) if empty
  useEffect(() => {
    const toLocalInputValue = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    if (!form.accessStartAt || !form.accessEndAt) {
      const now = new Date();
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setForm((p) => ({
        ...p,
        accessStartAt: p.accessStartAt || toLocalInputValue(now),
        accessEndAt: p.accessEndAt || toLocalInputValue(end)
      }));
    }
  }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onGenerate = async (e) => {
    e.preventDefault();
    if (!form.courseId) return;
    const payload = {
      courseId: form.courseId,
      quantity: Number(form.quantity)
    };
    const toLocalInputValue = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    if (!form.accessStartAt || !form.accessEndAt) {
      const now = new Date();
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      payload.accessStartAt = toLocalInputValue(now);
      payload.accessEndAt = toLocalInputValue(end);
    } else {
      payload.accessStartAt = form.accessStartAt;
      payload.accessEndAt = form.accessEndAt;
    }
    if (new Date(payload.accessEndAt) <= new Date(payload.accessStartAt)) {
      alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }
    console.log('📤 Generating course access codes with payload:', payload);
    await dispatch(adminGenerateCourseAccessCodes(payload));
    dispatch(adminListCourseAccessCodes({ courseId: form.courseId, page, limit }));
  };

  // Filter codes based on search term and used filter
  const filteredCodes = admin.codes.filter(code => {
    const courseName = code.courseId?.title || courses.find(c => c._id === code.courseId)?.title || '';
    const userEmail = code.usedBy?.email || '';
    const matchesSearch = true; // handled server-side now
    const matchesUsedFilter = !showOnlyUsed || code.isUsed;
    const codeCourseId = typeof code.courseId === 'object' ? code.courseId?._id : code.courseId;
    const matchesCourseFilter = !courseFilter || codeCourseId === courseFilter;
    return matchesSearch && matchesUsedFilter && matchesCourseFilter;
  });

  const isAllSelected = filteredCodes.length > 0 && filteredCodes.every(c => selected.has(c._id || c.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected(new Set());
    } else {
      const next = new Set(selected);
      filteredCodes.forEach(c => next.add(c._id || c.id));
      setSelected(next);
    }
  };
  const toggleSelectOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDeleteOne = async (id, isUsed) => {
    if (isUsed) {
      alert('لا يمكن حذف كود مُستخدم');
      return;
    }
    if (!confirm('تأكيد حذف هذا الكود؟')) return;
    await dispatch(adminDeleteCourseAccessCode({ id }));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    dispatch(adminListCourseAccessCodes({ courseId: form.courseId || undefined, page, limit }));
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`تأكيد حذف ${ids.length} كود (غير مُستخدم فقط)؟`)) return;
    await dispatch(adminBulkDeleteCourseAccessCodes({ ids, courseId: form.courseId || undefined, onlyUnused: true }));
    setSelected(new Set());
    dispatch(adminListCourseAccessCodes({ courseId: form.courseId || undefined, page, limit }));
  };

  const buildCsvAndDownload = (codes) => {
    const headers = [
      'code',
      'course',
      'accessStartAt',
      'accessEndAt',
      'isUsed',
      'usedBy',
      'usedAt',
      'codeExpiresAt'
    ];
    const getCourseName = (code) => {
      if (typeof code.courseId === 'object' && code.courseId?.title) {
        return code.courseId.title;
      }
      return courses.find(c => c._id === code.courseId)?.title || code.courseId || '';
    };
    const getUserEmail = (code) => {
      if (typeof code.usedBy === 'object' && code.usedBy?.email) {
        return code.usedBy.email;
      }
      return code.usedBy || '';
    };
    const rows = codes.map(c => ([
      c.code,
      getCourseName(c),
      c.accessStartAt ? new Date(c.accessStartAt).toISOString() : '',
      c.accessEndAt ? new Date(c.accessEndAt).toISOString() : '',
      c.isUsed ? 'yes' : 'no',
      getUserEmail(c),
      c.usedAt ? new Date(c.usedAt).toISOString() : '',
      c.codeExpiresAt ? new Date(c.codeExpiresAt).toISOString() : ''
    ]));
    const csvContent = [headers, ...rows]
      .map(r => r.map(v => {
        const s = String(v ?? '');
        // Escape quotes and wrap with quotes if contains comma/newline/quote
        const needsWrap = /[",\n]/.test(s);
        const escaped = s.replace(/"/g, '""');
        return needsWrap ? `"${escaped}"` : escaped;
      }).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.download = `course-access-codes-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openExportModal = () => {
    setShowExportModal(true);
  };

  const closeExportModal = () => {
    setShowExportModal(false);
    setExportMode('selected');
    setExportCourseIds([]);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      if (exportMode === 'selected') {
        const toExport = admin.codes.filter(c => selected.has(c._id || c.id));
        const toExportAvailable = toExport.filter(c => !c.isUsed);
        if (toExportAvailable.length === 0) {
          alert('لا توجد أكواد متاحة (غير مُستخدمة) ضمن المحدد للتصدير');
          return;
        }
        buildCsvAndDownload(toExportAvailable);
      } else {
        // byCourses mode: fetch all codes for selected courses (all pages)
        if (!exportCourseIds.length) {
          alert('اختر كورس واحد على الأقل');
          return;
        }
        const allCodes = [];
        for (const cid of exportCourseIds) {
          let p = 1;
          const l = 200;
          // loop pages until done
          while (true) {
            const params = new URLSearchParams();
            params.append('courseId', cid);
            params.append('page', String(p));
            params.append('limit', String(l));
            const res = await axiosInstance.get(`/course-access/admin/codes?${params.toString()}`);
            const data = res.data?.data;
            const pageCodes = data?.codes || [];
            allCodes.push(...pageCodes);
            const totalPages = data?.pagination?.totalPages || 1;
            if (p >= totalPages) break;
            p += 1;
          }
        }
        // Export only available (unused) codes
        const refined = allCodes.filter(c => !c.isUsed);
        if (refined.length === 0) {
          alert('لا توجد أكواد متاحة (غير مُستخدمة) للتصدير لهذه الكورسات');
          return;
        }
        buildCsvAndDownload(refined);
      }
      closeExportModal();
    } finally {
      setExporting(false);
    }
  };

  const getCourseName = (code) => {
    try {
      if (typeof code.courseId === 'object' && code.courseId?.title) {
        return String(code.courseId.title);
      }
      const courseTitle = courses.find(c => c._id === code.courseId)?.title;
      return courseTitle ? String(courseTitle) : (code.courseId ? String(code.courseId) : '');
    } catch (error) {
      console.error('Error in getCourseName:', error, code);
      return '';
    }
  };
  
  const getUserEmail = (code) => {
    try {
      if (typeof code.usedBy === 'object' && code.usedBy?.email) {
        return String(code.usedBy.email);
      }
      return code.usedBy ? String(code.usedBy) : '';
    } catch (error) {
      console.error('Error in getUserEmail:', error, code);
      return '';
    }
  };

  // Debug: Log the first code to see its structure
  if (filteredCodes.length > 0) {
    console.log('First code structure:', filteredCodes[0]);
    console.log('CourseId type:', typeof filteredCodes[0].courseId, filteredCodes[0].courseId);
    console.log('UsedBy type:', typeof filteredCodes[0].usedBy, filteredCodes[0].usedBy);
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <h1 className="text-3xl font-bold mb-6">أكواد الوصول للكورسات</h1>
        <form onSubmit={onGenerate} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-6 gap-4" dir="rtl">
          <div>
            <label className="block text-sm mb-1">المرحلة</label>
            <select name="stageId" value={form.stageId} onChange={(e)=>{onChange(e); setForm(p=>({...p, courseId: ""}));}} className="w-full p-2 rounded border dark:bg-gray-700">
              <option value="">اختر المرحلة</option>
              {stages.map((st) => (
                <option key={st._id} value={st._id}>{st.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">الكورس</label>
            <select name="courseId" value={form.courseId} onChange={onChange} className="w-full p-2 rounded border dark:bg-gray-700" disabled={!form.stageId}>
              <option value="">{form.stageId ? 'اختر كورس' : 'اختر المرحلة أولاً'}</option>
              {courses
                .filter((c) => !form.stageId || c.stage?._id === form.stageId)
                .map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">تاريخ البداية</label>
            <input name="accessStartAt" type="datetime-local" required value={form.accessStartAt} onChange={onChange} className="w-full p-2 rounded border dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">تاريخ النهاية</label>
            <input name="accessEndAt" type="datetime-local" required min={form.accessStartAt} value={form.accessEndAt} onChange={onChange} className="w-full p-2 rounded border dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm mb-1">العدد</label>
            <input name="quantity" type="number" min="1" max="200" value={form.quantity} onChange={onChange} className="w-full p-2 rounded border dark:bg-gray-700" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">توليد الأكواد</button>
          </div>
        </form>

        {error && <div className="text-red-600 mb-4">{String(error)}</div>}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3 mb-3">
            <h2 className="text-xl font-semibold">الأكواد المُنشأة</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="البحث في الأكواد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm w-full sm:w-64"
              />
              <select value={courseFilter} onChange={(e)=>setCourseFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded text-sm w-full sm:w-64">
                <option value="">كل الكورسات</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showOnlyUsed}
                  onChange={(e) => setShowOnlyUsed(e.target.checked)}
                  className="rounded"
                />
                الأكواد المُستخدمة فقط
              </label>
              {admin.listing && <span className="text-sm text-gray-500">جاري التحميل...</span>}
              <button onClick={openExportModal} className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm w-full sm:w-auto">تصدير</button>
              <button onClick={handleBulkDelete} disabled={selected.size === 0} className={`px-3 py-2 rounded text-white text-sm w-full sm:w-auto ${selected.size === 0 ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>حذف المحدد</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead>
                <tr className="text-sm text-gray-500">
                  <th className="p-2"><input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} /></th>
                  <th className="p-2">الكود</th>
                  <th className="p-2">المادة</th>
                  <th className="p-2 hidden sm:table-cell">الفترة</th>
                  <th className="p-2">الحالة</th>
                  <th className="p-2 hidden md:table-cell">المُستخدم</th>
                  <th className="p-2 hidden md:table-cell">تاريخ الاستخدام</th>
                  <th className="p-2 hidden md:table-cell">انتهاء صلاحية الكود</th>
                  <th className="p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map((c) => (
                  <tr key={c._id || c.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-2"><input type="checkbox" checked={selected.has(c._id || c.id)} onChange={()=>toggleSelectOne(c._id || c.id)} /></td>
                    <td className="p-2 font-mono">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{String(c.code || '')}</span>
                    </td>
                    <td className="p-2">{getCourseName(c)}</td>
                    <td className="p-2 hidden sm:table-cell">{c.accessStartAt && c.accessEndAt ? `${new Date(c.accessStartAt).toLocaleString('ar-EG')} ← ${new Date(c.accessEndAt).toLocaleString('ar-EG')}` : '-'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${c.isUsed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {c.isUsed ? "مُستخدم" : "متاح"}
                      </span>
                    </td>
                    <td className="p-2 hidden md:table-cell">{getUserEmail(c)}</td>
                    <td className="p-2 hidden md:table-cell">{c.usedAt ? new Date(c.usedAt).toLocaleString('ar-EG') : '-'}</td>
                    <td className="p-2 hidden md:table-cell">{c.codeExpiresAt ? new Date(c.codeExpiresAt).toLocaleString('ar-EG') : '-'}</td>
                    <td className="p-2">
                      <button onClick={() => handleDeleteOne(c._id || c.id, c.isUsed)} className={`px-2 py-1 rounded text-white text-xs ${c.isUsed ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>حذف</button>
                    </td>
                  </tr>
                ))}
                {filteredCodes.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-4 text-center text-gray-500">
                      {admin.listing ? 'جاري التحميل...' : 'لا توجد أكواد'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination */}
            {admin.pagination && admin.pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
                <button
                  className="px-3 py-2 rounded border w-full sm:w-auto"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  السابق
                </button>
                <span className="text-sm">
                  صفحة {page} من {admin.pagination.totalPages}
                </span>
                <button
                  className="px-3 py-2 rounded border w-full sm:w-auto"
                  disabled={page >= admin.pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, admin.pagination.totalPages))}
                >
                  التالي
                </button>
              </div>
            )}
          </div>
          {showExportModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" dir="rtl">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-1">تصدير الأكواد</h3>
                <p className="text-xs text-gray-500 mb-3">سيتم تصدير الأكواد المتاحة فقط (غير المُستخدمة)</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="exportMode" value="selected" checked={exportMode==='selected'} onChange={()=>setExportMode('selected')} />
                    <span>تصدير الأكواد المحددة ({selected.size})</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="radio" name="exportMode" value="byCourses" checked={exportMode==='byCourses'} onChange={()=>setExportMode('byCourses')} />
                    <div className="flex-1">
                      <div className="mb-2">تصدير حسب الكورس</div>
                      <select multiple value={exportCourseIds} onChange={(e)=>setExportCourseIds(Array.from(e.target.selectedOptions).map(o=>o.value))} className="w-full h-40 border rounded p-2 dark:bg-gray-700">
                        {courses.map(c => (
                          <option key={c._id} value={c._id}>{c.title}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">اضغط مع الاستمرار على Ctrl لاختيار أكثر من كورس</p>
                    </div>
                  </label>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <button onClick={closeExportModal} className="px-3 py-1 rounded border">إلغاء</button>
                  <button onClick={handleExport} disabled={exporting} className={`px-3 py-1 rounded text-white ${exporting ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'}`}>{exporting ? 'جاري التصدير...' : 'تصدير CSV'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}


