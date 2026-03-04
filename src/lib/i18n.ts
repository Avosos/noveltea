/* ══════════════════════════════════════════════════════════════════════════════
 * NovelTea — Internationalization (i18n)
 * Supports: English (en), German (de)
 * ══════════════════════════════════════════════════════════════════════════════ */

export type Language = "en" | "de";

export interface Translations {
  // ─── Navigation ─────────────────────────────
  nav: {
    editor: string;
    chapters: string;
    timeline: string;
    storyMap: string;
    conflicts: string;
    search: string;
    statistics: string;
    settings: string;
    graph: string;
    sources: string;
    dialogue: string;
  };
  // ─── Sidebar ────────────────────────────────
  sidebar: {
    navigation: string;
    worldbuilding: string;
    characters: string;
    locations: string;
    organizations: string;
    artifacts: string;
    lore: string;
    addCharacter: string;
    addLocation: string;
    addOrganization: string;
    addArtifact: string;
    addLore: string;
    closeProject: string;
  };
  // ─── Welcome ────────────────────────────────
  welcome: {
    subtitle: string;
    newProject: string;
    openProject: string;
    createNewProject: string;
    projectName: string;
    create: string;
    cancel: string;
    recentProjects: string;
  };
  // ─── Editor ─────────────────────────────────
  editor: {
    save: string;
    focusMode: string;
    storyContext: string;
    addScene: string;
    beginWriting: string;
    words: string;
    pov: string;
    location: string;
    timelineLabel: string;
    tension: string;
    referencedEntities: string;
    povCharacter: string;
    openConflicts: string;
    tensionCurve: string;
    selectChapterScene: string;
    saved: string;
    markAsSpeech: string;
    markAsMention: string;
  };
  // ─── Chapters ───────────────────────────────
  chapters: {
    title: string;
    subtitle: string;
    newChapter: string;
    scenes: string;
    scene: string;
    addScene: string;
    openInEditor: string;
    deleteChapter: string;
    act: string;
    chapterTitle: string;
  };
  // ─── Entities ───────────────────────────────
  entities: {
    title: string;
    searchEntities: string;
    all: string;
    noEntities: string;
    noMatch: string;
    noDescription: string;
    back: string;
    backToEntities: string;
    noEntitySelected: string;
    save: string;
    delete: string;
    description: string;
    descriptionPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    tags: string;
    addTag: string;
    entityLinks: string;
    addLink: string;
    referencedIn: string;
    notReferenced: string;
    entityName: string;
    selectEntity: string;
    relationship: string;
    bidirectional: string;
  };
  // ─── Character ──────────────────────────────
  character: {
    details: string;
    role: string;
    rolePlaceholder: string;
    age: string;
    occupation: string;
    motivation: string;
    motivationPlaceholder: string;
    characterArc: string;
    arcPlaceholder: string;
    relationships: string;
    addRelationship: string;
    selectCharacter: string;
    type: string;
    descriptionField: string;
    stateChanges: string;
    addStateChange: string;
    property: string;
    from: string;
    to: string;
    whatTriggers: string;
    nationality: string;
    nationalityPlaceholder: string;
    languages: string;
    languagesPlaceholder: string;
    skills: string;
    skillsPlaceholder: string;
    customFields: string;
    addCustomField: string;
    fieldName: string;
    fieldValue: string;
    appearance: string;
    appearancePlaceholder: string;
    personality: string;
    personalityPlaceholder: string;
    background: string;
    backgroundPlaceholder: string;
  };
  // ─── Location ───────────────────────────────
  location: {
    details: string;
    type: string;
    typePlaceholder: string;
    climate: string;
    climatePlaceholder: string;
    atmosphere: string;
    atmospherePlaceholder: string;
  };
  // ─── Settings ───────────────────────────────
  settings: {
    title: string;
    resetDefaults: string;
    appearance: string;
    theme: string;
    dark: string;
    grey: string;
    light: string;
    editorSection: string;
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    writing: string;
    showWordCount: string;
    showWordCountDesc: string;
    typewriterMode: string;
    typewriterModeDesc: string;
    focusMode: string;
    focusModeDesc: string;
    spellcheck: string;
    spellcheckDesc: string;
    autosave: string;
    autosaveInterval: string;
    language: string;
    languageDesc: string;
    seconds10: string;
    seconds30: string;
    minute1: string;
    minutes2: string;
    minutes5: string;
    disabled: string;
  };
  // ─── Stats ──────────────────────────────────
  stats: {
    title: string;
    totalWords: string;
    chaptersLabel: string;
    entitiesLabel: string;
    avgTension: string;
    outOf10: string;
    wordsPerChapter: string;
    average: string;
    wordsChapter: string;
    povDistribution: string;
    noPovData: string;
    characterScreentime: string;
    noScreentime: string;
    conflictTracking: string;
    total: string;
    active: string;
    planted: string;
  };
  // ─── Timeline ───────────────────────────────
  timeline: {
    title: string;
    subtitle: string;
    noScenes: string;
  };
  // ─── Story Map ──────────────────────────────
  storyMap: {
    title: string;
    subtitle: string;
    plotlines: string;
    herosJourney: string;
  };
  // ─── Conflicts ──────────────────────────────
  conflicts: {
    title: string;
    subtitle: string;
    newConflict: string;
    planted: string;
    active: string;
    resolved: string;
    name: string;
    typeLabel: string;
    interpersonal: string;
    internal: string;
    societal: string;
    environmental: string;
    chekhovsGun: string;
    description: string;
    status: string;
    notes: string;
  };
  // ─── Search ─────────────────────────────────
  search: {
    title: string;
    placeholder: string;
    results: string;
    result: string;
    forQuery: string;
    scenesCount: string;
    entitiesCount: string;
    inChapter: string;
    noResults: string;
  };
  // ─── Graph ──────────────────────────────────
  graph: {
    title: string;
    subtitle: string;
    showChapters: string;
    showCharacters: string;
    showLocations: string;
    showOrganizations: string;
    showConnections: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
    connections: string;
    nodes: string;
  };
  // ─── Sources ────────────────────────────────
  sources: {
    title: string;
    subtitle: string;
    addSource: string;
    sourceTitle: string;
    author: string;
    year: string;
    url: string;
    publisher: string;
    pages: string;
    type: string;
    book: string;
    article: string;
    website: string;
    journal: string;
    other: string;
    notes: string;
    footnotes: string;
    addFootnote: string;
    footnoteText: string;
    linkedChapter: string;
    noSources: string;
    searchSources: string;
    copyReference: string;
    insertFootnote: string;
  };
  // ─── Dialogue ───────────────────────────────
  dialogue: {
    title: string;
    subtitle: string;
    character: string;
    allCharacters: string;
    directSpeech: string;
    mentioned: string;
    chapter: string;
    scene: string;
    noAttributions: string;
    filterByCharacter: string;
    filterByType: string;
    speechType: string;
    mentionType: string;
    allTypes: string;
    goToScene: string;
    count: string;
  };
  // ─── Common ─────────────────────────────────
  common: {
    confirmDelete: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    back: string;
    search: string;
    noData: string;
    saved: string;
    saving: string;
    error: string;
    loading: string;
  };
}

