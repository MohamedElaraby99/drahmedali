import React from "react";
import Layout from "../Layout/Layout";
import { FaShieldAlt, FaUserCheck, FaHandshake, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaVideo, FaBan } from "react-icons/fa";

export default function TermsOfService() {
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
              شروط الخدمة
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              يرجى قراءة هذه الشروط بعناية قبل استخدام منصة فكرة التعليمية
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
                  مرحباً بك في نظام إدارة التعلم من منصة  almongezz. من خلال الوصول إلى منصتنا واستخدامها، 
                  فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، 
                  يرجى عدم استخدام خدماتنا.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  تنطبق هذه الشروط على جميع مستخدمي المنصة، بما في ذلك الطلاب والمدرسين والمسؤولين.
                </p>
              </section>

              {/* Account Registration */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaUserCheck className="ml-3 text-green-600" />
                  تسجيل الحساب
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      يجب عليك تقديم معلومات دقيقة وحالية وكاملة أثناء التسجيل.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 ml-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      يجب أن تكون عمرك 5 سنوات على الأقل لإنشاء حساب.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-blue-500 mt-1 ml-3 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">
                      أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك.
                    </p>
                  </div>
                </div>
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

              {/* Acceptable Use */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaHandshake className="ml-3 text-blue-600" />
                  الاستخدام المقبول
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">توافق على:</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="text-blue-600 ml-2">•</span>
                      استخدام المنصة للأغراض التعليمية فقط
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 ml-2">•</span>
                      احترام المستخدمين الآخرين والحفاظ على بيئة تعليمية إيجابية
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 ml-2">•</span>
                      عدم مشاركة محتوى غير مناسب أو مسيء أو ضار
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 ml-2">•</span>
                      عدم محاولة الوصول غير المصرح به للمنصة
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 ml-2">•</span>
                      عدم استخدام الأنظمة الآلية للوصول إلى المنصة
                    </li>
                  </ul>
                </div>
              </section>

              {/* Content and Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  المحتوى والملكية الفكرية
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    جميع المحتوى على هذه المنصة، بما في ذلك الكورسات والمواد والبرامج، 
                    مملوك لشركة منصة  almongezz أو المرخصين لها ومحمي بقوانين حقوق النشر.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    لا يجوز لك إعادة إنتاج أو توزيع أو إنشاء أعمال مشتقة دون إذن صريح.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    المحتوى الذي ينشئه المستخدم يبقى ملكك، لكنك تمنحنا ترخيصاً لاستخدامه 
                    لتحسين المنصة والأغراض التعليمية.
                  </p>
                </div>
              </section>

              {/* Privacy and Data Protection */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  الخصوصية وحماية البيانات
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    نحن ملتزمون بحماية خصوصيتك. ممارسات جمع البيانات واستخدامها 
                    موضحة في سياسة الخصوصية الخاصة بنا.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    نجمع المعلومات الشخصية بما في ذلك الاسم والبريد الإلكتروني وأرقام الهواتف والموقع 
                    والتفاصيل التعليمية لتقديم خدماتنا بفعالية.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    يتم تخزين بياناتك بأمان ولن يتم مشاركتها مع أطراف ثالثة دون موافقتك، 
                    إلا كما هو مطلوب بموجب القانون.
                  </p>
                </div>
              </section>

              {/* Payment and Subscriptions */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  الدفع والاشتراكات
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    قد تتطلب بعض الميزات الدفع. جميع الرسوم موضحة بوضوح قبل الشراء.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    يتم معالجة المدفوعات بأمان من خلال شركائنا في الدفع.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    يتم التعامل مع الاستردادات وفقاً لسياسة الاسترداد الخاصة بنا، المتاحة عند الطلب.
                  </p>
                </div>
              </section>

              {/* Termination */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  إنهاء الحساب
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    يمكنك إنهاء حسابك في أي وقت من خلال الاتصال بفريق الدعم لدينا.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    نحتفظ بالحق في تعليق أو إنهاء الحسابات التي تنتهك هذه الشروط.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    عند الإنهاء، سيتم إلغاء وصولك إلى المنصة، 
                    لكن بياناتك سيتم الاحتفاظ بها كما هو مطلوب بموجب القانون.
                  </p>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  حدود المسؤولية
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    تقدم شركة منصة  almongezz المحتوى التعليمي والخدمات "كما هي" دون ضمانات.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    نحن لسنا مسؤولين عن أي أضرار غير مباشرة أو عرضية أو تبعية.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    إجمالي مسؤوليتنا محدود بالمبلغ الذي دفعته لخدماتنا.
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  تغييرات الشروط
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    قد نحدث هذه الشروط من وقت لآخر. سيتم نشر التغييرات على هذه الصفحة.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    الاستمرار في استخدام المنصة بعد التغييرات يشكل قبول الشروط الجديدة.
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
                    إذا كان لديك أسئلة حول هذه الشروط، يرجى الاتصال بنا:
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
                  من خلال استخدام منصة شركة منصة  almongezz، فإنك تقر بأنك قد قرأت وفهمت 
                  وتوافق على الالتزام بشروط الخدمة هذه.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 