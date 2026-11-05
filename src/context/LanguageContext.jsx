import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

function getInitialLang() {
  // ?lang=hu vagy ?lang=en URL param felülírja a defaultot
  const param = new URLSearchParams(window.location.search).get("lang");
  if (param === "hu" || param === "en") return param;
  return /^\/bemutatkozas\/?$/i.test(window.location.pathname) ? "hu" : "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
