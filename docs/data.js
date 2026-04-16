const rawStudyTopics = window.STUDY_TOPICS || [];
const rawQuizBank = window.QUIZ_QUESTIONS || [];
const rawTimelineEvents = window.TIMELINE_EVENTS || [];
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

function extractFirstSubsection(markdown, headings) {
  for (const heading of headings) {
    const value = extractSubsection(markdown, heading);
    if (value) {
      return value;
    }
  }

  return "";
}

function normalizeTimelineEvents(events) {
  return (events || [])
    .map((event) => ({
      ...event,
      id: event.id || slugify(`${event.era}-${event.dateLabel}-${event.title}`),
      laws: dedupeStrings(event.laws || []),
      crimes: dedupeStrings(event.crimes || []),
      punishments: dedupeStrings(event.punishments || []),
      people: dedupeStrings(event.people || []),
      moduleIds: dedupeStrings(event.moduleIds || []),
      readingIds: dedupeStrings(event.readingIds || []),
      category: event.category || "context"
    }))
    .sort((left, right) => left.sortYear - right.sortYear);
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
    fullTextAvailable: true,
    readerNote:
      "Use the public-domain translation for full-text lookup, but keep the lecture's emphasis on the move from vendetta to civic adjudication at the center of your studying.",
    sourceProvenance: [
      {
        label: "Perseus Catalog - Eumenides (Smyth translation, public domain)",
        url: "https://catalog.perseus.org/catalog/urn%3Acts%3AgreekLit%3Atlg0085.tlg007.perseus-eng1",
        note: "Safe public-domain source for reading the trial book in full."
      },
      {
        label: "Week 4 lecture script",
        note: "Primary course framing for why the trilogy matters to crime and punishment."
      }
    ],
    sections: [
      {
        id: "oresteia-house-curse",
        label: "House of Atreus Background",
        span: "Agamemnon / Libation Bearers setup",
        summary:
          "Before the courtroom exists, the trilogy presents a chain of reciprocal violence inside one family: sacrifice, betrayal, revenge, and counter-revenge.",
        note:
          "This is the narrative ground for the whole course argument that legal institutions do not emerge in a vacuum. They emerge because unregulated blood vengeance is socially unsustainable.",
        whyItMatters:
          "You need this background so that Orestes' later trial looks like a political solution to a structural problem rather than a one-off mythic scene.",
        relatedWeekIds: ["week-4"],
        relatedTerms: ["pollution", "house of Atreus", "vengeance"],
        passages: [
          {
            id: "oresteia-oath-of-blood",
            citation: "Course framing on the House of Atreus",
            quote: "The house is trapped in inherited blood-guilt long before Athena appears.",
            context:
              "The lecture treats the backstory as a running demonstration that crimes generate obligations and memory, not just isolated legal incidents.",
            analysis:
              "Study this as the pre-legal world the trilogy must somehow domesticate."
          }
        ]
      },
      {
        id: "oresteia-seducer-logic",
        label: "Aegisthus, Seduction, and Retaliation",
        span: "Libation Bearers",
        summary:
          "Orestes dismisses the killing of Aegisthus as the punishment of a seducer, a move that anticipates the later legal rhetoric of Lysias 1.",
        note:
          "This is one of the strongest internal bridges in the course: tragedy already experiments with the argument that the dead adulterer or seducer is the real offender.",
        whyItMatters:
          "The week matters for Week 7 because it shows that the cultural logic behind lawful killing of a seducer predates the courtroom speech.",
        relatedWeekIds: ["week-4", "week-7"],
        relatedTerms: ["seducer", "lawful self-help", "Draco"],
        passages: [
          {
            id: "oresteia-aegisthus",
            citation: "Libation Bearers, seducer logic discussed in the Week 4 lecture",
            quote: "Orestes treats Aegisthus' death as a seducer's due penalty rather than as a separate homicide problem.",
            context:
              "The lecture explicitly flags this as a preview of how Lysias will later stretch a homicide exception into a broader moral license.",
            analysis:
              "Use this passage as comparative evidence when asked why Lysias' rhetoric would feel plausible to an Athenian audience."
          }
        ]
      },
      {
        id: "oresteia-athena-court",
        label: "Athena Creates a Court",
        span: "Eumenides 470-489",
        summary:
          "Athena refuses to settle the case as a solitary divine ruler and instead creates a permanent homicide court with witnesses, oaths, and judges.",
        note:
          "This is the reader's key institutional section. It is where tragedy starts sounding like a legal manual.",
        whyItMatters:
          "The passage shows the course's favorite point about state formation: law redirects revenge into recognizable procedure instead of pretending revenge never mattered.",
        relatedWeekIds: ["week-3", "week-4"],
        relatedTerms: ["Athena", "Areopagus", "court"],
        passages: [
          {
            id: "oresteia-athena-judges",
            citation: "Eumenides 470-484",
            quote:
              "The matter is too big for any mortal man ... I shall select judges of manslaughter, and swear them in, establish a court into all time to come.",
            context:
              "Athena turns a cycle of blood vengeance into a recurring civic institution.",
            analysis:
              "For exam purposes, this is the cleanest statement that the trilogy is about durable public procedure, not only divine truth."
          },
          {
            id: "oresteia-athena-evidence",
            citation: "Eumenides 485-489",
            quote:
              "Litigants, call your witnesses, have ready your proofs as evidence under bond to keep this case secure.",
            context:
              "The language abruptly shifts from mythic curse to procedural proof.",
            analysis:
              "This is where tragedy most clearly imagines how law formalizes conflict."
          }
        ]
      },
      {
        id: "oresteia-political-settlement",
        label: "Political Settlement and Civic Peace",
        span: "Eumenides end",
        summary:
          "The trial does not simply acquit Orestes. It settles the place of old vengeance powers inside the civic order and redirects communal violence outward.",
        note:
          "The ending is political rather than purely evidentiary. The city must absorb the Furies instead of annihilating them.",
        whyItMatters:
          "This is the section to use when asked whether courts abolish vengeance or manage it.",
        relatedWeekIds: ["week-4", "week-10"],
        relatedTerms: ["Eumenides", "insider-outsider violence", "civic justice"],
        passages: [
          {
            id: "oresteia-outward-war",
            citation: "Eumenides 858-866",
            quote: "No, let our wars range outward ... No true fighter I call the bird that fights at home.",
            context:
              "Athena asks the transformed Furies to help prevent internal bloodshed.",
            analysis:
              "The course reads this as the criminalization of intra-community violence alongside the continued legitimacy of outward war."
          }
        ]
      }
    ],
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
    fullTextAvailable: true,
    readerNote:
      "The exact assigned PDF translation is modern course material, so the app treats the lecture and the public-domain translation as study scaffolding rather than as identical texts.",
    sourceProvenance: [
      {
        label: "Internet Classics Archive - Lysias 1 (public-domain translation)",
        url: "https://classics.mit.edu/Lysias/lys.1.html",
        note: "Safe public-domain full text for section-by-section reading."
      },
      {
        label: "Week 7 lecture script",
        note: "Primary course framing for the law, the homicide exception, and the rhetoric of household danger."
      }
    ],
    sections: [
      {
        id: "lysias-opening-frame",
        label: "Opening Identification Strategy",
        span: "Lysias 1 [1]-[5]",
        summary:
          "The speech begins by asking the jurors to judge as householders and husbands before they judge as technical interpreters of homicide law.",
        note:
          "This is the basic rhetorical move of the whole defense. Euphiletos wants the jury to feel the wrong first and sort out the legal category second.",
        whyItMatters:
          "Use this section when explaining why the speech is about the construction of criminality, not only about the formal fact of a killing.",
        relatedWeekIds: ["week-6", "week-7"],
        relatedTerms: ["jury identification", "household", "logographer"],
        passages: [
          {
            id: "lysias-opening-fury",
            citation: "Lysias 1 opening",
            quote:
              "If you employed the same standards for others as you do for your own behaviour, there is not a single one of you who would not be furious...",
            context:
              "Before the defense lays out doctrine, it asks the jurors to inhabit the same injured masculine role.",
            analysis:
              "Treat this as the speech's emotional foundation: the jury is being taught how to feel before it is being taught how to classify."
          }
        ]
      },
      {
        id: "lysias-lawful-killing",
        label: "Lawful Killing and Draco's Exception",
        span: "Lysias 1 [4] and legal framing",
        summary:
          "Euphiletos does not deny the homicide. He argues that the killing falls inside a lawful exception and should therefore not count as murder.",
        note:
          "The lecture repeatedly warns that the exception is narrower than the speech makes it sound. That tension is the legal core of the case.",
        whyItMatters:
          "This section is essential for distinguishing lawful self-help from a generalized death penalty for adultery.",
        relatedWeekIds: ["week-3", "week-7"],
        relatedTerms: ["Draco", "homicide exception", "lawful self-help"],
        passages: [
          {
            id: "lysias-law-allows",
            citation: "Lysias 1 [4]",
            quote:
              "I believe, gentlemen, that what I have to demonstrate is this: that Eratosthenes seduced my wife and corrupted her ... except revenge, as the law allows.",
            context:
              "The defense condenses seduction, household shame, and legal permission into one opening claim.",
            analysis:
              "For study purposes, this is the speech's thesis statement. It is where a homicide defense becomes a story about household corruption."
          }
        ]
      },
      {
        id: "lysias-evidence-and-witnesses",
        label: "Evidence, Witnesses, and Restraint",
        span: "Lysias 1 [18]-[24]",
        summary:
          "Euphiletos insists that he waited for direct proof, gathered witnesses, and acted only after the adulterer was caught in flagrante delicto.",
        note:
          "The speech needs this section because otherwise Euphiletos could look like a man luring a rival into a premeditated killing.",
        whyItMatters:
          "This is where the defense tries hardest to sound procedural, measured, and almost judicial.",
        relatedWeekIds: ["week-3", "week-7"],
        relatedTerms: ["witnesses", "clear evidence", "premeditation"],
        passages: [
          {
            id: "lysias-clear-evidence",
            citation: "Lysias 1 [21]",
            quote: "I expect you to show me them in the act. For I do not need words, but clear evidence...",
            context:
              "Euphiletos reports his demand for proof from the household informant before he confronts Eratosthenes.",
            analysis:
              "The phrase 'clear evidence' is rhetorical gold: it makes private violence look disciplined and evidentiary."
          }
        ]
      },
      {
        id: "lysias-seducer-type",
        label: "The Seducer as Civic Threat",
        span: "Late defense strategy",
        summary:
          "The dead man is reconstructed as the type of dangerous seducer who corrupts households, children, inheritance, and civic order.",
        note:
          "This is where the speech's social imagination does the most work. Eratosthenes becomes more than an adulterer; he becomes a category of menace.",
        whyItMatters:
          "Use this section when comparing Lysias to modern character-based arguments or to the seducer logic already visible in the Oresteia.",
        relatedWeekIds: ["week-4", "week-6", "week-7"],
        relatedTerms: ["seducer", "household order", "legitimacy"],
        passages: [
          {
            id: "lysias-real-criminal",
            citation: "Lecture framing of Lysias 1",
            quote: "The defendant presents himself as the victim of a crime and the man he killed as the real criminal.",
            context:
              "The lecture's summary captures the speech's deepest inversion.",
            analysis:
              "This is the line to remember if asked who the speech wants the jury to see as the true offender."
          }
        ]
      }
    ],
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
    fullTextAvailable: true,
    readerNote:
      "The dialogue is long, so the app organizes it by argumentative movements rather than by trying to make you memorize every exchange in sequence.",
    sourceProvenance: [
      {
        label: "Internet Classics Archive - Plato, Gorgias (Jowett translation, public domain)",
        url: "https://classics.mit.edu/Plato/gorgias.html",
        note: "Safe public-domain full text for reading the dialogue in full."
      },
      {
        label: "Week 8 lecture script",
        note: "Primary course framing for rhetoric, punishment, and criminological comparison."
      }
    ],
    sections: [
      {
        id: "gorgias-rhetoric-definition",
        label: "What Rhetoric Claims To Be",
        span: "Early dialogue with Gorgias",
        summary:
          "Socrates presses Gorgias to define rhetoric precisely, exposing the gap between persuasive success and genuine knowledge.",
        note:
          "This section matters because law-courts are already inside the definition. Crime and punishment are present before punishment is explicitly discussed.",
        whyItMatters:
          "Use it to explain why Plato is the philosophical background for both Lysias and Cicero.",
        relatedWeekIds: ["week-8"],
        relatedTerms: ["rhetoric", "sophist", "Gorgias"],
        passages: [
          {
            id: "gorgias-law-courts",
            citation: "Gorgias 454b",
            quote:
              "Its effect is to persuade people in the kinds of mass meetings which happen in law-courts and so on; and I think its province is right and wrong.",
            context:
              "Gorgias identifies the social spaces where rhetoric naturally operates.",
            analysis:
              "The course uses this as proof that rhetoric is already bound to adjudication and civic decision-making."
          }
        ]
      },
      {
        id: "gorgias-polus-power",
        label: "Polus, Success, and the Appeal of Power",
        span: "Middle dialogue",
        summary:
          "Polus resists Socrates by treating successful wrongdoing as enviable power rather than as inner damage.",
        note:
          "This section gives you the anti-Socratic position that makes the later theory of punishment as cure meaningful.",
        whyItMatters:
          "It helps connect the dialogue to rational-choice and power-centered explanations of crime.",
        relatedWeekIds: ["week-6", "week-8"],
        relatedTerms: ["Polus", "power", "rational choice"],
        passages: [
          {
            id: "gorgias-power-appeal",
            citation: "Week 8 lecture discussion of Polus",
            quote: "Polus sees punishment as the unhappy consequence of crime rather than as something intrinsically good.",
            context:
              "The lecture uses Polus to articulate the intuitive attraction of unpunished wrongdoing.",
            analysis:
              "Remember Polus whenever the course contrasts success, force, and moral repair."
          }
        ]
      },
      {
        id: "gorgias-callicles-physis",
        label: "Callicles, Nature, and Anti-Conventional Justice",
        span: "Callicles' challenge",
        summary:
          "Callicles argues that conventional law is a weak collective restraint imposed on the naturally stronger and bolder.",
        note:
          "This is the dialogue's harshest challenge to shared civic justice and one of the clearest places where `physis` and `nomos` collide.",
        whyItMatters:
          "Study this section if you need to explain why Plato treats rhetoric as politically dangerous, not just morally slippery.",
        relatedWeekIds: ["week-8"],
        relatedTerms: ["Callicles", "physis", "nomos"],
        passages: [
          {
            id: "gorgias-callicles-frame",
            citation: "Week 8 lecture on Callicles",
            quote: "Callicles rejects conventional justice by treating law as an artificial restraint imposed by the weak.",
            context:
              "The lecture uses Callicles as the extreme version of anti-Socratic power politics.",
            analysis:
              "This is the best section to cite when asked what the dialogue contributes beyond courtroom technique."
          }
        ]
      },
      {
        id: "gorgias-punishment-cure",
        label: "Punishment as Cure",
        span: "Socratic answer to Polus and Callicles",
        summary:
          "Socrates argues that doing wrong harms the wrongdoer more deeply than suffering wrong and that punishment can therefore be beneficial.",
        note:
          "This is the course's cleanest ancient argument for rehabilitation without reducing punishment to softness or indulgence.",
        whyItMatters:
          "It lets you compare rehabilitative and deterrent ideas inside one ancient text instead of treating them as purely modern theories.",
        relatedWeekIds: ["week-6", "week-8"],
        relatedTerms: ["punishment as cure", "rehabilitation", "self-discipline"],
        passages: [
          {
            id: "gorgias-predatory-outlaw",
            citation: "Gorgias 507c-e",
            quote:
              "Anyone who wants to be happy must seek out and practise self-discipline ... This is the life of a predatory outlaw.",
            context:
              "Socrates links happiness to justice, restraint, and life with others.",
            analysis:
              "The point is not merely personal morality. The lecture reads this as an anti-predatory model of civic existence."
          },
          {
            id: "gorgias-worse-to-do-wrong",
            citation: "Gorgias 508d-e",
            quote:
              "It is more contemptible, and worse as well, to hit and cut me and my property without just cause ... than it is for me, the target of his wrongdoing.",
            context:
              "Socrates argues that wrongdoing damages the offender's soul.",
            analysis:
              "This is the most concise statement of crime as self-deformation in the whole course."
          }
        ]
      },
      {
        id: "gorgias-deterrence-afterlife",
        label: "Example, Spectacle, and Deterrence",
        span: "Late myth and afterlife argument",
        summary:
          "The dialogue ends by saying punishment should improve the punished person or serve as an example to others who witness it.",
        note:
          "This is where deterrence and rehabilitation sit side by side rather than replacing one another.",
        whyItMatters:
          "Use this section when asked how ancient texts can anticipate more than one modern theory of punishment at once.",
        relatedWeekIds: ["week-6", "week-8", "week-11"],
        relatedTerms: ["deterrence", "example", "punishment"],
        passages: [
          {
            id: "gorgias-example-others",
            citation: "Gorgias 525b-c",
            quote:
              "Every instance of punishment should either help its recipient by making him a better person or should act as an example for others.",
            context:
              "Late in the dialogue Socrates connects punishment to moral repair and public warning.",
            analysis:
              "This passage is ideal for comparative answers because it names both functions directly."
          }
        ]
      }
    ],
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
    fullTextAvailable: true,
    readerNote:
      "This reading works best when you treat it as both crisis narrative and argument about classification: citizen, criminal, rebel, enemy, and hero are all in play.",
    sourceProvenance: [
      {
        label: "Perseus Catalog - Sallust, Catiline's War (public-domain English)",
        url: "https://catalog.perseus.org/catalog/urn%3Acts%3AlatinLit%3Aphi0631.phi001.perseus-eng1",
        note: "Safe public-domain access point for the full text."
      },
      {
        label: "Week 11 lecture script",
        note: "Primary course framing for chronology, emergency power, and the criminal-versus-enemy problem."
      }
    ],
    sections: [
      {
        id: "catiline-social-crisis",
        label: "Social Crisis and the Appeal of Catiline",
        span: "Opening narrative and background",
        summary:
          "Sallust frames the conspiracy as a product of elite corruption, debt, frustration, and a wider diseased social order rather than as one isolated criminal mind.",
        note:
          "This section is where the course gets its strongest relative-deprivation reading of the Roman material.",
        whyItMatters:
          "Use it when explaining why Catiline has followers and why the urban plebs matter to the narrative.",
        relatedWeekIds: ["week-6", "week-10", "week-11"],
        relatedTerms: ["relative deprivation", "plebs", "debt crisis"],
        passages: [
          {
            id: "catiline-plebs",
            citation: "Catiline's War 24-25",
            quote: "The entire plebs, in its enthusiasm for revolution, approved completely of Catiline's projects.",
            context:
              "Sallust expands the crisis from one aristocratic conspirator to a broader political atmosphere.",
            analysis:
              "This is the cleanest passage for connecting social grievance to criminal or revolutionary mobilization."
          }
        ]
      },
      {
        id: "catiline-emergency-timeline",
        label: "Emergency Timeline and the SCU",
        span: "63 BCE chronology",
        summary:
          "The crisis escalates through letters, the SCU, revolt in Etruria, arrests, Senate debate, and executions without trial.",
        note:
          "Chronology matters here because the legal frame changes as the crisis escalates. Delay itself becomes part of the rhetoric of danger.",
        whyItMatters:
          "This is the section to study if you need to explain when suspects are still citizens and when they are pushed toward hostis status.",
        relatedWeekIds: ["week-10", "week-11"],
        relatedTerms: ["SCU", "hostis", "provocatio"],
        passages: [
          {
            id: "catiline-scu-frame",
            citation: "Week 11 lecture chronology",
            quote: "The SCU advises extraordinary measures but does not magically erase later legal responsibility.",
            context:
              "The lecture stresses that emergency decree and legality are not the same thing.",
            analysis:
              "Remember this when explaining why Cicero later becomes vulnerable for what he did in the emergency."
          }
        ]
      },
      {
        id: "catiline-caesar",
        label: "Caesar's Criminal-Punishment Frame",
        span: "Senate debate on 5 December 63 BCE",
        summary:
          "Caesar rejects execution without trial, but he does not become a simple soft option. He proposes confiscation and severe confinement instead.",
        note:
          "The course treats Caesar as someone trying to keep the captives inside a criminal-punishment frame, albeit a harsh one.",
        whyItMatters:
          "This is the best section for showing that Roman arguments about rights and punishment are already entangled with security logic.",
        relatedWeekIds: ["week-10", "week-11"],
        relatedTerms: ["Caesar", "detention", "citizenship"],
        passages: [
          {
            id: "catiline-caesar-prison",
            citation: "Catiline's War 37",
            quote:
              "Their money should be confiscated and they themselves held in chains in the municipalities which have the most effective resources.",
            context:
              "Caesar opposes execution but proposes an unusually strong custodial alternative.",
            analysis:
              "This matters because long-term punitive detention is relatively unclassical and shows how unstable the category of punishment becomes in emergencies."
          }
        ]
      },
      {
        id: "catiline-cato",
        label: "Cato's Enemy-War Frame",
        span: "Same Senate debate",
        summary:
          "Cato insists that the Senate is not really sentencing ordinary criminals. It is signaling resolve in an active war against enemies inside and outside the city.",
        note:
          "This is the decisive reframing move of the week: once the conspirators are treated as war enemies, the demand for ordinary trial weakens.",
        whyItMatters:
          "Use this section when asked how criminal law gives way to preemption, deterrence, and military logic.",
        relatedWeekIds: ["week-10", "week-11"],
        relatedTerms: ["Cato", "hostis", "deterrence"],
        passages: [
          {
            id: "catiline-cato-decree",
            citation: "Catiline's War 39",
            quote:
              "When you decide about P. Lentulus and the others, be assured that at the same time you are issuing a decree about Catiline's army.",
            context:
              "Cato turns sentencing into strategic messaging for the larger conflict.",
            analysis:
              "The key point is that punishment is now military theater as much as judicial response."
          }
        ]
      },
      {
        id: "catiline-heroic-end",
        label: "Catiline as Criminal and Hero",
        span: "Battle ending",
        summary:
          "Sallust ends by making Catiline die with the bravery of a Roman hero even though the state has defined him as an enemy.",
        note:
          "The text never lets the classification settle. That instability is the whole point of using Sallust in the course.",
        whyItMatters:
          "This section is ideal for answers about insider versus outsider and about the contradictions of political criminality.",
        relatedWeekIds: ["week-11", "week-12"],
        relatedTerms: ["heroism", "enemy combatant", "insider-outsider"],
        passages: [
          {
            id: "catiline-final-charge",
            citation: "Catiline's War 46",
            quote:
              "Mindful of his lineage and his own old-time status, he rushed into the thickest of the enemy and there, fighting, was stabbed.",
            context:
              "Catiline dies in a way that looks admirable by traditional Roman martial standards.",
            analysis:
              "This is the passage to use when arguing that the worst criminal can still be represented with aristocratic or heroic dignity."
          }
        ]
      }
    ],
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
    fullTextAvailable: true,
    readerNote:
      "Read this speech as courtroom performance. The legal charge matters, but the speech wins by making the jurors inhabit a different genre before they decide the case.",
    sourceProvenance: [
      {
        label: "Internet Classics Archive - Cicero, Pro Caelio (public-domain translation)",
        url: "https://classics.mit.edu/Cicero/cic.cael.html",
        note: "Safe public-domain full text for reading the speech in full."
      },
      {
        label: "Week 12 lecture script",
        note: "Primary course framing for vis, theatrical substitution, Clodia, and character-based criminality."
      }
    ],
    sections: [
      {
        id: "caelio-opening",
        label: "Opening Frame and the Holiday Court",
        span: "Pro Caelio 1",
        summary:
          "Cicero opens by stressing how grave the forum must look to an outsider, only so he can make the charge on `vis` feel absurdly overblown once Caelius is recast as harmless.",
        note:
          "The speech begins with legal seriousness, not because Cicero wants to dwell on doctrine, but because he needs the seriousness as the setup for his mockery.",
        whyItMatters:
          "This section is the clearest proof that the defense is really fighting over interpretive frame, not simply factual detail.",
        relatedWeekIds: ["week-10", "week-12"],
        relatedTerms: ["vis", "Megalensia", "theatrical substitution"],
        passages: [
          {
            id: "caelio-opening-overkill",
            citation: "Pro Caelio 1",
            quote:
              "If somebody were here who knew nothing about our laws, our courts, and our customs ... he would have no doubt that the defendant is charged with so massive a crime that to leave it unattended would result in the collapse of the state.",
            context:
              "Cicero dramatizes the legal setting before undercutting it.",
            analysis:
              "The opening teaches the jurors that the case can be won by making the forum itself look mismatched to the accused."
          }
        ]
      },
      {
        id: "caelio-catiline-problem",
        label: "Caelius, Catiline, and Dangerous Association",
        span: "Early character work",
        summary:
          "Cicero must neutralize Caelius' earlier connection to Catiline without letting Catiline stop being the villain of last week's material.",
        note:
          "This is where Cicero's rhetorical flexibility is most obvious. Catiline becomes so slippery and protean that Caelius can be excused for once moving in his orbit.",
        whyItMatters:
          "Study this section if you need to connect Weeks 11 and 12 in a single answer about criminal identity and elite politics.",
        relatedWeekIds: ["week-11", "week-12"],
        relatedTerms: ["Catiline", "Caelius", "character evidence"],
        passages: [
          {
            id: "caelio-catiline-description",
            citation: "Week 12 lecture on Cicero's description of Catiline",
            quote: "Cicero repurposes last week's villain into someone so deceptive that mere association no longer proves Caelius' guilt.",
            context:
              "The lecture stresses that courtroom rhetoric is driven by present advantage, not by stable personal conviction.",
            analysis:
              "This is the comparative bridge back to Lysias: both speeches reshape identity to solve a legal problem."
          }
        ]
      },
      {
        id: "caelio-clodia-theater",
        label: "Clodia as Stage Type",
        span: "Middle of the speech",
        summary:
          "Cicero converts Clodia from elite woman and former lover into a stock comic type whose narrative can be dismissed as theatrical fabrication.",
        note:
          "The speech's gender politics matter here. Clodia is both historical participant and rhetorical dumping ground.",
        whyItMatters:
          "This is the section to use when asked how the speech relies on misogyny, sexual double standards, and genre.",
        relatedWeekIds: ["week-6", "week-12"],
        relatedTerms: ["Clodia", "comedy", "gender", "character construction"],
        passages: [
          {
            id: "caelio-aging-poet",
            citation: "Pro Caelio 64",
            quote:
              "This whole tale ... belongs to an aging lady poet who has written a lot of comedies - but it has no plot and no ending.",
            context:
              "Cicero accuses the prosecution of theatrical fabrication while staging the whole case theatrically himself.",
            analysis:
              "The line is essential because it shows the speech projecting its own strategy onto the other side."
          }
        ]
      },
      {
        id: "caelio-law-on-vis",
        label: "Returning to the Law on Vis",
        span: "Closing movement",
        summary:
          "After long stretches of ridicule, Cicero returns to the law itself and insists that a statute designed for riots and insurrection is being abused for private erotic revenge.",
        note:
          "This return to doctrine is strategic. Cicero can only make it work after he has already privatized the case through comedy and scandal.",
        whyItMatters:
          "This section is where the speech most clearly intersects with the Roman state's growing claim over violence.",
        relatedWeekIds: ["week-10", "week-12"],
        relatedTerms: ["vis", "state violence", "public versus private"],
        passages: [
          {
            id: "caelio-vis-statute",
            citation: "Pro Caelio 70",
            quote:
              "This is the law under which this young man Caelius is being prosecuted not to exact punishment on behalf of the commonwealth but on behalf of the sexual perversions of this woman.",
            context:
              "Cicero fuses public-law seriousness and private scandal at the very end of the speech.",
            analysis:
              "Remember this as the clearest statement of the speech's privatizing strategy."
          }
        ]
      },
      {
        id: "caelio-riggsby",
        label: "Riggsby and the Bigger Roman Shift",
        span: "Lecture's modern scholarship frame",
        summary:
          "The lecture uses Andrew Riggsby to argue that the speech reveals a Roman world in which the state is increasingly trying to centralize legitimate force while advocacy still turns law into theater.",
        note:
          "This section is not a primary-text movement, but it is crucial for understanding why the course assigns the speech in a crime-and-punishment course rather than only in a rhetoric course.",
        whyItMatters:
          "Use it when explaining how Week 12 synthesizes rhetoric, criminality, and the rise of stronger public claims over violence.",
        relatedWeekIds: ["week-10", "week-12"],
        relatedTerms: ["Riggsby", "vis", "state monopoly on violence"],
        passages: [
          {
            id: "caelio-riggsby-theater",
            citation: "Week 12 lecture quoting Riggsby",
            quote: "Cicero invites the jurors to view themselves as a comic, not a judicial, audience.",
            context:
              "Riggsby gives the lecture its clearest vocabulary for theatrical substitution.",
            analysis:
              "This is the best secondary-source sentence to remember for explaining the speech's genre strategy."
          }
        ]
      }
    ],
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
    priority: "foundation",
    themes: ["bridge review", "greek synthesis", "transition"],
    headline: "No lecture script survives here, so the week functions as a Greek review and transition module."
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
    priority: "foundation",
    themes: ["bridge review", "greek to roman transition", "comparison"],
    headline: "No lecture script survives here, so the week functions as the bridge from Greek argument to Roman law."
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
      const bridgeSummary = section?.preview || meta.headline;
      const lectureThesis = extractFirstSubsection(section?.markdown, [
        "Bridge thesis",
        "Why this bridge week matters",
        "Why this bridge is doing",
        "Why this week still matters"
      ]);
      const whyItMatters = extractFirstSubsection(section?.markdown, [
        "What to review in this gap week",
        "What to carry forward into Week 10",
        "Roman preview"
      ]);
      const examTrap =
        stripMarkdown(extractFirstSubsection(section?.markdown, ["Exam trap"])) ||
        "Use the surrounding lectures to review and connect material rather than inventing missing lecture claims.";

      return {
        id: moduleId,
        week: weekLabel,
        title: section?.title || `${weekLabel}: Bridge Week`,
        shortTitle: section?.title?.split(":").slice(1).join(":").trim() || "Bridge week",
        family: meta.family,
        priority: meta.priority,
        themes: meta.themes,
        headline: meta.headline,
        isBridgeWeek: true,
        hasLectureContent: false,
        summary:
          bridgeSummary ||
          "This week has no standalone lecture script in the local archive, so it is treated as a bridge module rather than a fabricated content week.",
        lectureThesis:
          stripMarkdown(lectureThesis) ||
          "Use adjacent weeks to consolidate the course argument and move into the next major block without inventing missing lecture claims.",
        whyItMatters:
          stripMarkdown(whyItMatters) ||
          "The gap itself is informative: it is the right place to review, synthesize, and compare surrounding weeks.",
        historicalContext: stripMarkdown(
          extractFirstSubsection(section?.markdown, ["What to review in this gap week", "What this bridge is doing"])
        ),
        comparisonLens: stripMarkdown(
          extractFirstSubsection(section?.markdown, ["Roman preview", "What to carry forward into Week 10"])
        ),
        examAdvice: stripMarkdown(extractFirstSubsection(section?.markdown, ["Bridge checklist"])),
        sourceFrame:
          "Bridge week built from the surrounding guide sections because no separate lecture-script file survives in the local archive.",
        bridgeSummary: bridgeSummary,
        comparisonTakeaways: [],
        keyTerms: [],
        keyInstitutions: [],
        chronology: [],
        selfCheck: dedupeStrings(
          extractFirstSubsection(section?.markdown, ["Bridge checklist"])
            .split(/\r?\n/)
            .map((line) => line.replace(/^\d+\.\s*/, "").trim())
            .filter(Boolean)
        ).length
          ? dedupeStrings(
              extractFirstSubsection(section?.markdown, ["Bridge checklist"])
                .split(/\r?\n/)
                .map((line) => line.replace(/^\d+\.\s*/, "").trim())
                .filter(Boolean)
            )
          : [
              "Can you explain how the previous and next lecture connect without making up missing content?",
              "Can you tell which source in the archive actually covers the concept you are studying?"
            ],
        concepts: [],
        passages: [],
        comparisons: [],
        pitfalls: examTrap ? [examTrap] : [],
        narrativeIntro:
          bridgeSummary ||
          "Use this bridge week to connect the surrounding units instead of treating the archive gap as missing knowledge.",
        likelyQuestionAngles: dedupeStrings(
          extractFirstSubsection(section?.markdown, ["Bridge checklist"])
            .split(/\r?\n/)
            .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        ).slice(0, 4),
        relatedTimelineIds: [],
        guideSectionId: section?.id || null,
        guidePreview: section?.preview || "",
        relatedReadingIds,
        relatedReadings
      };
    }

    const titleMatch = section?.title?.split(":");
    const shortTitle = titleMatch && titleMatch.length > 1 ? titleMatch.slice(1).join(":").trim() : weekLabel;
    const lectureThesis =
      extractFirstSubsection(section?.markdown, ["What this lecture is arguing", "Lecture frame in plain English"]) ||
      dedupeStrings(moduleTopics.map((topic) => topic.argument)).join(" ");
    const whyItMatters =
      extractFirstSubsection(section?.markdown, ["Why this matters for crime and punishment", "Why this week matters"]) ||
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
      isBridgeWeek: false,
      hasLectureContent: true,
      summary: section?.preview || moduleTopics[0]?.summary || "",
      lectureThesis: stripMarkdown(lectureThesis),
      whyItMatters: stripMarkdown(whyItMatters),
      historicalContext: stripMarkdown(
        extractFirstSubsection(section?.markdown, [
          "Historical background to the conspiracy",
          "History and background",
          "Background to the conspiracy",
          "Background to the case at hand",
          "Ancient case study: Publius Claudius Pulcher and the sacred chickens",
          "What this week matters",
          "Why this week matters",
          "What this lecture teaches"
        ])
      ),
      comparisonLens: stripMarkdown(extractSubsection(section?.markdown, "Ancient vs modern comparison")),
      examAdvice: stripMarkdown(extractSubsection(section?.markdown, "Study questions answered")),
      sourceFrame: stripMarkdown(extractSubsection(section?.markdown, "The Five Things")),
      bridgeSummary: "",
      comparisonTakeaways: moduleTopics.flatMap((topic) => topic.comparisons || []).slice(0, 4),
      examTrap,
      keyTerms: dedupeStrings(moduleTopics.flatMap((topic) => topic.terms || [])),
      keyInstitutions: dedupeStrings([
        ...moduleTopics.flatMap((topic) => (topic.concepts || []).map((concept) => concept.term)),
        ...moduleTopics.flatMap((topic) => topic.terms || [])
      ]).slice(0, 8),
      chronology: dedupeStrings(moduleTopics.flatMap((topic) => topic.events || [])),
      selfCheck: dedupeStrings(moduleTopics.flatMap((topic) => topic.studyQuestions || [])),
      concepts: moduleTopics.flatMap((topic) => topic.concepts || []).slice(0, 8),
      passages: moduleTopics.flatMap((topic) => topic.passages || []),
      comparisons: moduleTopics.flatMap((topic) => topic.comparisons || []).slice(0, 4),
      pitfalls: dedupeStrings(moduleTopics.flatMap((topic) => topic.pitfalls || [])),
      topics: moduleTopics,
      narrativeIntro: dedupeStrings([
        section?.preview,
        moduleTopics[0]?.summary,
        moduleTopics[0]?.argument,
        moduleTopics[0]?.whyItMatters
      ]).join(" "),
      likelyQuestionAngles: dedupeStrings(moduleTopics.flatMap((topic) => topic.studyQuestions || [])).slice(0, 5),
      relatedTimelineIds: [],
      guideSectionId: section?.id || null,
      guidePreview: section?.preview || "",
      relatedReadingIds,
      relatedReadings
    };
  });
}

