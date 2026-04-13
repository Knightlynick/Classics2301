const coreQuestions = [
  {
    id: "q01",
    week: "Week 1",
    topic: "Ancient and Modern Punishment",
    priority: "foundation",
    weight: 1,
    prompt: "Which contrast does Week 1 use as one of the clearest differences between ancient and modern punishment?",
    choices: ["Exile in antiquity versus long-term imprisonment in modernity", "Fines in antiquity versus fines in modernity", "Trials in antiquity versus trials in modernity", "Judges in antiquity versus judges in modernity"],
    correctIndex: 0,
    explanation: "The lecture stresses that exile is a major ancient punishment, while long-term prison as correction is a modern centerpiece.",
    sourceRef: "Week 1 Lecture Script"
  },
  {
    id: "q02",
    week: "Week 1",
    topic: "Public and Private Cases",
    priority: "foundation",
    weight: 1,
    prompt: "Why does the course use the O.J. Simpson example in Week 1?",
    choices: ["To show how one event can produce both criminal and civil proceedings", "To prove modern juries are unreliable", "To compare Roman senate trials with Canadian courts", "To show that homicide is always a public crime"],
    correctIndex: 0,
    explanation: "The point is the split between public prosecution and private redress, not O.J. as a historical parallel to antiquity.",
    sourceRef: "Week 1 Lecture Script"
  },
  {
    id: "q03",
    week: "Week 1",
    topic: "Sacred Chickens",
    priority: "foundation",
    weight: 1,
    prompt: "What does the case of Publius Claudius Pulcher and the sacred chickens mainly illustrate?",
    choices: ["That Roman public wrongs could combine religion, war, politics, and procedure", "That Roman law ignored religion completely", "That Roman consuls could never be prosecuted", "That Roman trials always lasted multiple days"],
    correctIndex: 0,
    explanation: "The story is a deliberately strange example showing that Roman public accountability does not map neatly onto modern criminal categories.",
    sourceRef: "Week 1 Lecture Script"
  },
  {
    id: "q04",
    week: "Week 2",
    topic: "Greek Periods",
    priority: "foundation",
    weight: 1,
    prompt: "Aeschylus and the Oresteia belong to which major Greek period?",
    choices: ["Classical", "Dark Age", "Hellenistic", "Neolithic"],
    correctIndex: 0,
    explanation: "Aeschylus is an early Classical Athenian tragedian, not an Archaic lawgiver or Hellenistic author.",
    sourceRef: "Week 2 Historical Background materials"
  },
  {
    id: "q05",
    week: "Week 2",
    topic: "Hellenistic Chronology",
    priority: "foundation",
    weight: 1,
    prompt: "What event marks the beginning of the Hellenistic period in the course timeline?",
    choices: ["The death of Alexander in 323 BCE", "The Persian Wars", "The reforms of Solon", "The trial of Socrates"],
    correctIndex: 0,
    explanation: "The Hellenistic world begins after Alexander's death, when his empire breaks into successor kingdoms.",
    sourceRef: "Week 2 Historical Background materials"
  },
  {
    id: "q06",
    week: "Week 2",
    topic: "Roman Periodization",
    priority: "foundation",
    weight: 1,
    prompt: "What date does the course use for the beginning of the Roman Republic?",
    choices: ["509 BCE", "753 BCE", "287 BCE", "27 BCE"],
    correctIndex: 0,
    explanation: "509 BCE is the traditional date when the last king was expelled and the Republic began.",
    sourceRef: "Week 2 Historical Background materials"
  },
  {
    id: "q07",
    week: "Week 3",
    topic: "Greek Legal Terms",
    priority: "foundation",
    weight: 1,
    prompt: "In the Greek law material, a graphe is best understood as:",
    choices: ["A public prosecution", "A private inheritance settlement", "A priestly ritual", "A written appeal to Sparta"],
    correctIndex: 0,
    explanation: "A graphe is a public action, contrasted with private suits like dike.",
    sourceRef: "Week 3 Lecture Script"
  },
  {
    id: "q08",
    week: "Week 3",
    topic: "Lethal Self-Help",
    priority: "foundation",
    weight: 1,
    prompt: "What does 'lethal self-help' mean in the Greek law lectures?",
    choices: ["Legally permitted private violence in certain circumstances", "Random killing without law", "State executions carried out by magistrates", "Military service in wartime"],
    correctIndex: 0,
    explanation: "The lecture uses the phrase for cases where law regulates rather than abolishes private retaliatory force.",
    sourceRef: "Week 3 Lecture Script"
  },
  {
    id: "q09",
    week: "Week 3",
    topic: "Solonian Reform",
    priority: "foundation",
    weight: 1,
    prompt: "Why is Solon important in the law lectures?",
    choices: ["He is associated with reforms that widen access to appeal and civic legal process", "He created the Roman senate", "He wrote the Corpus Iuris Civilis", "He abolished all private cases at Athens"],
    correctIndex: 0,
    explanation: "Solon matters as a reformer whose legal and political changes broaden the role of the people in adjudication.",
    sourceRef: "Week 3 Lecture Script"
  },
  {
    id: "q10",
    week: "Week 3",
    topic: "Athenian Trials",
    priority: "foundation",
    weight: 1,
    prompt: "Which feature best matches the typical Athenian jury trial described in Week 3?",
    choices: ["Large citizen juries and strong dependence on litigant speeches", "A professional prosecutor appointed by the state", "A single judge issuing a written verdict", "Long-term imprisonment before sentencing"],
    correctIndex: 0,
    explanation: "Athenian trials depend on citizen juries and persuasive speech, not modern professional prosecution.",
    sourceRef: "Week 3 Lecture Script"
  },
  {
    id: "q11",
    week: "Week 4",
    topic: "Oresteia Sequence",
    priority: "foundation",
    weight: 1,
    prompt: "Which sequence is correct in the Oresteia?",
    choices: ["Clytemnestra kills Agamemnon, then Orestes kills Clytemnestra", "Orestes kills Agamemnon, then Athena kills Orestes", "Agamemnon kills Clytemnestra, then the Furies kill Athena", "Clytemnestra kills Orestes, then Agamemnon returns"],
    correctIndex: 0,
    explanation: "The trilogy centers on chained household revenge: Agamemnon dies, then Clytemnestra dies, then Orestes is pursued.",
    sourceRef: "Week 4 Lecture Script"
  },
  {
    id: "q12",
    week: "Week 4",
    topic: "Athena's Court",
    priority: "foundation",
    weight: 1,
    prompt: "What is the main significance of Athena's intervention at the end of the Oresteia?",
    choices: ["She turns a cycle of revenge into civic adjudication", "She abolishes all divine justice", "She proves blood vengeance is always superior to law", "She orders Orestes to go into Roman exile"],
    correctIndex: 0,
    explanation: "Athena creates a court, but the old logic of vengeance is not destroyed so much as incorporated.",
    sourceRef: "Week 4 Lecture Script"
  },
  {
    id: "q13",
    week: "Week 4",
    topic: "Eumenides",
    priority: "foundation",
    weight: 1,
    prompt: "What is the lecture's main point about the Eumenides at the end of the trilogy?",
    choices: ["They preserve the old force of vengeance inside the new civic order", "They disappear because divine justice no longer matters", "They become Roman praetors", "They prove the jury system is unnecessary"],
    correctIndex: 0,
    explanation: "The old avenging powers remain important; they are transformed, not erased.",
    sourceRef: "Week 4 Lecture Script"
  },
  {
    id: "q14",
    week: "Week 6",
    topic: "Defining Crime",
    priority: "high",
    weight: 2,
    prompt: "Which approach defines crime as something societies construct rather than as a universal natural category?",
    choices: ["Social constructionist", "Biological positivist", "Strictly legalist", "Military"],
    correctIndex: 0,
    explanation: "The social-constructionist approach is central to the course because it explains why ancient and modern categories do not line up neatly.",
    sourceRef: "Week 6 Lecture Script"
  },
  {
    id: "q15",
    week: "Week 6",
    topic: "Positivism",
    priority: "high",
    weight: 2,
    prompt: "Which figure is associated in the lecture with biological positivism?",
    choices: ["Cesare Lombroso", "Solon", "Cicero", "Hadrian"],
    correctIndex: 0,
    explanation: "Lombroso is the classic example of the attempt to identify criminality through bodily features.",
    sourceRef: "Week 6 Lecture Script"
  },
  {
    id: "q16",
    week: "Week 6",
    topic: "Relative Deprivation",
    priority: "high",
    weight: 2,
    prompt: "Relative deprivation theory is most concerned with:",
    choices: ["Feeling unfairly deprived of what one believes should be available", "Physical criminal markers", "The random order of tribal voting", "Religious pollution"],
    correctIndex: 0,
    explanation: "It is not just poverty but perceived unfair lack compared with expectation or entitlement.",
    sourceRef: "Week 6 Lecture Script"
  },
  {
    id: "q17",
    week: "Week 6",
    topic: "Victimological Other",
    priority: "high",
    weight: 2,
    prompt: "The victimological other is:",
    choices: ["A person who does not fit the expected public image of a victim", "A criminal disguised as a victim", "A public prosecutor", "A juror who votes for acquittal"],
    correctIndex: 0,
    explanation: "The term refers to people whose victimhood is culturally harder to recognize because they do not match familiar stereotypes.",
    sourceRef: "Week 6 Lecture Script"
  },
  {
    id: "q18",
    week: "Week 6",
    topic: "Social Control",
    priority: "high",
    weight: 2,
    prompt: "Social Control Theory most directly asks:",
    choices: ["What weakens the bonds that restrain people from offending", "How to compose legal speeches", "How many jurors sit on a quaestio", "Whether women could vote in Rome"],
    correctIndex: 0,
    explanation: "The theory focuses on the weakening of social ties, commitments, involvement, and belief.",
    sourceRef: "Week 6 Lecture Script"
  },
  {
    id: "q19",
    week: "Week 7",
    topic: "Author and Speaker",
    priority: "high",
    weight: 2,
    prompt: "In Lysias 1, who wrote the speech and who speaks it in court?",
    choices: ["Lysias wrote it; Euphiletos speaks it", "Euphiletos wrote it; Draco speaks it", "Solon wrote it; Lysias speaks it", "Eratosthenes wrote it; his family speaks it"],
    correctIndex: 0,
    explanation: "A key trap in this unit is confusing the author with the courtroom speaker.",
    sourceRef: "Week 7 Lecture Script"
  },
  {
    id: "q20",
    week: "Week 7",
    topic: "Draco's Law",
    priority: "high",
    weight: 2,
    prompt: "What is the lecture's most important warning about Draco's homicide law in this case?",
    choices: ["It creates a homicide exception; it is not simply a statute imposing death for adultery", "It abolishes homicide law entirely", "It makes all sexual misconduct a public crime", "It forbids witnesses in adultery cases"],
    correctIndex: 0,
    explanation: "The speech rhetorically inflates the law's support for the killing, but the legal logic is narrower.",
    sourceRef: "Week 7 Lecture Script"
  },
  {
    id: "q21",
    week: "Week 7",
    topic: "Seduction",
    priority: "high",
    weight: 2,
    prompt: "Why is seduction presented as worse than rape in the lecture on Lysias 1?",
    choices: ["Because it threatens household control, legitimacy, and inheritance from within", "Because Athenians thought violence was harmless", "Because rape was rewarded financially", "Because public cases could never involve sex"],
    correctIndex: 0,
    explanation: "Seduction is cast as more corrosive to the household because it creates ongoing intimacy and corruption.",
    sourceRef: "Week 7 Lecture Script"
  },
  {
    id: "q22",
    week: "Week 7",
    topic: "Clear Evidence",
    priority: "high",
    weight: 2,
    prompt: "Why does Euphiletos stress that he needed 'clear evidence' and witnesses?",
    choices: ["To avoid looking like a premeditated murderer acting on private hatred", "To prove he was a professional prosecutor", "To show that the Areopagus had already convicted Eratosthenes", "To claim the killing took place in Sparta"],
    correctIndex: 0,
    explanation: "The defense needs to show lawful confirmation and immediate response, not a private vendetta prepared long in advance.",
    sourceRef: "Lysias 1 [21]"
  },
  {
    id: "q23",
    week: "Week 7",
    topic: "Jury Identification",
    priority: "high",
    weight: 2,
    prompt: "What is the main function of the opening appeal that jurors would feel the same anger in Euphiletos' place?",
    choices: ["It invites the jury to identify with him as an ordinary householder", "It proves the legal statute word for word", "It denies Eratosthenes was in the house", "It turns the case into a public prosecution"],
    correctIndex: 0,
    explanation: "The speech is built around jury identification and shared social assumptions, not technical law alone.",
    sourceRef: "Lysias 1 opening"
  },
  {
    id: "q24",
    week: "Week 8",
    topic: "Polus",
    priority: "high",
    weight: 2,
    prompt: "What is Polus' position on a criminal who escapes punishment?",
    choices: ["He thinks such a criminal can still be happy", "He thinks punishment always improves the soul", "He thinks rhetoric has no political power", "He thinks only women can be criminals"],
    correctIndex: 0,
    explanation: "Polus treats punishment as bad for the offender, so avoiding it can look like success.",
    sourceRef: "Week 8 Lecture Script"
  },
  {
    id: "q25",
    week: "Week 8",
    topic: "Socrates on Punishment",
    priority: "high",
    weight: 2,
    prompt: "What is Socrates' most famous claim about punishment in the Gorgias material?",
    choices: ["It is better to be punished than to do wrong and escape punishment", "Punishment is always worse than the crime", "Rhetoricians should rule the city", "Nature and convention are identical"],
    correctIndex: 0,
    explanation: "Socrates treats punishment as corrective medicine for the soul rather than merely a deterrent threat.",
    sourceRef: "Week 8 Lecture Script"
  },
  {
    id: "q26",
    week: "Week 8",
    topic: "Callicles",
    priority: "high",
    weight: 2,
    prompt: "What contrast structures Callicles' argument against Socrates?",
    choices: ["Nature (physis) versus convention/law (nomos)", "Public versus private", "Citizen versus foreigner", "Army versus navy"],
    correctIndex: 0,
    explanation: "Callicles argues that the weak use convention and law to restrain the naturally stronger few.",
    sourceRef: "Week 8 Lecture Script"
  },
  {
    id: "q27",
    week: "Week 8",
    topic: "Rhetoric and Law",
    priority: "high",
    weight: 2,
    prompt: "Why is rhetoric so important in the Gorgias and in this course more broadly?",
    choices: ["Because persuasive speech can shape law, politics, and what a community accepts as true", "Because all Greek laws were written in verse", "Because rhetoric replaced military service", "Because juries never heard speeches"],
    correctIndex: 0,
    explanation: "The lecture repeatedly links rhetoric to the power to define justice, guilt, and political reality.",
    sourceRef: "Week 8 Lecture Script"
  },
  {
    id: "q28",
    week: "Week 10",
    topic: "Regal Period",
    priority: "roman-heavy",
    weight: 4,
    prompt: "How were disputes mainly resolved in the Roman regal period, according to the lecture?",
    choices: ["Largely by custom, patrons, and early religious-family regulation rather than a fully developed code", "By the Law of Citations", "By permanent jury courts for all crimes", "By imperial prefects and police cohorts"],
    correctIndex: 0,
    explanation: "The regal period is presented as a world of custom, priestly control, and patron-client assistance, not a mature legal bureaucracy.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q29",
    week: "Week 10",
    topic: "Twelve Tables",
    priority: "roman-heavy",
    weight: 4,
    prompt: "Why are the Twelve Tables so important in Roman legal history?",
    choices: ["They made written law public and became the iconic beginning of Roman law", "They created the emperor", "They abolished plebeians", "They introduced the Corpus Iuris Civilis"],
    correctIndex: 0,
    explanation: "Their publication reduced priestly secrecy and gave Romans a public written legal reference point.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q30",
    week: "Week 10",
    topic: "Praetors",
    priority: "roman-heavy",
    weight: 4,
    prompt: "What is the difference between the praetor urbanus and the praetor peregrinus?",
    choices: ["The urban praetor handled citizen cases; the peregrine praetor handled cases involving foreigners", "One commanded the navy and the other the cavalry", "One was patrician and the other plebeian", "One judged only adultery and the other only homicide"],
    correctIndex: 0,
    explanation: "The split appears when Rome needs more formal legal administration for cases involving non-Romans.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q31",
    week: "Week 10",
    topic: "Centuriate Assembly",
    priority: "roman-heavy",
    weight: 4,
    prompt: "Which statement best describes the centuriate assembly?",
    choices: ["It was organized by wealth and systematically favored richer citizens", "It included plebeians only and elected tribunes", "It was purely geographic and random in voting order", "It did not vote on important matters"],
    correctIndex: 0,
    explanation: "The lecture emphasizes that the most important assembly was also the one that most clearly privileged wealth.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q32",
    week: "Week 10",
    topic: "Plebiscites",
    priority: "roman-heavy",
    weight: 4,
    prompt: "After the lex Hortensia of 287 BCE, plebiscites were:",
    choices: ["Binding on the whole Roman people", "Valid only inside the plebeian assembly", "Advisory like senatus consulta", "Restricted to military matters"],
    correctIndex: 0,
    explanation: "This is one of the key turning points in the Struggle of the Orders.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q33",
    week: "Week 10",
    topic: "Lawyers and Jurists",
    priority: "roman-heavy",
    weight: 4,
    prompt: "What does ad respondendum mean in the lecture's list of Roman legal work?",
    choices: ["Giving legal advice", "Drafting documents", "Preparing cases for court", "Hearing military appeals"],
    correctIndex: 0,
    explanation: "The three classic functions are ad respondendum, ad agendum, and ad cavendum.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q34",
    week: "Week 10",
    topic: "Law of Citations",
    priority: "roman-heavy",
    weight: 4,
    prompt: "What did the Law of Citations do?",
    choices: ["It made the writings of selected jurists binding on magistrates", "It abolished juristic writing entirely", "It created the Twelve Tables", "It limited provocatio to patricians"],
    correctIndex: 0,
    explanation: "Theodosius II and Valentinian III formally privileged the writings of Papinian, Ulpian, Paulus, Modestinus, and Gaius.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q35",
    week: "Week 10",
    topic: "Corpus Iuris Civilis",
    priority: "roman-heavy",
    weight: 4,
    prompt: "Which set correctly names the four parts of Justinian's Corpus Iuris Civilis as taught in the lecture?",
    choices: ["Codex, Novellae, Institutiones, Digest", "Twelve Tables, Digest, Heliaia, Codex", "Codex, Senatus Consulta, Graphe, Novellae", "Digest, Praetor's Edict, Oresteia, Codex"],
    correctIndex: 0,
    explanation: "The lecture treats Justinian's codification as the most complete and important surviving source for Roman law.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q36",
    week: "Week 10",
    topic: "Lex Calpurnia",
    priority: "roman-heavy",
    weight: 4,
    prompt: "Why is the lex Calpurnia of 149 BCE so important?",
    choices: ["It established the first quaestio perpetua", "It created the tribunate", "It legalized adultery", "It ended the Republic"],
    correctIndex: 0,
    explanation: "The first permanent criminal court was the quaestio de repetundiis for provincial extortion.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q37",
    week: "Week 10",
    topic: "Lex Cornelia",
    priority: "roman-heavy",
    weight: 4,
    prompt: "What is the main significance of the lex Cornelia de sicariis et veneficis in the lecture?",
    choices: ["It helped make murder a stronger subject of public criminal law in Rome", "It abolished all courts for political violence", "It transferred all lawmaking to the emperor", "It prevented appeals in capital cases from the Twelve Tables onward"],
    correctIndex: 0,
    explanation: "The law creates a permanent court for killing and poisoning and expands state restriction on violence.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q38",
    week: "Week 10",
    topic: "Delicts",
    priority: "roman-heavy",
    weight: 4,
    prompt: "In the Roman law lecture, delicts are best described as:",
    choices: ["Wrongful acts that sit between modern crimes and torts", "Religious festivals for jurists", "Assemblies that elect praetors", "Military decrees issued by censors"],
    correctIndex: 0,
    explanation: "Delicts combine civil-style procedure with punitive penalties and do not fit modern categories neatly.",
    sourceRef: "Week 10 Lecture Script"
  },
  {
    id: "q39",
    week: "Week 11",
    topic: "SCU",
    priority: "roman-heavy",
    weight: 5,
    prompt: "What is the senatus consultum ultimum in the Catiline lecture?",
    choices: ["An emergency advisory decree urging consuls to protect the state by extraordinary means", "A permanent criminal court for adultery", "The written code of Justinian", "The annual edict of the praetor"],
    correctIndex: 0,
    explanation: "The SCU gives emergency cover, but it does not erase the consul's responsibility for what he does.",
    sourceRef: "Week 11 Lecture Script"
  },
  {
    id: "q40",
    week: "Week 11",
    topic: "Etruria",
    priority: "roman-heavy",
    weight: 5,
    prompt: "Why is Etruria important in the Catiline material?",
    choices: ["It is where Manlius raises revolt among discontented veterans and displaced farmers", "It is where Cicero is tried for murder", "It is where the Twelve Tables were discovered", "It is where Clodia lives with Caelius"],
    correctIndex: 0,
    explanation: "The lecture emphasizes Etruria as the social and military base that makes Catiline's threat plausible.",
    sourceRef: "Week 11 Lecture Script"
  },
  {
    id: "q41",
    week: "Week 11",
    topic: "Caesar's Position",
    priority: "roman-heavy",
    weight: 5,
    prompt: "What position does Caesar take in Sallust's senate debate over the conspirators?",
    choices: ["Do not execute them; confiscate property and detain them instead", "Execute them immediately to frighten Catiline's army", "Acquit them because the conspiracy is invented", "Turn the matter over to the plebeian assembly for a comedy contest"],
    correctIndex: 0,
    explanation: "Caesar argues against summary execution and draws on Roman precedent against killing citizens without due process.",
    sourceRef: "Week 11 Lecture Script"
  },
  {
    id: "q42",
    week: "Week 11",
    topic: "Cato's Position",
    priority: "roman-heavy",
    weight: 5,
    prompt: "What is Cato's central move in the Catiline debate?",
    choices: ["He reframes the captured conspirators as enemies in war rather than ordinary criminals", "He denies the conspiracy existed", "He argues only poor people can be criminals", "He asks the senate to abolish the office of consul"],
    correctIndex: 0,
    explanation: "By shifting the frame to war, Cato justifies immediate harsh action without trial.",
    sourceRef: "Week 11 Lecture Script"
  },
  {
    id: "q43",
    week: "Week 11",
    topic: "Hostis",
    priority: "roman-heavy",
    weight: 5,
    prompt: "When Catiline is declared hostis, he is being treated as:",
    choices: ["An enemy of the state", "A harmless private citizen", "A Roman jurist", "A tribune of the plebs"],
    correctIndex: 0,
    explanation: "Hostis shifts Catiline out of the frame of ordinary citizenship and into the language of war and enemy status.",
    sourceRef: "Week 11 Lecture Script"
  },
  {
    id: "q44",
    week: "Week 11",
    topic: "Ambiguity of Catiline",
    priority: "roman-heavy",
    weight: 5,
    prompt: "Why does the lecture insist that Catiline's status remains ambiguous even after the senate acts against him?",
    choices: ["Because Sallust still gives him heroic qualities and broad support among Romans", "Because Catiline was secretly a Greek philosopher", "Because no one in Rome knew his name", "Because Cicero defended him in court"],
    correctIndex: 0,
    explanation: "The text preserves him as both villain and heroic commander, insider and outsider, criminal and enemy.",
    sourceRef: "Week 11 Lecture Script"
  },
  {
    id: "q45",
    week: "Week 12",
    topic: "Charge Against Caelius",
    priority: "roman-heavy",
    weight: 5,
    prompt: "What is the formal charge Cicero is answering in Pro Caelio?",
    choices: ["Vis, or political violence", "Parricide", "Provincial extortion", "Treason against the emperor"],
    correctIndex: 0,
    explanation: "The lecture stresses that the public-crime frame of vis is far more serious than the scandalous private story Cicero tells.",
    sourceRef: "Week 12 Lecture Script"
  },
  {
    id: "q46",
    week: "Week 12",
    topic: "Comic Framing",
    priority: "roman-heavy",
    weight: 5,
    prompt: "What is Cicero's most distinctive strategic move in the lecture's reading of Pro Caelio?",
    choices: ["He recasts the trial as Roman comedy and Caelius as the young comic hero", "He refuses to talk about character at all", "He insists only written documents matter", "He argues the jurors should ignore Clodia completely because women cannot appear in Roman court"],
    correctIndex: 0,
    explanation: "The lecture repeatedly says Cicero wants the jurors to behave like an audience, not like neutral judicial analysts.",
    sourceRef: "Week 12 Lecture Script"
  },
  {
    id: "q47",
    week: "Week 12",
    topic: "Clodia",
    priority: "roman-heavy",
    weight: 5,
    prompt: "In Cicero's version of the case, what role does Clodia play?",
    choices: ["She becomes the scandalous source and manipulator of the prosecution narrative", "She is the neutral presiding magistrate", "She is the murdered ambassador from Alexandria", "She is the author of the speech"],
    correctIndex: 0,
    explanation: "Cicero turns Clodia into the dramatic villain so that Caelius appears harmless and the charge of vis looks misused.",
    sourceRef: "Week 12 Lecture Script"
  },
  {
    id: "q48",
    week: "Week 12",
    topic: "Riggsby and Vis",
    priority: "roman-heavy",
    weight: 5,
    prompt: "What is the lecture's main takeaway from Riggsby on the law of vis?",
    choices: ["It shows Rome moving toward treating unauthorized violence as violence against the state", "It proves Roman juries cared only about written statutes", "It means adultery was no longer important in Rome", "It abolished the role of rhetoric in court"],
    correctIndex: 0,
    explanation: "Riggsby helps the lecture connect Pro Caelio to the broader Roman shift toward centralizing legitimate force.",
    sourceRef: "Week 12 Lecture Script and Riggsby excerpt"
  }
];

