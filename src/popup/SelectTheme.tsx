import SyntaxHighlighter from "react-syntax-highlighter";
import { themes, Theme } from "../config/themes";
import { useEffect, useState } from "react";
import { getStorage, sendMessageToContents, setStorage } from "../utils/chrome";
import { StorageValue } from "../types";
import { FromPopup } from "../config";
import Header from "../components/Header";
import SelectboxRow from "../components/SelectboxRow";
import Button from "../components/Button";
import { Language, languages, snippets } from "../config/languages";
import Github from "../components/Github";
import { loadThemeStyle } from "../utils";

type Preview = {
  themeName: Theme;
  language: Language;
};

const Preview = ({ themeName, language }: Preview) => {
  const [themeStyle, setThemeStyle] = useState<{
    [key: string]: React.CSSProperties;
  } | null>(null);
  useEffect(() => {
    loadThemeStyle(themeName, (theme) => setThemeStyle(theme));
  });
  const getSnippet = () => {
    return (
      snippets.find((snippet) => snippet.language === language)?.code || ""
    );
  };
  if (themeStyle === null) return null;

  return (
    <SyntaxHighlighter language={language} style={themeStyle}>
      {getSnippet()}
    </SyntaxHighlighter>
  );
};

const SelectTheme = () => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("");
  const [selectedPreviewLanguage, setSelectedPreviewLanguage] =
    useState<Language>("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    getStorage(["themeName", "previewLanguage"]).then((data: StorageValue) => {
      setSelectedTheme(data.themeName as Theme);
      setSelectedPreviewLanguage(data.previewLanguage as Language);
    });
  }, []);

  const handleChangeTheme = (e: React.FormEvent<HTMLSelectElement>) => {
    if (e.currentTarget.value) {
      setSelectedTheme(e.currentTarget.value as Theme);
    }
  };
  const handleChangeLanguage = (e: React.FormEvent<HTMLSelectElement>) => {
    if (e.currentTarget.value) {
      setSelectedPreviewLanguage(e.currentTarget.value as Language);
    }
  };
  const handleApply = () => {
    if (isApplying) return;

    setIsApplying(true);
    setStorage({ themeName: selectedTheme }).then(() => {
      setIsApplying(false);

      updateContentPage();
    });
    setIsApplying(false);
  };

  const updateContentPage = () => {
    sendMessageToContents(FromPopup.update_theme);
  };
  return (
    <div className="body">
      <Header />
      <div className="flex flex-col p-4 gap-2 relative">
        <SelectboxRow
          labelText="Theme"
          options={themes}
          selectedValue={selectedTheme}
          handleChange={handleChangeTheme}
        />
        <SelectboxRow
          labelText="Preview"
          options={languages}
          selectedValue={selectedPreviewLanguage}
          handleChange={handleChangeLanguage}
        />

        <div className="flex flex-col mt-4">
          {selectedTheme && (
            <Preview
              themeName={selectedTheme}
              language={selectedPreviewLanguage}
            />
          )}
        </div>

        <div className="self-end mt-2">
          <Button text="Apply" type="button" handleClick={handleApply} />
        </div>
        <div className="absolute bottom-4 left-4">
          <Github />
        </div>
      </div>
    </div>
  );
};

export default SelectTheme;
