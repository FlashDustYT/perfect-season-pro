(function () {
  "use strict";

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const countries = [
    "United States",
    "Canada",
    "Brazil",
    "Mexico",
    "England",
    "France",
    "Spain",
    "Germany",
    "Nigeria",
    "Ghana",
    "Japan",
    "South Korea",
    "Australia",
    "Argentina"
  ];

  const genders = [
    { id: "female", label: "Female" },
    { id: "male", label: "Male" },
    { id: "nonbinary", label: "Nonbinary" }
  ];

  const emojis = {
    genders: {
      female: "👩",
      male: "👨",
      nonbinary: "🧑"
    },
    sports: {
      basketball: "🏀",
      football: "🏈",
      soccer: "⚽",
      boxing: "🥊",
      mma: "🥋"
    },
    families: {
      supportive: "🤝",
      strict: "📋",
      absent: "🌫️",
      famous: "🌟",
      toxic: "⚠️",
      working: "🛠️",
      wealthy: "💎"
    },
    actions: {
      early_development: "🧸",
      balanced_training: "🏃",
      skill_lab: "🎯",
      strength_speed: "💪",
      recovery_block: "🛌",
      mental_coach: "🧠",
      offseason_camp: "⛺",
      family_time: "🏠",
      coach_meeting: "📋",
      mentor_session: "🧭",
      team_bonding: "🤝",
      rivalry_focus: "🔥",
      agent_meeting: "💼",
      nil_push: "📣",
      smart_investment: "📈",
      lifestyle_splurge: "💸",
      press_work: "🎙️",
      social_posting: "📱",
      charity_event: "❤️",
      media_blackout: "🔕"
    },
    events: {
      childhood_sport_choice: "🧒",
      growth_spurt: "📏",
      academy_move: "🚚",
      hidden_talent: "✨",
      wrong_crowd: "🌙",
      trainer_discovery: "🧢",
      identity_crisis: "🪞",
      scout_misread: "👀",
      sibling_need: "💌",
      family_pressure: "🏠",
      viral_highlight: "📱",
      injury_scare: "🩹",
      coach_conflict: "📋",
      agent_pitch: "💼",
      bad_investment: "💸",
      endorsement_offer: "🤝",
      rival_callout: "🔥",
      friend_support: "👥",
      school_pressure: "🎓",
      media_narrative: "📰",
      wellness_breakthrough: "🧘",
      national_attention: "🌍",
      tax_bill: "🧾"
    }
  };

  const difficulties = {
    casual: {
      label: "Casual",
      summary: "More chances, softer injuries, friendlier money.",
      injuryMod: 0.7,
      burnoutMod: 0.75,
      opportunityMod: 1.3,
      volatility: 0.75,
      salaryMod: 1.18,
      taxMod: 0.9,
      recoveryMod: 1.2,
      eventChance: 0.13
    },
    realistic: {
      label: "Realistic",
      summary: "Balanced pressure, injuries, media, and finances.",
      injuryMod: 1,
      burnoutMod: 1,
      opportunityMod: 1,
      volatility: 1,
      salaryMod: 1,
      taxMod: 1,
      recoveryMod: 1,
      eventChance: 0.18
    },
    brutal: {
      label: "Brutal Realism",
      summary: "Thin margins, hard injuries, expensive mistakes.",
      injuryMod: 1.45,
      burnoutMod: 1.35,
      opportunityMod: 0.78,
      volatility: 1.35,
      salaryMod: 0.84,
      taxMod: 1.2,
      recoveryMod: 0.82,
      eventChance: 0.24
    }
  };

  const sports = {
    basketball: {
      label: "Basketball",
      startStage: "School Prospect",
      proStage: "Pro Basketball",
      draftAge: 19,
      positions: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
      paths: ["High School", "College", "G League", "International League", "NBA"],
      combine: ["vertical leap", "lane sprint", "shooting drill", "scrimmage IQ"],
      skillNames: ["handle", "shot creation", "defense", "court vision"],
      peakAge: 28
    },
    football: {
      label: "Football",
      startStage: "School Prospect",
      proStage: "Pro Football",
      draftAge: 21,
      positions: ["Quarterback", "Running Back", "Wide Receiver", "Linebacker", "Cornerback", "Edge Rusher"],
      paths: ["High School", "College", "Combine", "Practice Squad", "NFL"],
      combine: ["forty-yard dash", "bench press", "position drills", "interviews"],
      skillNames: ["playbook", "explosiveness", "tackling", "field sense"],
      peakAge: 27
    },
    soccer: {
      label: "Soccer",
      startStage: "Academy Prospect",
      proStage: "Senior Club",
      draftAge: 16,
      positions: ["Goalkeeper", "Center Back", "Fullback", "Midfielder", "Winger", "Striker"],
      paths: ["Youth Academy", "U18 Club", "Domestic League", "International Transfer", "National Team"],
      combine: ["first touch", "match fitness", "tactical test", "trial match"],
      skillNames: ["touch", "passing", "pace", "positioning"],
      peakAge: 28
    },
    boxing: {
      label: "Boxing",
      startStage: "Amateur Circuit",
      proStage: "Professional Boxer",
      draftAge: 18,
      positions: [],
      weightClasses: ["Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight"],
      paths: ["Local Amateur", "National Amateur", "Regional Title", "World Title", "Hall of Fame"],
      combine: ["sparring rounds", "cardio test", "defense drill", "weigh-in"],
      skillNames: ["jab", "footwork", "power", "ring IQ"],
      peakAge: 30
    },
    mma: {
      label: "MMA",
      startStage: "Amateur Circuit",
      proStage: "Professional Fighter",
      draftAge: 18,
      positions: [],
      weightClasses: ["Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight"],
      paths: ["Local Amateur", "Regional Promotion", "Contender Series", "Major Promotion", "Champion"],
      combine: ["striking rounds", "grappling rounds", "cardio test", "weigh-in"],
      skillNames: ["striking", "wrestling", "submissions", "fight IQ"],
      peakAge: 31
    }
  };

  const families = {
    supportive: {
      label: "Supportive Family",
      summary: "Steady backing and room to grow.",
      effects: { motivation: 8, confidence: 4, burnout: -5, family: 12, discipline: 2 }
    },
    strict: {
      label: "Strict Family",
      summary: "High standards, pressure, and structure.",
      effects: { discipline: 9, motivation: 4, burnout: 7, confidence: -2, family: 2 }
    },
    absent: {
      label: "Absent Family",
      summary: "Independence arrives early.",
      effects: { confidence: -6, motivation: 3, social: 5, family: -12 }
    },
    famous: {
      label: "Famous Family",
      summary: "Doors open, expectations follow.",
      effects: { social: 13, money: 2200, pressure: 10, ego: 6, public: 5, family: 4 }
    },
    toxic: {
      label: "Toxic Family",
      summary: "Talent develops under difficult pressure.",
      effects: { burnout: 13, discipline: -5, confidence: -8, motivation: -3, family: -16, pressure: 8 }
    },
    working: {
      label: "Working-Class Family",
      summary: "Grit, responsibility, and fewer shortcuts.",
      effects: { discipline: 5, grit: 8, motivation: 4, family: 3 }
    },
    wealthy: {
      label: "Wealthy Family",
      summary: "Resources are available, hunger is tested.",
      effects: { money: 5000, pressure: 4, discipline: -3, social: 4, family: 5 }
    }
  };

  const personalities = {
    driven: {
      label: "Driven",
      effects: { discipline: 8, motivation: 8, ego: -2, burnout: 4, confidence: 2 }
    },
    charismatic: {
      label: "Charismatic",
      effects: { social: 10, chemistry: 5, ego: 3, public: 5, confidence: 3 }
    },
    reserved: {
      label: "Reserved",
      effects: { public: -4, discipline: 3, mental: 5, social: -3, ego: -2 }
    },
    volatile: {
      label: "Volatile",
      effects: { ego: 9, confidence: 6, discipline: -7, mediaHeat: 6, chemistry: -4 }
    },
    humble: {
      label: "Humble",
      effects: { chemistry: 7, ego: -6, public: 3, coachTrust: 4, confidence: -1 }
    },
    showboat: {
      label: "Showboat",
      effects: { social: 10, ego: 10, chemistry: -3, confidence: 4, mediaHeat: 4 }
    },
    analytical: {
      label: "Analytical",
      effects: { discipline: 5, financeIQ: 6, skill: 3, mental: 3, coachTrust: 2 }
    }
  };

  const actions = [
    {
      id: "early_development",
      label: "Early Development",
      category: "training",
      summary: "Movement, play, sleep, and family rhythm.",
      effects: { skill: 1, athleticism: 1, health: 3, family: 2, burnout: -2, motivation: 1 }
    },
    {
      id: "balanced_training",
      label: "Balanced Training",
      category: "training",
      summary: "Skill, body, and habits.",
      effects: { skill: 3, athleticism: 2, discipline: 1, burnout: 2, injuryRisk: 1 }
    },
    {
      id: "skill_lab",
      label: "Skill Lab",
      category: "training",
      summary: "Craft and sport IQ.",
      effects: { skill: 5, confidence: 2, burnout: 2, athleticism: -1 }
    },
    {
      id: "strength_speed",
      label: "Strength and Speed",
      category: "training",
      summary: "Explosiveness and frame.",
      effects: { athleticism: 5, injuryRisk: 3, burnout: 3, health: -1 }
    },
    {
      id: "recovery_block",
      label: "Recovery Block",
      category: "training",
      summary: "Health, sleep, and rehab.",
      effects: { health: 7, injuryRisk: -6, burnout: -7, motivation: -1, discipline: 1 }
    },
    {
      id: "mental_coach",
      label: "Mental Coach",
      category: "training",
      summary: "Confidence without ego.",
      effects: { mental: 6, confidence: 4, burnout: -3, ego: -2, money: -250 }
    },
    {
      id: "offseason_camp",
      label: "Offseason Camp",
      category: "training",
      summary: "High-cost leap forward.",
      effects: { skill: 7, athleticism: 5, discipline: 2, burnout: 4, injuryRisk: 2, money: -1200 }
    },
    {
      id: "family_time",
      label: "Family Time",
      category: "relationships",
      summary: "Repair pressure at home.",
      effects: { family: 8, burnout: -3, motivation: 2, social: -1 }
    },
    {
      id: "coach_meeting",
      label: "Coach Meeting",
      category: "relationships",
      summary: "Role clarity and trust.",
      effects: { coachTrust: 8, discipline: 2, confidence: 1, ego: -1 }
    },
    {
      id: "mentor_session",
      label: "Mentor Session",
      category: "relationships",
      summary: "Learn from someone older.",
      effects: { mentor: 8, mental: 3, discipline: 2, public: 1 }
    },
    {
      id: "team_bonding",
      label: "Team Bonding",
      category: "relationships",
      summary: "Locker room chemistry.",
      effects: { chemistry: 8, coachTrust: 2, social: 2, discipline: -1 }
    },
    {
      id: "rivalry_focus",
      label: "Rivalry Focus",
      category: "relationships",
      summary: "Turn tension into fuel.",
      effects: { confidence: 4, motivation: 5, rivalry: 5, burnout: 2, ego: 2 }
    },
    {
      id: "agent_meeting",
      label: "Agent Meeting",
      category: "business",
      summary: "Deals, leverage, and timing.",
      effects: { agent: 8, brand: 3, money: -150, public: 1 }
    },
    {
      id: "nil_push",
      label: "NIL Push",
      category: "business",
      summary: "Local endorsements before pro.",
      effects: { money: 850, brand: 5, social: 6, mediaHeat: 3, burnout: 1 }
    },
    {
      id: "smart_investment",
      label: "Smart Investment",
      category: "business",
      summary: "Build wealth slowly.",
      effects: { wealth: 900, money: -700, financeIQ: 3, burnout: 1 }
    },
    {
      id: "lifestyle_splurge",
      label: "Lifestyle Splurge",
      category: "business",
      summary: "Fun now, risk later.",
      effects: { confidence: 4, social: 5, discipline: -5, money: -900, injuryRisk: 2, mediaHeat: 2 }
    },
    {
      id: "press_work",
      label: "Press Work",
      category: "media",
      summary: "Shape the public story.",
      effects: { public: 6, social: 3, brand: 4, burnout: 2, mediaHeat: -1 }
    },
    {
      id: "social_posting",
      label: "Social Posting",
      category: "media",
      summary: "Grow followers and risk noise.",
      effects: { social: 8, brand: 3, ego: 2, mediaHeat: 4, discipline: -1 }
    },
    {
      id: "charity_event",
      label: "Charity Event",
      category: "media",
      summary: "Reputation and roots.",
      effects: { public: 8, family: 2, social: 2, money: -350, burnout: 1 }
    },
    {
      id: "media_blackout",
      label: "Media Blackout",
      category: "media",
      summary: "Quiet work, fewer headlines.",
      effects: { discipline: 4, mental: 3, mediaHeat: -7, social: -4, brand: -1 }
    }
  ];

  const actionRules = {
    early_development: { minAge: 0, maxAge: 6 },
    balanced_training: { minAge: 7 },
    skill_lab: { minAge: 8 },
    strength_speed: { minAge: 12 },
    recovery_block: { minAge: 5 },
    mental_coach: { minAge: 12 },
    offseason_camp: { minAge: 13 },
    family_time: { minAge: 0 },
    coach_meeting: { minAge: 8 },
    mentor_session: { minAge: 10 },
    team_bonding: { minAge: 10 },
    rivalry_focus: { minAge: 12 },
    agent_meeting: { minAge: 15 },
    nil_push: { minAge: 15 },
    smart_investment: { minAge: 16 },
    lifestyle_splurge: { minAge: 13 },
    press_work: { minAge: 13 },
    social_posting: { minAge: 12 },
    charity_event: { minAge: 12 },
    media_blackout: { minAge: 12 }
  };

  const majorEvents = [
    {
      id: "childhood_sport_choice",
      title: "Childhood Sport Choice",
      text: "Your family has to decide what kind of childhood this athlete gets.",
      minAge: 5,
      maxAge: 10,
      once: true,
      weight: 11,
      choices: [
        { label: "Specialize Early", effects: { skill: 8, discipline: 4, burnout: 6, injuryRisk: 3, family: -2 }, flags: { earlySpecialization: true }, log: "Early specialization sharpens the game, but childhood pressure rises." },
        { label: "Play Multiple Sports", effects: { athleticism: 7, health: 3, injuryRisk: -4, skill: 3 }, flags: { multiSportBase: true }, log: "A multi-sport base builds a wider athletic foundation." },
        { label: "Keep It Fun", effects: { mental: 6, family: 5, burnout: -5, motivation: 4 }, flags: { protectedChildhood: true }, log: "Joy becomes part of the long-term foundation." }
      ]
    },
    {
      id: "growth_spurt",
      title: "Growth Spurt",
      text: "Your body changes fast, and training has to adjust.",
      minAge: 11,
      maxAge: 16,
      once: true,
      weight: 9,
      choices: [
        { label: "Rebuild Movement", effects: { health: 6, injuryRisk: -5, skill: 2, athleticism: 2 }, profileEffects: { height: 2, weight: 8 }, flags: { movementRebuild: true }, log: "You rebuild coordination around the new frame." },
        { label: "Add Power", effects: { athleticism: 7, injuryRisk: 4, confidence: 4 }, profileEffects: { height: 1, weight: 14 }, flags: { powerFrame: true }, log: "The new frame becomes a power advantage." },
        { label: "Rush Back", effects: { skill: 5, confidence: 3, health: -7, injuryRisk: 8 }, profileEffects: { height: 1, weight: 6 }, flags: { rushedGrowth: true }, log: "You keep performing, but the body carries new risk." }
      ]
    },
    {
      id: "academy_move",
      title: "Academy Move",
      text: "A stronger program wants you to move away from home.",
      minAge: 12,
      maxAge: 17,
      once: true,
      weight: 8,
      choices: [
        { label: "Move Away", effects: { skill: 7, coachTrust: 6, family: -8, mental: -3, pressure: 5 }, flags: { eliteAcademy: true }, log: "The higher level changes the ceiling and the loneliness." },
        { label: "Stay Home", effects: { family: 8, mental: 4, public: -2, skill: 2 }, flags: { hometownPath: true }, log: "Home stays stable, even if the spotlight grows slower." },
        { label: "Negotiate Hybrid", effects: { skill: 4, family: 2, financeIQ: 3, burnout: 3 }, flags: { hybridAcademy: true }, log: "The compromise keeps both development and roots alive." }
      ]
    },
    {
      id: "hidden_talent",
      title: "Hidden Talent",
      text: "A coach notices something nobody has been training yet.",
      minAge: 8,
      maxAge: 15,
      once: true,
      weight: 8,
      choices: [
        { label: "Build Around It", effects: { skill: 7, confidence: 5, coachTrust: 4, burnout: 2 }, flags: { signatureSkill: true }, log: "A signature skill starts becoming part of your identity." },
        { label: "Stay Balanced", effects: { athleticism: 4, skill: 4, health: 3, injuryRisk: -2 }, flags: { balancedFoundation: true }, log: "You develop the talent without letting it narrow the whole game." },
        { label: "Hide It For Now", effects: { mental: 4, confidence: -2, public: -2, skill: 2 }, flags: { lateReveal: true }, log: "The talent stays quiet, waiting for a better stage." }
      ]
    },
    {
      id: "wrong_crowd",
      title: "Wrong Crowd",
      text: "A new social circle makes the dream feel less urgent.",
      minAge: 13,
      maxAge: 21,
      weight: 7,
      choices: [
        { label: "Cut It Off", effects: { discipline: 6, mental: -2, friendship: -5, burnout: 2 }, flags: { hardBoundaries: true }, log: "You protect the dream, but it costs you socially." },
        { label: "Keep Balance", effects: { social: 4, discipline: 2, mental: 2, motivation: -1 }, flags: { socialBalance: true }, log: "You keep the circle close without letting it own the calendar." },
        { label: "Enjoy The Moment", effects: { social: 8, confidence: 3, discipline: -8, mediaHeat: 3, skill: -2 }, flags: { partyRisk: true }, log: "The fun is real. So is the drift." }
      ]
    },
    {
      id: "trainer_discovery",
      title: "Underground Trainer",
      text: "Someone outside the usual system offers a different way to train.",
      minAge: 12,
      maxAge: 25,
      once: true,
      weight: 7,
      choices: [
        { label: "Trust Them", effects: { skill: 8, athleticism: 3, money: -600, injuryRisk: 2 }, flags: { undergroundTrainer: true }, log: "The unusual training unlocks a new gear." },
        { label: "Vet Them First", effects: { financeIQ: 4, coachTrust: 2, skill: 3, money: -150 }, flags: { carefulNetwork: true }, log: "You make the relationship useful without surrendering judgment." },
        { label: "Stay With Staff", effects: { coachTrust: 5, chemistry: 3, skill: 1 }, flags: { systemLoyal: true }, log: "The official staff trusts you more after you stay in-house." }
      ]
    },
    {
      id: "identity_crisis",
      title: "Identity Crisis",
      text: "For the first time, you wonder who you are without the sport.",
      minAge: 16,
      maxAge: 32,
      weight: 6,
      choices: [
        { label: "Talk It Out", effects: { mental: 8, burnout: -6, family: 2, ego: -2 }, flags: { innerWork: true }, log: "You get language for the pressure instead of carrying it alone." },
        { label: "Train Through It", effects: { skill: 5, discipline: 4, mental: -4, burnout: 5 }, flags: { grindMask: true }, log: "The numbers improve, but the question stays underneath." },
        { label: "Explore A Passion", effects: { brand: 4, mental: 4, motivation: 2, skill: -1 }, flags: { outsidePassion: true }, log: "A life outside the sport makes the sport feel less suffocating." }
      ]
    },
    {
      id: "scout_misread",
      title: "Scout Misread",
      text: "A respected evaluator says your ceiling is lower than the hype.",
      minAge: 15,
      maxAge: 23,
      weight: 7,
      choices: [
        { label: "Change Their Mind", effects: { motivation: 7, skill: 4, rivalry: 3, burnout: 3 }, flags: { revengeArc: true }, log: "The report becomes fuel for a revenge arc." },
        { label: "Study The Weakness", effects: { skill: 5, discipline: 5, ego: -3, confidence: -1 }, flags: { weaknessAudit: true }, log: "The criticism becomes a map." },
        { label: "Ignore It", effects: { confidence: 4, ego: 4, public: -2, discipline: -2 }, flags: { ignoresScouts: true }, log: "You refuse to let outside voices define the story." }
      ]
    },
    {
      id: "sibling_need",
      title: "Family Needs You",
      text: "A loved one needs real support during a crucial stretch.",
      minAge: 12,
      maxAge: 28,
      weight: 6,
      choices: [
        { label: "Show Up Fully", effects: { family: 10, mental: 3, skill: -3, public: 1 }, flags: { familyAnchor: true }, log: "Family becomes an anchor, even as training takes a hit." },
        { label: "Split Time", effects: { family: 5, discipline: 2, burnout: 3 }, flags: { splitResponsibilities: true }, log: "You keep both responsibilities alive, barely." },
        { label: "Stay On Track", effects: { skill: 4, confidence: 2, family: -7, burnout: 2 }, flags: { lonelyAscent: true }, log: "The career stays on track, but the emotional bill comes later." }
      ]
    },
    {
      id: "viral_highlight",
      title: "Viral Highlight",
      text: "A clip of your best moment takes off overnight.",
      minAge: 12,
      weight: 9,
      choices: [
        { label: "Capitalize", effects: { social: 12, brand: 6, ego: 3, mediaHeat: 3 }, log: "The highlight becomes a brand moment." },
        { label: "Stay Grounded", effects: { discipline: 4, coachTrust: 3, confidence: 2, social: 3 }, log: "You let the work speak after the hype." },
        { label: "Talk Big", effects: { social: 7, rivalry: 8, ego: 6, chemistry: -3, mediaHeat: 5 }, log: "Your quote gives the media a new headline." }
      ]
    },
    {
      id: "injury_scare",
      title: "Injury Scare",
      text: "A sharp pain shows up during training.",
      minAge: 8,
      weight: 10,
      choices: [
        { label: "Play Through", effects: { confidence: 3, health: -12, injuryRisk: 10, coachTrust: 2 }, log: "You kept going, but your body remembers it." },
        { label: "Report Early", effects: { health: 5, injuryRisk: -5, coachTrust: -2, discipline: 2 }, log: "You caught the problem before it became a crisis." },
        { label: "Full Rehab", effects: { health: 12, injuryRisk: -10, burnout: -4, skill: -2 }, log: "You lose rhythm but protect the long game." }
      ]
    },
    {
      id: "family_pressure",
      title: "Family Pressure",
      text: "Home life starts shaping your choices.",
      minAge: 5,
      weight: 8,
      choices: [
        { label: "Set Boundaries", effects: { mental: 6, discipline: 2, family: -5, burnout: -3 }, log: "You draw a line and clear your head." },
        { label: "Keep Peace", effects: { family: 8, burnout: 5, motivation: 2 }, log: "You keep everyone close, even when it costs energy." },
        { label: "Use the Pressure", effects: { motivation: 7, confidence: -2, burnout: 4 }, log: "The pressure becomes fuel, but it burns hot." }
      ]
    },
    {
      id: "coach_conflict",
      title: "Coach Conflict",
      text: "Your coach questions your habits and role.",
      minAge: 10,
      weight: 7,
      choices: [
        { label: "Listen", effects: { coachTrust: 8, discipline: 3, ego: -3 }, log: "The relationship improves after a hard conversation." },
        { label: "Push Back", effects: { confidence: 4, ego: 5, coachTrust: -8, mediaHeat: 2 }, log: "You defend yourself, and the room gets colder." },
        { label: "Ask a Mentor", effects: { mentor: 6, mental: 4, coachTrust: 2 }, log: "An older voice helps you read the situation." }
      ]
    },
    {
      id: "agent_pitch",
      title: "Agent Pitch",
      text: "An agent says they can change your future.",
      minAge: 16,
      weight: 7,
      choices: [
        { label: "Sign Now", effects: { agent: 12, brand: 4, money: -400, discipline: -1 }, log: "You add representation early." },
        { label: "Interview More", effects: { agent: 5, financeIQ: 4, discipline: 2 }, log: "You compare options before trusting anyone." },
        { label: "Stay Independent", effects: { financeIQ: 3, ego: 2, agent: -3, money: 150 }, log: "You keep control for now." }
      ]
    },
    {
      id: "bad_investment",
      title: "Bad Investment Pitch",
      text: "A flashy opportunity promises fast money.",
      minAge: 17,
      weight: 6,
      choices: [
        { label: "Buy In", effects: { money: -2500, wealth: -1600, confidence: -3, financeIQ: -2 }, log: "The deal looks worse after the paperwork clears." },
        { label: "Research It", effects: { financeIQ: 7, wealth: 300, discipline: 2 }, log: "You slow down and avoid a costly trap." },
        { label: "Ask Family", effects: { family: 4, financeIQ: 2, money: -200 }, log: "Advice from home keeps the damage small." }
      ]
    },
    {
      id: "endorsement_offer",
      title: "Endorsement Offer",
      text: "A brand wants your name before you reach the pros.",
      maxStage: "prepro",
      minAge: 15,
      weight: 7,
      choices: [
        { label: "Take Cash", effects: { money: 1800, brand: 4, social: 4, burnout: 2 }, log: "The deal helps now and raises expectations." },
        { label: "Negotiate Equity", effects: { wealth: 1200, financeIQ: 4, agent: 2, money: 400 }, log: "You think like an owner earlier than most." },
        { label: "Decline", effects: { discipline: 3, coachTrust: 2, public: 1 }, log: "You keep the focus narrow." }
      ]
    },
    {
      id: "rival_callout",
      title: "Rival Callout",
      text: "A rival says you are overrated.",
      minAge: 11,
      weight: 8,
      choices: [
        { label: "Answer Publicly", effects: { rivalry: 10, mediaHeat: 5, social: 5, ego: 4 }, log: "The rivalry becomes part of your story." },
        { label: "Outwork Them", effects: { skill: 4, motivation: 4, discipline: 3, rivalry: 3 }, log: "You answer with film and results." },
        { label: "Make Peace", effects: { chemistry: 5, public: 4, rivalry: -4, ego: -2 }, log: "You lower the temperature and win some respect." }
      ]
    },
    {
      id: "friend_support",
      title: "Friendship Tested",
      text: "A close friend needs time when your schedule is packed.",
      minAge: 7,
      weight: 5,
      choices: [
        { label: "Show Up", effects: { friendship: 9, burnout: -2, discipline: -1 }, log: "The relationship survives the season." },
        { label: "Stay Locked In", effects: { discipline: 4, motivation: 2, friendship: -5 }, log: "You choose the grind and feel the distance." },
        { label: "Bring Them In", effects: { friendship: 4, social: 3, mental: 2 }, log: "Your circle learns how to fit the dream." }
      ]
    },
    {
      id: "school_pressure",
      title: "School Pressure",
      text: "Grades, academy demands, and training collide.",
      minAge: 12,
      maxAge: 20,
      weight: 6,
      choices: [
        { label: "Hire Tutor", effects: { academics: 8, money: -500, burnout: 1 }, log: "Academic pressure eases with help." },
        { label: "Cram Alone", effects: { academics: 4, burnout: 5, discipline: 2 }, log: "You get through it, but it drains you." },
        { label: "Ignore It", effects: { academics: -8, confidence: 2, coachTrust: -2 }, log: "The short-term relief creates future risk." }
      ]
    },
    {
      id: "media_narrative",
      title: "Media Narrative",
      text: "A public storyline starts sticking to you.",
      minAge: 17,
      weight: 7,
      choices: [
        { label: "Control Message", effects: { public: 7, mediaHeat: -3, brand: 3, money: -300 }, log: "Your team steadies the narrative." },
        { label: "Lean Into It", effects: { social: 8, brand: 5, ego: 3, mediaHeat: 5 }, log: "Attention grows, and so does the noise." },
        { label: "Disappear", effects: { discipline: 4, mental: 3, social: -5, mediaHeat: -5 }, log: "You go quiet and recover focus." }
      ]
    },
    {
      id: "wellness_breakthrough",
      title: "Wellness Breakthrough",
      text: "A better routine finally clicks.",
      minAge: 8,
      weight: 5,
      choices: [
        { label: "Protect It", effects: { health: 9, burnout: -8, discipline: 4, motivation: 2 }, log: "Your routine becomes a real advantage." },
        { label: "Train Harder", effects: { skill: 4, athleticism: 3, burnout: 3, injuryRisk: 2 }, log: "You turn freshness into extra work." },
        { label: "Share It", effects: { social: 5, public: 4, chemistry: 3 }, log: "People notice the calmer version of you." }
      ]
    },
    {
      id: "national_attention",
      title: "National Attention",
      text: "Scouts from a bigger stage are watching.",
      minAge: 16,
      weight: 6,
      choices: [
        { label: "Chase Stage", effects: { public: 7, confidence: 4, burnout: 3, mediaHeat: 3 }, log: "You step toward the spotlight." },
        { label: "Stay Patient", effects: { discipline: 4, coachTrust: 4, public: 2 }, log: "Patience protects your timeline." },
        { label: "Change Team", effects: { chemistry: -6, coachTrust: -3, public: 5, skill: 3 }, log: "A bigger platform comes with a new locker room." }
      ]
    },
    {
      id: "tax_bill",
      title: "Tax Bill",
      text: "Money gets real after fees, taxes, and advice.",
      minAge: 18,
      weight: 5,
      choices: [
        { label: "Pay Carefully", effects: { money: -1400, financeIQ: 4, public: 1 }, log: "It hurts, but your books stay clean." },
        { label: "Cut Corners", effects: { money: -450, financeIQ: -3, mediaHeat: 4, public: -4 }, log: "You save cash now and invite trouble later." },
        { label: "Hire Accountant", effects: { money: -950, financeIQ: 7, wealth: 400 }, log: "Professional help pays for itself over time." }
      ]
    }
  ];

  const postCareer = [
    "Coach",
    "Team Owner",
    "Commentator",
    "Entrepreneur",
    "Fashion Designer",
    "Musician",
    "Actor",
    "Trainer"
  ];

  window.LegacyLeagueData = {
    months,
    countries,
    genders,
    emojis,
    difficulties,
    sports,
    families,
    personalities,
    actions,
    actionRules,
    majorEvents,
    postCareer
  };
})();