// START GENERATED GLOSSARY BANK
const greekGlossaryEntries = [
  {
    term: "Agon",
    definition: "Formal dispute scene in Greek tragedy or comedy."
  },
  {
    term: "Anakrisis",
    definition: "Pre-trial hearing where the magistrate read the complaint and asked for admission or denial."
  },
  {
    term: "Apagoge",
    definition: "The procedure by which the volunteer prosecutor arrests the defendant first and then brings him to the competent official."
  },
  {
    term: "Apagoge, ephegesis, endeixis, apographe, eisangelia, probole, dokimasia, euthynai",
    definition: "Types of public cases that volunteer prosecutors could bring, often called \"summary procedures.\"."
  },
  {
    term: "Apographe",
    definition: "The procedure by which the volunteer prosecutor lists property that is wrongfully held by the defendant, property that rightfully belongs to the State."
  },
  {
    term: "Apotumpansimos",
    definition: "The act of exposing the convicted individual by securing his neck, wrists, and ankles to a vertical wooden plank (another form of the death penalty)."
  },
  {
    term: "Archon",
    definition: "Chief magistrate at Athens."
  },
  {
    term: "Archon Basileus",
    definition: "Archon responsible for religion, homicide, and deliberate wounding cases."
  },
  {
    term: "Archon Eponymous",
    definition: "Archon responsible for property, family matters, and key festivals; the year was named after him."
  },
  {
    term: "Archon Polemarchus",
    definition: "Archon responsible for cases involving non-Athenians."
  },
  {
    term: "Areopagus",
    definition: "Aristocratic council and court for intentional homicide and other grave offenses."
  },
  {
    term: "Barathon",
    definition: "The pit into which the convicted individual would be hurled (for death penalties)."
  },
  {
    term: "Boedromion & Mounikhion",
    definition: "Certain actions/cases could only be brought out between specific months."
  },
  {
    term: "Boule",
    definition: "Council of 500 citizens that prepared business for the assembly."
  },
  {
    term: "De novo",
    definition: "A Latin expression meaning \"from scratch\", \"from the beginning\"."
  },
  {
    term: "Delphinion",
    definition: "Homicide cases were tried in this court when the defendant was asserting an affirmative defense (arguing that the homicide was excused on a grounds of assumption of risk, self-defense, defense of property, etc.)."
  },
  {
    term: "Diamartyria",
    definition: "Literally \"on the account of a testimony\", \"through testimony\"."
  },
  {
    term: "Dikai emporikai",
    definition: "Mercantile cases that applied to both citizens and non-citizens and could only be initiated if the dispute at issue pertained to an alleged breach of a written contract that either: had been concluded in the Athenian..."
  },
  {
    term: "Dikastai/dikastes",
    definition: "Jurors."
  },
  {
    term: "Dikastic oath",
    definition: "An oath that each dikastes (juror) was required to swear in order to be eligible to serve as a juror."
  },
  {
    term: "Dike",
    definition: "Private suit or case brought by the wronged individual."
  },
  {
    term: "Dike aikeias",
    definition: "A charge of assault or battery (the Athenians didn't distinguish between the two)."
  },
  {
    term: "Dike biaien",
    definition: "A cause of action for theft by force."
  },
  {
    term: "Dike blabes",
    definition: "A case for damage to property or breach of contract; a cause of action used to rectify/correct a variety of civil wrongs, e.g."
  },
  {
    term: "Dike exoules",
    definition: "An additional fine paid by the defendant to the state if the defendant failed to pay the plaintiff what was due."
  },
  {
    term: "Dike heirgmou",
    definition: "A charge for false imprisonment/confinement."
  },
  {
    term: "Dike kakegorias",
    definition: "An action brought out for slander/defamation."
  },
  {
    term: "Dike klopes",
    definition: "A cause of action for simple theft."
  },
  {
    term: "Dokimasia",
    definition: "A hearing where a candidate might be qualified from citizenship, public office or speaking in the Ekklesia."
  },
  {
    term: "Eisagogeis",
    definition: "Monetary cases related to loans and banking."
  },
  {
    term: "Eisangelia",
    definition: "Public denunciation procedure used for treason, betrayal, and other injuries to the state."
  },
  {
    term: "Ek pronoias",
    definition: "The Greek term meaning \"intentionally,\" \"with forethought,\" \"with design,\" \"purposely.\" A homicide that could be described by this term was punishable by death and the confiscation of the murderer's property."
  },
  {
    term: "Ekklesia",
    definition: "Assembly of Athenian citizens."
  },
  {
    term: "Endeixis",
    definition: "The procedure by which the volunteer prosecutor first explains the charge to the magistrate and is then authorized to make the arrest."
  },
  {
    term: "Ephegesis",
    definition: "The procedure by which the volunteer prosecutor leads the magistrate to the defendant for arrest."
  },
  {
    term: "Ephetai",
    definition: "A special court of 51 men over the age of 50 who tried homicide cases in four distinct courts: the Delphinion; the Palladion; the Prytaneion; the Phreatto."
  },
  {
    term: "Epimeletai tou emporiou",
    definition: "Cases involving the sale of grain in the whole sale market that was conducted in the Athenian port, the Piraeus, at the Emporion."
  },
  {
    term: "Euthynai",
    definition: "Review of performance in public office."
  },
  {
    term: "Exegetai",
    definition: "(=\"expounders\") Religious officials who memorized sacred laws so that they could advise others about the laws."
  },
  {
    term: "Graphe",
    definition: "Public action brought on behalf of the community."
  },
  {
    term: "Graphe moicheias",
    definition: "A private case against a rapist."
  },
  {
    term: "Graphe paranomon",
    definition: "A \"prosecution for illegalities\" used to block decrees that contradicted or conflicted with established laws."
  },
  {
    term: "Heken",
    definition: "This term also means \"intentionally.\" A homicide that could be described by this term was punishable by death and the confiscation of the murderer's property."
  },
  {
    term: "Hekousios",
    definition: "This term also means \"intentionally,\" or \"voluntarily.\" A homicide that could be described by this term was punishable by death and the confiscation of the murderer's property."
  },
  {
    term: "Heliaia",
    definition: "Judicial sitting of the Athenian assembly or people's court."
  },
  {
    term: "Hierosylia",
    definition: "The act of robbing from a temple (which could be punished by death)."
  },
  {
    term: "Hubris",
    definition: "Abusive, arrogant, degrading conduct that could ground prosecution."
  },
  {
    term: "Kakourgoi",
    definition: "A cause of action for serious theft, e.g. thieves who stole at night, stole from a gymnasium, stole more than 10 drachmas from a harbor or stole more than 50 drachmas from anywhere else."
  },
  {
    term: "Klepsydra",
    definition: "A water clock that kept track of the time allotted for each speech."
  },
  {
    term: "Kleroterion",
    definition: "An allotment machine used to sort black and white balls for jury selection."
  },
  {
    term: "Kyrios",
    definition: "Legally responsible adult male guardian of a woman or child."
  },
  {
    term: "Lex",
    definition: "The Latin term for law or statute."
  },
  {
    term: "Lex talionis",
    definition: "(Latin) Law of retribution; an eye for an eye; follow for follow or rather, retaliatory retribution."
  },
  {
    term: "Logographoi",
    definition: "Speechwriters who composed court speeches for litigants."
  },
  {
    term: "Martyria",
    definition: "A testimony."
  },
  {
    term: "Miasma",
    definition: "Pollution caused by homicide that could spread through the community."
  },
  {
    term: "Nautodikai",
    definition: "Judge of sailors who handled cases involving Athenians who either lived overseas or sailed as mariners or merchants."
  },
  {
    term: "Nomos/Nomoi",
    definition: "Greek law or custom; later also written statute."
  },
  {
    term: "Nomothetai",
    definition: "Lawgivers or legislators who approved laws after assembly votes."
  },
  {
    term: "Palladion",
    definition: "Court used for unintentional homicides or when the victim was either a slave or foreigner."
  },
  {
    term: "Paragraphe",
    definition: "A procedural challenge; \"prosecution in opposition\", \"counter prosecution\"; a technical legal mechanism employed by defendants."
  },
  {
    term: "Phreatto",
    definition: "Where cases were heard when the accused had already been convicted and exiled for a prior homicide."
  },
  {
    term: "Pinakion",
    definition: "A wooden or bronze \"ticket\" that had each juror's name on it and one of the first ten letters of the alphabet."
  },
  {
    term: "Poine",
    definition: "A payment."
  },
  {
    term: "Polis",
    definition: "Greek city-state understood as a political community, not just a place."
  },
  {
    term: "Probole",
    definition: "A preliminary hearing at the Ekklesia regarding official misconduct."
  },
  {
    term: "Prodikasiai",
    definition: "Pre-trial conferences; a procedural stage for homicide trials."
  },
  {
    term: "Prodosia",
    definition: "A public-wrong charge used against generals for losing ships, troops, or territory."
  },
  {
    term: "Prosklesis",
    definition: "A summons or \"call to court\"; the summons had to alert the defendant to three facts: 1."
  },
  {
    term: "Prytaneia",
    definition: "A filing fee which the plaintiff/prosecutor had to pay."
  },
  {
    term: "Prytaneion",
    definition: "Court used for cases where death was caused by an unknown person (i.e."
  },
  {
    term: "Pseudomartyrion",
    definition: "A false testimony or perjury. A dike pseudomartyrion is a charge/prosecution for bearing false testimony."
  },
  {
    term: "Strategoi",
    definition: "Board of generals with military jurisdiction."
  },
  {
    term: "Sychophants",
    definition: "Volunteer prosecutors who brought cases for profit, prestige, or leverage."
  },
  {
    term: "Synegroi",
    definition: "(=\"supporting speakers\") Public prosecutors who brought actions against men who were acting in an official capacity."
  },
  {
    term: "The Eleven",
    definition: "Dealt with suits involving kakourgoi and cases that required the defendant to be incarcerated while awaiting trial."
  },
  {
    term: "The Forty",
    definition: "Judges who heard majority of the private cases brought by means of a dike (except under the jurisdiction of the Archon, Thesmothetai, or some other specialized court)."
  },
  {
    term: "Thesmothetai",
    definition: "Officials responsible for many graphe and dike cases."
  },
  {
    term: "Trauma ek pronoias",
    definition: "Wounding with intent to kill; deliberate armed battery."
  },
  {
    term: "Xenodikai",
    definition: "Judges of foreigners (Abolished around 350 BCE)."
  }
];