function inferReadingLocation(question) {
  const source = String(question.sourceRef || "").toLowerCase();

  const mappings = [
    {
      when: () => question.week === "Week 7" && source.includes("[21]"),
      value: { readingSectionId: "lysias-evidence-and-witnesses", readingPassageId: "lysias-clear-evidence" }
    },
    {
      when: () => question.week === "Week 7" && source.includes("[4]"),
      value: { readingSectionId: "lysias-lawful-killing", readingPassageId: "lysias-law-allows" }
    },
    {
      when: () => question.week === "Week 7" && source.includes("opening"),
      value: { readingSectionId: "lysias-opening-frame", readingPassageId: "lysias-opening-fury" }
    },
    {
      when: () => question.week === "Week 8" && source.includes("454"),
      value: { readingSectionId: "gorgias-rhetoric-definition", readingPassageId: "gorgias-law-courts" }
    },
    {
      when: () => question.week === "Week 8" && source.includes("525"),
      value: { readingSectionId: "gorgias-deterrence-afterlife", readingPassageId: "gorgias-example-others" }
    },
    {
      when: () => question.week === "Week 8" && (source.includes("507") || source.includes("508")),
      value: { readingSectionId: "gorgias-punishment-cure", readingPassageId: "gorgias-predatory-outlaw" }
    },
    {
      when: () => question.week === "Week 11" && (source.includes("24") || source.includes("25")),
      value: { readingSectionId: "catiline-social-crisis", readingPassageId: "catiline-plebs" }
    },
    {
      when: () => question.week === "Week 11" && source.includes("37"),
      value: { readingSectionId: "catiline-caesar", readingPassageId: "catiline-caesar-prison" }
    },
    {
      when: () => question.week === "Week 11" && source.includes("39"),
      value: { readingSectionId: "catiline-cato", readingPassageId: "catiline-cato-decree" }
    },
    {
      when: () => question.week === "Week 11" && source.includes("46"),
      value: { readingSectionId: "catiline-heroic-end", readingPassageId: "catiline-final-charge" }
    },
    {
      when: () => question.week === "Week 12" && source.includes("64"),
      value: { readingSectionId: "caelio-clodia-theater", readingPassageId: "caelio-aging-poet" }
    },
    {
      when: () => question.week === "Week 12" && source.includes("70"),
      value: { readingSectionId: "caelio-law-on-vis", readingPassageId: "caelio-vis-statute" }
    },
    {
      when: () => question.week === "Week 12" && source.includes("riggsby"),
      value: { readingSectionId: "caelio-riggsby", readingPassageId: "caelio-riggsby-theater" }
    },
    {
      when: () => question.week === "Week 12" && source.includes("1"),
      value: { readingSectionId: "caelio-opening", readingPassageId: "caelio-opening-overkill" }
    }
  ];

  return mappings.find((mapping) => mapping.when())?.value || {};
}

