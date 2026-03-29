export const locales = ["en", "fr", "zh-cn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  "zh-cn": "简体中文",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  "zh-cn": "🇨🇳",
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/** UI translations for static strings */
export const translations: Record<Locale, Record<string, string>> = {
  en: {
    out_of: "out of",
    show_more: "Show More",
    show_less: "Show Less",
    taken_courses: "Taken Courses",
    extracurricular_activities: "Extracurricular Activities",
    publications: "Publications",
    course_name: "Course Name",
    total_credit: "Total Credit",
    obtained_credit: "Obtained Credit",
    present: "Present",
    read_more: "Read More",
    all_posts: "All Posts",
    back_to_blog: "← Back to Blog",
    table_of_contents: "Table of Contents",
    share: "Share",
    tags: "Tags",
    view_certificate: "View Certificate",
    view_grades: "View Grades",
    my_resume: "My Resume",
    contact_me: "Contact Me",
    navigation: "Navigation",
    copyright: "© 2024 All Rights Reserved.",
    featured_posts: "Featured Posts",
    recent_posts: "Recent Posts",
    book_a_call: "Book a call",
  },
  fr: {
    out_of: "sur",
    show_more: "Voir Plus",
    show_less: "Voir Moins",
    taken_courses: "Cours Suivis",
    extracurricular_activities: "Activités Extra-scolaires",
    publications: "Publications",
    course_name: "Nom du Cours",
    total_credit: "Crédit Total",
    obtained_credit: "Crédit Obtenu",
    present: "Présent",
    read_more: "Lire la Suite",
    all_posts: "Tous les Articles",
    back_to_blog: "← Retour au Blog",
    table_of_contents: "Table des Matières",
    share: "Partager",
    tags: "Tags",
    view_certificate: "Voir le Certificat",
    view_grades: "Voir les Notes",
    my_resume: "Mon CV",
    contact_me: "Me Contacter",
    navigation: "Navigation",
    copyright: "© 2024 Tous Droits Réservés.",
    featured_posts: "Articles en Vedette",
    recent_posts: "Articles Récents",
    book_a_call: "Réserver un appel",
  },
  "zh-cn": {
    out_of: "满分",
    show_more: "显示更多",
    show_less: "显示更少",
    taken_courses: "已修课程",
    extracurricular_activities: "课外活动",
    publications: "出版物",
    course_name: "课程名称",
    total_credit: "总学分",
    obtained_credit: "已获学分",
    present: "至今",
    read_more: "阅读更多",
    all_posts: "所有文章",
    back_to_blog: "← 返回博客",
    table_of_contents: "目录",
    share: "分享",
    tags: "标签",
    view_certificate: "查看证书",
    view_grades: "查看成绩",
    my_resume: "我的简历",
    contact_me: "联系我",
    navigation: "导航",
    copyright: "© 2024 版权所有。",
    featured_posts: "精选文章",
    recent_posts: "最新文章",
    book_a_call: "预约通话",
  },
};

export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}
