(function () {
  "use strict";

  const PREFIX = "legacy-league-slot-";
  const SLOT_COUNT = 5;

  function slotKey(slot) {
    return `${PREFIX}${slot}`;
  }

  function save(slot, state) {
    localStorage.setItem(
      slotKey(slot),
      JSON.stringify({
        savedAt: new Date().toISOString(),
        state
      })
    );
  }

  function load(slot) {
    const raw = localStorage.getItem(slotKey(slot));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function remove(slot) {
    localStorage.removeItem(slotKey(slot));
  }

  function list() {
    return Array.from({ length: SLOT_COUNT }, (_, index) => {
      const slot = index + 1;
      const data = load(slot);
      if (!data) return { slot, empty: true };
      const state = data.state;
      return {
        slot,
        empty: false,
        savedAt: data.savedAt,
        name: state.profile.name,
        sport: state.profile.sportLabel,
        age: state.profile.age,
        stage: state.career.stage,
        legacy: Math.round(state.career.legacy)
      };
    });
  }

  function exportState(state) {
    return JSON.stringify(state, null, 2);
  }

  function importState(text) {
    const parsed = JSON.parse(text);
    if (!parsed || !parsed.profile || !parsed.career || !parsed.ratings) {
      throw new Error("This does not look like a Legacy League save.");
    }
    return parsed;
  }

  window.LegacyLeagueStorage = {
    SLOT_COUNT,
    save,
    load,
    remove,
    list,
    exportState,
    importState
  };
})();
