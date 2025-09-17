(function () {
  const CHECKBOX_SELECTOR = ".checkbox";
  const DARK_CLASS = "dark-mode";
  const STORAGE_KEYS = [
    { key: "theme", dark: "dark", light: "light" },
    { key: "dark-mode", dark: "enabled", light: "disabled" },
  ];
  const body = document.body;
  const checkboxes = new Set();

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {

    }
  }

  function getStoredPreference() {
    for (const { key, dark, light } of STORAGE_KEYS) {
      const value = readStorage(key);
      if (value === dark) return "dark";
      if (value === light) return "light";
    }
    return null;
  }

  function persistPreference(isDark) {
    STORAGE_KEYS.forEach(({ key, dark, light }) => {
      writeStorage(key, isDark ? dark : light);
    });
  }

  function updateCheckboxStates(isDark) {
    checkboxes.forEach(checkbox => {
      if (checkbox) {
        checkbox.checked = isDark;
      }
    });
  }

  function emitChange(isDark) {
    const event = new CustomEvent("darkmodechange", { detail: { isDark } });
    document.dispatchEvent(event);
  }

  function applyTheme(isDark, options = {}) {
    const shouldBeDark = Boolean(isDark);
    body.classList.toggle(DARK_CLASS, shouldBeDark);
    updateCheckboxStates(shouldBeDark);
    if (!options.skipPersist) {
      persistPreference(shouldBeDark);
    }
    if (!options.skipEvent) {
      emitChange(shouldBeDark);
    }
  }

  function handleCheckboxChange(event) {
    applyTheme(event.target.checked);
  }

  function initialise() {
    const storedPreference = getStoredPreference();
    const startInDarkMode = storedPreference === "dark";

    document.querySelectorAll(CHECKBOX_SELECTOR).forEach(checkbox => {
      if (!checkbox) return;
      checkboxes.add(checkbox);
      checkbox.checked = startInDarkMode;
      checkbox.removeEventListener("change", handleCheckboxChange);
      checkbox.addEventListener("change", handleCheckboxChange);
    });

    applyTheme(startInDarkMode, { skipPersist: storedPreference !== null, skipEvent: true });
    persistPreference(startInDarkMode);

    requestAnimationFrame(() => emitChange(startInDarkMode));
  }

  document.addEventListener("DOMContentLoaded", initialise);

  window.DarkMode = {
    isDark() {
      return body.classList.contains(DARK_CLASS);
    },
    setDark(value) {
      applyTheme(Boolean(value));
    },
    toggle() {
      applyTheme(!this.isDark());
    },
    onChange(handler) {
      if (typeof handler !== "function") return;
      document.addEventListener("darkmodechange", event => handler(event.detail.isDark, event));
    },
    syncCheckbox(element) {
      if (!element) return;
      checkboxes.add(element);
      element.checked = this.isDark();
      element.removeEventListener("change", handleCheckboxChange);
      element.addEventListener("change", handleCheckboxChange);
    },
  };
})();
