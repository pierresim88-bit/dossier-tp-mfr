'use client';

import {
  BookOpenCheck,
  Check,
  ChefHat,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  ListChecks,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UtensilsCrossed,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { techniqueSources, techniques } from '@/lib/techniques';
import type { Formation } from '@/lib/techniques';

type TechniqueStatus =
  | 'À observer en entreprise'
  | 'À préparer'
  | 'À réaliser pendant le TP'
  | 'À consolider';

type SelectedTechnique = { name: string; status: TechniqueStatus };
type Production = {
  id: string;
  title: string;
  covers: string;
  description: string;
  ingredients: string;
  progression: string;
  material: string;
  presentation: string;
  hygiene: string;
};
type ScheduleRow = {
  id: string;
  step: string;
  responsible: string;
  action: string;
  control: string;
};
type Dossier = {
  formation: Formation;
  dossierNumber: string;
  diploma: string;
  group: string;
  period: string;
  sessionDates: string;
  theme: string;
  menu: string;
  author: string;
  participant: string;
  situation: string;
  objectives: string;
  mission: string;
  expectedTraces: string;
  researchQuestions: string;
  sources: string;
  constraints: string;
  pointsToPrepare: string;
  selectedTechniques: SelectedTechnique[];
  productions: Production[];
  hygieneAnalysis: string;
  priorityControl: string;
  schedule: ScheduleRow[];
  sketches: string;
  success: string;
  difficulty: string;
  nextGoal: string;
  tutorFeedback: string;
};

const tabs = [
  ['cadre', 'Cadre'],
  ['situation', 'Situation'],
  ['techniques', 'Techniques'],
  ['fiches', 'Fiches techniques'],
  ['hygiene', 'Hygiène'],
  ['organisation', 'Ordonnancement'],
  ['croquis', 'Croquis'],
  ['bilan', 'Bilan'],
] as const;
type TabId = (typeof tabs)[number][0];

const uid = () => Math.random().toString(36).slice(2, 9);
const emptyProduction = (index: number): Production => ({
  id: uid(), title: `Production ${index}`, covers: '', description: '', ingredients: '',
  progression: '', material: '', presentation: '', hygiene: '',
});
const emptyScheduleRow = (index: number): ScheduleRow => ({
  id: uid(), step: `Étape ${index}`, responsible: '', action: '', control: '',
});
const makeDossier = (formation: Formation): Dossier => ({
  formation,
  dossierNumber: '',
  diploma: formation === 'cuisine' ? 'BP Arts de la cuisine' : 'BP Arts du service et commercialisation en restauration',
  group: '', period: '', sessionDates: '', theme: '', menu: '', author: '', participant: '',
  situation: '', objectives: '', mission: '', expectedTraces: '', researchQuestions: '', sources: '',
  constraints: '', pointsToPrepare: '', selectedTechniques: [],
  productions: [emptyProduction(1), emptyProduction(2), emptyProduction(3)],
  hygieneAnalysis: '', priorityControl: '',
  schedule: Array.from({ length: 6 }, (_, index) => emptyScheduleRow(index + 1)),
  sketches: '', success: '', difficulty: '', nextGoal: '', tutorFeedback: '',
});
const storageKey = 'trame-dossier-tp-mfr-v1';

function Field({ label, value, onChange, placeholder, wide }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; wide?: boolean;
}) {
  return <label className={wide ? 'field field-wide' : 'field'}><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function TextArea({ label, value, onChange, placeholder, rows = 5 }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number;
}) {
  return <label className="field field-wide"><span>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} /></label>;
}

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return <header className="section-heading"><span>{eyebrow}</span><h2>{title}</h2><p>{intro}</p></header>;
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [formationChoice, setFormationChoice] = useState<Formation | ''>('');
  const [activeTab, setActiveTab] = useState<TabId>('cadre');
  const [dossier, setDossier] = useState<Dossier>(() => makeDossier('cuisine'));
  const [techniqueSearch, setTechniqueSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const restored = JSON.parse(raw) as Dossier;
      if (restored.formation && restored.productions && restored.schedule) {
        setDossier({ ...makeDossier(restored.formation), ...restored });
        setFormationChoice(restored.formation);
        setStarted(true);
      }
    } catch { window.localStorage.removeItem(storageKey); }
  }, []);

  useEffect(() => {
    if (!started) return;
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(dossier)); setSaved(true);
      window.setTimeout(() => setSaved(false), 1200);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [dossier, started]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const reportError = (error: unknown) => console.warn('WebMCP', error);

    void Promise.resolve(context.registerTool({
      name: 'start_practical_dossier',
      title: 'Ouvrir un dossier de travaux pratiques',
      description: 'Choisit la formation et ouvre un nouveau dossier pédagogique vide dans l’interface.',
      inputSchema: {
        type: 'object',
        properties: { formation: { type: 'string', enum: ['cuisine', 'service'] } },
        required: ['formation'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const formation = (input as { formation?: unknown }).formation;
        if (formation !== 'cuisine' && formation !== 'service') throw new Error('Formation invalide');
        setFormationChoice(formation);
        setDossier(makeDossier(formation));
        setStarted(true);
        setActiveTab('cadre');
        return { formation, section: 'cadre', status: 'opened' };
      },
    }, { signal: lifecycle.signal })).catch(reportError);

    void Promise.resolve(context.registerTool({
      name: 'navigate_practical_dossier',
      title: 'Ouvrir une partie du dossier',
      description: 'Affiche l’une des huit parties du dossier actuellement ouvert.',
      inputSchema: {
        type: 'object',
        properties: { section: { type: 'string', enum: tabs.map(([id]) => id) } },
        required: ['section'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        const section = (input as { section?: unknown }).section;
        if (!tabs.some(([id]) => id === section)) throw new Error('Partie invalide');
        setActiveTab(section as TabId);
        return { section, status: 'visible' };
      },
    }, { signal: lifecycle.signal })).catch(reportError);

    return () => lifecycle.abort();
  }, []);

  useEffect(() => {
    const beforePrint = () => setPrintMode(true);
    const afterPrint = () => setPrintMode(false);
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  const groups = useMemo(() => {
    const query = techniqueSearch.trim().toLocaleLowerCase('fr');
    if (!query) return techniques[dossier.formation];
    return techniques[dossier.formation].map((group) => ({
      ...group, items: group.items.filter((item) => item.toLocaleLowerCase('fr').includes(query)),
    })).filter((group) => group.items.length);
  }, [dossier.formation, techniqueSearch]);

  const update = <K extends keyof Dossier>(key: K, value: Dossier[K]) => setDossier((current) => ({ ...current, [key]: value }));
  const chooseFormation = () => {
    if (!formationChoice) return;
    setDossier(makeDossier(formationChoice)); setStarted(true); setActiveTab('cadre');
  };
  const switchFormation = (formation: Formation) => {
    setFormationChoice(formation);
    setDossier((current) => ({ ...current, formation,
      diploma: formation === 'cuisine' ? 'BP Arts de la cuisine' : 'BP Arts du service et commercialisation en restauration',
      selectedTechniques: [],
    }));
  };
  const toggleTechnique = (name: string) => setDossier((current) => {
    const exists = current.selectedTechniques.some((item) => item.name === name);
    return { ...current, selectedTechniques: exists
      ? current.selectedTechniques.filter((item) => item.name !== name)
      : [...current.selectedTechniques, { name, status: 'À préparer' as TechniqueStatus }],
    };
  });
  const updateTechniqueStatus = (name: string, status: TechniqueStatus) => setDossier((current) => ({
    ...current, selectedTechniques: current.selectedTechniques.map((item) => item.name === name ? { ...item, status } : item),
  }));
  const updateProduction = (id: string, key: keyof Production, value: string) => update('productions', dossier.productions.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const updateSchedule = (id: string, key: keyof ScheduleRow, value: string) => update('schedule', dossier.schedule.map((item) => item.id === id ? { ...item, [key]: value } : item));

  const exportDossier = () => {
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `dossier-tp-${dossier.formation}-${dossier.dossierNumber || 'modele'}.json`; anchor.click(); URL.revokeObjectURL(url);
    setNotice('Copie du dossier sauvegardée');
    window.setTimeout(() => setNotice(''), 2500);
  };
  const importDossier = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result)) as Dossier;
        if (!imported.formation || !imported.productions || !imported.schedule) throw new Error('Format incorrect');
        setDossier({ ...makeDossier(imported.formation), ...imported }); setFormationChoice(imported.formation); setStarted(true); setActiveTab('cadre');
        setNotice('Dossier importé avec succès');
        window.setTimeout(() => setNotice(''), 3000);
      } catch {
        setNotice("Import impossible : choisissez une sauvegarde .json créée par cette trame.");
      }
    };
    reader.readAsText(file); event.target.value = '';
  };
  const resetDossier = () => {
    if (!window.confirm('Créer un dossier vide et effacer les données enregistrées sur cet appareil ?')) return;
    const formation = dossier.formation; window.localStorage.removeItem(storageKey); setDossier(makeDossier(formation)); setActiveTab('cadre');
  };

  if (!started) {
    return <main className="welcome-shell"><section className="welcome-card">
      <div className="brand-lockup"><div className="brand-mark" aria-hidden="true">MFR</div><div><strong>La Palette des Saveurs</strong><span>Trame pédagogique réutilisable</span></div></div>
      <div className="welcome-copy"><span className="kicker">Dossier de travaux pratiques</span><h1>Choisir la formation</h1><p>Le choix ouvre un dossier vide avec les techniques professionnelles correspondant au référentiel sélectionné.</p></div>
      <label className="formation-select"><span>Formation</span><select value={formationChoice} onChange={(event) => setFormationChoice(event.target.value as Formation | '')}>
        <option value="">Sélectionner une formation</option><option value="cuisine">BP Arts de la cuisine</option><option value="service">BP Arts du service et commercialisation en restauration</option>
      </select></label>
      <button className="primary-button welcome-button" disabled={!formationChoice} onClick={chooseFormation}>Ouvrir le dossier <ChevronRight size={19} /></button>
      <p className="privacy-note">Les données restent sur cet appareil. Aucun compte ni serveur n'est nécessaire.</p>
    </section></main>;
  }

  return <main className="app-shell">
    <header className="app-header">
      <div className="brand-lockup compact"><div className="brand-mark" aria-hidden="true">MFR</div><div><strong>Dossier de travaux pratiques</strong><span>Modèle maître complétable</span></div></div>
      <div className="header-actions">
        <span className={saved ? 'save-state visible' : 'save-state'}><Save size={14} /> Enregistré</span>
        {notice && <span className="header-notice" role="status">{notice}</span>}
        <label className="ghost-button import-button"><Upload size={17} /> Importer un dossier<input type="file" accept=".json,application/json" onChange={importDossier} /></label>
        <button className="ghost-button" onClick={exportDossier}><Download size={17} /> Sauvegarder</button>
        <button className="ghost-button" onClick={() => window.print()}><Printer size={17} /> Imprimer</button>
      </div>
    </header>
    <div className="workspace">
      <aside className="sidebar">
        <div className={`formation-badge ${dossier.formation}`}>
          {dossier.formation === 'cuisine' ? <ChefHat /> : <UtensilsCrossed />}
          <div><span>Formation choisie</span><strong>{dossier.formation === 'cuisine' ? 'Cuisine' : 'Service'}</strong></div>
        </div>
        <nav aria-label="Parties du dossier">{tabs.map(([id, label], index) => <button key={id} className={activeTab === id ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab(id)}><span>{index + 1}</span>{label}</button>)}</nav>
        <button className="reset-button" onClick={resetDossier}><RotateCcw size={16} /> Nouveau dossier vide</button>
      </aside>
      <section className="document-surface">
        <div className="document-topline"><label>Formation<select value={dossier.formation} onChange={(event) => switchFormation(event.target.value as Formation)}><option value="cuisine">BP Arts de la cuisine</option><option value="service">BP Arts du service</option></select></label><span>Dossier {dossier.dossierNumber || 'sans numéro'}</span></div>

        {(printMode || activeTab === 'cadre') && <div className="section-content">
          <SectionHeading eyebrow="Partie 1" title="Cadre de la séance" intro="Renseigner uniquement les éléments qui situent cette séance dans le plan de formation." />
          <div className="field-grid">
            <Field label="Numéro du dossier" value={dossier.dossierNumber} onChange={(v) => update('dossierNumber', v)} placeholder="Exemple 03" />
            <Field label="Auteur ou équipe" value={dossier.author} onChange={(v) => update('author', v)} />
            <Field label="Diplôme" value={dossier.diploma} onChange={(v) => update('diploma', v)} />
            <Field label="Groupe" value={dossier.group} onChange={(v) => update('group', v)} />
            <Field label="Période d'alternance" value={dossier.period} onChange={(v) => update('period', v)} />
            <Field label="Dates de la session" value={dossier.sessionDates} onChange={(v) => update('sessionDates', v)} />
            <Field wide label="Thème de la session" value={dossier.theme} onChange={(v) => update('theme', v)} />
            <div className="menu-editor">
              <div className="menu-editor-title"><UtensilsCrossed size={22} /><div><strong>Menu de la séance</strong><span>À adapter librement au thème et aux productions retenues</span></div></div>
              <textarea value={dossier.menu} onChange={(event) => update('menu', event.target.value)} rows={9} placeholder={'ENTRÉE\n\nPLAT PRINCIPAL ET GARNITURES\n\nFROMAGES\n\nDESSERT\n\nBOISSONS OU ACCORDS'} />
            </div>
            <Field wide label="Participant ou apprenti" value={dossier.participant} onChange={(v) => update('participant', v)} />
          </div>
        </div>}

        {(printMode || activeTab === 'situation') && <div className="section-content">
          <SectionHeading eyebrow="Partie 2" title="Situation professionnelle" intro="La situation donne du sens au thème et guide ce qui sera recherché, préparé, réalisé et évalué." />
          <TextArea label="Situation issue du plan de formation" value={dossier.situation} onChange={(v) => update('situation', v)} rows={7} />
          <TextArea label="Objectifs de la période d'alternance" value={dossier.objectives} onChange={(v) => update('objectives', v)} />
          <TextArea label="Mission confiée pendant le TP" value={dossier.mission} onChange={(v) => update('mission', v)} />
          <TextArea label="Traces ou productions attendues" value={dossier.expectedTraces} onChange={(v) => update('expectedTraces', v)} rows={3} />
          <div className="two-columns"><TextArea label="Questions de recherche" value={dossier.researchQuestions} onChange={(v) => update('researchQuestions', v)} /><TextArea label="Sources personnes ou documents" value={dossier.sources} onChange={(v) => update('sources', v)} /></div>
        </div>}

        {(printMode || activeTab === 'techniques') && <div className="section-content">
          <SectionHeading eyebrow="Partie 3" title="Techniques professionnelles" intro={`Sélectionner les techniques à mobiliser pour la pratique en ${dossier.formation === 'cuisine' ? 'cuisine' : 'service'}.`} />
          <div className="technique-toolbar"><label className="search-field"><Search size={18} /><input value={techniqueSearch} onChange={(event) => setTechniqueSearch(event.target.value)} placeholder="Rechercher une technique" /></label><span>{dossier.selectedTechniques.length} sélectionnée(s)</span></div>
          <div className="technique-layout"><div className="technique-catalogue">
            {groups.map((group) => <details key={group.category} open={!techniqueSearch}><summary>{group.category}<span>{group.items.length}</span></summary><div className="technique-options">
              {group.items.map((item) => { const selected = dossier.selectedTechniques.some((entry) => entry.name === item); return <button key={item} className={selected ? 'technique-option selected' : 'technique-option'} onClick={() => toggleTechnique(item)}><span className="check-box">{selected && <Check size={14} />}</span>{item}</button>; })}
            </div></details>)}
          </div><aside className="selected-panel"><h3><ListChecks size={19} /> Sélection de la séance</h3>
            {dossier.selectedTechniques.length === 0 ? <p className="empty-state">Aucune technique sélectionnée.</p> : dossier.selectedTechniques.map((item) => <div className="selected-technique" key={item.name}><strong>{item.name}</strong><div><select value={item.status} onChange={(event) => updateTechniqueStatus(item.name, event.target.value as TechniqueStatus)}><option>À observer en entreprise</option><option>À préparer</option><option>À réaliser pendant le TP</option><option>À consolider</option></select><button aria-label={`Retirer ${item.name}`} onClick={() => toggleTechnique(item.name)}><Trash2 size={15} /></button></div></div>)}
          </aside></div>
          <TextArea label="Points techniques à préparer et critères de réussite" value={dossier.pointsToPrepare} onChange={(v) => update('pointsToPrepare', v)} rows={6} />
          <TextArea label="Contraintes communes de la séance" value={dossier.constraints} onChange={(v) => update('constraints', v)} rows={4} />
          <p className="source-note">Liste structurée à partir de l'annexe VIII du référentiel officiel. <a href={techniqueSources[dossier.formation]} target="_blank" rel="noreferrer">Consulter le référentiel</a></p>
        </div>}

        {(printMode || activeTab === 'fiches') && <div className="section-content">
          <SectionHeading eyebrow="Partie 4" title="Fiches techniques" intro="Créer une fiche par production. Les fiches peuvent être ajoutées ou supprimées selon la séance." />
          <div className="production-list">{dossier.productions.map((production, index) => <article className="production-card" key={production.id}>
            <header><span>Fiche technique {index + 1}</span>{dossier.productions.length > 1 && <button aria-label="Supprimer cette fiche" onClick={() => update('productions', dossier.productions.filter((item) => item.id !== production.id))}><Trash2 size={17} /></button>}</header>
            <div className="field-grid compact-grid"><Field wide label="Intitulé de la production" value={production.title} onChange={(v) => updateProduction(production.id, 'title', v)} /><Field label="Nombre de couverts ou portions" value={production.covers} onChange={(v) => updateProduction(production.id, 'covers', v)} /><Field label="Descriptif retenu" value={production.description} onChange={(v) => updateProduction(production.id, 'description', v)} /></div>
            <TextArea label="Denrées unités et quantités" value={production.ingredients} onChange={(v) => updateProduction(production.id, 'ingredients', v)} rows={4} />
            <TextArea label="Progression technique étapes et contrôles" value={production.progression} onChange={(v) => updateProduction(production.id, 'progression', v)} rows={5} />
            <div className="two-columns"><TextArea label="Matériel spécifique" value={production.material} onChange={(v) => updateProduction(production.id, 'material', v)} rows={3} /><TextArea label="Présentation dressage ou mise en place" value={production.presentation} onChange={(v) => updateProduction(production.id, 'presentation', v)} rows={3} /></div>
            <TextArea label="Point critique d'hygiène" value={production.hygiene} onChange={(v) => updateProduction(production.id, 'hygiene', v)} rows={3} />
          </article>)}</div>
          <button className="secondary-button" onClick={() => update('productions', [...dossier.productions, emptyProduction(dossier.productions.length + 1)])}><Plus size={17} /> Ajouter une fiche technique</button>
        </div>}

        {(printMode || activeTab === 'hygiene') && <div className="section-content">
          <SectionHeading eyebrow="Partie 5" title="Points critiques d'hygiène" intro="Repérer les dangers, choisir les mesures de maîtrise et préciser les contrôles attendus." />
          <div className="guidance-grid"><div><ClipboardCheck /><strong>Dangers</strong><span>Biologiques chimiques physiques allergènes</span></div><div><BookOpenCheck /><strong>Maîtrise</strong><span>Organisation températures nettoyage séparation</span></div><div><FileText /><strong>Preuves</strong><span>Traçabilité étiquetage relevés validation</span></div></div>
          <TextArea label="Analyse des étapes produits dangers mesures et contrôles" value={dossier.hygieneAnalysis} onChange={(v) => update('hygieneAnalysis', v)} rows={13} />
          <TextArea label="Point critique prioritaire retenu" value={dossier.priorityControl} onChange={(v) => update('priorityControl', v)} rows={4} />
        </div>}

        {(printMode || activeTab === 'organisation') && <div className="section-content wide-section">
          <SectionHeading eyebrow="Partie 6" title="Ordonnancement par étapes" intro="Organiser la progression du travail. Chaque ligne correspond à une étape observable et à son contrôle." />
          <div className="schedule-table"><div className="schedule-head"><span>Étape</span><span>Responsable ou poste</span><span>Action attendue</span><span>Contrôle validation coordination</span><span /></div>
            {dossier.schedule.map((row) => <div className="schedule-row" key={row.id}><input aria-label="Étape" value={row.step} onChange={(event) => updateSchedule(row.id, 'step', event.target.value)} /><input aria-label="Responsable ou poste" value={row.responsible} onChange={(event) => updateSchedule(row.id, 'responsible', event.target.value)} /><textarea aria-label="Action attendue" value={row.action} onChange={(event) => updateSchedule(row.id, 'action', event.target.value)} rows={2} /><textarea aria-label="Contrôle et validation" value={row.control} onChange={(event) => updateSchedule(row.id, 'control', event.target.value)} rows={2} /><button aria-label="Supprimer cette étape" onClick={() => update('schedule', dossier.schedule.filter((item) => item.id !== row.id))}><Trash2 size={16} /></button></div>)}
          </div><button className="secondary-button" onClick={() => update('schedule', [...dossier.schedule, emptyScheduleRow(dossier.schedule.length + 1)])}><Plus size={17} /> Ajouter une étape</button>
        </div>}

        {(printMode || activeTab === 'croquis') && <div className="section-content">
          <SectionHeading eyebrow="Partie 7" title="Croquis et présentation" intro="Décrire ou dessiner le résultat attendu avant la réalisation." />
          <div className="sketch-zone" aria-label="Zone de croquis imprimable"><Sparkles size={28} /><span>Zone libre pour croquis schéma plan de salle ou légende</span></div>
          <TextArea label="Légende emplacement des éléments ou choix de présentation" value={dossier.sketches} onChange={(v) => update('sketches', v)} rows={7} />
        </div>}

        {(printMode || activeTab === 'bilan') && <div className="section-content">
          <SectionHeading eyebrow="Partie 8" title="Bilan réflexif" intro="Identifier les réussites, les difficultés et la prochaine étape de progression." />
          <div className="reflection-grid"><TextArea label="J'ai réussi" value={dossier.success} onChange={(v) => update('success', v)} rows={6} /><TextArea label="Je n'ai pas encore réussi" value={dossier.difficulty} onChange={(v) => update('difficulty', v)} rows={6} /><TextArea label="Mon prochain objectif" value={dossier.nextGoal} onChange={(v) => update('nextGoal', v)} rows={6} /><TextArea label="Retour du formateur ou du tuteur" value={dossier.tutorFeedback} onChange={(v) => update('tutorFeedback', v)} rows={6} /></div>
          <div className="completion-card"><GraduationCap /><div><strong>Dossier prêt à être transmis</strong><span>Vérifier la situation, les techniques, les fiches et l'ordonnancement avant impression.</span></div><button className="primary-button" onClick={() => window.print()}><Printer size={17} /> Imprimer le dossier</button></div>
        </div>}
      </section>
    </div>
  </main>;
}
