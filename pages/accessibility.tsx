import React from 'react';

export default function AccessibilityPage() {
  return (
    <div dir="rtl" className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-right font-sans">
      <h1 className="text-3xl font-bold mb-8">הצהרת נגישות</h1>

      <div className="space-y-6 text-gray-800">
        <section>
          <p className="mb-4">
            אנו רואים חשיבות רבה במתן שירות שוויוני לכלל הגולשים ובשיפור חווית הגלישה באתר.
            אנו משקיעים משאבים ומאמצים רבים על מנת להנגיש את האתר ולהתאים אותו לאנשים עם מוגבלות,
            בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות תשנ"ח-1998 ולתקנות שהותקנו מכוחו.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">תקינה</h2>
          <p>
            אתר זה נבנה בהתאם להוראות הנגישות המופיעות ב
            <a 
              href="https://www.isoc.org.il/accessibility" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mx-1"
            >
              תקן הישראלי (ת"י 5568)
            </a>
            ולקווים המנחים של ארגון W3C ברמת AA.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">אמצעי הנגישות באתר</h2>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>תמיכה בכל הדפדפנים המקובלים (Chrome, Firefox, Edge, Safari).</li>
            <li>תכני האתר כתובים בשפה ברורה וקריאה.</li>
            <li>מבנה האתר מושתת על ניווט נוח וברור ותפריטים נגישים.</li>
            <li>התאמה לגלישה במכשירים ניידים (רספונסיביות).</li>
            <li>שימוש בתגיות כותרת (Headings) להיררכיה ברורה של התוכן.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">הסדרי נגישות פיזיים</h2>
          <p>
            האתר הינו אתר אינטרנט המספק שירותי פודקאסט ותוכן דיגיטלי בלבד.
            לא קיימת קבלת קהל פיזית ולכן אין רלוונטיות להסדרי נגישות במבנה.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">סייגים לנגישות</h2>
          <p>
            למרות מאמצינו להנגיש את כלל הדפים באתר, ייתכן ויתגלו חלקים שטרם הונגשו במלואם.
            אנו ממשיכים במאמצים לשפר את נגישות האתר כחלק ממחויבותנו לאפשר שימוש בו עבור כלל האוכלוסייה, כולל אנשים עם מוגבלויות.
          </p>
        </section>

        <section className="bg-gray-100 p-6 rounded-lg mt-8 border border-gray-200">
          <h2 className="text-xl font-bold mb-4">פרטי רכז הנגישות ודרכי התקשרות</h2>
          <p className="mb-2">
            אם נתקלתם בבעיה בנושא נגישות, או שיש לכם הערה או שאלה, נשמח אם תפנו אלינו.
          </p>
          <div className="space-y-2 mt-4 font-medium">
            <p>שם רכז הנגישות: <span className="font-normal">טל אסיף</span></p>
            <p>טלפון: <span className="font-normal">052-8381502</span></p>
            <p>דואר אלקטרוני: <a href="mailto:tracktripil@gmail.com" className="text-blue-600 hover:underline font-normal">tracktripil@gmail.com</a></p>
          </div>
        </section>

        <p className="text-sm text-gray-500 mt-8">
          הצהרת הנגישות עודכנה לאחרונה בתאריך: {new Date().toLocaleDateString('he-IL')}
        </p>
      </div>
    </div>
  );
}
