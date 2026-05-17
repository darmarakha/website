
(function () {
  "use strict";

  const app = document.getElementById("dnd-app");
  const DATA = window.DND2014_DATA;
  if (!app || !DATA) return;

  const skillLabelById = (id) => (DATA.skills || []).find((skill) => skill.id === id)?.label || id;

  function selectedSkillIds(form) {
    return Array.from(form.querySelectorAll("input[name='skills']:checked"))
      .map((input) => String(input.value || "").trim())
      .filter(Boolean)
      .filter((value, index, list) => list.indexOf(value) === index);
  }

  function classIdFromForm(form) {
    return String(form.querySelector("select[name='classNameField']")?.value || "").trim();
  }

  function currentExpertiseValues(form) {
    return Array.from(form.querySelectorAll("select[name^='expertise-']"))
      .map((select) => String(select.value || "").trim())
      .filter(Boolean);
  }

  function hasThievesTools(form) {
    const classId = classIdFromForm(form);
    if (classId === "rogue") return true;
    const text = [
      form.querySelector("[name='startingPackage'] option:checked")?.textContent || "",
      form.textContent || ""
    ].join(" ");
    return /thieves' tools/i.test(text);
  }

  function optionHtml(value, label, selected) {
    const safeValue = String(value).replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
    const safeLabel = String(label).replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
    return `<option value="${safeValue}" ${selected ? "selected" : ""}>${safeLabel}</option>`;
  }

  function syncExpertiseWithSkillProficiency(form) {
    if (!form || form.id !== "character-form") return;
    const expertiseSelects = Array.from(form.querySelectorAll("select[name^='expertise-']"));
    if (!expertiseSelects.length) return;

    const skills = selectedSkillIds(form);
    const allowed = new Set(skills.map((id) => "skill:" + id));
    if (hasThievesTools(form)) allowed.add("tool:thieves_tools");

    const previous = currentExpertiseValues(form).filter((value) => allowed.has(value));
    const used = new Set();

    expertiseSelects.forEach((select, index) => {
      const current = allowed.has(select.value) ? select.value : (previous[index] || "");
      let html = optionHtml("", "— Pilih skill/tool —", !current);

      skills.forEach((skillId) => {
        const value = "skill:" + skillId;
        const selected = current === value && !used.has(value);
        html += optionHtml(value, skillLabelById(skillId), selected);
      });

      if (allowed.has("tool:thieves_tools")) {
        const selected = current === "tool:thieves_tools" && !used.has("tool:thieves_tools");
        html += optionHtml("tool:thieves_tools", "Thieves' Tools", selected);
      }

      select.innerHTML = html;
      if (select.value) used.add(select.value);
    });
  }

  function scheduleSync(form) {
    window.requestAnimationFrame(() => syncExpertiseWithSkillProficiency(form));
  }

  document.addEventListener("change", function (event) {
    const target = event.target;
    const form = target?.closest?.("#character-form");
    if (!form) return;
    if (
      target.matches("input[name='skills']") ||
      target.matches("select[name='classNameField']") ||
      target.matches("select[name='race']") ||
      target.matches("select[name='subrace']") ||
      target.matches("select[name='startingPackage']") ||
      target.matches("select[name^='expertise-']")
    ) {
      scheduleSync(form);
    }
  }, true);

  const observer = new MutationObserver(() => {
    const form = document.getElementById("character-form");
    if (form) scheduleSync(form);
  });
  observer.observe(app, { childList: true, subtree: true });

  window.addEventListener("load", () => {
    const form = document.getElementById("character-form");
    if (form) scheduleSync(form);
  });
})();