const en: Translations = {
  nav: {
    editor: "Editor",
    chapters: "Chapters",
    timeline: "Timeline",
    storyMap: "Story Map",
    conflicts: "Conflicts",
    search: "Search",
    statistics: "Statistics",
    settings: "Settings",
    graph: "Graph",
    sources: "Sources",
    dialogue: "Dialogue",
  },
  sidebar: {
    navigation: "Navigation",
    worldbuilding: "Worldbuilding",
    characters: "Characters",
    locations: "Locations",
    organizations: "Organizations",
    artifacts: "Artifacts",
    lore: "Lore",
    addCharacter: "Add Character",
    addLocation: "Add Location",
    addOrganization: "Add Organization",
    addArtifact: "Add Artifact",
    addLore: "Add Lore",
    closeProject: "Close Project",
  },
  welcome: {
    subtitle: "Structured authoring for novels and narrative worlds",
    newProject: "New Project",
    openProject: "Open Project",
    createNewProject: "Create New Project",
    projectName: "Project name…",
    create: "Create",
    cancel: "Cancel",
    recentProjects: "Recent Projects",
  },
  editor: {
    save: "Save (Ctrl+S)",
    focusMode: "Focus mode",
    storyContext: "Story context",
    addScene: "+ Add Scene",
    beginWriting: "Begin writing your scene…",
    words: "words",
    pov: "POV",
    location: "Location",
    timelineLabel: "Timeline",
    tension: "Tension",
    referencedEntities: "Referenced Entities",
    povCharacter: "POV Character",
    openConflicts: "Open Conflicts",
    tensionCurve: "Tension Curve",
    selectChapterScene: "Select a chapter and scene to start writing",
    saved: "Saved",
    markAsSpeech: "Mark as Speech",
    markAsMention: "Mark as Mention",
  },
  chapters: {
    title: "Chapters & Scenes",
    subtitle: "chapters · {scenes} scenes · {words} words",
    newChapter: "New Chapter",
    scenes: "scenes",
    scene: "scene",
    addScene: "Add Scene",
    openInEditor: "Open in editor",
    deleteChapter: "Delete chapter",
    act: "Act",
    chapterTitle: "Chapter Title",
  },
  entities: {
    title: "Worldbuilding",
    searchEntities: "Search entities...",
    all: "All",
    noEntities: "No entities yet.",
    noMatch: "No entities match your search.",
    noDescription: "No description",
    back: "Back",
    backToEntities: "Back to Entities",
    noEntitySelected: "No entity selected.",
    save: "Save",
    delete: "Delete",
    description: "Description",
    descriptionPlaceholder: "Describe this entity...",
    notes: "Notes",
    notesPlaceholder: "Internal notes...",
    tags: "Tags",
    addTag: "Add tag...",
    entityLinks: "Entity Links",
    addLink: "Add Link",
    referencedIn: "Referenced in {count} scene(s)",
    notReferenced: "Not referenced in any scenes yet.",
    entityName: "Entity name",
    selectEntity: "Select entity...",
    relationship: "Relationship...",
    bidirectional: "Bidir.",
  },
  character: {
    details: "Character Details",
    role: "Role",
    rolePlaceholder: "Protagonist, Antagonist...",
    age: "Age",
    occupation: "Occupation",
    motivation: "Motivation",
    motivationPlaceholder: "What drives this character?",
    characterArc: "Character Arc",
    arcPlaceholder: "How does this character change throughout the story?",
    relationships: "Relationships",
    addRelationship: "Add Relationship",
    selectCharacter: "Select character...",
    type: "Type",
    descriptionField: "Description",
    stateChanges: "State Changes (Arc Points)",
    addStateChange: "Add State Change",
    property: "Property (e.g. Loyalty)",
    from: "From",
    to: "To",
    whatTriggers: "What triggers this change?",
    nationality: "Nationality",
    nationalityPlaceholder: "e.g. German, Japanese...",
    languages: "Languages",
    languagesPlaceholder: "e.g. English, French...",
    skills: "Skills & Abilities",
    skillsPlaceholder: "e.g. Swordsmanship, Diplomacy...",
    customFields: "Custom Attributes",
    addCustomField: "Add Field",
    fieldName: "Field name",
    fieldValue: "Value",
    appearance: "Appearance",
    appearancePlaceholder: "Physical appearance, distinctive features...",
    personality: "Personality",
    personalityPlaceholder: "Temperament, quirks, mannerisms...",
    background: "Background",
    backgroundPlaceholder: "History, upbringing, key events...",
  },
  location: {
    details: "Location Details",
    type: "Type",
    typePlaceholder: "City, Forest, Building...",
    climate: "Climate",
    climatePlaceholder: "Temperate, Arid...",
    atmosphere: "Atmosphere / Sensory Details",
    atmospherePlaceholder: "What does it look, sound, smell, and feel like?",
  },
  settings: {
    title: "Settings",
    resetDefaults: "Reset Defaults",
    appearance: "Appearance",
    theme: "Theme",
    dark: "Dark",
    grey: "Grey",
    light: "Light",
    editorSection: "Editor",
    fontFamily: "Font Family",
    fontSize: "Font Size",
    lineHeight: "Line Height",
    writing: "Writing",
    showWordCount: "Show Word Count",
    showWordCountDesc: "Display word count in the titlebar",
    typewriterMode: "Typewriter Mode",
    typewriterModeDesc: "Keep the cursor centered vertically",
    focusMode: "Focus Mode",
    focusModeDesc: "Dim everything except the current paragraph",
    spellcheck: "Spellcheck",
    spellcheckDesc: "Enable browser spell checking",
    autosave: "Autosave",
    autosaveInterval: "Autosave Interval",
    language: "Language",
    languageDesc: "Choose the interface language",
    seconds10: "10 seconds",
    seconds30: "30 seconds",
    minute1: "1 minute",
    minutes2: "2 minutes",
    minutes5: "5 minutes",
    disabled: "Disabled",
  },
  stats: {
    title: "Statistics",
    totalWords: "Total Words",
    chaptersLabel: "Chapters",
    entitiesLabel: "Entities",
    avgTension: "Avg Tension",
    outOf10: "out of 10",
    wordsPerChapter: "Words per Chapter",
    average: "Average",
    wordsChapter: "words/chapter",
    povDistribution: "POV Distribution",
    noPovData: "No POV data yet.",
    characterScreentime: "Character Screentime",
    noScreentime: "No character appearances tracked.",
    conflictTracking: "Conflict Tracking",
    total: "Total",
    active: "Active",
    planted: "Planted",
  },
  timeline: {
    title: "Timeline",
    subtitle: "Chronological scene progression",
    noScenes: "No scenes yet. Create chapters and scenes to see the timeline.",
  },
  storyMap: {
    title: "Story Map",
    subtitle: "Three-act structure overview with plotline threads",
    plotlines: "Plotlines",
    herosJourney: "Hero's Journey Reference",
  },
  conflicts: {
    title: "Conflicts & Chekhov's Guns",
    subtitle: "conflicts",
    newConflict: "New Conflict",
    planted: "Planted",
    active: "Active",
    resolved: "Resolved",
    name: "Name",
    typeLabel: "Type",
    interpersonal: "Interpersonal",
    internal: "Internal",
    societal: "Societal",
    environmental: "Environmental",
    chekhovsGun: "Chekhov's Gun",
    description: "Description",
    status: "Status",
    notes: "Notes",
  },
  search: {
    title: "Search",
    placeholder: "Search scenes, entities, and tags...",
    results: "results",
    result: "result",
    forQuery: "for",
    scenesCount: "Scenes",
    entitiesCount: "Entities",
    inChapter: "in",
    noResults: "No results found.",
  },
  graph: {
    title: "Knowledge Graph",
    subtitle: "Visual connections between chapters, characters and locations",
    showChapters: "Chapters",
    showCharacters: "Characters",
    showLocations: "Locations",
    showOrganizations: "Organizations",
    showConnections: "Connections",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetView: "Reset View",
    connections: "connections",
    nodes: "nodes",
  },
  sources: {
    title: "Sources & Citations",
    subtitle: "Manage research sources, literature references and footnotes",
    addSource: "Add Source",
    sourceTitle: "Title",
    author: "Author",
    year: "Year",
    url: "URL",
    publisher: "Publisher",
    pages: "Pages",
    type: "Type",
    book: "Book",
    article: "Article",
    website: "Website",
    journal: "Journal",
    other: "Other",
    notes: "Notes",
    footnotes: "Footnotes",
    addFootnote: "Add Footnote",
    footnoteText: "Footnote text...",
    linkedChapter: "Linked Chapter",
    noSources: "No sources yet. Add research material and references.",
    searchSources: "Search sources...",
    copyReference: "Copy Reference",
    insertFootnote: "Insert as Footnote",
  },
  dialogue: {
    title: "Dialogue Attribution",
    subtitle: "Track character speech and mentions across your story",
    character: "Character",
    allCharacters: "All Characters",
    directSpeech: "Direct Speech",
    mentioned: "Mentioned",
    chapter: "Chapter",
    scene: "Scene",
    noAttributions: "No dialogue attributions yet. Mark text in the editor to attribute it to characters.",
    filterByCharacter: "Filter by character",
    filterByType: "Filter by type",
    speechType: "Speech",
    mentionType: "Mention",
    allTypes: "All Types",
    goToScene: "Go to Scene",
    count: "Count",
  },
  common: {
    confirmDelete: "Delete \"{name}\"?",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    back: "Back",
    search: "Search",
    noData: "No data",
    saved: "Saved successfully!",
    saving: "Saving...",
    error: "Error",
    loading: "Loading...",
  },
};

