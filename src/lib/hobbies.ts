import type { Locale } from "@/lib/i18n";
import type { HobbyId } from "@/components/three/hobbyRoom";

export interface HobbyInfo {
  /** Short label shown on hover. */
  name: string;
  /** Category shown above the title in the panel. */
  kind: string;
  text: string;
  /** What clicking does (easter egg), shown as a hint. */
  play?: string;
  link?: { href: string; label: string };
}

type Table = Record<HobbyId, HobbyInfo>;

const en: Table = {
  triban: { kind: "Cycling", name: "Triban GRVL 520 Subcompact", text: "The red gravel bike.", play: "Click again to spin the wheels.", link: { href: "/blog/bike/", label: "Read the bike trip" } },
  scott: { kind: "Cycling", name: "Scott Addict Gravel", text: "The gravel bike in white and blue.", play: "Click again to spin the wheels.", link: { href: "/blog/bike/", label: "Read the bike trip" } },
  orbea: { kind: "Cycling", name: "Orbea Orca M30i Pwr Ltd 2024", text: "The orange road bike.", play: "Click again to spin the wheels.", link: { href: "/blog/bike/", label: "Read the bike trip" } },
  jersey: { kind: "Basketball", name: "Golden State · Curry 30", text: "Basketball is my weekly sport, and Steph Curry is my favourite player.", play: "Try the ball on the floor." },
  medals: { kind: "Running", name: "Half-marathon medals", text: "Hoka half-marathon medals.", play: "Click again to make them swing." },
  ball: { kind: "Easter egg", name: "Take a shot", text: "Aim for the mini hoop above the frame.", play: "Click the ball to shoot." },
  tent: { kind: "Outdoors", name: "Bivouac", text: "Self-sufficient overnight hikes: freestanding tent and mountain boots.", play: "Click again to light the lantern." },
  camera: { kind: "Photo & video", name: "Sony A6600 on a Sirui tripod", text: "My camera for timelapses and travel videos.", play: "Click again to take a photo.", link: { href: "/photos/", label: "See the photos" } },
  instax: { kind: "Photo & video", name: "Instax Mini 11", text: "Instant prints for the trips.", play: "Click again to print one." },
  fuji: { kind: "Photo & video", name: "Mount Fuji", text: "A frame from my Mount Fuji timelapse, Japan, spring 2025.", link: { href: "/photos/", label: "See the timelapses" } },
  monitors: { kind: "Desk", name: "Dual screens · BenQ PD2706U", text: "Work by day, K-drama at night." },
  music: { kind: "Music", name: "C-pop on repeat", text: "Phoenix Legend, Jay Chou, Eason Chan, Faye Wong.", play: "Click again to change the song." },
  speakers: { kind: "Desk", name: "PreSonus Eris 4.5", text: "Studio monitors for music and editing.", play: "Click again to skip the song." },
  mic: { kind: "Desk", name: "Shure MV7X", text: "For voice-overs and calls.", play: "Click again: on air." },
  scarlett: { kind: "Desk", name: "Focusrite Scarlett 2i2", text: "Audio interface for the mic and the speakers." },
  streamdeck: { kind: "Desk", name: "Stream Deck", text: "Shortcuts for editing and streaming.", play: "Click again to light it up." },
  pi: { kind: "Tech", name: "Raspberry Pi in its cage", text: "My homelab: self-hosted services running in Docker.", link: { href: "/blog/spotify-free/", label: "Read: self-hosted music" } },
  prints: { kind: "Tech", name: "3D prints", text: "A shelf of things printed at home." },
  lamp: { kind: "Desk", name: "Desk lamp", text: "The light for late sessions.", play: "Click again to switch it on or off." },
  printer: { kind: "Tech", name: "Creality SparkX i7", text: "The 3D printer behind the shelf of prints.", play: "Click again to start a print." },
};

