import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "ar";

const translations: Record<string, Record<Lang, string>> = {
  // Sidebar nav
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  seasons: { en: "Seasons", ar: "المواسم" },
  groups: { en: "Groups", ar: "المجموعات" },
  teams: { en: "Teams", ar: "الفرق" },
  players: { en: "Players", ar: "اللاعبون" },
  gameweeks: { en: "Game Weeks", ar: "أسابيع اللعب" },
  matches: { en: "Matches", ar: "المباريات" },
  stats: { en: "Stats", ar: "الإحصائيات" },
  news: { en: "News", ar: "الأخبار" },
  chips: { en: "Chips", ar: "الرقائق" },
  fantasy: { en: "Fantasy", ar: "الفانتازي" },
  signOut: { en: "Sign Out", ar: "تسجيل الخروج" },
  collapse: { en: "Collapse", ar: "طي" },
  fantasyLeague: { en: "Fantasy League", ar: "دوري الفانتازي" },
  groupStage: { en: "Group Stage", ar: "مرحلة المجموعات" },

  // Common actions
  add: { en: "Add", ar: "إضافة" },
  edit: { en: "Edit", ar: "تعديل" },
  delete: { en: "Delete", ar: "حذف" },
  save: { en: "Save", ar: "حفظ" },
  saving: { en: "Saving...", ar: "جاري الحفظ..." },
  cancel: { en: "Cancel", ar: "إلغاء" },
  actions: { en: "Actions", ar: "الإجراءات" },
  loading: { en: "Loading...", ar: "جاري التحميل..." },
  noData: { en: "No data yet", ar: "لا توجد بيانات بعد" },
  error: { en: "Error", ar: "خطأ" },
  select: { en: "Select", ar: "اختر" },
  new: { en: "New", ar: "جديد" },
  none: { en: "None", ar: "لا يوجد" },

  // Seasons page
  seasonNumber: { en: "Season Number", ar: "رقم الموسم" },
  startDate: { en: "Start Date", ar: "تاريخ البداية" },
  endDate: { en: "End Date", ar: "تاريخ النهاية" },
  addSeason: { en: "Add Season", ar: "إضافة موسم" },
  editSeason: { en: "Edit Season", ar: "تعديل موسم" },
  deleteSeason: { en: "Delete this season?", ar: "هل تريد حذف هذا الموسم؟" },
  season: { en: "Season", ar: "الموسم" },

  // Groups page
  groupNumber: { en: "Group Number", ar: "رقم المجموعة" },
  addGroup: { en: "Add Group", ar: "إضافة مجموعة" },
  editGroup: { en: "Edit Group", ar: "تعديل مجموعة" },
  deleteGroup: { en: "Delete this group?", ar: "هل تريد حذف هذه المجموعة؟" },
  group: { en: "Group", ar: "مجموعة" },

  // Teams page
  teamName: { en: "Team Name", ar: "اسم الفريق" },
  addTeam: { en: "Add Team", ar: "إضافة فريق" },
  editTeam: { en: "Edit Team", ar: "تعديل فريق" },
  deleteTeam: { en: "Delete this team?", ar: "هل تريد حذف هذا الفريق؟" },
  selectGroup: { en: "Select group", ar: "اختر مجموعة" },

  // Players page
  firstName: { en: "First Name", ar: "الاسم الأول" },
  lastName: { en: "Last Name", ar: "اسم العائلة" },
  position: { en: "Position", ar: "المركز" },
  value: { en: "Value", ar: "القيمة" },
  team: { en: "Team", ar: "الفريق" },
  price: { en: "Price", ar: "السعر" },
  addPlayer: { en: "Add Player", ar: "إضافة لاعب" },
  editPlayer: { en: "Edit Player", ar: "تعديل لاعب" },
  deletePlayer: { en: "Delete this player?", ar: "هل تريد حذف هذا اللاعب؟" },
  selectTeam: { en: "Select team", ar: "اختر فريق" },

  // Game Weeks page
  weekNumber: { en: "Week #", ar: "رقم الأسبوع" },
  weekNum: { en: "Week Number", ar: "رقم الأسبوع" },
  addGameWeek: { en: "Add Game Week", ar: "إضافة أسبوع لعب" },
  editGameWeek: { en: "Edit Game Week", ar: "تعديل أسبوع لعب" },
  deleteGameWeek: { en: "Delete this game week?", ar: "هل تريد حذف أسبوع اللعب هذا؟" },
  selectSeason: { en: "Select season", ar: "اختر موسم" },

  // Matches page
  date: { en: "Date", ar: "التاريخ" },
  gameWeek: { en: "Game Week", ar: "أسبوع اللعب" },
  team1: { en: "Team 1", ar: "الفريق ١" },
  team2: { en: "Team 2", ar: "الفريق ٢" },
  status: { en: "Status", ar: "الحالة" },
  played: { en: "Played", ar: "لُعبت" },
  upcoming: { en: "Upcoming", ar: "قادمة" },
  motm: { en: "MOTM", ar: "أفضل لاعب" },
  manOfTheMatch: { en: "Man of the Match", ar: "أفضل لاعب في المباراة" },
  matchPlayed: { en: "Match Played", ar: "المباراة لُعبت" },
  addMatch: { en: "Add Match", ar: "إضافة مباراة" },
  editMatch: { en: "Edit Match", ar: "تعديل مباراة" },
  deleteMatch: { en: "Delete this match?", ar: "هل تريد حذف هذه المباراة؟" },

  // Announcements page
  announcements: { en: "Announcements", ar: "الإعلانات" },
  title: { en: "Title", ar: "العنوان" },
  body: { en: "Body", ar: "المحتوى" },
  image: { en: "Image", ar: "الصورة" },
  published: { en: "Published", ar: "منشور" },
  draft: { en: "Draft", ar: "مسودة" },
  noDescription: { en: "No description", ar: "بدون وصف" },
  titleRequired: { en: "Title is required", ar: "العنوان مطلوب" },
  announcementUpdated: { en: "Announcement updated", ar: "تم تحديث الإعلان" },
  announcementCreated: { en: "Announcement created", ar: "تم إنشاء الإعلان" },
  deleted: { en: "Deleted", ar: "تم الحذف" },
  deleteAnnouncement: { en: "Delete this announcement?", ar: "هل تريد حذف هذا الإعلان؟" },
  newAnnouncement: { en: "New Announcement", ar: "إعلان جديد" },
  editAnnouncement: { en: "Edit Announcement", ar: "تعديل الإعلان" },
  announcementTitle: { en: "Announcement title", ar: "عنوان الإعلان" },
  details: { en: "Details...", ar: "التفاصيل..." },
  noAnnouncements: { en: "No announcements yet.", ar: "لا توجد إعلانات بعد." },
  uploadFailed: { en: "Upload failed", ar: "فشل الرفع" },

  // Stats page
  statistics: { en: "Statistics", ar: "الإحصائيات" },
  teamSeason: { en: "Team Season", ar: "موسم الفريق" },
  teamMatch: { en: "Team Match", ar: "مباراة الفريق" },
  playerSeason: { en: "Player Season", ar: "موسم اللاعب" },
  playerMatch: { en: "Player Match", ar: "مباراة اللاعب" },

  // Chips page
  chipName: { en: "Chip Name", ar: "اسم الرقاقة" },
  description: { en: "Description", ar: "الوصف" },
  addChip: { en: "Add Chip", ar: "إضافة رقاقة" },
  editChip: { en: "Edit Chip", ar: "تعديل رقاقة" },
  deleteChip: { en: "Delete this chip?", ar: "هل تريد حذف هذه الرقاقة؟" },

  // Fantasy Admin page
  fantasyManagement: { en: "Fantasy Management", ar: "إدارة الفانتازي" },
  leaderboard: { en: "Leaderboard", ar: "لوحة المتصدرين" },
  fantasyTeams: { en: "Fantasy Teams", ar: "فرق الفانتازي" },
  calculate: { en: "Calculate", ar: "احسب" },
  chipUsage: { en: "Chip Usage", ar: "استخدام الرقائق" },
  fantasyLeaderboard: { en: "Fantasy Leaderboard", ar: "ترتيب الفانتازي" },
  noFantasyTeams: { en: "No fantasy teams yet", ar: "لا توجد فرق فانتازي بعد" },
  noChipsUsed: { en: "No chips used yet", ar: "لم يتم استخدام رقائق بعد" },
  calculateMatchPoints: { en: "Calculate Match Points", ar: "احسب نقاط المباراة" },
  calculateDesc: { en: "Click \"Calculate\" on a match to compute fantasy points based on player stats.", ar: "اضغط \"احسب\" على مباراة لحساب نقاط الفانتازي بناءً على إحصائيات اللاعبين." },
  recalculate: { en: "Recalculate", ar: "إعادة الحساب" },
  calculating: { en: "Calculating...", ar: "جاري الحساب..." },
  pointsCalculated: { en: "Points Calculated", ar: "تم حساب النقاط" },
  playersProcessed: { en: "players processed", ar: "لاعبين تمت معالجتهم" },
  pts: { en: "pts", ar: "نقطة" },

  // Dashboard page
  fantasyLeagueDashboard: { en: "Fantasy League Dashboard", ar: "لوحة تحكم دوري الفانتازي" },
  platformSubtitle: { en: "School League Stats & Fantasy Football Platform", ar: "إحصائيات الدوري المدرسي ومنصة كرة القدم الخيالية" },
  fantasySystem: { en: "Fantasy System", ar: "نظام الفانتازي" },
  pointSystem: { en: "Point System", ar: "نظام النقاط" },
  pointsEngine: { en: "Points Engine", ar: "محرك النقاط" },
  pointsEngineDesc: { en: "Calculates fantasy points per player per match based on game rules", ar: "يحسب نقاط الفانتازي لكل لاعب في كل مباراة بناءً على قواعد اللعبة" },
  chipsCount: { en: "6 Chips", ar: "٦ رقائق" },
  chipsDesc: { en: "2 Captains, Wild Card, No Goalie, Bench Boost, Midfield Maestro, Aguerooooooo", ar: "٢ كابتن، وايلد كارد، بدون حارس، تعزيز الاحتياط، مايسترو الوسط، أغويرووووو" },
  budgetLabel: { en: "70M Budget", ar: "ميزانية ٧٠ مليون" },
  budgetDesc: { en: "Squad: 1 GK + 3 DEF + 3 MID + 2 FWD (max 2 per class)", ar: "التشكيلة: ١ حارس + ٣ مدافعين + ٣ وسط + ٢ مهاجمين (بحد أقصى ٢ من كل صف)" },
  leaderboardLabel: { en: "Leaderboard", ar: "لوحة المتصدرين" },
  leaderboardDesc: { en: "Real-time ranking of all fantasy teams", ar: "ترتيب فوري لجميع فرق الفانتازي" },
  goalsLabel: { en: "Goals: GK=12, DEF=7, MID=4, FWD=3", ar: "أهداف: حارس=١٢، مدافع=٧، وسط=٤، مهاجم=٣" },
  assistsLabel: { en: "Assists: GK=7, DEF=4, MID/FWD=3", ar: "تمريرات حاسمة: حارس=٧، مدافع=٤، وسط/مهاجم=٣" },
  cleanSheetLabel: { en: "Clean sheet: GK=4, DEF=3", ar: "شباك نظيفة: حارس=٤، مدافع=٣" },
  cardsLabel: { en: "Yellow=-1, 🟥 Red=-3, Own Goal=-2", ar: "أصفر=-١، 🟥 أحمر=-٣، هدف ذاتي=-٢" },
  penaltyLabel: { en: "Penalty save=+5, Penalty miss=-3", ar: "صد ضربة جزاء=+٥، ضربة جزاء ضائعة=-٣" },
  refBonusLabel: { en: "Ref bonus: 3/2/1 pts for top 3 players", ar: "مكافأة الحكم: ٣/٢/١ نقاط لأفضل ٣ لاعبين" },

  // Group Stage
  noGroupsFound: { en: "No groups found", ar: "لا توجد مجموعات" },
  noTeams: { en: "No teams", ar: "لا توجد فرق" },
};

interface LangCtx { lang: Lang; toggle: () => void; t: (key: string) => string; }

const LanguageContext = createContext<LangCtx>({ lang: "en", toggle: () => {}, t: (k) => k });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");
  const toggle = () => setLang(l => l === "en" ? "ar" : "en");
  const t = (key: string) => translations[key]?.[lang] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      <div dir={lang === "ar" ? "rtl" : "ltr"}>{children}</div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