function buildStudyRef(question) {
  if (question.studyRef) {
    return question.studyRef;
  }

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
    readingId: relatedReadingId,
    ...inferReadingLocation(question)
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
    difficulty: question.difficulty || "medium",
    tags: dedupeStrings(question.tags || []),
    variantGroup: question.variantGroup || question.id,
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
              reading.readerNote,
              ...(reading.relatedTerms || []),
              ...reading.excerpts.map((excerpt) => excerpt.quote),
              ...(reading.sections || []).flatMap((section) => [
                section.label,
                section.summary,
                section.note,
                section.whyItMatters,
                ...(section.relatedTerms || []),
                ...((section.passages || []).flatMap((passage) => [
                  passage.citation,
                  passage.quote,
                  passage.context,
                  passage.analysis
                ]))
              ])
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

function attachTimelineEventsToModules(weekModules, timelineEvents) {
  const timelineIdsByModule = timelineEvents.reduce((accumulator, event) => {
    event.moduleIds.forEach((moduleId) => {
      accumulator[moduleId] = accumulator[moduleId] || [];
      accumulator[moduleId].push(event.id);
    });
    return accumulator;
  }, {});

  return weekModules.map((module) => ({
    ...module,
    relatedTimelineIds: dedupeStrings([...(module.relatedTimelineIds || []), ...(timelineIdsByModule[module.id] || [])])
  }));
}

const timeline = rawTimelineEvents.length ? normalizeTimelineEvents(rawTimelineEvents) : parseTimeline(guideSections.timelineSection);
const weekModules = attachTimelineEventsToModules(
  buildWeekModules(rawStudyTopics, guideSections.weekSections, readingDossiers),
  timeline
);
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
