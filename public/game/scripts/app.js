(function () {
  "use strict";

  const Data = window.LegacyLeagueData;
  const Logic = window.LegacyLeagueLogic;
  const Storage = window.LegacyLeagueStorage;

  const app = document.getElementById("app");
  const topActions = document.getElementById("topActions");
  const toast = document.getElementById("toast");

  let state = null;
  let activeTab = "career";
  let selectedSlot = 1;
  let advanceStep = 1;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function percent(value) {
    return Logic.clamp(Math.round(value), 0, 100);
  }

  function moodForState(currentState) {
    const r = currentState.ratings;
    if (r.burnout > 72) return { icon: "😵", label: "Overheated", detail: "Recovery needs attention.", value: 100 - r.burnout };
    if (r.mental > 68 && r.confidence > 60) return { icon: "🌤️", label: "Glowing", detail: "The dream feels close.", value: (r.mental + r.confidence) / 2 };
    if (r.confidence < 38) return { icon: "🌧️", label: "Doubting", detail: "Confidence is wobbling.", value: r.confidence };
    if (r.motivation > 70) return { icon: "🔥", label: "Hungry", detail: "Motivation is carrying the month.", value: r.motivation };
    return { icon: "🌿", label: "Steady", detail: "Nothing flashy. Good foundation.", value: (r.mental + r.motivation) / 2 };
  }

  function nextUnlock(currentState) {
    const locked = Data.actions
      .map((action) => ({ action, rule: Logic.actionRule(action.id) }))
      .filter((item) => currentState.profile.age < (item.rule.minAge || 0))
      .sort((a, b) => (a.rule.minAge || 0) - (b.rule.minAge || 0));
    if (!locked.length) return { label: "All focuses unlocked", detail: "The full toolkit is open.", value: 100 };
    const next = locked[0];
    const age = next.rule.minAge || 0;
    return {
      label: `${emojiForAction(next.action.id)} ${next.action.label}`,
      detail: `Unlocks at age ${age}.`,
      value: age ? (currentState.profile.age / age) * 100 : 100
    };
  }

  function storyHook(currentState) {
    const flags = currentState.flags || {};
    if (currentState.pendingEvent) return { icon: "⚡", label: "Decision Time", detail: currentState.pendingEvent.title, value: 100 };
    if (flags.partyRisk) return { icon: "🌙", label: "Temptation Arc", detail: "Discipline could swing the save.", value: currentState.ratings.discipline };
    if (flags.signatureSkill) return { icon: "✨", label: "Signature Skill", detail: "A star identity is forming.", value: currentState.ratings.skill };
    if (flags.eliteAcademy) return { icon: "🚚", label: "Away From Home", detail: "Academy pressure is shaping them.", value: currentState.ratings.mental };
    if (currentState.profile.age < 8) return { icon: "🧸", label: "Tiny Foundations", detail: "Family and joy matter most.", value: currentState.ratings.family };
    if (!currentState.career.pro && currentState.profile.age >= 14) return { icon: "👀", label: "Scout Watch", detail: "Rankings can move fast now.", value: currentState.career.draftStock };
    return { icon: "📖", label: "Story Brewing", detail: "Advance time to reveal the next arc.", value: currentState.ratings.motivation };
  }

  function goalRows(currentState) {
    const r = currentState.ratings;
    const rows = [
      { label: "Stay healthy", value: 100 - r.injuryRisk, detail: "Keep injury risk low." },
      { label: "Build joy", value: (r.mental + r.motivation + r.family) / 3, detail: "Mental, motivation, and family." },
      { label: "Earn attention", value: currentState.career.pro ? r.public : currentState.career.draftStock, detail: currentState.career.pro ? "Public perception." : "Draft stock." },
      { label: "Create wealth", value: Math.min(100, (currentState.finance.wealth / 1000000) * 100), detail: "Long-term financial freedom." }
    ];
    if (currentState.profile.age < 12) rows[2] = { label: "Love the game", value: (r.motivation + r.family + (100 - r.burnout)) / 3, detail: "Joy before hype." };
    return rows;
  }

  function progressBar(value) {
    return `<div class="mini-progress"><span style="width:${percent(value)}%"></span></div>`;
  }

  function render() {
    renderTopActions();
    if (!state) {
      renderCreateScreen();
      return;
    }
    state = Logic.migrateState(state);
    renderCareerScreen();
  }

  function emojiForSport(sportId) {
    return Data.emojis?.sports?.[sportId] || "";
  }

  function emojiForGender(genderId) {
    return Data.emojis?.genders?.[genderId] || "🧑";
  }

  function emojiForAction(actionId) {
    return Data.emojis?.actions?.[actionId] || "✨";
  }

  function emojiForFamily(familyId) {
    return Data.emojis?.families?.[familyId] || "🏠";
  }

  function emojiForEvent(eventId) {
    return Data.emojis?.events?.[eventId] || "⚡";
  }

  function renderTopActions() {
    const slots = Storage.list();
    topActions.innerHTML = `
      <button class="ghost-button" data-action="new-career">New</button>
      <select class="slot-picker" data-action="select-slot" aria-label="Save slot">
        ${slots
          .map(
            (slot) =>
              `<option value="${slot.slot}" ${slot.slot === selectedSlot ? "selected" : ""}>Slot ${slot.slot}${slot.empty ? "" : ` - ${escapeHtml(slot.name)}`}</option>`
          )
          .join("")}
      </select>
      <button class="ghost-button" data-action="quick-save" ${state ? "" : "disabled"}>Save</button>
      <button class="ghost-button" data-action="quick-load">Load</button>
    `;
  }

  function optionList(items, current) {
    return items.map((item) => `<option value="${escapeHtml(item)}" ${item === current ? "selected" : ""}>${escapeHtml(item)}</option>`).join("");
  }

  function keyedOptions(items, current) {
    return Object.keys(items)
      .map((key) => `<option value="${key}" ${key === current ? "selected" : ""}>${escapeHtml(items[key].label)}</option>`)
      .join("");
  }

  function familyOptions(current) {
    return Object.keys(Data.families)
      .map((key) => `<option value="${key}" ${key === current ? "selected" : ""}>${emojiForFamily(key)} ${escapeHtml(Data.families[key].label)}</option>`)
      .join("");
  }

  function sportOptions(current) {
    return Object.keys(Data.sports)
      .map((key) => `<option value="${key}" ${key === current ? "selected" : ""}>${emojiForSport(key)} ${escapeHtml(Data.sports[key].label)}</option>`)
      .join("");
  }

  function genderOptions(current) {
    return Data.genders
      .map((gender) => `<option value="${gender.id}" ${gender.id === current ? "selected" : ""}>${emojiForGender(gender.id)} ${escapeHtml(gender.label)}</option>`)
      .join("");
  }

  function roleOptions(sportId, current) {
    const sport = Data.sports[sportId];
    if (!sport.positions.length) {
      return `<option value="">Weight class auto-assigned</option>`;
    }
    return sport.positions.map((role) => `<option value="${escapeHtml(role)}" ${role === current ? "selected" : ""}>${escapeHtml(role)}</option>`).join("");
  }

  function presetPayload(kind) {
    const base = Logic.randomCareerPayload();
    if (kind === "prodigy") {
      return {
        ...base,
        name: "Mika Starling",
        family: "supportive",
        personality: "driven",
        speed: 82,
        strength: 72,
        endurance: 78,
        coordination: 88,
        recovery: 76,
        iq: 84,
        naturalPotential: 92
      };
    }
    if (kind === "underdog") {
      return {
        ...base,
        name: "Ari Stone",
        family: "working",
        personality: "analytical",
        speed: 58,
        strength: 55,
        endurance: 68,
        coordination: 62,
        recovery: 60,
        iq: 78,
        naturalPotential: 74
      };
    }
    return {
      ...base,
      name: "Nova Vale",
      family: "famous",
      personality: "volatile",
      speed: 88,
      strength: 82,
      endurance: 58,
      coordination: 80,
      recovery: 48,
      iq: 64,
      naturalPotential: 90
    };
  }

  function renderCreateScreen(payload) {
    const data =
      payload ||
      {
        name: "",
        gender: "nonbinary",
        sport: "basketball",
        role: "Point Guard",
        country: "United States",
        height: 72,
        weight: 180,
        family: "supportive",
        personality: "driven",
        difficulty: "realistic",
        speed: 55,
        strength: 55,
        endurance: 55,
        coordination: 55,
        recovery: 55,
        iq: 55,
        naturalPotential: 65
      };

    app.innerHTML = `
      <div class="start-layout">
        <section class="intro-panel">
          <img src="assets/arena.svg" alt="" class="arena-art">
          <div class="intro-copy">
            <p class="eyebrow">Mobile and desktop career sim</p>
            <h1>Build an athlete. Live the whole arc.</h1>
          </div>
        </section>

        <form class="creator panel" id="creatorForm">
          <div class="form-heading">
            <h2>Character Creation</h2>
            <button type="button" class="secondary-button" data-action="randomize">Randomize</button>
          </div>

          <div class="origin-card">
            <div class="origin-avatar">${emojiForGender(data.gender)}${emojiForSport(data.sport)}</div>
            <div>
              <strong>${escapeHtml(data.name || "Newborn Prospect")}</strong>
              <span>${emojiForFamily(data.family)} ${escapeHtml(Data.families[data.family]?.label || "Family")} · ${escapeHtml(Data.sports[data.sport]?.label || "Sport")} dream</span>
            </div>
          </div>

          <div class="preset-row" aria-label="Career presets">
            <button type="button" class="preset-button" data-action="preset" data-preset="prodigy">✨ Prodigy</button>
            <button type="button" class="preset-button" data-action="preset" data-preset="underdog">🌱 Underdog</button>
            <button type="button" class="preset-button" data-action="preset" data-preset="chaos">🔥 Chaos</button>
          </div>

          <div class="field-grid">
            <label>Name
              <input name="name" maxlength="32" value="${escapeHtml(data.name)}" placeholder="Rookie Legend" required>
            </label>
            <label>Gender
              <select name="gender">${genderOptions(data.gender)}</select>
            </label>
            <label>Sport
              <select name="sport" data-action="sport-change">${sportOptions(data.sport)}</select>
            </label>
            <label>Position or Class
              <select name="role" id="roleSelect">${roleOptions(data.sport, data.role)}</select>
            </label>
            <label>Country
              <select name="country">${optionList(Data.countries, data.country)}</select>
            </label>
            <label>Difficulty
              <select name="difficulty">${keyedOptions(Data.difficulties, data.difficulty)}</select>
            </label>
            <label>Family
              <select name="family">${familyOptions(data.family)}</select>
            </label>
            <label>Personality
              <select name="personality">${keyedOptions(Data.personalities, data.personality)}</select>
            </label>
          </div>

          <div class="measure-grid">
            ${rangeControl("height", "Projected Height", data.height, 60, 84, `${Logic.formatHeight(Number(data.height))}`)}
            ${rangeControl("weight", "Projected Weight", data.weight, 110, 320, `${data.weight} lb`)}
          </div>

          <h3>Genetics</h3>
          <div class="genetics-grid">
            ${rangeControl("speed", "Speed", data.speed, 25, 95, data.speed)}
            ${rangeControl("strength", "Strength", data.strength, 25, 95, data.strength)}
            ${rangeControl("endurance", "Endurance", data.endurance, 25, 95, data.endurance)}
            ${rangeControl("coordination", "Coordination", data.coordination, 25, 95, data.coordination)}
            ${rangeControl("recovery", "Recovery", data.recovery, 25, 95, data.recovery)}
            ${rangeControl("iq", "Sport IQ", data.iq, 25, 95, data.iq)}
            ${rangeControl("naturalPotential", "Natural Potential", data.naturalPotential, 25, 95, data.naturalPotential)}
          </div>

          <div class="form-footer">
            <button type="submit" class="primary-button">Start Career</button>
          </div>
        </form>
      </div>
    `;
    wireRangeLabels();
  }

  function rangeControl(name, label, value, min, max, display) {
    return `
      <label class="range-field">${escapeHtml(label)}
        <span class="range-value" data-range-output="${name}">${escapeHtml(display)}</span>
        <input type="range" name="${name}" min="${min}" max="${max}" value="${value}" data-range="${name}">
      </label>
    `;
  }

  function wireRangeLabels() {
    app.querySelectorAll("[data-range]").forEach((input) => {
      const output = app.querySelector(`[data-range-output="${input.dataset.range}"]`);
      const update = () => {
        if (input.name === "height") output.textContent = Logic.formatHeight(Number(input.value));
        else if (input.name === "weight") output.textContent = `${input.value} lb`;
        else output.textContent = input.value;
      };
      input.addEventListener("input", update);
      update();
    });
  }

  function collectForm(form) {
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });
    ["height", "weight", "speed", "strength", "endurance", "coordination", "recovery", "iq", "naturalPotential"].forEach((key) => {
      payload[key] = Number(payload[key]);
    });
    return payload;
  }

  function metric(label, value, tone) {
    return `
      <div class="metric ${tone || ""}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `;
  }

  function bar(label, value, invert) {
    const width = Logic.clamp(Math.round(value), 0, 100);
    const tone = invert ? (width > 70 ? "bad" : width > 40 ? "warn" : "good") : width > 70 ? "good" : width > 40 ? "warn" : "bad";
    return `
      <div class="bar-row">
        <div class="bar-label"><span>${escapeHtml(label)}</span><strong>${width}</strong></div>
        <div class="bar-track"><span class="${tone}" style="width:${width}%"></span></div>
      </div>
    `;
  }

  function pulseCard(item) {
    return `
      <article class="pulse-card">
        <div class="pulse-top">
          <span>${item.icon}</span>
          <strong>${escapeHtml(item.label)}</strong>
        </div>
        <p>${escapeHtml(item.detail)}</p>
        ${progressBar(item.value)}
      </article>
    `;
  }

  function renderPulseDeck() {
    const mood = moodForState(state);
    const unlock = nextUnlock(state);
    const hook = storyHook(state);
    const moneyMood =
      state.finance.debt > 0
        ? { icon: "🧾", label: "Debt Watch", detail: `${money(state.finance.debt)} owed.`, value: 100 - Math.min(100, state.finance.debt / 500) }
        : { icon: "💰", label: "Money Calm", detail: `${money(state.finance.money)} cash ready.`, value: Math.min(100, 20 + state.finance.money / 100) };
    return `
      <section class="pulse-grid" aria-label="Career pulse">
        ${pulseCard(mood)}
        ${pulseCard(hook)}
        ${pulseCard(unlock)}
        ${pulseCard(moneyMood)}
      </section>
    `;
  }

  function renderGoalBoard() {
    return `
      <section class="goal-board">
        <div class="section-heading">
          <h3>Goal Board</h3>
          <span>small wins keep the save moving</span>
        </div>
        <div class="goal-list">
          ${goalRows(state)
            .map(
              (goal) => `
                <article class="goal-row">
                  <div>
                    <strong>${escapeHtml(goal.label)}</strong>
                    <span>${escapeHtml(goal.detail)}</span>
                  </div>
                  ${progressBar(goal.value)}
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderCareerScreen() {
    const score = Logic.performanceScore(state);
    const date = Logic.currentDateLabel(state);
    const r = state.ratings;
    const contract = state.career.contract;
    const sportEmoji = emojiForSport(state.profile.sport);
    const personEmoji = emojiForGender(state.profile.gender);
    const focusAction = Data.actions.find((action) => action.id === state.monthlyFocus);
    const focusLocked = Boolean(state.turn?.focusLocked);
    const bestStreak = Math.max(state.career.streaks?.healthyMonths || 0, state.career.streaks?.hotMonths || 0, state.career.streaks?.disciplineMonths || 0);

    app.innerHTML = `
      <section class="career-hero">
        <img src="assets/arena.svg" alt="" class="hero-bg">
        <div class="hero-content">
          <p class="eyebrow">${escapeHtml(date)}</p>
          <h1><span class="hero-emoji">${personEmoji}</span> ${escapeHtml(state.profile.name)}</h1>
          <p>${sportEmoji} ${escapeHtml(state.profile.role)} | ${escapeHtml(state.profile.sportLabel)} | ${escapeHtml(state.career.stage)}</p>
        </div>
        <div class="hero-score">
          <span>Performance</span>
          <strong>${score}</strong>
        </div>
      </section>

      <section class="command-row">
        <div class="tab-strip" role="tablist">
          ${tabButton("career", "📋 Career")}
          ${tabButton("training", "🏃 Train")}
          ${tabButton("relationships", "👥 People")}
          ${tabButton("business", "💰 Money")}
          ${tabButton("media", "📱 Media")}
          ${tabButton("saves", "💾 Saves")}
          ${tabButton("legacy", "🏆 Legacy")}
        </div>
        <div class="advance-controls">
          <select class="advance-picker" data-action="advance-step" aria-label="Advance amount">
            <option value="1" ${advanceStep === 1 ? "selected" : ""}>1 month</option>
            <option value="12" ${advanceStep === 12 ? "selected" : ""}>1 year</option>
          </select>
          <button class="primary-button advance" data-action="advance-time" ${state.pendingEvent || state.career.retired ? "disabled" : ""}>Advance</button>
        </div>
      </section>

      <section class="metric-grid">
        ${metric("Age", Logic.formatAge(state.profile.age))}
        ${metric("Stage", state.career.stage)}
        ${metric("Focus", focusAction ? `${emojiForAction(focusAction.id)} ${focusAction.label}` : "None")}
        ${metric("Focus Lock", focusLocked ? "Used" : "Open", focusLocked ? "warn" : "")}
        ${metric("Money", money(state.finance.money), state.finance.money <= 0 ? "danger" : "")}
        ${metric("Wealth", money(state.finance.wealth))}
        ${metric("Debt", money(state.finance.debt), state.finance.debt > 0 ? "danger" : "")}
        ${metric("Legacy", Math.round(state.career.legacy))}
        ${metric("Potential", state.profile.potential)}
        ${metric("Best Streak", `${bestStreak} mo`)}
      </section>

      ${renderPulseDeck()}

      <div class="main-grid">
        <section class="panel status-panel">
          <h2>Status</h2>
          ${bar("Skill", r.skill)}
          ${bar("Athleticism", r.athleticism)}
          ${bar("Health", r.health)}
          ${bar("Injury Risk", r.injuryRisk, true)}
          ${bar("Mental Health", r.mental)}
          ${bar("Burnout", r.burnout, true)}
          ${bar("Discipline", r.discipline)}
          ${bar("Confidence", r.confidence)}
          ${bar("Motivation", r.motivation)}
          ${bar("Ego", r.ego, true)}
        </section>

        <section class="panel tab-panel">
          ${renderActiveTab(contract)}
        </section>

        <section class="panel log-panel">
          <h2>Timeline</h2>
          <div class="log-list">
            ${state.log.map((entry) => `<article class="log-item ${entry.type}"><span>${escapeHtml(entry.date)}</span><p>${escapeHtml(entry.text)}</p></article>`).join("")}
          </div>
        </section>
      </div>

      ${state.pendingEvent ? renderEventModal(state.pendingEvent) : ""}
    `;
  }

  function tabButton(id, label) {
    return `<button class="tab-button ${activeTab === id ? "active" : ""}" data-action="tab" data-tab="${id}" role="tab" aria-selected="${activeTab === id}">${label}</button>`;
  }

  function renderActiveTab(contract) {
    if (activeTab === "training") return renderActionTab("training", "Training Focus");
    if (activeTab === "relationships") return renderActionTab("relationships", "Relationships");
    if (activeTab === "business") return renderActionTab("business", "Business and Lifestyle");
    if (activeTab === "media") return renderActionTab("media", "Media and Reputation");
    if (activeTab === "saves") return renderSaveTab();
    if (activeTab === "legacy") return renderLegacyTab();

    return `
      <h2>Career Sheet</h2>
      <div class="profile-list">
        ${fact("Person", `${emojiForGender(state.profile.gender)} ${state.profile.genderLabel}`)}
        ${fact("Sport", `${emojiForSport(state.profile.sport)} ${state.profile.sportLabel}`)}
        ${fact("Role", state.profile.role)}
        ${fact("Country", state.profile.country)}
        ${fact("Projected Height", Logic.formatHeight(state.profile.height))}
        ${fact("Projected Weight", `${state.profile.weight} lb`)}
        ${fact("Family", `${emojiForFamily(state.profile.family)} ${state.profile.familyLabel}`)}
        ${fact("Personality", state.profile.personalityLabel)}
        ${fact("Difficulty", state.profile.difficultyLabel)}
        ${fact("Prospect Rank", state.career.prospectRank ? `#${state.career.prospectRank}` : "N/A")}
        ${fact("Draft Stock", `${Math.round(state.career.draftStock)} / 100`)}
        ${fact("Amateur Rank", state.career.amateurRank ? `#${state.career.amateurRank}` : "N/A")}
        ${fact("Contract", contract ? `${money(contract.salary)} yearly, ${contract.monthsRemaining} months left` : "None")}
      </div>
      ${renderGoalBoard()}
    `;
  }

  function fact(label, value) {
    return `<div class="fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  }

  function renderActionTab(category, heading) {
    const actions = Data.actions.filter((action) => action.category === category);
    const focusLocked = Boolean(state.turn?.focusLocked);
    return `
      <h2>${escapeHtml(heading)}</h2>
      <p class="panel-note">${focusLocked ? "Focus locked until time advances." : "Pick one focus for this month."}</p>
      <div class="action-grid">
        ${actions
          .map((action) => {
            const available = Logic.isActionAvailable(state, action.id);
            const lockedOut = focusLocked && state.monthlyFocus !== action.id;
            const rule = Logic.actionRule(action.id);
            const ageText = !available
              ? state.profile.age < (rule.minAge || 0)
                ? `Available at age ${rule.minAge}`
                : "No longer available"
              : action.summary;
            return `
              <button class="action-tile ${state.monthlyFocus === action.id ? "selected" : ""}" data-action="set-focus" data-focus="${action.id}" ${!available || lockedOut ? "disabled" : ""}>
                <span class="action-emoji">${emojiForAction(action.id)}</span>
                <strong>${escapeHtml(action.label)}</strong>
                <span>${escapeHtml(ageText)}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderSaveTab() {
    const slots = Storage.list();
    return `
      <h2>Save Slots</h2>
      <div class="slot-list">
        ${slots
          .map(
            (slot) => `
              <div class="slot-row">
                <div>
                  <strong>Slot ${slot.slot}</strong>
                  <span>${slot.empty ? "Empty" : `${escapeHtml(slot.name)} | ${escapeHtml(slot.sport)} | age ${slot.age} | ${escapeHtml(slot.stage)} | legacy ${slot.legacy}`}</span>
                </div>
                <div class="slot-buttons">
                  <button class="secondary-button" data-action="save-slot" data-slot="${slot.slot}">Save</button>
                  <button class="secondary-button" data-action="load-slot" data-slot="${slot.slot}" ${slot.empty ? "disabled" : ""}>Load</button>
                  <button class="danger-button" data-action="delete-slot" data-slot="${slot.slot}" ${slot.empty ? "disabled" : ""}>Delete</button>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="import-export">
        <textarea id="saveText" rows="8" placeholder="Exported save data appears here."></textarea>
        <div class="inline-buttons">
          <button class="secondary-button" data-action="export-save">Export</button>
          <button class="secondary-button" data-action="import-save">Import</button>
        </div>
      </div>
    `;
  }

  function renderLegacyTab() {
    const injuries = state.career.injuryHistory;
    const achievements = state.career.achievements;
    return `
      <h2>Legacy</h2>
      <div class="profile-list">
        ${fact("Legacy Score", Math.round(state.career.legacy))}
        ${fact("Hall of Fame", state.career.hallOfFame ? "Yes" : "Not yet")}
        ${fact("Years Pro", state.career.yearsPro)}
        ${fact("Post-Career Path", state.career.postCareer || "Undecided")}
        ${fact("Coach Trust", `${state.ratings.coachTrust} / 100`)}
        ${fact("Locker Room", `${state.ratings.chemistry} / 100`)}
        ${fact("Social Reputation", `${state.ratings.social} / 100`)}
        ${fact("Public Perception", `${state.ratings.public} / 100`)}
        ${fact("Agent Relationship", `${state.ratings.agent} / 100`)}
        ${fact("Mentor Bond", `${state.ratings.mentor} / 100`)}
        ${fact("Healthy Streak", `${state.career.streaks?.healthyMonths || 0} months`)}
        ${fact("Hot Streak", `${state.career.streaks?.hotMonths || 0} months`)}
        ${fact("Discipline Streak", `${state.career.streaks?.disciplineMonths || 0} months`)}
      </div>
      <h3>Achievements</h3>
      <div class="pill-list">${achievements.length ? achievements.map((item) => `<span>${escapeHtml(item)}</span>`).join("") : "<span>None yet</span>"}</div>
      <h3>Injury History</h3>
      <div class="compact-list">${injuries.length ? injuries.map((item) => `<p>${escapeHtml(item.date)}: severity ${item.severity}</p>`).join("") : "<p>No recorded injuries.</p>"}</div>
    `;
  }

  function renderEventModal(event) {
    return `
      <div class="event-backdrop" role="presentation"></div>
      <section class="event-modal" role="dialog" aria-modal="true" aria-labelledby="eventTitle">
        <p class="eyebrow">Major moment</p>
        <h2 id="eventTitle"><span class="event-emoji">${emojiForEvent(event.id)}</span> ${escapeHtml(event.title)}</h2>
        <p>${escapeHtml(event.text)}</p>
        <div class="choice-grid">
          ${event.choices
            .map(
              (choice, index) => `
                <button class="choice-button" data-action="choose-event" data-choice="${index}">
                  ${escapeHtml(choice.label)}
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function handleAction(target) {
    const action = target.dataset.action;
    if (!action) return;

    if (action === "new-career") {
      state = null;
      activeTab = "career";
      render();
      return;
    }

    if (action === "select-slot") {
      selectedSlot = Number(target.value);
      renderTopActions();
      return;
    }

    if (action === "quick-save") {
      if (!state) return;
      Storage.save(selectedSlot, state);
      showToast(`Saved to slot ${selectedSlot}.`);
      render();
      return;
    }

    if (action === "quick-load") {
      const loaded = Storage.load(selectedSlot);
      if (!loaded) {
        showToast(`Slot ${selectedSlot} is empty.`);
        return;
      }
      state = Logic.migrateState(loaded.state);
      activeTab = "career";
      showToast(`Loaded slot ${selectedSlot}.`);
      render();
      return;
    }

    if (action === "randomize") {
      renderCreateScreen(Logic.randomCareerPayload());
      return;
    }

    if (action === "preset") {
      renderCreateScreen(presetPayload(target.dataset.preset));
      return;
    }

    if (action === "sport-change") {
      const form = document.getElementById("creatorForm");
      const payload = collectForm(form);
      const sport = Data.sports[payload.sport];
      payload.role = sport.positions.length ? sport.positions[0] : "";
      renderCreateScreen(payload);
      return;
    }

    if (!state) return;

    if (action === "tab") {
      activeTab = target.dataset.tab;
      render();
      return;
    }

    if (action === "advance-step") {
      advanceStep = Number(target.value);
      render();
      return;
    }

    if (action === "advance-time" || action === "advance-month") {
      const result = Logic.advanceTime(state, advanceStep);
      state = result.state;
      const label = result.advanced === 1 ? "1 month" : `${result.advanced} months`;
      showToast(result.stoppedForEvent ? `Advanced ${label}. A major moment needs your choice.` : `Advanced ${label}.`);
      render();
      return;
    }

    if (action === "set-focus") {
      if (state.turn?.focusLocked && state.monthlyFocus !== target.dataset.focus) {
        showToast("Focus already used this month.");
        return;
      }
      if (!Logic.isActionAvailable(state, target.dataset.focus)) {
        showToast("That focus is not available at this age.");
        return;
      }
      state = Logic.setFocus(state, target.dataset.focus);
      showToast("Monthly focus updated.");
      render();
      return;
    }

    if (action === "choose-event") {
      state = Logic.chooseEvent(state, Number(target.dataset.choice));
      showToast("Choice applied.");
      render();
      return;
    }

    if (action === "save-slot") {
      const slot = Number(target.dataset.slot);
      selectedSlot = slot;
      Storage.save(slot, state);
      showToast(`Saved to slot ${slot}.`);
      render();
      return;
    }

    if (action === "load-slot") {
      const slot = Number(target.dataset.slot);
      const loaded = Storage.load(slot);
      if (!loaded) return;
      selectedSlot = slot;
      state = Logic.migrateState(loaded.state);
      activeTab = "career";
      showToast(`Loaded slot ${slot}.`);
      render();
      return;
    }

    if (action === "delete-slot") {
      const slot = Number(target.dataset.slot);
      Storage.remove(slot);
      showToast(`Deleted slot ${slot}.`);
      render();
      return;
    }

    if (action === "export-save") {
      const area = document.getElementById("saveText");
      area.value = Storage.exportState(state);
      area.select();
      showToast("Save exported.");
      return;
    }

    if (action === "import-save") {
      const area = document.getElementById("saveText");
      try {
        state = Logic.migrateState(Storage.importState(area.value));
        activeTab = "career";
        showToast("Save imported.");
        render();
      } catch (error) {
        showToast(error.message);
      }
    }
  }

  app.addEventListener("submit", (event) => {
    if (event.target.id !== "creatorForm") return;
    event.preventDefault();
    state = Logic.createCareer(collectForm(event.target));
    activeTab = "career";
    showToast("Career started.");
    render();
  });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (target && target.tagName === "SELECT") return;
    if (target) handleAction(target);
  });

  document.addEventListener("change", (event) => {
    const target = event.target.closest("[data-action]");
    if (target) handleAction(target);
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }

  render();
})();
