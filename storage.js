/**
 * THE UNKNOWN — Storage Module
 * LocalStorage-based player progress with safe defaults and migration.
 */
const Storage = (() => {
  const KEY = 'the_unknown_save_v1';
  const VERSION = 1;

  const defaultState = () => ({
    version: VERSION,
    profile: {
      name: 'Investigator',
      createdAt: Date.now(),
      lastActive: Date.now()
    },
    xp: 0,
    level: 1,
    cases: {},          // caseId -> { progress: 0-100, status: 'open'|'in_progress'|'completed', completedObjectives: [], discoveredChapters: [] }
    evidence: {},       // evidenceId -> { discovered: true, discoveredAt, notes: '' }
    challenges: {},     // challengeId -> { completed: true, score, attempts, completedAt }
    locations: { 'loc-central': { unlocked: true } },
    notes: {},          // caseId -> free text theory
    theories: {},       // caseId -> array of theory objects
    activity: [],       // recent activity log (max 20)
    achievements: {},   // achievementId -> unlockedAt
    collectibles: {},
    terminalHistory: [],
    settings: { reducedMotion: false }
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return defaultState();
      // Merge with defaults to handle new fields
      const base = defaultState();
      return deepMerge(base, data);
    } catch (e) {
      console.warn('Save data corrupted, resetting.', e);
      return defaultState();
    }
  }

  function save(state) {
    try {
      state.profile.lastActive = Date.now();
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('Failed to save', e);
      return false;
    }
  }

  function deepMerge(target, source) {
    const out = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        out[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        out[key] = source[key];
      }
    }
    return out;
  }

  function reset() {
    localStorage.removeItem(KEY);
    return defaultState();
  }

  // Public API used by other modules
  let state = load();

  return {
    get() { return state; },
    set(newState) {
      state = newState;
      save(state);
    },
    update(fn) {
      state = fn({ ...state });
      save(state);
      return state;
    },
    reset() {
      state = reset();
      return state;
    },
    // Convenience helpers
    addXP(amount, reason) {
      if (amount <= 0) return state;
      return this.update(s => {
        s.xp += amount;
        const newLevel = Math.floor(s.xp / 100) + 1;
        if (newLevel > s.level) {
          s.level = newLevel;
          this._logActivity(s, `Reached level ${newLevel}`);
        }
        if (reason) this._logActivity(s, `+${amount} XP — ${reason}`);
        return s;
      });
    },
    hasEvidence(id) {
      return !!(state.evidence[id] && state.evidence[id].discovered);
    },
    discoverEvidence(id, meta = {}) {
      if (this.hasEvidence(id)) return { already: true, state };
      return this.update(s => {
        s.evidence[id] = {
          discovered: true,
          discoveredAt: Date.now(),
          notes: meta.notes || ''
        };
        this._logActivity(s, `Evidence discovered: ${id}`);
        return s;
      });
    },
    getCaseProgress(caseId) {
      return state.cases[caseId] || { progress: 0, status: 'open', completedObjectives: [], discoveredChapters: [] };
    },
    updateCase(caseId, patch) {
      return this.update(s => {
        const current = s.cases[caseId] || { progress: 0, status: 'open', completedObjectives: [], discoveredChapters: [] };
        s.cases[caseId] = { ...current, ...patch };
        return s;
      });
    },
    completeObjective(caseId, objectiveId) {
      const prog = this.getCaseProgress(caseId);
      if (prog.completedObjectives.includes(objectiveId)) return { already: true };
      return this.update(s => {
        const c = s.cases[caseId] || { progress: 0, status: 'in_progress', completedObjectives: [], discoveredChapters: [] };
        c.completedObjectives = [...c.completedObjectives, objectiveId];
        c.status = 'in_progress';
        // rough progress
        c.progress = Math.min(100, Math.round((c.completedObjectives.length / 4) * 100));
        s.cases[caseId] = c;
        this._logActivity(s, `Objective complete: ${objectiveId}`);
        return s;
      });
    },
    completeChallenge(challengeId, score = 100) {
      if (state.challenges[challengeId]?.completed) return { already: true };
      return this.update(s => {
        s.challenges[challengeId] = {
          completed: true,
          score,
          attempts: (s.challenges[challengeId]?.attempts || 0) + 1,
          completedAt: Date.now()
        };
        this._logActivity(s, `Challenge solved: ${challengeId}`);
        return s;
      });
    },
    unlockLocation(locId) {
      if (state.locations[locId]?.unlocked) return { already: true };
      return this.update(s => {
        s.locations[locId] = { unlocked: true, unlockedAt: Date.now() };
        this._logActivity(s, `Location unlocked: ${locId}`);
        return s;
      });
    },
    isLocationUnlocked(locId) {
      return !!(state.locations[locId] && state.locations[locId].unlocked);
    },
    saveNote(caseId, text) {
      return this.update(s => {
        s.notes[caseId] = text;
        return s;
      });
    },
    saveTheory(caseId, theory) {
      return this.update(s => {
        if (!s.theories[caseId]) s.theories[caseId] = [];
        s.theories[caseId].push({ ...theory, createdAt: Date.now() });
        return s;
      });
    },
    unlockAchievement(id) {
      if (state.achievements[id]) return { already: true };
      return this.update(s => {
        s.achievements[id] = Date.now();
        this._logActivity(s, `Achievement unlocked: ${id}`);
        return s;
      });
    },
    _logActivity(s, message) {
      s.activity = [{ message, at: Date.now() }, ...(s.activity || [])].slice(0, 20);
    },
    getActivity() {
      return state.activity || [];
    }
  };
})();

// Make available globally for simple script loading
window.Storage = Storage;
