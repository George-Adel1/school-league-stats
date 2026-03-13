import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "ar";

const translations: Record<string, Record<Lang, string>> = {
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
