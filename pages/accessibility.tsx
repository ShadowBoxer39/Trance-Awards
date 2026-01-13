import React from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';

export default function AccessibilityPage() {
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  return (
    <>
      <Head>
        <title>הצהרת נגישות | יוצאים לטראק</title>
        <meta name="description" content="הצהרת נגישות - יוצאים לטראק" />
      </Head>

      <div className="trance-backdrop min-h-screen text-gray-100">
        <Navigation currentPage="accessibility" />

        <main className="max-w-4xl mx-auto py-24 px-6">
          <h1 className="text-4xl font-bold mb-8 text-gradient">הצהרת נגישות</h1>

          <div className="glass-card rounded-xl p-8 space-y-8">
            <section>
              <p className="text-gray-300 leading-relaxed">
                אנו רואים חשיבות רבה במתן שירות שוויוני לכלל הגולשים ובשיפור חווית הגלישה באתר.
                אנו משקיעים משאבים ומאמצים רבים על מנת להנגיש את האתר ולהתאים אותו לאנשים עם מוגבלות,
                בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות תשנ"ח-1998 ולתקנות שהותקנו מכוחו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-purple-400">תקינה</h2>
              <p className="text-gray-300 leading-relaxed">
                אתר זה נבנה בהתאם להוראות הנגישות המופיעות ב
                <a 
                  href="https://www.gov.il/he/departments/policies/accessibility_standard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 hover:underline mx-1"
                >
                  תקן הישראלי (ת"י 5568)
                </a>
                ולקווים המנחים של ארגון W3C ברמת AA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-purple-400">אמצעי הנגישות באתר</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mr-4">
                <li>תמיכה בכל הדפדפנים המקובלים (Chrome, Firefox, Edge, Safari).</li>
                <li>תכני האתר כתובים בשפה ברורה וקריאה.</li>
                <li>מבנה האתר מושתת על ניווט נוח וברור ותפריטים נגישים.</li>
                <li>התאמה לגלישה במכשירים ניידים (רספונסיביות).</li>
                <li>שימוש בתגיות כותרת (Headings) להיררכיה ברורה של התוכן.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-purple-400">הסדרי נגישות פיזיים</h2>
              <p className="text-gray-300 leading-relaxed">
                האתר הינו אתר אינטרנט המספק שירותי פודקאסט ותוכן דיגיטלי בלבד.
                לא קיימת קבלת קהל פיזית ולכן אין רלוונטיות להסדרי נגישות במבנה.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3 text-purple-400">סייגים לנגישות</h2>
              <p className="text-gray-300 leading-relaxed">
                למרות מאמצינו להנגיש את כלל הדפים באתר, ייתכן ויתגלו חלקים שטרם הונגשו במלואם.
                אנו ממשיכים במאמצים לשפר את נגישות האתר כחלק ממחויבותנו לאפשר שימוש בו עבור כלל האוכלוסייה, כולל אנשים עם מוגבלויות.
              </p>
            </section>

            <section className="bg-purple-900/30 p-6 rounded-xl border border-purple-500/30 mt-8">
              <h2 className="text-2xl font-bold mb-4 text-white">פרטי רכז הנגישות ודרכי התקשרות</h2>
              <p className="text-gray-300 mb-4">
                אם נתקלתם בבעיה בנושא נגישות, או שיש לכם הערה או שאלה, נשמח אם תפנו אלינו.
              </p>
              <div className="space-y-2 text-gray-300">
                <p>שם: <span className="text-white font-medium">יוצאים לטראק</span></p>
                <p>טלפון: <a href="tel:052-8381502" className="text-purple-400 hover:text-purple-300">052-8381502</a></p>
                <p>דואר אלקטרוני: <a href="mailto:tracktripil@gmail.com" className="text-purple-400 hover:text-purple-300">tracktripil@gmail.com</a></p>
              </div>
            </section>

            <p className="text-sm text-gray-500 pt-4">
              הצהרת הנגישות עודכנה לאחרונה בתאריך: {new Date().toLocaleDateString('he-IL')}
            </p>
          </div>
        </main>
      </div>
    </>
  );
}