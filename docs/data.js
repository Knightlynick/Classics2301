const rawStudyTopics = window.STUDY_TOPICS || [];
const rawQuizBank = window.QUIZ_QUESTIONS || [];
const guideSource = window.STUDY_GUIDE_CONTENT || {
  generatedFrom: "",
  generatedOn: "",
  markdown: "",
  outline: [],
  sections: []
};

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[`'".,:;!?()[\]{}]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function weekNumber(label) {
  return Number(String(label || "").replace(/\D/g, "")) || 0;
}

function dedupeStrings(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))];
}

function stripMarkdown(markdown) {
  return String(markdown || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[`*_]/g, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstParagraph(markdown) {
  const blocks = String(markdown || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split(/\n\s*\n/)
    .map((block) => stripMarkdown(block))
    .filter(Boolean);

  return blocks[0] || "";
}

function cleanSectionHeading(markdown) {
  return String(markdown || "").replace(/^##\s+.+$/m, "").trim();
}

function extractSubsection(markdown, headingText) {
  const lines = String(markdown || "").split(/\r?\n/);
  const needle = String(headingText || "").toLowerCase();
  const collected = [];
  let capture = false;
  let targetLevel = 0;

  for (const line of lines) {
    const headingMatch = /^(#{2,6})\s+(.+)$/.exec(line.trim());
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = stripMarkdown(headingMatch[2]).toLowerCase();

      if (!capture && title === needle) {
        capture = true;
        targetLevel = level;
        continue;
      }

      if (capture && level <= targetLevel) {
        break;
      }
    }

    if (capture) {
      collected.push(line);
    }
  }

  return collected.join("\n").trim();
}

function buildGuideSections(source) {
  const topLevelSections = (source.sections || []).map((section) => ({
    ...section,
    plainText: stripMarkdown(section.markdown),
    preview: firstParagraph(cleanSectionHeading(section.markdown))
  }));

  const overviewSections = [];
  const weekSections = [];
  const referenceSections = [];
  const glossarySections = [];
  let timelineSection = null;
  let finalFocusSection = null;

  topLevelSections.forEach((section) => {
    if (/^Week \d+/.test(section.title)) {
      weekSections.push(section);
      return;
    }

    if (section.title === "Master Timeline") {
      timelineSection = section;
      overviewSections.push(section);
      return;
    }

    if (/Glossary/i.test(section.title)) {
      glossarySections.push(section);
      return;
    }

    if (/Final Exam Focus/i.test(section.title)) {
      finalFocusSection = section;
      referenceSections.push(section);
      return;
    }

    if (
      /Cross-Course Comparison|High-Yield Terms|Final Checklist|Glossary Practice Questions/i.test(
        section.title
      )
    ) {
      referenceSections.push(section);
      return;
    }

    overviewSections.push(section);
  });

  const searchIndex = topLevelSections.map((section) => ({
    id: section.id,
    title: section.title,
    category: /^Week \d+/.test(section.title)
      ? "week"
      : /Glossary/i.test(section.title)
        ? "glossary"
        : "reference",
    preview: section.preview,
    text: section.plainText
  }));

  return {
    topLevelSections,
    overviewSections,
    weekSections,
    referenceSections,
    glossarySections,
    timelineSection,
    finalFocusSection,
    outline: source.outline || [],
    searchIndex
  };
}

function parseTimeline(section) {
  if (!section) {
    return [];
  }

  const entries = [];
  let currentEra = "general";

  for (const rawLine of section.markdown.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (/^###\s+Greek timeline/i.test(line)) {
      currentEra = "greek";
      continue;
    }

    if (/^###\s+Roman timeline/i.test(line)) {
      currentEra = "roman";
      continue;
    }

    if (!line.startsWith("- ")) {
      continue;
    }

    const detail = line.slice(2).trim();
    const parts = detail.split(":");
    const label = parts.shift() || detail;
    const body = parts.length ? parts.join(":").trim() : detail;
    entries.push({
      id: slugify(`${currentEra}-${label}`),
      era: currentEra,
      label: label.trim(),
      detail: body,
      target: inferTimelineTarget(detail)
    });
  }

  return entries;
}

function inferTimelineTarget(detail) {
  const text = detail.toLowerCase();

  if (text.includes("oresteia") || text.includes("aeschylus")) {
    return { type: "reading", id: "oresteia" };
  }

  if (text.includes("socrates") || text.includes("plato")) {
    return { type: "reading", id: "gorgias" };
  }

  if (text.includes("twelve tables") || text.includes("hortensia") || text.includes("praetorship")) {
    return { type: "week", id: "week-10" };
  }

  if (text.includes("catilinarian") || text.includes("catiline")) {
    return { type: "reading", id: "catiline" };
  }

  if (text.includes("caelius") || text.includes("cicero")) {
    return { type: "reading", id: "pro-caelio" };
  }

  return { type: "week", id: "week-2" };
}

const guideSections = buildGuideSections(guideSource);

const readingDossiers = [
  {
    id: "oresteia",
    family: "greek",
    week: "Week 4",
    title: "Aeschylus, Oresteia",
    shortTitle: "Oresteia",
    author: "Aeschylus",
    date: "458 BCE",
    location: "Athens",
    language: "Attic Greek",
    courseRole: "Greek tragedy as a public argument about justice",
    summary:
      "The trilogy follows the House of Atreus from sacrificial violence to Athena's foundation of a homicide court.",
    whyItMatters:
      "Week 4 uses the trilogy to show that civic justice does not erase vengeance. It redirects revenge, memory, and divine anger into a public institution.",
    keyQuestions: [
      "How does the trilogy move from household revenge to public adjudication?",
      "What survives from the old vengeance logic after Athena's court is founded?",
      "Why does the reading distinguish violence inside the community from violence against outsiders?"
    ],
    themes: ["vengeance", "pollution", "court", "insider-outsider violence"],
    relatedTerms: ["Furies", "Eumenides", "pollution", "Athena", "Areopagus"],
    relatedWeekIds: ["week-4"],
    excerpts: [
      {
        citation: "Eumenides 470-484, quoted in the Week 4 lecture script",
        quote:
          "The matter is too big for any mortal man ... I shall select judges of manslaughter, and swear them in, establish a court into all time to come.",
        speaker: "Athena",
        context:
          "Athena refuses to decide Orestes' case alone and turns the dispute into a permanent civic procedure.",
        analysis:
          "The reading imagines a court not as the destruction of older claims, but as a political way to hear them both without endless reciprocal bloodshed."
      },
      {
        citation: "Eumenides 485-489, quoted in the Week 4 lecture script",
        quote:
          "Litigants, call your witnesses, have ready your proofs as evidence under bond to keep this case secure.",
        speaker: "Athena",
        context:
          "The play suddenly sounds like a procedural manual: witnesses, proofs, oaths, and a sworn jury.",
        analysis:
          "Aeschylus turns tragedy into a thought experiment about how law formalizes conflict and demands evidence rather than pure retaliatory force."
      },
      {
        citation: "Eumenides 858-866, quoted in the Week 4 lecture script",
        quote:
          "No, let our wars range outward ... No true fighter I call the bird that fights at home.",
        speaker: "Athena",
        context:
          "Athena asks the transformed Furies to prevent civil bloodshed and keep communal violence from turning inward.",
        analysis:
          "The trilogy's political line is clear: intra-community violence becomes criminalized, while outward violence remains legible as war and collective glory."
      }
    ]
  },
  {
    id: "lysias-1",
    family: "greek",
    week: "Week 7",
    title: "Lysias 1, On the Murder of Eratosthenes",
    shortTitle: "Lysias 1",
    author: "Lysias",
    date: "Probably after 403 BCE",
    location: "Athens",
    language: "Attic Greek",
    courseRole: "Greek courtroom rhetoric and the construction of criminality",
    summary:
      "Euphiletos admits the killing but argues that Eratosthenes, not he, was the true criminal threat to the household.",
    whyItMatters:
      "The course uses this speech to separate homicide law from social imagination: the defense depends on lawful exception, household anxiety, and jury identification all at once.",
    keyQuestions: [
      "How does the speech make a homicide look like lawful punishment?",
      "Why is seduction treated as more corrosive than a one-time sexual assault?",
      "How does Lysias turn Euphiletos into an ordinary, believable citizen?"
    ],
    themes: ["homicide exception", "household order", "seduction", "jury identification"],
    relatedTerms: ["Draco", "logographer", "seducer", "Euphiletos", "Eratosthenes"],
    relatedWeekIds: ["week-3", "week-7"],
    excerpts: [
      {
        citation: "Lysias 1 [4], quoted in the Week 7 lecture and final guide",
        quote:
          "I believe, gentlemen, that what I have to demonstrate is this: that Eratosthenes seduced my wife and corrupted her ... except revenge, as the law allows.",
        speaker: "Euphiletos, in a speech written by Lysias",
        context:
          "The defense opens by redefining the case as household corruption plus lawful response rather than private malice.",
        analysis:
          "This is the speech's core move: Euphiletos concedes the act but reframes motive, victimhood, and legal category before the jury can settle on 'murderer.'"
      },
      {
        citation: "Lysias 1 [21], quoted in the final guide",
        quote:
          "I expect you to show me them in the act. For I do not need words, but clear evidence...",
        speaker: "Euphiletos reporting his demand for eyewitness confirmation",
        context:
          "He emphasizes witnesses and direct proof before acting against Eratosthenes.",
        analysis:
          "The passage works rhetorically to deny premeditated hatred. It makes the killing look immediate, verified, and socially supervised rather than privately engineered."
      }
    ]
  },
  {
    id: "gorgias",
    family: "greek",
    week: "Week 8",
    title: "Plato, Gorgias",
    shortTitle: "Gorgias",
    author: "Plato",
    date: "Probably early fourth century BCE",
    location: "Athens",
    language: "Attic Greek",
    courseRole: "Philosophy of rhetoric, justice, and punishment",
    summary:
      "The dialogue asks whether rhetoric teaches truth or only persuasion, then stages rival theories of punishment through Gorgias, Polus, Callicles, and Socrates.",
    whyItMatters:
      "Week 8 turns the dialogue into a theory lab: deterrence, rehabilitation, social construction, and afterlife punishment all appear in one sustained argument.",
    keyQuestions: [
      "Is rhetoric a path to truth or just a way to control audiences?",
      "Why does Socrates claim it is worse to do wrong than to suffer it?",
      "How do Polus and Callicles give different anti-Socratic accounts of power and punishment?"
    ],
    themes: ["rhetoric", "punishment", "deterrence", "self-discipline", "social construction"],
    relatedTerms: ["rhetoric", "Socrates", "Gorgias", "Polus", "Callicles", "nomos", "physis"],
    relatedWeekIds: ["week-6", "week-8"],
    excerpts: [
      {
        citation: "Gorgias 454b, quoted in the Week 8 lecture script",
        quote:
          "Its effect is to persuade people in the kinds of mass meetings which happen in law-courts and so on; and I think its province is right and wrong.",
        speaker: "Gorgias",
        context:
          "Socrates asks Gorgias what rhetoric actually is and where it works.",
        analysis:
          "The course seizes on this line because law-courts are one of rhetoric's natural habitats. The reading is therefore already about crime and punishment before punishment is named."
      },
      {
        citation: "Gorgias 507c-e, quoted in the Week 8 lecture script",
        quote:
          "Anyone who wants to be happy must seek out and practise self-discipline ... This is the life of a predatory outlaw.",
        speaker: "Socrates",
        context:
          "Socrates answers Callicles by tying happiness to restraint, justice, and life with others.",
        analysis:
          "Punishment here becomes part of a broader moral program. The point is not only to stop crime but to prevent the self from becoming antisocial and predatory."
      },
      {
        citation: "Gorgias 508d-e, quoted in the Week 8 lecture script",
        quote:
          "It is more contemptible, and worse as well, to hit and cut me and my property without just cause ... than it is for me, the target of his wrongdoing.",
        speaker: "Socrates",
        context:
          "Socrates insists that wrongdoing damages the offender more deeply than the victim.",
        analysis:
          "This is the course's clearest ancient statement of punishment as cure rather than merely fear. Crime matters because it deforms the soul and community together."
      },
      {
        citation: "Gorgias 525b-c, quoted in the Week 8 lecture script",
        quote:
          "Every instance of punishment should either help its recipient by making him a better person or should act as an example for others.",
        speaker: "Socrates",
        context:
          "Late in the dialogue Socrates turns to afterlife punishment and deterrent spectacle.",
        analysis:
          "The line gives students a clean way to compare rehabilitation and deterrence inside one ancient text rather than treating those as purely modern categories."
      }
    ]
  },
  {
    id: "catiline",
    family: "roman",
    week: "Week 11",
    title: "Sallust, Catiline's War",
    shortTitle: "Catiline's War",
    author: "Sallust",
    date: "c. 44-40 BCE",
    location: "Rome",
    language: "Latin",
    courseRole: "Roman crisis narrative and the criminal-enemy threshold",
    summary:
      "Sallust turns the conspiracy into a study of criminality, social breakdown, emergency power, and the unstable line between citizen and enemy.",
    whyItMatters:
      "Week 11 is the Roman counterpart to the Greek rhetoric weeks: the state cannot decide whether Catiline and his allies are criminals, rebels, insiders, or enemies in war.",
    keyQuestions: [
      "When does a dangerous insider stop being a citizen and become a hostis?",
      "How does Sallust mix social grievance with moral condemnation?",
      "What is really at stake in the Caesar-Cato disagreement about punishment?"
    ],
    themes: ["state emergency", "hostis", "relative deprivation", "deterrence", "civil conflict"],
    relatedTerms: ["Catiline", "SCU", "hostis", "provocatio", "relative deprivation"],
    relatedWeekIds: ["week-10", "week-11"],
    excerpts: [
      {
        citation: "Catiline's War 24-25, quoted in the Week 11 lecture script",
        quote:
          "The entire plebs, in its enthusiasm for revolution, approved completely of Catiline's projects.",
        speaker: "Sallust as narrator",
        context:
          "Sallust explains why the conspiracy cannot be reduced to one wicked aristocrat.",
        analysis:
          "The line is the clearest opening for a relative-deprivation reading: crime here grows out of a diseased social order and a willing urban audience."
      },
      {
        citation: "Catiline's War 37, quoted in the Week 11 lecture script",
        quote:
          "Their money should be confiscated and they themselves held in chains in the municipalities which have the most effective resources.",
        speaker: "Caesar",
        context:
          "Caesar rejects execution without trial but still proposes severe preventive confinement.",
        analysis:
          "This is one reason the course treats Caesar as neither a pure liberal hero nor a soft option. He remains inside a criminal-punishment frame, but a harsh one."
      },
      {
        citation: "Catiline's War 39, quoted in the Week 11 lecture script",
        quote:
          "When you decide about P. Lentulus and the others, be assured that at the same time you are issuing a decree about Catiline's army.",
        speaker: "Cato",
        context:
          "Cato pushes the Senate to treat sentencing as strategic signaling in an active emergency.",
        analysis:
          "The legal question becomes military theater: punishment is now about deterrence, resolve, and the management of enemy morale."
      },
      {
        citation: "Catiline's War 46, quoted in the Week 11 lecture script",
        quote:
          "Mindful of his lineage and his own old-time status, he rushed into the thickest of the enemy and there, fighting, was stabbed.",
        speaker: "Sallust as narrator",
        context:
          "Catiline dies with the bravery of a Roman hero even as the state defines him as an enemy.",
        analysis:
          "Sallust never lets the category settle. Catiline stays morally repellent and militarily admirable at the same time."
      }
    ]
  },
  {
    id: "pro-caelio",
    family: "roman",
    week: "Week 12",
    title: "Cicero, Pro Caelio",
    shortTitle: "Pro Caelio",
    author: "Cicero",
    date: "56 BCE",
    location: "Rome",
    language: "Latin",
    courseRole: "Roman defense speech as theatrical reframing",
    summary:
      "Cicero recasts a prosecution under the law on vis as a comic drama about youth, scandal, and malicious private revenge.",
    whyItMatters:
      "Week 12 shows how Roman advocacy can privatize a public charge by narrating character, sexuality, and festival theater more powerfully than doctrine alone.",
    keyQuestions: [
      "How does Cicero make a serious public-law charge look absurdly misapplied?",
      "Why is Clodia both a historical figure and a rhetorical construction?",
      "How does the speech link family reputation, character, and criminality?"
    ],
    themes: ["vis", "theater", "character", "gender", "state violence"],
    relatedTerms: ["Caelius", "Clodia", "vis", "Megalensia", "character evidence"],
    relatedWeekIds: ["week-10", "week-11", "week-12"],
    excerpts: [
      {
        citation: "Pro Caelio 1, quoted in the Week 12 lecture script",
        quote:
          "If somebody were here who knew nothing about our laws, our courts, and our customs ... he would have no doubt that the defendant is charged with so massive a crime that to leave it unattended would result in the collapse of the state.",
        speaker: "Cicero",
        context:
          "Cicero opens by inflating the seriousness of the forum, the holiday setting, and the law on vis so that he can mock the charge that follows.",
        analysis:
          "The joke only works because the statute is serious. Cicero's strategy is to seize that seriousness first, then make the jury feel it has been theatrically misapplied."
      },
      {
        citation: "Pro Caelio 64, quoted in the Week 12 lecture script",
        quote:
          "This whole tale ... belongs to an aging lady poet who has written a lot of comedies - but it has no plot and no ending.",
        speaker: "Cicero",
        context:
          "Near the end of the speech, Cicero accuses Clodia and the prosecution of staging fiction.",
        analysis:
          "He projects his own theatricality onto the other side. The speech wins by making the jurors feel like a comic audience rather than a judicial audience."
      },
      {
        citation: "Week 12 lecture script on the law of vis",
        quote:
          "The law on vis was designed for massive riots and insurrections, when the safety of the state itself was in danger.",
        speaker: "Lecture framing of Cicero's opening",
        context:
          "The course uses the speech to remind students that Caelius is charged under a public-security law, not simply with private scandal.",
        analysis:
          "This is why the speech matters beyond gossip. Cicero succeeds only by making a statute about state violence feel like it really belongs to a lover's quarrel."
      }
    ]
  }
];
const weekMetaMap = {
  "Week 1": {
    family: "bridge",
    priority: "foundation",
    themes: ["method", "ancient-modern mismatch", "public-private"],
    headline: "Start by unlearning the idea that ancient crime is just an earlier version of ours."
  },
  "Week 2": {
    family: "bridge",
    priority: "foundation",
    themes: ["chronology", "context", "periodization"],
    headline: "Chronology is part of interpretation, not filler."
  },
  "Week 3": {
    family: "greek",
    priority: "foundation",
    themes: ["greek law", "procedure", "self-help"],
    headline: "Greek law is citizen-driven, term-heavy, and foundational for every later Greek week."
  },
  "Week 4": {
    family: "greek",
    priority: "foundation",
    themes: ["tragedy", "vengeance", "court"],
    headline: "The Oresteia turns revenge into civic argument without pretending anger disappears."
  },
  "Week 5": {
    family: "bridge",
    priority: "reference",
    themes: ["archive note"],
    headline: "No lecture-script content is present in the local archive."
  },
  "Week 6": {
    family: "bridge",
    priority: "high",
    themes: ["criminology", "theory", "otherness"],
    headline: "Week 6 gives you the modern theory vocabulary the rest of the course keeps borrowing."
  },
  "Week 7": {
    family: "greek",
    priority: "high",
    themes: ["lysias", "homicide", "household", "rhetoric"],
    headline: "The defendant admits the killing and then tries to make the dead man the real criminal."
  },
  "Week 8": {
    family: "greek",
    priority: "high",
    themes: ["gorgias", "rhetoric", "punishment", "philosophy"],
    headline: "Rhetoric, punishment, and social construction all collide in one dialogue."
  },
  "Week 9": {
    family: "bridge",
    priority: "reference",
    themes: ["archive note"],
    headline: "No lecture-script content is present in the local archive."
  },
  "Week 10": {
    family: "roman",
    priority: "roman-heavy",
    themes: ["roman law", "institutions", "codification"],
    headline: "Roman legal history is one long story of state-building, office, and textual authority."
  },
  "Week 11": {
    family: "roman",
    priority: "roman-heavy",
    themes: ["catiline", "emergency power", "enemy combatant"],
    headline: "The state cannot decide whether Catiline is a criminal, rebel, insider, or enemy."
  },
  "Week 12": {
    family: "roman",
    priority: "roman-heavy",
    themes: ["pro caelio", "vis", "character", "theater"],
    headline: "Cicero wins by relocating a public violence charge into comic theater and character warfare."
  }
};

const weekToReadingIds = {
  "Week 4": ["oresteia"],
  "Week 7": ["lysias-1"],
  "Week 8": ["gorgias"],
  "Week 11": ["catiline"],
  "Week 12": ["pro-caelio"]
};

function buildWeekModules(topics, sections, readings) {
  const sectionByWeek = new Map(
    sections
      .filter((section) => /^Week \d+/.test(section.title))
      .map((section) => {
        const label = /^Week \d+/.exec(section.title)?.[0] || section.title;
        return [label, section];
      })
  );

  const topicsByWeek = topics.reduce((accumulator, topic) => {
    accumulator[topic.week] = accumulator[topic.week] || [];
    accumulator[topic.week].push(topic);
    return accumulator;
  }, {});

  const weekLabels = Array.from({ length: 12 }, (_, index) => `Week ${index + 1}`);

  return weekLabels.map((weekLabel) => {
    const moduleId = `week-${weekNumber(weekLabel)}`;
    const moduleTopics = (topicsByWeek[weekLabel] || []).sort(
      (left, right) => left.title.localeCompare(right.title)
    );
    const section = sectionByWeek.get(weekLabel);
    const meta = weekMetaMap[weekLabel] || {
      family: "bridge",
      priority: "reference",
      themes: []
    };
    const relatedReadingIds = weekToReadingIds[weekLabel] || [];
    const relatedReadings = readings.filter((reading) => relatedReadingIds.includes(reading.id));

    if (!moduleTopics.length) {
      return {
        id: moduleId,
        week: weekLabel,
        title: `${weekLabel}: Archive Note`,
        shortTitle: "No lecture-script content",
        family: meta.family,
        priority: meta.priority,
        themes: meta.themes,
        headline: meta.headline,
        hasLectureContent: false,
        summary:
          "The local archive has no lecture-script content for this week, so the app treats it as a reference gap rather than inventing missing material.",
        lectureThesis:
          "Use adjacent weeks to bridge the course narrative. The app marks this absence explicitly so you do not mistake the silence for missing study.",
        whyItMatters:
          "The course as preserved locally moves from the surrounding lectures without new weekly lecture content here.",
        examTrap:
          "Do not invent lecture claims for this week. On the preserved course spine, Weeks 5 and 9 are content gaps in the local archive.",
        keyTerms: [],
        chronology: [],
        selfCheck: [
          "Can you explain how the previous and next lecture connect without making up missing content?",
          "Can you tell which source in the archive actually covers the concept you are studying?"
        ],
        concepts: [],
        passages: [],
        comparisons: [],
        pitfalls: [],
        guideSectionId: section?.id || null,
        guidePreview: section?.preview || "",
        relatedReadingIds,
        relatedReadings
      };
    }

    const titleMatch = section?.title?.split(":");
    const shortTitle = titleMatch && titleMatch.length > 1 ? titleMatch.slice(1).join(":").trim() : weekLabel;
    const lectureThesis =
      extractSubsection(section?.markdown, "What this lecture is arguing") ||
      extractSubsection(section?.markdown, "Lecture frame in plain English") ||
      dedupeStrings(moduleTopics.map((topic) => topic.argument)).join(" ");
    const whyItMatters =
      extractSubsection(section?.markdown, "Why this matters for crime and punishment") ||
      dedupeStrings(moduleTopics.map((topic) => topic.whyItMatters)).join(" ");
    const examTrap =
      stripMarkdown(extractSubsection(section?.markdown, "MCQ Trap")) ||
      dedupeStrings(moduleTopics.flatMap((topic) => topic.pitfalls || []))[0] ||
      "";

    return {
      id: moduleId,
      week: weekLabel,
      title: section?.title || `${weekLabel}: ${shortTitle}`,
      shortTitle,
      family: meta.family,
      priority: meta.priority,
      themes: meta.themes,
      headline: meta.headline,
      hasLectureContent: true,
      summary: section?.preview || moduleTopics[0]?.summary || "",
      lectureThesis: stripMarkdown(lectureThesis),
      whyItMatters: stripMarkdown(whyItMatters),
      examTrap,
      keyTerms: dedupeStrings(moduleTopics.flatMap((topic) => topic.terms || [])),
      chronology: dedupeStrings(moduleTopics.flatMap((topic) => topic.events || [])),
      selfCheck: dedupeStrings(moduleTopics.flatMap((topic) => topic.studyQuestions || [])),
      concepts: moduleTopics.flatMap((topic) => topic.concepts || []).slice(0, 8),
      passages: moduleTopics.flatMap((topic) => topic.passages || []),
      comparisons: moduleTopics.flatMap((topic) => topic.comparisons || []).slice(0, 4),
      pitfalls: dedupeStrings(moduleTopics.flatMap((topic) => topic.pitfalls || [])),
      topics: moduleTopics,
      guideSectionId: section?.id || null,
      guidePreview: section?.preview || "",
      relatedReadingIds,
      relatedReadings
    };
  });
}

function buildStudyRef(question) {
  if (question.bank === "glossary") {
    return {
      type: "glossary",
      glossaryId: slugify(question.correctAnswer || question.choices?.[question.correctIndex] || "")
    };
  }

  const moduleId = `week-${weekNumber(question.week)}`;
  const relatedReadingId = (weekToReadingIds[question.week] || [])[0] || null;

  return {
    type: "week",
    moduleId,
    readingId: relatedReadingId
  };
}

function normalizeQuizQuestion(question) {
  const correctAnswer = question.correctAnswer || question.choices?.[question.correctIndex] || "";
  const distractors = question.distractors || (question.choices || []).filter((choice) => choice !== correctAnswer);

  return {
    id: question.id,
    bank: question.bank || "core",
    family: question.family || null,
    week: question.week,
    topic: question.topic,
    priority: question.priority,
    weight: question.weight || 1,
    prompt: question.prompt,
    correctAnswer,
    distractors: dedupeStrings(distractors),
    explanation: question.explanation,
    sourceRef: question.sourceRef,
    studyNote: question.studyNote || null,
    studyRef: buildStudyRef({
      ...question,
      correctAnswer
    })
  };
}

function extractGlossaryDefinition(question) {
  const correctAnswer = question.correctAnswer || "";
  const prefix = `${correctAnswer} means `;

  if (question.explanation?.startsWith(prefix)) {
    return question.explanation.slice(prefix.length).trim();
  }

  if (question.studyNote?.whyCorrect?.startsWith(prefix)) {
    return question.studyNote.whyCorrect.slice(prefix.length).trim();
  }

  const match = /"(.+)"$/.exec(question.prompt || "");
  return match ? match[1] : question.explanation || "";
}

function extractAliases(term) {
  const aliases = [];
  const parenMatch = /\(([^)]+)\)/.exec(term);
  if (parenMatch) {
    aliases.push(parenMatch[1].replace(/singular:|plural:|literally/gi, "").trim());
  }

  if (term.includes("/")) {
    aliases.push(...term.split("/").map((part) => part.trim()));
  }

  return dedupeStrings(aliases).filter((alias) => alias && alias !== term);
}

function containsTerm(text, term) {
  const haystack = ` ${String(text || "").toLowerCase()} `;
  const needle = String(term || "").toLowerCase().trim();

  if (!needle) {
    return false;
  }

  return haystack.includes(` ${needle} `) || haystack.includes(needle);
}

function buildGlossaryIndex(quizQuestions, weekModules, readingRecords) {
  const glossaryQuestions = quizQuestions.filter((question) => question.bank === "glossary");

  return glossaryQuestions
    .map((question) => {
      const term = question.correctAnswer;
      const aliases = extractAliases(term);
      const tokens = [term, ...aliases];

      let relatedWeekIds = weekModules
        .filter((module) =>
          tokens.some((token) =>
            [
              module.summary,
              module.lectureThesis,
              module.whyItMatters,
              module.examTrap,
              ...(module.keyTerms || []),
              ...(module.selfCheck || [])
            ].some((field) => containsTerm(field, token))
          )
        )
        .map((module) => module.id);

      if (!relatedWeekIds.length) {
        relatedWeekIds = question.family === "greek" ? ["week-3", "week-7"] : ["week-10", "week-12"];
      }

      const relatedReadingIds = readingRecords
        .filter((reading) =>
          tokens.some((token) =>
            [
              reading.summary,
              reading.whyItMatters,
              ...(reading.relatedTerms || []),
              ...reading.excerpts.map((excerpt) => excerpt.quote)
            ].some((field) => containsTerm(field, token))
          )
        )
        .map((reading) => reading.id);

      return {
        id: slugify(term),
        term,
        family: question.family,
        definition: extractGlossaryDefinition(question),
        aliases,
        sourceRef: question.sourceRef,
        relatedWeekIds: dedupeStrings(relatedWeekIds),
        relatedReadingIds: dedupeStrings(relatedReadingIds),
        searchText: [term, ...aliases, extractGlossaryDefinition(question), question.sourceRef].join(" ")
      };
    })
    .sort((left, right) => left.term.localeCompare(right.term));
}

const weekModules = buildWeekModules(rawStudyTopics, guideSections.weekSections, readingDossiers);
const quizQuestions = rawQuizBank.map(normalizeQuizQuestion);
const glossaryIndex = buildGlossaryIndex(quizQuestions, weekModules, readingDossiers);

const studyPath = [
  {
    id: "path-1",
    title: "Start with the course method",
    description:
      "Use the Start Here view for the ancient-modern mismatch, timeline, and exam priorities before you memorize details.",
    target: { type: "view", id: "startView" }
  },
  {
    id: "path-2",
    title: "Lock the Roman spine",
    description:
      "Weeks 10-12 are the heaviest final-exam territory: Roman law, Catiline, and Pro Caelio should be the first deep modules you master.",
    target: { type: "week", id: "week-10" }
  },
  {
    id: "path-3",
    title: "Use the readings as evidence",
    description:
      "Move into the dossier view once the weekly lecture thesis is clear, then learn which passage proves which argument.",
    target: { type: "reading", id: "pro-caelio" }
  },
  {
    id: "path-4",
    title: "Drill terminology and pressure-test it",
    description:
      "Finish each pass with glossary review and a quiz set that deep-links wrong answers back into the study material.",
    target: { type: "view", id: "quizView" }
  }
];

const priorityDeck = [
  {
    id: "priority-roman",
    label: "Highest priority",
    description: "Weeks 10-12 and the Roman law/glossary backbone",
    targets: ["week-10", "week-11", "week-12"]
  },
  {
    id: "priority-reading",
    label: "Second pass",
    description: "Week 7 Lysias, Week 8 Gorgias, Week 6 criminology toolkit",
    targets: ["week-7", "week-8", "week-6"]
  },
  {
    id: "priority-foundation",
    label: "Foundation pass",
    description: "Weeks 1-4 for method, chronology, vocabulary, and tragedy",
    targets: ["week-1", "week-2", "week-3", "week-4"]
  }
];
const noLectureWeeks = weekModules.filter((module) => !module.hasLectureContent).map((module) => module.id);
const timeline = parseTimeline(guideSections.timelineSection);

window.STUDY_DATA = Object.freeze({
  generatedFrom: guideSource.generatedFrom,
  generatedOn: guideSource.generatedOn,
  guideMarkdown: guideSource.markdown,
  guideSections,
  glossaryIndex,
  noLectureWeeks,
  priorityDeck,
  quizQuestions,
  readingDossiers,
  studyPath,
  studyTopics: rawStudyTopics,
  timeline,
  weekModules
});
