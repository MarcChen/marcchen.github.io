export const locales = ["en", "fr", "zh-cn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  "zh-cn": "简体中文",
};

/** Short labels used by the inline language switch. */
export const localeLabels: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  "zh-cn": "中文",
};

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  fr: "fr",
  "zh-cn": "zh-CN",
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/** UI translations for static strings. */
export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Shell
    skip_to_content: "Skip to content",
    nav_primary: "Primary",
    nav_menu_open: "Menu",
    nav_menu_close: "Close",
    nav_about: "About",
    nav_work: "Work",
    nav_writing: "Writing",
    nav_photographs: "Photographs",
    nav_contact: "Contact",
    switch_language: "Languages",
    a11y_new_tab: "opens in a new tab",

    // Hero
    hero_role: "Data engineer, Paris",
    hero_lede:
      "Quiet systems for noisy problems: forecasting data at Veolia, photography on the long road between the numbers.",
    hero_currently: "Currently",
    hero_studied: "Studied",
    hero_elsewhere: "Elsewhere",
    hero_currently_value: "Data science at Veolia",
    hero_studied_value: "Artificial intelligence at ENSTA Paris, 2025",
    hero_elsewhere_value: "French, English, Chinese",
    hero_see_work: "See the work",
    hero_read_record: "About me",
    hero_place: "Paris, France",

    // About
    about_statement:
      "I make data systems that must survive reality, then I ride 600 km to meet reality myself.",
    about_certified: "Certifications",
    about_languages: "Languages",
    about_also: "Also",
    about_also_value: "Cyclist, photographer, ENSTRAID and Technimage alumnus.",
    about_cv: "CV",
    about_portrait_alt: "Portrait of Marc Chen",
    about_photo_caption:
      "Mont-Saint-Michel, seen from the Cabourg–Saint-Malo ride.",

    // Section titles
    about_title: "About",
    skills_title: "Skills",
    experiences_title: "Experience",
    education_title: "Education",
    projects_title: "Selected work",
    accomplishments_title: "Courses & certificates",
    featured_posts: "Featured Posts",
    featured_title: "Latest writing",
    achievements_title: "Achievements",
    sec_all_writing: "All writing",

    // Skills
    skills_entries: "{n} skills",
    skills_empty: "No skills under this filter.",
    cat_basic: "Foundations",
    cat_programming_language: "Programming",
    cat_cloud_services: "Cloud",

    // Experience / education
    present: "Present",
    taken_courses: "Courses",
    extracurricular_activities: "Extracurricular activities",
    view_grades: "View grades",
    edu_grade: "Grade",

    // Projects
    source_code: "GitHub",
    live_preview: "Project page",
    no_projects: "No projects match this filter.",
    projects_filter: "Filter projects",
    proj_all: "All",
    proj_professional: "Professional",
    proj_academic: "Academic",
    proj_hobby: "Hobby",
    project_img_visionvendor_alt:
      "Vision Vendor logo and tagline: an AI-powered appraisal and reselling partner.",
    project_img_uav_alt:
      "ENST'AIR hexacopter on a table before the Dassault UAV Challenge.",

    // Accomplishments
    acc_view: "Certificate",

    // Blog
    all_posts: "All posts",
    blog_nav: "Writing",
    blog_title: "Writing",
    blog_intro:
      "Notes on data systems, small machines, and the roads between them. Kept since 2020.",
    no_posts: "No posts yet.",
    read_more: "Read",
    back_to_blog: "Back to writing",
    post_previous: "Previous",
    post_next: "Next",
    post_date: "Published",
    post_tags: "Tags",
    comments: "Comments",
    comments_intro: "Comments run on GitHub Discussions and load only when you ask.",
    comments_load: "Load comments",
    comments_hide: "Hide comments",
    comments_help: "Open the discussion on GitHub",
    comments_fallback: "If the thread does not appear, read it on GitHub.",

    // Photos
    photos_nav: "Photographs",
    photos_title: "Photographs",
    photos_intro:
      "Landscape, architecture, and the ordinary light in between. A small archive, kept slowly.",
    photos_empty_title: "No photographs online yet.",
    photos_empty_body:
      "The gallery is not published yet. Photographs from the 2023 ride are in the journal.",
    photos_journal: "Read the ride journal",
    photos_caption: "Mont-Saint-Michel, from the Cabourg–Saint-Malo ride.",
    photos_gallery_hint: "Select a photograph to open it full screen.",

    // 404
    notfound_label: "404",
    notfound_title: "This page does not exist.",
    notfound_body:
      "The address may be wrong, or the page has moved. Try one of the three home pages, or browse the writing.",
    notfound_writing: "Browse writing",

    // Footer
    footer_contact: "Contact",
    footer_pages: "Pages",
    footer_elsewhere: "Elsewhere",
    footer_languages: "Languages",
    footer_cv_en: "English CV",
    footer_cv_fr: "French CV",
    footer_cv_zh: "Chinese CV",
    footer_top: "Top",
    footer_location: "Paris, France",
    book_a_call: "Book a call",
    my_resume: "My Resume",

    // Kept compatibility keys
    out_of: "out of",
    show_more: "Show more",
    show_less: "Show less",
    course_name: "Course",
    total_credit: "Total credit",
    obtained_credit: "Obtained credit",
    view_certificate: "View certificate",
    featured_project: "Featured project",
    role_label: "Role",
    copy_email: "Copy email",
    contact_me: "Contact",
  },
  fr: {
    skip_to_content: "Aller au contenu",
    nav_primary: "Navigation principale",
    nav_menu_open: "Menu",
    nav_menu_close: "Fermer",
    nav_about: "À propos",
    nav_work: "Projets",
    nav_writing: "Écrits",
    nav_photographs: "Photographies",
    nav_contact: "Contact",
    switch_language: "Langues",
    a11y_new_tab: "s'ouvre dans un nouvel onglet",

    hero_role: "Ingénieur data, Paris",
    hero_lede:
      "Des systèmes discrets pour des problèmes bruyants : la prévision de données chez Veolia, la photographie sur la longue route entre les chiffres.",
    hero_currently: "Actuellement",
    hero_studied: "Formation",
    hero_elsewhere: "Ailleurs",
    hero_currently_value: "Data science chez Veolia",
    hero_studied_value: "Intelligence artificielle à l'ENSTA Paris, 2025",
    hero_elsewhere_value: "Français, anglais, chinois",
    hero_see_work: "Voir les projets",
    hero_read_record: "À propos",
    hero_place: "Paris, France",

    about_statement:
      "Je construis des systèmes de données qui doivent tenir face au réel, puis je pédale 600 km pour aller le rencontrer.",
    about_certified: "Certifications",
    about_languages: "Langues",
    about_also: "Aussi",
    about_also_value: "Cycliste, photographe, ancien d'ENSTRAID et de Technimage.",
    about_cv: "CV",
    about_portrait_alt: "Portrait de Marc Chen",
    about_photo_caption:
      "Le Mont-Saint-Michel, vu depuis le trajet Cabourg–Saint-Malo.",

    about_title: "À propos",
    skills_title: "Compétences",
    experiences_title: "Expérience",
    education_title: "Formation",
    projects_title: "Projets choisis",
    accomplishments_title: "Cours & certificats",
    featured_posts: "Articles en vedette",
    featured_title: "Derniers écrits",
    achievements_title: "Réalisations",
    sec_all_writing: "Tous les écrits",

    skills_entries: "{n} compétences",
    skills_empty: "Aucune compétence pour ce filtre.",
    cat_basic: "Fondamentaux",
    cat_programming_language: "Programmation",
    cat_cloud_services: "Cloud",

    present: "Présent",
    taken_courses: "Cours",
    extracurricular_activities: "Activités extra-scolaires",
    view_grades: "Voir les notes",
    edu_grade: "Note",

    source_code: "GitHub",
    live_preview: "Page du projet",
    no_projects: "Aucun projet ne correspond à ce filtre.",
    projects_filter: "Filtrer les projets",
    proj_all: "Tout",
    proj_professional: "Professionnel",
    proj_academic: "Académique",
    proj_hobby: "Loisir",
    project_img_visionvendor_alt:
      "Logo et signature Vision Vendor : un partenaire d'estimation et de revente propulsé par l'IA.",
    project_img_uav_alt:
      "L'hexacoptère d'ENST'AIR sur une table avant le Dassault UAV Challenge.",

    acc_view: "Certificat",

    all_posts: "Tous les articles",
    blog_nav: "Écrits",
    blog_title: "Écrits",
    blog_intro:
      "Notes sur des systèmes de données, de petites machines et les routes qui les relient. Tenues depuis 2020.",
    no_posts: "Pas encore d'articles.",
    read_more: "Lire",
    back_to_blog: "Retour aux écrits",
    post_previous: "Précédent",
    post_next: "Suivant",
    post_date: "Publié le",
    post_tags: "Tags",
    comments: "Commentaires",
    comments_intro:
      "Les commentaires passent par GitHub Discussions et ne se chargent que si vous le demandez.",
    comments_load: "Afficher les commentaires",
    comments_hide: "Masquer les commentaires",
    comments_help: "Ouvrir la discussion sur GitHub",
    comments_fallback: "Si le fil n'apparaît pas, lisez-le sur GitHub.",

    photos_nav: "Photographies",
    photos_title: "Photographies",
    photos_intro:
      "Paysages, architecture et la lumière ordinaire entre les deux. Une petite archive, tenue lentement.",
    photos_empty_title: "Pas encore de photographies en ligne.",
    photos_empty_body:
      "La galerie n'est pas encore publiée. Les photographies du trajet 2023 sont dans le journal.",
    photos_journal: "Lire le journal de route",
    photos_caption: "Le Mont-Saint-Michel, depuis le trajet Cabourg–Saint-Malo.",
    photos_gallery_hint: "Choisissez une photographie pour l'ouvrir en plein écran.",

    notfound_label: "404",
    notfound_title: "Cette page n'existe pas.",
    notfound_body:
      "L'adresse est peut-être incorrecte, ou la page a été déplacée. Reprenez depuis l'une des trois pages d'accueil, ou parcourez les écrits.",
    notfound_writing: "Parcourir les écrits",

    footer_contact: "Contact",
    footer_pages: "Pages",
    footer_elsewhere: "Ailleurs",
    footer_languages: "Langues",
    footer_cv_en: "CV anglais",
    footer_cv_fr: "CV français",
    footer_cv_zh: "CV chinois",
    footer_top: "Haut",
    footer_location: "Paris, France",
    book_a_call: "Réserver un appel",
    my_resume: "Mon CV",

    out_of: "sur",
    show_more: "Voir plus",
    show_less: "Voir moins",
    course_name: "Cours",
    total_credit: "Crédit total",
    obtained_credit: "Crédit obtenu",
    view_certificate: "Voir le certificat",
    featured_project: "Projet en vedette",
    role_label: "Rôle",
    copy_email: "Copier l'email",
    contact_me: "Contact",
  },
  "zh-cn": {
    skip_to_content: "跳到内容",
    nav_primary: "主导航",
    nav_menu_open: "菜单",
    nav_menu_close: "关闭",
    nav_about: "关于",
    nav_work: "作品",
    nav_writing: "文章",
    nav_photographs: "摄影",
    nav_contact: "联系",
    switch_language: "语言",
    a11y_new_tab: "在新标签页打开",

    hero_role: "数据工程师，巴黎",
    hero_lede:
      "为嘈杂的问题搭建安静的系统：在威立雅做数据预测，在数字之间的长路上拍照。",
    hero_currently: "目前",
    hero_studied: "求学",
    hero_elsewhere: "别处",
    hero_currently_value: "在威立雅做数据科学",
    hero_studied_value: "ENSTA Paris 人工智能，2025",
    hero_elsewhere_value: "法语、英语、中文",
    hero_see_work: "看作品",
    hero_read_record: "关于我",
    hero_place: "法国，巴黎",

    about_statement:
      "我做的数据系统必须经得起现实，然后我骑 600 公里去见现实。",
    about_certified: "认证",
    about_languages: "语言",
    about_also: "其他",
    about_also_value: "骑行者、摄影师，ENSTRAID 与 Technimage 前成员。",
    about_cv: "简历",
    about_portrait_alt: "Marc Chen 的肖像",
    about_photo_caption: "圣米歇尔山，摄于卡堡—圣马洛途中。",

    about_title: "关于",
    skills_title: "技能",
    experiences_title: "经历",
    education_title: "教育",
    projects_title: "精选作品",
    accomplishments_title: "课程与证书",
    featured_posts: "精选文章",
    featured_title: "最新文章",
    achievements_title: "成就",
    sec_all_writing: "全部文章",

    skills_entries: "{n} 项技能",
    skills_empty: "此筛选下没有技能。",
    cat_basic: "基础",
    cat_programming_language: "编程",
    cat_cloud_services: "云服务",

    present: "至今",
    taken_courses: "课程",
    extracurricular_activities: "课外活动",
    view_grades: "查看成绩",
    edu_grade: "成绩",

    source_code: "GitHub",
    live_preview: "项目页面",
    no_projects: "没有符合此筛选的项目。",
    projects_filter: "筛选项目",
    proj_all: "全部",
    proj_professional: "职业",
    proj_academic: "学术",
    proj_hobby: "兴趣",
    project_img_visionvendor_alt:
      "Vision Vendor 的标志与标语：AI 驱动的估价与转售伙伴。",
    project_img_uav_alt: "达索无人机挑战赛前放在桌上的 ENST'AIR 六旋翼无人机。",

    acc_view: "证书",

    all_posts: "所有文章",
    blog_nav: "文章",
    blog_title: "文章",
    blog_intro:
      "关于数据系统、小机器，以及连接它们的道路的笔记。从 2020 年记到现在。",
    no_posts: "暂无文章。",
    read_more: "阅读",
    back_to_blog: "返回文章",
    post_previous: "上一篇",
    post_next: "下一篇",
    post_date: "发布于",
    post_tags: "标签",
    comments: "评论",
    comments_intro: "评论由 GitHub Discussions 提供，仅在您点击时加载。",
    comments_load: "加载评论",
    comments_hide: "收起评论",
    comments_help: "在 GitHub 上打开讨论",
    comments_fallback: "如果讨论没有出现，请在 GitHub 上阅读。",

    photos_nav: "摄影",
    photos_title: "摄影",
    photos_intro: "风景、建筑，以及两者之间平常的光。一个慢慢整理的小档案。",
    photos_empty_title: "照片尚未上线。",
    photos_empty_body:
      "画廊还未发布。2023 年骑行途中的照片发布在文章里。",
    photos_journal: "读骑行日志",
    photos_caption: "圣米歇尔山，摄于卡堡—圣马洛途中。",
    photos_gallery_hint: "选择一张照片以全屏打开。",

    notfound_label: "404",
    notfound_title: "此页不存在。",
    notfound_body:
      "地址可能有误，或页面已经移动。请从三个语言版本的首页重新开始，或浏览文章。",
    notfound_writing: "浏览文章",

    footer_contact: "联系",
    footer_pages: "页面",
    footer_elsewhere: "别处",
    footer_languages: "语言",
    footer_cv_en: "英文简历",
    footer_cv_fr: "法文简历",
    footer_cv_zh: "中文简历",
    footer_top: "顶部",
    footer_location: "法国，巴黎",
    book_a_call: "预约通话",
    my_resume: "我的简历",

    out_of: "满分",
    show_more: "显示更多",
    show_less: "显示更少",
    course_name: "课程",
    total_credit: "总学分",
    obtained_credit: "已获学分",
    view_certificate: "查看证书",
    featured_project: "精选项目",
    role_label: "角色",
    copy_email: "复制邮箱",
    contact_me: "联系我",
  },
};

export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}

/** Small helper for strings with a numeric placeholder. */
export function tn(locale: Locale, key: string, n: number): string {
  return t(locale, key).replace("{n}", String(n));
}

export function formatDate(date: string | Date, locale: Locale): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  const tag = locale === "zh-cn" ? "zh-CN" : locale;
  return new Intl.DateTimeFormat(tag, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Stable ISO string for <time> and OpenGraph, whatever gray-matter gave us. */
export function dateISO(date: string | Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? String(date) : d.toISOString();
}