const romanGlossaryEntries = [
  {
    term: "Abigeatus",
    definition: "Rustling; a specific subspecies of theft."
  },
  {
    term: "Absolvo",
    definition: "Acquittal."
  },
  {
    term: "Actio de posito et suspenso",
    definition: "\"an action relating to something that has been placed or hung out\"."
  },
  {
    term: "Actio de rebus effusis vel deiectis",
    definition: "\"an action relating to things which have been thrown out\" This action was carried out against the owner of the property from which things were thrown or poured onto a street."
  },
  {
    term: "Actio servi corrupti",
    definition: "This action concerned situations where a person influenced another's slave in a negative manner."
  },
  {
    term: "Actus reus",
    definition: "Criminal act; an essential element for a crime in Roman law."
  },
  {
    term: "Ad agendum",
    definition: "To prepare a case for the court (Latin meaning: agere is the verb used to plead a case before the court)."
  },
  {
    term: "Ad cavendum",
    definition: "To draft documents; the process of drafting written formulae for lawsuits or business transactions."
  },
  {
    term: "Ad respondendum",
    definition: "To answer legal questions and give legal advice; the private function of a lawyer to explanation to a praetor, aedile, judge, or layperson what a particular law meant."
  },
  {
    term: "Aedile",
    definition: "Roman magistrate who supervised archives, public works, streets, and the marketplace."
  },
  {
    term: "Ambitus",
    definition: "Criminal conduct related to elections such as bribery and other types of electoral corruption."
  },
  {
    term: "Apud iudicem",
    definition: "The time a case would be heard by a judge."
  },
  {
    term: "Augurs",
    definition: "Augurs were in charge of the auspices and augury. They had the power to delay or prohibit public business."
  },
  {
    term: "Calumnia",
    definition: "Bringing false criminal charges as an accuser."
  },
  {
    term: "Censor",
    definition: "Magistrate who ran the census and assessed the social and moral standing of Roman citizens."
  },
  {
    term: "Centumviri (100 men)",
    definition: "Large juries used for disputes involving inheritance of large estates of nobles or the rich."
  },
  {
    term: "Civis",
    definition: "Latin for citizen."
  },
  {
    term: "Cognitio extraordinario / Cognitio extra ordinem",
    definition: "Extraordinary post-classical procedure in which one official heard the whole case instead of splitting it into separate phases."
  },
  {
    term: "Comitia",
    definition: "An assembly."
  },
  {
    term: "Comitia centuriata",
    definition: "The assembly compromising all Roman citizens organized into \"centuries\". It was organized by wealth."
  },
  {
    term: "Comitia curiata",
    definition: "During the Republic it served mostly to witness and perhaps authorize wills and adoptions. It operated in the Monarchy but we don't know the details."
  },
  {
    term: "Comitia tributa",
    definition: "The comitia tributa was organized by the location of residence and they vote in an order determined by lot."
  },
  {
    term: "Concilium plebis",
    definition: "An assembly of all plebeians organized by tribe and presided over by the tribunes of the plebs."
  },
  {
    term: "Condemnatio",
    definition: "This is another part of the typical formula. It is the instruction to judge to either find the defendant liable or not based upon an application of the formula to his findings of fact."
  },
  {
    term: "Condemno",
    definition: "A conviction."
  },
  {
    term: "Contiones",
    definition: "Public meetings Where debating and public discussion took place."
  },
  {
    term: "Cursus honorum",
    definition: "A regular order of elected offices which was established after the Second Punic War."
  },
  {
    term: "Damnum iniuria datum",
    definition: "Property damage."
  },
  {
    term: "De residuis",
    definition: "Embezzlement of entrusted money."
  },
  {
    term: "Decreta",
    definition: "Legal decisions rendered by the emperor in any given case that had been brought before him."
  },
  {
    term: "Delictum",
    definition: "Crime or unintentional tort."
  },
  {
    term: "Dolus",
    definition: "Criminal intent."
  },
  {
    term: "Edictum perpetuum",
    definition: "Julianus, the jurist under the reign of Emperor Hadrian (117-138 CE) put the praetorian and aedilician edicts into their final forms. Later classical Roman jurists referred to Julianus' frozen version of the..."
  },
  {
    term: "Effractores",
    definition: "Burglars who broke into apartments."
  },
  {
    term: "Equites (singular: eques )",
    definition: "They bid on contracts with the senate or with magistrates to carryout public business like the collection of taxes (publicani)."
  },
  {
    term: "Exceptio",
    definition: "An exceptio is an example of one of the legal institutions that Roman praetors created. It is a method of protecting rights kind of like a defense to an action."
  },
  {
    term: "Expilatores",
    definition: "Thieves who ransacked homes in the countryside."
  },
  {
    term: "Falsum",
    definition: "Forgery."
  },
  {
    term: "Flagrante delicto",
    definition: "(literally,\"in blazing offence\"); caught red handed."
  },
  {
    term: "Furtum manifestum",
    definition: "The thief is caught in the action. The penalty was to be beaten and then the perpetrator was handed over to the victim of the theft as a slave or bondsman."
  },
  {
    term: "Furtum nec manifestum",
    definition: "The thief is not caught in the action."
  },
  {
    term: "Glossa",
    definition: "Comments and laws."
  },
  {
    term: "Honestiores",
    definition: "More privileged citizens (for example army veterans)."
  },
  {
    term: "Imperium",
    definition: "The power to command held by senior Roman magistrates."
  },
  {
    term: "In iure",
    definition: "The first phase of Roman procedure, conducted before the praetor."
  },
  {
    term: "Iniuria",
    definition: "Personal injury to reputation, dignity, honor, or bodily integrity."
  },
  {
    term: "Inscriptio",
    definition: "The court president wrote down an inscriptio for the prosecutor to sign."
  },
  {
    term: "Institutiones",
    definition: "An official textbook on Roman law and a functional code that could be consulted for subsequent decisions."
  },
  {
    term: "Intentio",
    definition: "This is another part of the typical formula (written instruction). It is the statement of the plaintiff's claim and the most important section of every formula."
  },
  {
    term: "Intercessio",
    definition: "Veto power used against magistrates of equal or lower status."
  },
  {
    term: "Interdictio aquae et ignis",
    definition: "Banishment/exile; literally \"prohibition of water and fire\"."
  },
  {
    term: "Iudex",
    definition: "Latin for \"judge\". One of the most important officials involved in the development of the legis actiones system."
  },
  {
    term: "Iudex qui litem suam fecit",
    definition: "\"a judge who has made a case his own\". One of the quasi-delicts."
  },
  {
    term: "Iudicis nominatio",
    definition: "This is one part of the typical formula which nominates a judge."
  },
  {
    term: "Ius Aelianum",
    definition: "A collection of judicial formulae for lawsuits, dating to ca. 200 BCE."
  },
  {
    term: "Ius Flavianum",
    definition: "A collection of formulae for lawsuits, dating to ca. 300 BCE."
  },
  {
    term: "Ius gentium",
    definition: "Literally, \"law of the peoples/nations\". The praetor peregrinus used this law between a Roman citizen and a foreigner or between two foreigners who were involved in a dispute on Roman soil."
  },
  {
    term: "Ius honorarium",
    definition: "The law that resulted from the praetors' edicts. It was used to distinguish law based on the praetor's edict from more formal legislation."
  },
  {
    term: "Ius occidendi",
    definition: "The right of killing; stems from the power of the paterfamilias over members of his family."
  },
  {
    term: "Ius privatum",
    definition: "Included rules of property, succession, contracts, and laws relating to the family; deals with the interests of separate persons (according to the Roman Jurist Ulpian)."
  },
  {
    term: "Ius publicum",
    definition: "A body of laws that deals with interests of the entire community (according to Roman Jurist Ulpian)."
  },
  {
    term: "Ius respondendi ex auctoritate principis",
    definition: "(sometimes referred to simply as the ius respondendi ); the law of responding from the authority of the princeps (emperor)."
  },
  {
    term: "Ius vocatio",
    definition: "The act of bringing a defendant before the praetor by a formal summons initiated in the in iure phase."
  },
  {
    term: "Laudatores",
    definition: "Character witnesses."
  },
  {
    term: "Leges",
    definition: "Statutes adopted by the populus romanus; designed to honour the honour the mos maiorum."
  },
  {
    term: "Legis actiones",
    definition: "The early form of civil procedure; \"suits/actions of law\"."
  },
  {
    term: "Lenocinium",
    definition: "Any conduct that facilitated sexual crime."
  },
  {
    term: "Lex Aquilia",
    definition: "Plebiscite governing wrongful damage to property, especially injury to another person's slaves or animals."
  },
  {
    term: "Lex Calpurnia",
    definition: "Law of 149 BCE that created the first permanent jury court and helped launch the quaestiones perpetuae."
  },
  {
    term: "Lex Canuleia",
    definition: "A law passed in 445 BCE which gave plebeians the right of intermarriage with the patricians."
  },
  {
    term: "Lex Cornelia de iniuriis",
    definition: "A law that created what amounted to a criminal cause of action against persons for hittng others or for forcefully breaking into another's home."
  },
  {
    term: "Lex Cornelia nummaria",
    definition: "The earliest Roman law to criminalize the counterfeiting of money."
  },
  {
    term: "Lex Fabia",
    definition: "A law that criminalized the sale of a Roman citizen, freedman, or slave who belonged to someone else."
  },
  {
    term: "Lex Hortensia",
    definition: "Law of 287 BCE making plebiscites binding on all Roman citizens."
  },
  {
    term: "Lex Iulia de adulteriis coercendis",
    definition: "Augustan law punishing adultery and giving the paterfamilias limited rights in flagrante delicto."
  },
  {
    term: "Lex Ogulnia",
    definition: "(300 BCE) The law that allowed plebeians to be pontifices."
  },
  {
    term: "Lex Pompeia",
    definition: "(55 BCE) The first statute that criminalized parricide as an offense distinct from ordinary murder."
  },
  {
    term: "Lex talionis",
    definition: "A law on retribution; essentially the equivalent of \"an eye for an eye\"."
  },
  {
    term: "Licinian Sextian law",
    definition: "(367 BCE) this law allowed one of the two consuls elected every year had to be a plebeian."
  },
  {
    term: "Litis contestatio",
    definition: "The appearance of parties before the praetor to initiate a suit."
  },
  {
    term: "Maiestas",
    definition: "Treason--Maiestas included a number of illegal activities: armed assault on the State; gathering soldiers or conducting warfare without the State's permission; desertion."
  },
  {
    term: "Maius imperium",
    definition: "The \"greater power to command\", held by a more senior magistrate (i.e."
  },
  {
    term: "Mancipatio",
    definition: "The act of transferring res mancipi e.g. land, slaves, cattle, horses, mules, donkeys."
  },
  {
    term: "Mens rea",
    definition: "\"a guilty mind\"."
  },
  {
    term: "Mos maiorum",
    definition: "Customs of their (Romans') ancestors."
  },
  {
    term: "Nominis delatio",
    definition: "=(denunciation of the name) The trial began with a nominis delatio attended by both prosecutor and defendant."
  },
  {
    term: "Novella",
    definition: "New laws that were adopted after the Corpus Iuris had been written."
  },
  {
    term: "Obligatio/obligationes",
    definition: "This entailed some relationship between two persons in which one was a creditor and the other debtor."
  },
  {
    term: "Paterfamilias",
    definition: "The father of the family; the head of the household."
  },
  {
    term: "Peculatus",
    definition: "A kind of embezzlement; any wrongful appropriation, diversion, or conversion of sacred, religious, or public funds."
  },
  {
    term: "Per formulam",
    definition: "The formulary procedure which replaced the legis actiones in the beginning of the 2nd century B.C."
  },
  {
    term: "Perduellio",
    definition: "This term also refers to treasonous conduct but it was used more in the earlier Republic."
  },
  {
    term: "Plagium",
    definition: "Kidnapping."
  },
  {
    term: "Plebiscita (singular: plebiscitum )",
    definition: "Enactments of the concilium plebis that became binding on all Rome after the lex Hortensia."
  },
  {
    term: "Pontifices",
    definition: "Pontiffs (priests) had access to the archives containing the specialized legal forms and phrases that were necessary to conduct a law suit."
  },
  {
    term: "Populus Romanus",
    definition: "The Roman people."
  },
  {
    term: "Praefectus vigilum",
    definition: "Prefect of the Night Watch."
  },
  {
    term: "Praescriptio",
    definition: "A general comment concerning the wrong."
  },
  {
    term: "Praetor",
    definition: "Roman magistrate responsible for the judiciary, annual edicts, and legal formulae."
  },
  {
    term: "Praetor peregrinus",
    definition: "Praetor who handled disputes involving foreigners."
  },
  {
    term: "Praetor urbanus",
    definition: "Praetor who handled disputes involving Roman citizens."
  },
  {
    term: "Praevaricatio",
    definition: "A criminal offence for an accuser to hide legitimate charges."
  },
  {
    term: "Provocatio",
    definition: "Right to appeal a magistrate's summary judgment to the Roman people."
  },
  {
    term: "Quaestio de repetundiis",
    definition: "Court for extortion by provincial governors."
  },
  {
    term: "Quaestiones perpetuae",
    definition: "Permanent Roman criminal courts for recurring categories of public wrong."
  },
  {
    term: "Quaestors",
    definition: "Financial officials."
  },
  {
    term: "Rapina",
    definition: "Robbery with violence."
  },
  {
    term: "Recuperatores",
    definition: "Recoverers three to five judges instead of a single iudex."
  },
  {
    term: "Repetundae",
    definition: "Provincial extortion and abuse of office for private gain."
  },
  {
    term: "Restitutio",
    definition: "One of the legal institutions created by the Roman praetors."
  },
  {
    term: "Saccularii",
    definition: "Thieves who slit pockets and purses to empty their contents."
  },
  {
    term: "Sanctio",
    definition: "The negative consequences which resulted from a person's violation of the praescriptio."
  },
  {
    term: "Sciens dolo malo",
    definition: "\"knowingly and with malicious intent\"."
  },
  {
    term: "Senatus Consulta",
    definition: "Advice or resolutions issued by the Senate."
  },
  {
    term: "Sententia",
    definition: "The opinion of the judge ( iudex )."
  },
  {
    term: "Stellionatus",
    definition: "Any conduct that was dishonest or fraudulent and did not fit neatly into another defined criminal category could be dealt as stellionatus."
  },
  {
    term: "Stipulatio",
    definition: "A face to face contract that originally required one party to ask \"Do you promise\" and the other to respond \"I promise\"."
  },
  {
    term: "Stuprum",
    definition: "An illegal crime which occurred when a man acting sciens dolo malo had sexual relations with a \"respectable\" unmarried girl or woman or boy."
  },
  {
    term: "Tergiversatio",
    definition: "A criminal offence for an accuser to abandon charges once formally begun."
  },
  {
    term: "Tresviri capitalis",
    definition: "Handled cases involving theft."
  },
  {
    term: "Tripertitia",
    definition: "A major work published by Sextus Aelius Paetus. It was the first attempt at a systematic treatment of Roman law."
  },
  {
    term: "Vis",
    definition: "Force or violence treated as a public crime, often punished by exile or death."
  }
];

