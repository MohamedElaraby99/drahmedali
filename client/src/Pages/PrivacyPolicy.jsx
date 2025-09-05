import React from "react";
import Layout from "../Layout/Layout";
import { FaShieldAlt, FaDatabase, FaEye, FaLock, FaUserSecret, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaVideo, FaBan } from "react-icons/fa";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <FaShieldAlt className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              سياسة الخصوصية
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              كيف نجمع ونستخدم ونحمي معلوماتك الشخصية
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              آخر تحديث: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700" dir="rtl">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaInfoCircle className="ml-3 text-blue-600" />
                  مقدمة
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  منصة  almongezz يهم ملتزمة بحماية خصوصيتك. 
                  تشرح سياسة الخصوصية هذه كيف نجمع ونستخدم ونكشف ونحمي معلوماتك 
                  عند استخدام منصة إدارة التعلم الخاصة بنا.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  من خلال استخدام خدماتنا، فإنك توافق على ممارسات البيانات الموضحة في هذه السياسة.
                </p>
              </section>

              {/* Video Screening Policy - NEW SECTION */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaVideo className="ml-3 text-red-600" />
                  سياسة مراقبة المحتوى والفيديوهات
                </h2>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-l-4 border-red-500">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FaExclamationTriangle className="text-red-500 mt-1 ml-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                          تحذير مهم: سياسة الحظر الصارمة
                        </h3>
                        <p className="text-red-700 dark:text-red-300">
                          يحظر تماماً على أي طالب تسجيل أو مشاركة أو نشر أي فيديو أو محتوى من منصتنا التعليمية.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">العقوبات المطبقة:</h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <FaBan className="text-red-500 mt-1 ml-2 flex-shrink-0" />
                          <span>حذف الحساب فوراً</span>
                        </li>
                        <li className="flex items-start">
                          <FaBan className="text-red-500 mt-1 ml-2 flex-shrink-0" />
                          <span>حظر دائم من المنصة</span>
                        </li>
                        <li className="flex items-start">
                          <FaBan className="text-red-500 mt-1 ml-2 flex-shrink-0" />
                          <span>عدم إمكانية التسجيل مرة أخرى</span>
                        </li>
                        <li className="flex items-start">
                          <FaBan className="text-red-500 mt-1 ml-2 flex-shrink-0" />
                          <span>إجراءات قانونية إذا لزم الأمر</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">ما يعتبر انتهاكاً:</h4>
                      <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                        <li>• تسجيل شاشة الفيديوهات التعليمية</li>
                        <li>• مشاركة روابط المحتوى مع أشخاص آخرين</li>
                        <li>• نشر المحتوى على وسائل التواصل الاجتماعي</li>
                        <li>• حفظ أو تحميل المواد التعليمية</li>
                        <li>• إعادة توزيع المحتوى بأي شكل من الأشكال</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Information We Collect */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaDatabase className="ml-3 text-blue-600" />
                  المعلومات التي نجمعها
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">المعلومات الشخصية</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                          <span>الاسم الكامل ومعلومات الاتصال</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                          <span>عنوان البريد الإلكتروني وأرقام الهواتف</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                          <span>العمر والتفاصيل التعليمية</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                          <span>الموقع الجغرافي (المدينة)</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                          <span>صورة الملف الشخصي والصورة الرمزية</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">معلومات الاستخدام</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                          <span>بيانات تقدم الدرس وإكمالها</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                          <span>تفضيلات التعلم والتفاعلات</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                          <span>معلومات الجهاز وعناوين IP</span>
                        </li>
                        <li className="flex items-start">
                          <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                          <span>أنماط الاستخدام والتحليلات</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaEye className="ml-3 text-green-600" />
                  كيف نستخدم المعلومات
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    نستخدم المعلومات التي نجمعها للأغراض التالية:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>تقديم وتحسين خدمات التعلم</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>التواصل معك بشأن حسابك والدورات</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>تحليل استخدام المنصة لتحسين التجربة</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>ضمان أمان المنصة ومنع الاحتيال</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>الامتثال للالتزامات القانونية</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaUserSecret className="ml-3 text-blue-600" />
                  مشاركة المعلومات
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    نحن لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة، إلا في الحالات التالية:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start">
                        <FaExclamationTriangle className="text-blue-500 mt-1 ml-3 flex-shrink-0" />
                        <span>بموافقتك الصريحة</span>
                      </li>
                      <li className="flex items-start">
                        <FaExclamationTriangle className="text-blue-500 mt-1 ml-3 flex-shrink-0" />
                        <span>لتقديم الخدمات المطلوبة (مثل معالجة الدفع)</span>
                      </li>
                      <li className="flex items-start">
                        <FaExclamationTriangle className="text-blue-500 mt-1 ml-3 flex-shrink-0" />
                        <span>للامتثال للقوانين والأنظمة</span>
                      </li>
                      <li className="flex items-start">
                        <FaExclamationTriangle className="text-blue-500 mt-1 ml-3 flex-shrink-0" />
                        <span>لحماية حقوقنا وممتلكاتنا</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaLock className="ml-3 text-blue-600" />
                  أمان البيانات
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    نحن نستخدم تدابير أمنية تقنية وإدارية مناسبة لحماية معلوماتك الشخصية:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>التشفير أثناء النقل والتخزين</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>الوصول المقيد للموظفين المصرح لهم</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>مراقبة الأمان المنتظمة</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>النسخ الاحتياطية الآمنة</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Retention */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  الاحتفاظ بالبيانات
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو كما هو مطلوب لتقديم الخدمات.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    عند إغلاق حسابك، قد نحتفظ ببعض المعلومات لفترة محدودة للامتثال للقوانين 
                    أو لحل النزاعات أو لتنفيذ اتفاقياتنا.
                  </p>
                </div>
              </section>

              {/* Your Rights */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  حقوقك
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    لديك الحق في:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>الوصول إلى معلوماتك الشخصية</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>تصحيح المعلومات غير الدقيقة</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>حذف معلوماتك الشخصية</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>تقييد معالجة معلوماتك</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                        <span>الاعتراض على معالجة معلوماتك</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  ملفات تعريف الارتباط
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    نستخدم ملفات تعريف الارتباط لتحسين تجربتك على منصتنا. هذه الملفات تساعدنا في:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• تذكر تفضيلاتك</li>
                      <li>• تحليل استخدام الموقع</li>
                      <li>• تحسين الأداء والأمان</li>
                      <li>• تخصيص المحتوى</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح.
                  </p>
                </div>
              </section>

              {/* Third-Party Services */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  خدمات الطرف الثالث
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    قد نستخدم خدمات من أطراف ثالثة مثل:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• مزودي خدمات الدفع</li>
                      <li>• خدمات الاستضافة والسحابة</li>
                      <li>• أدوات التحليلات</li>
                      <li>• خدمات البريد الإلكتروني</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    هذه الخدمات لها سياسات خصوصية خاصة بها، ونشجعك على مراجعتها.
                  </p>
                </div>
              </section>

              {/* Children's Privacy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  خصوصية الأطفال
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    منصتنا مخصصة للأطفال من سن 5 سنوات وما فوق. نحن نجمع معلومات محدودة من الأطفال 
                    ونحصل على موافقة الوالدين عند الحاجة.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    إذا كنت أحد الوالدين وتعتقد أن طفلك قد قدم لنا معلومات شخصية، 
                    يرجى الاتصال بنا فوراً.
                  </p>
                </div>
              </section>

              {/* Changes to Privacy Policy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  تغييرات سياسة الخصوصية
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    قد نحدث هذه السياسة من وقت لآخر. سنقوم بنشر أي تغييرات على هذه الصفحة 
                    وإخطارك عبر البريد الإلكتروني إذا كانت التغييرات مهمة.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    الاستمرار في استخدام خدماتنا بعد التغييرات يشكل قبول السياسة المحدثة.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  معلومات الاتصال
                </h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    إذا كان لديك أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا:
                  </p>
                  <div className="space-y-1 text-gray-700 dark:text-gray-300">
                    <p><strong>البريد الإلكتروني:</strong> softwarefikra@gmail.com</p>
                    <p><strong>الهاتف:</strong> +201207039410</p>
                    <p><strong>العنوان:</strong> المنصورة، شارع 18 توريل، مصر</p>
                    <p><strong>الموقع الإلكتروني:</strong> https://fikra.solutions/</p>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  من خلال استخدام خدماتنا، فإنك توافق على جمع واستخدام معلوماتك 
                  كما هو موضح في سياسة الخصوصية هذه.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 