const fr: Table = {
  triban: { kind: "Vélo", name: "Triban GRVL 520 Subcompact", text: "Le gravel rouge.", play: "Clique encore pour faire tourner les roues.", link: { href: "/fr/blog/bike/", label: "Lire le voyage à vélo" } },
  scott: { kind: "Vélo", name: "Scott Addict Gravel", text: "Le gravel blanc et bleu.", play: "Clique encore pour faire tourner les roues.", link: { href: "/fr/blog/bike/", label: "Lire le voyage à vélo" } },
  orbea: { kind: "Vélo", name: "Orbea Orca M30i Pwr Ltd 2024", text: "Le vélo de route orange.", play: "Clique encore pour faire tourner les roues.", link: { href: "/fr/blog/bike/", label: "Lire le voyage à vélo" } },
  jersey: { kind: "Basket", name: "Golden State · Curry 30", text: "Le basket est mon sport de la semaine, et Steph Curry mon joueur préféré.", play: "Essaie le ballon au sol." },
  medals: { kind: "Course à pied", name: "Médailles de semi-marathon", text: "Médailles de semi-marathon Hoka.", play: "Clique encore pour les faire balancer." },
  ball: { kind: "Easter egg", name: "Tente un tir", text: "Vise le mini panier au-dessus du cadre.", play: "Clique sur le ballon pour tirer." },
  tent: { kind: "Plein air", name: "Bivouac", text: "Randonnées en autonomie : tente autoportante et chaussures de montagne.", play: "Clique encore pour allumer la lanterne." },
  camera: { kind: "Photo & vidéo", name: "Sony A6600 sur trépied Sirui", text: "Mon appareil pour les timelapses et les vidéos de voyage.", play: "Clique encore pour prendre une photo.", link: { href: "/fr/photos/", label: "Voir les photos" } },
  instax: { kind: "Photo & vidéo", name: "Instax Mini 11", text: "Des tirages instantanés pour les voyages.", play: "Clique encore pour en imprimer un." },
  fuji: { kind: "Photo & vidéo", name: "Mont Fuji", text: "Une image de mon timelapse du mont Fuji, Japon, printemps 2025.", link: { href: "/fr/photos/", label: "Voir les timelapses" } },
  monitors: { kind: "Bureau", name: "Double écran · BenQ PD2706U", text: "Le travail le jour, les K-dramas le soir." },
  music: { kind: "Musique", name: "C-pop en boucle", text: "Phoenix Legend, Jay Chou, Eason Chan, Faye Wong.", play: "Clique encore pour changer de chanson." },
  speakers: { kind: "Bureau", name: "PreSonus Eris 4.5", text: "Enceintes de monitoring pour la musique et le montage.", play: "Clique encore pour passer la chanson." },
  mic: { kind: "Bureau", name: "Shure MV7X", text: "Pour les voix off et les appels.", play: "Clique encore : à l’antenne." },
  scarlett: { kind: "Bureau", name: "Focusrite Scarlett 2i2", text: "L’interface audio du micro et des enceintes." },
  streamdeck: { kind: "Bureau", name: "Stream Deck", text: "Des raccourcis pour le montage et le streaming.", play: "Clique encore pour l’allumer." },
  pi: { kind: "Tech", name: "Raspberry Pi dans sa cage", text: "Mon homelab : des services auto-hébergés sous Docker.", link: { href: "/blog/spotify-free/", label: "Lire : musique auto-hébergée" } },
  prints: { kind: "Tech", name: "Impressions 3D", text: "Une étagère d’objets imprimés à la maison." },
  lamp: { kind: "Bureau", name: "Lampe de bureau", text: "La lumière des sessions tardives.", play: "Clique encore pour l’allumer ou l’éteindre." },
  printer: { kind: "Tech", name: "Creality SparkX i7", text: "L’imprimante 3D derrière l’étagère d’impressions.", play: "Clique encore pour lancer une impression." },
};

const zh: Table = {
  triban: { kind: "骑行", name: "Triban GRVL 520 Subcompact", text: "红色的砾石公路车。", play: "再点一次让车轮转起来。", link: { href: "/zh-cn/blog/bike/", label: "阅读骑行游记" } },
  scott: { kind: "骑行", name: "Scott Addict Gravel", text: "白蓝配色的砾石车。", play: "再点一次让车轮转起来。", link: { href: "/zh-cn/blog/bike/", label: "阅读骑行游记" } },
  orbea: { kind: "骑行", name: "Orbea Orca M30i Pwr Ltd 2024", text: "橙色的公路车。", play: "再点一次让车轮转起来。", link: { href: "/zh-cn/blog/bike/", label: "阅读骑行游记" } },
  jersey: { kind: "篮球", name: "金州勇士 · 库里 30", text: "篮球是我每周的运动，库里是我最喜欢的球员。", play: "试试地上的篮球。" },
  medals: { kind: "跑步", name: "半程马拉松奖牌", text: "Hoka 半程马拉松奖牌。", play: "再点一次让它们摆动。" },
  ball: { kind: "彩蛋", name: "投个篮", text: "瞄准相框上方的小篮筐。", play: "点击篮球投篮。" },
  tent: { kind: "户外", name: "露营", text: "自给自足的徒步露营：自立式帐篷和登山鞋。", play: "再点一次点亮营灯。" },
  camera: { kind: "摄影与视频", name: "Sony A6600 + 思锐三脚架", text: "拍延时摄影和旅行视频的相机。", play: "再点一次拍张照。", link: { href: "/zh-cn/photos/", label: "查看照片" } },
  instax: { kind: "摄影与视频", name: "Instax Mini 11", text: "旅行时的拍立得。", play: "再点一次打印一张。" },
  fuji: { kind: "摄影与视频", name: "富士山", text: "来自我的富士山延时摄影，日本，2025 年春。", link: { href: "/zh-cn/photos/", label: "查看延时摄影" } },
  monitors: { kind: "桌面", name: "双屏 · BenQ PD2706U", text: "白天工作，晚上追韩剧。" },
  music: { kind: "音乐", name: "循环播放华语流行", text: "凤凰传奇、周杰伦、陈奕迅、王菲。", play: "再点一次切歌。" },
  speakers: { kind: "桌面", name: "PreSonus Eris 4.5", text: "用于听歌和剪辑的监听音箱。", play: "再点一次下一首。" },
  mic: { kind: "桌面", name: "Shure MV7X", text: "用于配音和通话。", play: "再点一次：开麦。" },
  scarlett: { kind: "桌面", name: "Focusrite Scarlett 2i2", text: "连接麦克风和音箱的声卡。" },
  streamdeck: { kind: "桌面", name: "Stream Deck", text: "剪辑和直播的快捷键。", play: "再点一次点亮它。" },
  pi: { kind: "科技", name: "树莓派与保护笼", text: "我的家庭服务器：用 Docker 自托管服务。", link: { href: "/blog/spotify-free/", label: "阅读：自托管音乐" } },
  prints: { kind: "科技", name: "3D 打印", text: "一层在家打印的小物件。" },
  lamp: { kind: "桌面", name: "台灯", text: "深夜工作的灯光。", play: "再点一次开关灯。" },
  printer: { kind: "科技", name: "Creality SparkX i7", text: "架子上的 3D 打印件都出自它。", play: "再点一次开始打印。" },
};

const TABLES: Record<Locale, Table> = { en, fr, "zh-cn": zh };

export function getHobbies(locale: Locale): Table {
  return TABLES[locale] ?? en;
}