function glossarySourceRef(family) {
  return family === "greek" ? "Greek Law Wiki Glossary" : "Roman Law Wiki Glossary";
}

function glossaryWeekLabel(family) {
  return family === "greek" ? "Greek Glossary" : "Roman Glossary";
}

function glossaryTopicLabel(family) {
  return family === "greek" ? "Greek Glossary Drill" : "Roman Glossary Drill";
}

function pickGlossaryDistractors(entries, index) {
  const offsets = [1, 2, 5, 8, 13, 21, 34];
  const distractors = [];
  for (const offset of offsets) {
    const candidate = entries[(index + offset) % entries.length];
    if (!candidate || distractors.some((entry) => entry.term === candidate.term)) continue;
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }
  return distractors;
}

function buildGlossaryQuestions(entries, family) {
  return entries.map((entry, index) => ({
    id: "g-" + family + "-" + String(index + 1).padStart(3, "0"),
    week: glossaryWeekLabel(family),
    topic: glossaryTopicLabel(family),
    priority: "glossary",
    weight: 1,
    bank: "glossary",
    family,
    prompt: "Given the definition, what is the correct " + family + " term? \"" + entry.definition + "\"",
    choices: [entry.term, ...pickGlossaryDistractors(entries, index).map((candidate) => candidate.term)],
    correctIndex: 0,
    explanation: entry.term + " means " + entry.definition,
    sourceRef: glossarySourceRef(family)
  }));
}

window.QUIZ_QUESTIONS = [
  ...coreQuestions.map((question) => ({
    ...question,
    bank: "core",
    family: question.family || null
  })),
  ...buildGlossaryQuestions(greekGlossaryEntries, "greek"),
  ...buildGlossaryQuestions(romanGlossaryEntries, "roman")
];
// END GENERATED GLOSSARY BANK