const de: Translations = {
  nav: {
    editor: "Editor",
    chapters: "Kapitel",
    timeline: "Zeitstrahl",
    storyMap: "Story Map",
    conflicts: "Konflikte",
    search: "Suche",
    statistics: "Statistiken",
    settings: "Einstellungen",
    graph: "Graph",
    sources: "Quellen",
    dialogue: "Dialoge",
  },
  sidebar: {
    navigation: "Navigation",
    worldbuilding: "Weltenbau",
    characters: "Charaktere",
    locations: "Orte",
    organizations: "Organisationen",
    artifacts: "Artefakte",
    lore: "Lore",
    addCharacter: "Charakter hinzufügen",
    addLocation: "Ort hinzufügen",
    addOrganization: "Organisation hinzufügen",
    addArtifact: "Artefakt hinzufügen",
    addLore: "Lore hinzufügen",
    closeProject: "Projekt schließen",
  },
  welcome: {
    subtitle: "Strukturiertes Schreiben für Romane und narrative Welten",
    newProject: "Neues Projekt",
    openProject: "Projekt öffnen",
    createNewProject: "Neues Projekt erstellen",
    projectName: "Projektname…",
    create: "Erstellen",
    cancel: "Abbrechen",
    recentProjects: "Letzte Projekte",
  },
  editor: {
    save: "Speichern (Strg+S)",
    focusMode: "Fokusmodus",
    storyContext: "Story-Kontext",
    addScene: "+ Szene hinzufügen",
    beginWriting: "Beginne hier zu schreiben…",
    words: "Wörter",
    pov: "Perspektive",
    location: "Ort",
    timelineLabel: "Zeitstrahl",
    tension: "Spannung",
    referencedEntities: "Referenzierte Entitäten",
    povCharacter: "POV-Charakter",
    openConflicts: "Offene Konflikte",
    tensionCurve: "Spannungskurve",
    selectChapterScene: "Wähle ein Kapitel und eine Szene zum Schreiben",
    saved: "Gespeichert",
    markAsSpeech: "Als Rede markieren",
    markAsMention: "Als Erwähnung markieren",
  },
  chapters: {
    title: "Kapitel & Szenen",
    subtitle: "Kapitel · {scenes} Szenen · {words} Wörter",
    newChapter: "Neues Kapitel",
    scenes: "Szenen",
    scene: "Szene",
    addScene: "Szene hinzufügen",
    openInEditor: "Im Editor öffnen",
    deleteChapter: "Kapitel löschen",
    act: "Akt",
    chapterTitle: "Kapitel-Titel",
  },
  entities: {
    title: "Weltenbau",
    searchEntities: "Entitäten suchen...",
    all: "Alle",
    noEntities: "Noch keine Entitäten.",
    noMatch: "Keine passenden Entitäten gefunden.",
    noDescription: "Keine Beschreibung",
    back: "Zurück",
    backToEntities: "Zurück zu Entitäten",
    noEntitySelected: "Keine Entität ausgewählt.",
    save: "Speichern",
    delete: "Löschen",
    description: "Beschreibung",
    descriptionPlaceholder: "Beschreibe diese Entität...",
    notes: "Notizen",
    notesPlaceholder: "Interne Notizen...",
    tags: "Tags",
    addTag: "Tag hinzufügen...",
    entityLinks: "Entitäts-Verknüpfungen",
    addLink: "Verknüpfung hinzufügen",
    referencedIn: "Referenziert in {count} Szene(n)",
    notReferenced: "Noch in keiner Szene referenziert.",
    entityName: "Entitäts-Name",
    selectEntity: "Entität auswählen...",
    relationship: "Beziehung...",
    bidirectional: "Bidir.",
  },
  character: {
    details: "Charakter-Details",
    role: "Rolle",
    rolePlaceholder: "Protagonist, Antagonist...",
    age: "Alter",
    occupation: "Beruf",
    motivation: "Motivation",
    motivationPlaceholder: "Was treibt diesen Charakter an?",
    characterArc: "Charakter-Entwicklung",
    arcPlaceholder: "Wie verändert sich dieser Charakter im Laufe der Geschichte?",
    relationships: "Beziehungen",
    addRelationship: "Beziehung hinzufügen",
    selectCharacter: "Charakter auswählen...",
    type: "Typ",
    descriptionField: "Beschreibung",
    stateChanges: "Zustandsänderungen (Wendepunkte)",
    addStateChange: "Zustandsänderung hinzufügen",
    property: "Eigenschaft (z.B. Loyalität)",
    from: "Von",
    to: "Nach",
    whatTriggers: "Was löst diese Veränderung aus?",
    nationality: "Nationalität",
    nationalityPlaceholder: "z.B. Deutsch, Japanisch...",
    languages: "Sprachen",
    languagesPlaceholder: "z.B. Englisch, Französisch...",
    skills: "Fähigkeiten & Können",
    skillsPlaceholder: "z.B. Schwertkampf, Diplomatie...",
    customFields: "Eigene Attribute",
    addCustomField: "Feld hinzufügen",
    fieldName: "Feldname",
    fieldValue: "Wert",
    appearance: "Aussehen",
    appearancePlaceholder: "Körperliche Erscheinung, besondere Merkmale...",
    personality: "Persönlichkeit",
    personalityPlaceholder: "Temperament, Eigenarten, Gewohnheiten...",
    background: "Hintergrund",
    backgroundPlaceholder: "Geschichte, Erziehung, Schlüsselereignisse...",
  },
  location: {
    details: "Ort-Details",
    type: "Typ",
    typePlaceholder: "Stadt, Wald, Gebäude...",
    climate: "Klima",
    climatePlaceholder: "Gemäßigt, Trocken...",
    atmosphere: "Atmosphäre / Sinneseindrücke",
    atmospherePlaceholder: "Wie sieht es aus, wie klingt, riecht und fühlt es sich an?",
  },
  settings: {
    title: "Einstellungen",
    resetDefaults: "Zurücksetzen",
    appearance: "Darstellung",
    theme: "Farbschema",
    dark: "Dunkel",
    grey: "Grau",
    light: "Hell",
    editorSection: "Editor",
    fontFamily: "Schriftart",
    fontSize: "Schriftgröße",
    lineHeight: "Zeilenhöhe",
    writing: "Schreiben",
    showWordCount: "Wortzähler anzeigen",
    showWordCountDesc: "Wortzähler in der Titelleiste anzeigen",
    typewriterMode: "Schreibmaschinenmodus",
    typewriterModeDesc: "Cursor vertikal zentriert halten",
    focusMode: "Fokusmodus",
    focusModeDesc: "Alles außer dem aktuellen Absatz abdunkeln",
    spellcheck: "Rechtschreibprüfung",
    spellcheckDesc: "Browser-Rechtschreibprüfung aktivieren",
    autosave: "Automatisches Speichern",
    autosaveInterval: "Speicherintervall",
    language: "Sprache",
    languageDesc: "Wähle die Sprache der Benutzeroberfläche",
    seconds10: "10 Sekunden",
    seconds30: "30 Sekunden",
    minute1: "1 Minute",
    minutes2: "2 Minuten",
    minutes5: "5 Minuten",
    disabled: "Deaktiviert",
  },
  stats: {
    title: "Statistiken",
    totalWords: "Gesamtwörter",
    chaptersLabel: "Kapitel",
    entitiesLabel: "Entitäten",
    avgTension: "Ø Spannung",
    outOf10: "von 10",
    wordsPerChapter: "Wörter pro Kapitel",
    average: "Durchschnitt",
    wordsChapter: "Wörter/Kapitel",
    povDistribution: "POV-Verteilung",
    noPovData: "Noch keine POV-Daten.",
    characterScreentime: "Charakter-Auftritte",
    noScreentime: "Keine Charakter-Auftritte erfasst.",
    conflictTracking: "Konflikt-Verfolgung",
    total: "Gesamt",
    active: "Aktiv",
    planted: "Angelegt",
  },
  timeline: {
    title: "Zeitstrahl",
    subtitle: "Chronologischer Szenenverlauf",
    noScenes: "Noch keine Szenen. Erstelle Kapitel und Szenen, um den Zeitstrahl zu sehen.",
  },
  storyMap: {
    title: "Story Map",
    subtitle: "Drei-Akt-Struktur mit Handlungssträngen",
    plotlines: "Handlungsstränge",
    herosJourney: "Heldenreise – Referenz",
  },
  conflicts: {
    title: "Konflikte & Tschechows Gewehr",
    subtitle: "Konflikte",
    newConflict: "Neuer Konflikt",
    planted: "Angelegt",
    active: "Aktiv",
    resolved: "Gelöst",
    name: "Name",
    typeLabel: "Typ",
    interpersonal: "Zwischenmenschlich",
    internal: "Innerlich",
    societal: "Gesellschaftlich",
    environmental: "Umwelt",
    chekhovsGun: "Tschechows Gewehr",
    description: "Beschreibung",
    status: "Status",
    notes: "Notizen",
  },
  search: {
    title: "Suche",
    placeholder: "Szenen, Entitäten und Tags durchsuchen...",
    results: "Ergebnisse",
    result: "Ergebnis",
    forQuery: "für",
    scenesCount: "Szenen",
    entitiesCount: "Entitäten",
    inChapter: "in",
    noResults: "Keine Ergebnisse gefunden.",
  },
  graph: {
    title: "Wissensgraph",
    subtitle: "Visuelle Verbindungen zwischen Kapiteln, Charakteren und Orten",
    showChapters: "Kapitel",
    showCharacters: "Charaktere",
    showLocations: "Orte",
    showOrganizations: "Organisationen",
    showConnections: "Verbindungen",
    zoomIn: "Vergrößern",
    zoomOut: "Verkleinern",
    resetView: "Ansicht zurücksetzen",
    connections: "Verbindungen",
    nodes: "Knoten",
  },
  sources: {
    title: "Quellen & Zitate",
    subtitle: "Forschungsquellen, Literaturverweise und Fußnoten verwalten",
    addSource: "Quelle hinzufügen",
    sourceTitle: "Titel",
    author: "Autor",
    year: "Jahr",
    url: "URL",
    publisher: "Verlag",
    pages: "Seiten",
    type: "Typ",
    book: "Buch",
    article: "Artikel",
    website: "Webseite",
    journal: "Zeitschrift",
    other: "Sonstiges",
    notes: "Notizen",
    footnotes: "Fußnoten",
    addFootnote: "Fußnote hinzufügen",
    footnoteText: "Fußnotentext...",
    linkedChapter: "Verknüpftes Kapitel",
    noSources: "Noch keine Quellen. Füge Forschungsmaterial und Referenzen hinzu.",
    searchSources: "Quellen suchen...",
    copyReference: "Referenz kopieren",
    insertFootnote: "Als Fußnote einfügen",
  },
  dialogue: {
    title: "Dialog-Zuordnung",
    subtitle: "Verfolge Charakter-Rede und Erwähnungen in deiner Geschichte",
    character: "Charakter",
    allCharacters: "Alle Charaktere",
    directSpeech: "Wörtliche Rede",
    mentioned: "Erwähnt",
    chapter: "Kapitel",
    scene: "Szene",
    noAttributions: "Noch keine Dialog-Zuordnungen. Markiere Text im Editor, um ihn Charakteren zuzuordnen.",
    filterByCharacter: "Nach Charakter filtern",
    filterByType: "Nach Typ filtern",
    speechType: "Rede",
    mentionType: "Erwähnung",
    allTypes: "Alle Typen",
    goToScene: "Zur Szene",
    count: "Anzahl",
  },
  common: {
    confirmDelete: "\"{name}\" löschen?",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    add: "Hinzufügen",
    close: "Schließen",
    back: "Zurück",
    search: "Suchen",
    noData: "Keine Daten",
    saved: "Erfolgreich gespeichert!",
    saving: "Speichere...",
    error: "Fehler",
    loading: "Laden...",
  },
};

const translations: Record<Language, Translations> = { en, de };

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
];
