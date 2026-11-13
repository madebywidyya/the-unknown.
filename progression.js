/**
 * THE UNKNOWN — Progression & Achievements
 */
const Progression = (() => {
  const ACHIEVEMENTS = {
    first_discovery: { name: 'First Discovery', desc: 'Collect your first piece of evidence', icon: '🔍' },
    archive_explorer: { name: 'Archive Explorer', desc: 'Open three different case files', icon: '📂' },
    detail_observer: { name: 'Detail Observer', desc: 'Complete an observation challenge', icon: '👁' },
    code_breaker: { name: 'Code Breaker', desc: 'Solve a cipher or pattern challenge', icon: '🔐' },
    master_investigator: { name: 'Master Investigator', desc: 'Complete three full cases', icon: '★' },
    evidence_collector: { name: 'Evidence Collector', desc: 'Discover 8 pieces of evidence', icon: '📋' },
    map_walker: { name: 'Map Walker', desc: 'Unlock three locations', icon: '🗺' },
    terminal_initiate: { name: 'Terminal Initiate', desc: 'Successfully use a secret terminal command', icon: '💻' }
  };

  function checkAchievements() {
    const s = Storage.get();
    const evidenceCount = Object.keys(s.evidence).filter(k => s.evidence[k].discovered).length;
    const casesOpened = Object.keys(s.cases).length;
    const casesCompleted = Object.values(s.cases).filter(c => c.status === 'completed' || c.progress >= 100).length;
    const challengesCompleted = Object.values(s.challenges).filter(c => c.completed).length;
    const locationsUnlocked = Object.values(s.locations).filter(l => l.unlocked).length;

    if (evidenceCount >= 1) Storage.unlockAchievement('first_discovery');
    if (casesOpened >= 3) Storage.unlockAchievement('archive_explorer');
    if (evidenceCount >= 8) Storage.unlockAchievement('evidence_collector');
    if (casesCompleted >= 3) Storage.unlockAchievement('master_investigator');
    if (locationsUnlocked >= 3) Storage.unlockAchievement('map_walker');

    // Type-based (simplified — real check would inspect challenge types)
    const solved = Object.keys(s.challenges).filter(id => s.challenges[id].completed);
    if (solved.some(id => id.includes('003') || id.includes('006'))) Storage.unlockAchievement('detail_observer');
    if (solved.some(id => id.includes('002') || id.includes('004'))) Storage.unlockAchievement('code_breaker');
  }

  function xpForLevel(level) {
    return (level - 1) * 100;
  }

  function levelProgress() {
    const s = Storage.get();
    const currentLevelXP = xpForLevel(s.level);
    const nextLevelXP = xpForLevel(s.level + 1);
    const into = s.xp - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;
    return { into, needed, percent: Math.min(100, Math.round((into / needed) * 100)) };
  }

  function stats() {
    const s = Storage.get();
    return {
      xp: s.xp,
      level: s.level,
      evidence: Object.keys(s.evidence).filter(k => s.evidence[k].discovered).length,
      casesCompleted: Object.values(s.cases).filter(c => c.status === 'completed' || c.progress >= 100).length,
      casesInProgress: Object.values(s.cases).filter(c => c.status === 'in_progress').length,
      challenges: Object.values(s.challenges).filter(c => c.completed).length,
      locations: Object.values(s.locations).filter(l => l.unlocked).length,
      achievements: Object.keys(s.achievements).length,
      levelProgress: levelProgress()
    };
  }

  return {
    ACHIEVEMENTS,
    checkAchievements,
    levelProgress,
    stats,
    xpForLevel
  };
})();

window.Progression = Progression;
