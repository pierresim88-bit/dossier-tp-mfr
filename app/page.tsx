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
  ['cadre', 'Le TP'],
  ['techniques', 'Techniques'],
  ['fiches', 'Fiches techniques'],
  ['organisation', 'Ordonnancement'],
  ['bilan', 'Finaliser'],
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
const storageKey = 'trame-dossier-tp-mfr-v2';
const legacyStorageKey = 'trame-dossier-tp-mfr-v1';

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

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey);
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
      description: 'Affiche l’une des cinq parties du dossier actuellement ouvert.',
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
  const updateProduction = (id: string, key: keyof Production, value: string) => setDossier((current) => ({
    ...current,
    productions: current.productions.map((item) => item.id === id ? { ...item, [key]: value } : item),
  }));
  const updateSchedule = (id: string, key: keyof ScheduleRow, value: string) => setDossier((current) => ({
    ...current,
    schedule: current.schedule.map((item) => item.id === id ? { ...item, [key]: value } : item),
  }));

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
    const formation = dossier.formation;
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(legacyStorageKey);
    setDossier(makeDossier(formation)); setActiveTab('cadre');
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
        <label className="ghost-button import-button"><Upload size={17} /> Reprendre un brouillon<input type="file" accept=".json,application/json" onChange={importDossier} /></label>
        <button className="ghost-button" onClick={exportDossier}><Download size={17} /> Sauvegarder le brouillon</button>
        <button className="primary-button" onClick={() => window.print()}><Printer size={17} /> Exporter tout le dossier</button>
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

        <div className={`section-content ${activeTab === 'cadre' ? 'is-active' : ''}`}>
          <SectionHeading eyebrow="1 · Le TP" title="Préparer le dossier" intro="Les informations indispensables pour contextualiser la séance et donner le dossier aux apprentis." />
          <div className="field-grid essential-grid">
            <Field label="Numéro du dossier" value={dossier.dossierNumber} onChange={(v) => update('dossierNumber', v)} placeholder="Exemple : 02" />
            <Field label="Dates de la session" value={dossier.sessionDates} onChange={(v) => update('sessionDates', v)} placeholder="Exemple : du 14 au 19 septembre" />
            <Field wide label="Thème de la session" value={dossier.theme} onChange={(v) => update('theme', v)} />
          </div>
          <TextArea label="Situation professionnelle issue du plan de formation" value={dossier.situation} onChange={(v) => update('situation', v)} rows={6} placeholder="Copier ici la situation du plan de formation." />
          <div className="menu-editor">
            <div className="menu-editor-title"><UtensilsCrossed size={22} /><div><strong>Menu du TP</strong><span>Ce texte reste enregistré pendant toute la préparation.</span></div></div>
            <textarea value={dossier.menu} onChange={(event) => update('menu', event.target.value)} rows={10} placeholder={'ENTRÉE\n\nPLAT ET GARNITURES\n\nFROMAGE\n\nDESSERT'} />
          </div>
          <TextArea label="Consigne ou mission donnée aux apprentis" value={dossier.mission} onChange={(v) => update('mission', v)} rows={4} placeholder="Une consigne courte suffit." />
        </div>

        <div className={`section-content ${activeTab === 'techniques' ? 'is-active' : ''}`}>
          <SectionHeading eyebrow="2 · Techniques" title="Choisir les techniques professionnelles" intro={`Cocher uniquement les techniques réellement travaillées pendant le TP ${dossier.formation === 'cuisine' ? 'de cuisine' : 'de service'}.`} />
          <div className="technique-toolbar"><label className="search-field"><Search size={18} /><input value={techniqueSearch} onChange={(event) => setTechniqueSearch(event.target.value)} placeholder="Rechercher une technique" /></label><span>{dossier.selectedTechniques.length} sélectionnée(s)</span></div>
          <div className="technique-layout"><div className="technique-catalogue">
            {groups.map((group) => <details key={group.category} open={!techniqueSearch}><summary>{group.category}<span>{group.items.length}</span></summary><div className="technique-options">
              {group.items.map((item) => { const selected = dossier.selectedTechniques.some((entry) => entry.name === item); return <button key={item} type="button" className={selected ? 'technique-option selected' : 'technique-option'} onClick={() => toggleTechnique(item)}><span className="check-box">{selected && <Check size={14} />}</span>{item}</button>; })}
            </div></details>)}
          </div><aside className="selected-panel"><h3><ListChecks size={19} /> Techniques retenues</h3>
            {dossier.selectedTechniques.length === 0 ? <p className="empty-state">Cliquez sur les techniques à intégrer au dossier.</p> : dossier.selectedTechniques.map((item) => <div className="selected-technique simple" key={item.name}><strong>{item.name}</strong><button type="button" aria-label={`Retirer ${item.name}`} onClick={() => toggleTechnique(item.name)}><Trash2 size={15} /></button></div>)}
          </aside></div>
          <TextArea label="Points à préparer et critères de réussite" value={dossier.pointsToPrepare} onChange={(v) => update('pointsToPrepare', v)} rows={6} placeholder="Gestes attendus, vigilance, résultat recherché…" />
          <p className="source-note">Techniques issues du référentiel officiel. <a href={techniqueSources[dossier.formation]} target="_blank" rel="noreferrer">Consulter le référentiel</a></p>
        </div>

        <div className={`section-content ${activeTab === 'fiches' ? 'is-active' : ''}`}>
          <SectionHeading eyebrow="3 · Fiches techniques" title="Préparer les productions" intro="Trois fiches sont proposées par défaut. Ne renseigner que les rubriques utiles au TP." />
          <div className="production-list">{dossier.productions.map((production, index) => <article className="production-card" key={production.id}>
            <header><span>Fiche technique {index + 1}</span>{dossier.productions.length > 1 && <button type="button" aria-label="Supprimer cette fiche" onClick={() => update('productions', dossier.productions.filter((item) => item.id !== production.id))}><Trash2 size={17} /></button>}</header>
            <div className="field-grid compact-grid"><Field wide label="Intitulé de la production" value={production.title} onChange={(v) => updateProduction(production.id, 'title', v)} /><Field wide label="Nombre de couverts ou portions" value={production.covers} onChange={(v) => updateProduction(production.id, 'covers', v)} /></div>
            <div className="technical-sheet-grid"><TextArea label="Denrées · unités · quantités" value={production.ingredients} onChange={(v) => updateProduction(production.id, 'ingredients', v)} rows={8} /><TextArea label="Progression technique · étapes · contrôles" value={production.progression} onChange={(v) => updateProduction(production.id, 'progression', v)} rows={8} /></div>
            <TextArea label="Point critique d'hygiène ou de sécurité" value={production.hygiene} onChange={(v) => updateProduction(production.id, 'hygiene', v)} rows={3} />
          </article>)}</div>
          <button className="secondary-button" type="button" onClick={() => update('productions', [...dossier.productions, emptyProduction(dossier.productions.length + 1)])}><Plus size={17} /> Ajouter une fiche technique</button>
        </div>

        <div className={`section-content wide-section ${activeTab === 'organisation' ? 'is-active' : ''}`}>
          <SectionHeading eyebrow="4 · Ordonnancement" title="Organiser le travail" intro="Un ordonnancement simple, sans horaires : l'ordre des tâches, la répartition chef/commis et les contrôles." />
          <div className="schedule-table"><div className="schedule-head"><span>Ordre</span><span>Chef / commis</span><span>Production ou tâche</span><span>Point de contrôle</span><span /></div>
            {dossier.schedule.map((row) => <div className="schedule-row" key={row.id}><input aria-label="Ordre" value={row.step} onChange={(event) => updateSchedule(row.id, 'step', event.target.value)} /><input aria-label="Chef ou commis" value={row.responsible} onChange={(event) => updateSchedule(row.id, 'responsible', event.target.value)} /><textarea aria-label="Production ou tâche" value={row.action} onChange={(event) => updateSchedule(row.id, 'action', event.target.value)} rows={2} /><textarea aria-label="Point de contrôle" value={row.control} onChange={(event) => updateSchedule(row.id, 'control', event.target.value)} rows={2} /><button type="button" aria-label="Supprimer cette étape" onClick={() => update('schedule', dossier.schedule.filter((item) => item.id !== row.id))}><Trash2 size={16} /></button></div>)}
          </div><button className="secondary-button" type="button" onClick={() => update('schedule', [...dossier.schedule, emptyScheduleRow(dossier.schedule.length + 1)])}><Plus size={17} /> Ajouter une étape</button>
        </div>

        <div className={`section-content ${activeTab === 'bilan' ? 'is-active' : ''}`}>
          <SectionHeading eyebrow="5 · Finaliser" title="Hygiène, présentation et bilan" intro="Les dernières pages du dossier à remettre aux apprentis." />
          <div className="final-block">
            <h3><ClipboardCheck size={20} /> Points critiques d'hygiène</h3>
            <TextArea label="Quels sont les dangers et les mesures de maîtrise à prévoir ?" value={dossier.hygieneAnalysis} onChange={(v) => update('hygieneAnalysis', v)} rows={6} />
            <TextArea label="Quel point critique devra être contrôlé en priorité ?" value={dossier.priorityControl} onChange={(v) => update('priorityControl', v)} rows={3} />
          </div>
          <div className="final-block">
            <h3><Sparkles size={20} /> Croquis de la présentation</h3>
            <div className="sketch-zone" aria-label="Zone de croquis imprimable"><span>Zone libre pour le croquis de présentation</span></div>
          </div>
          <div className="final-block">
            <h3><GraduationCap size={20} /> Bilan réflexif de l'apprenti</h3>
            <div className="reflection-grid three"><TextArea label="J'ai réussi" value={dossier.success} onChange={(v) => update('success', v)} rows={5} /><TextArea label="Je dois encore travailler" value={dossier.difficulty} onChange={(v) => update('difficulty', v)} rows={5} /><TextArea label="Mon prochain objectif" value={dossier.nextGoal} onChange={(v) => update('nextGoal', v)} rows={5} /></div>
          </div>
          <div className="completion-card"><GraduationCap /><div><strong>Le dossier complet est prêt</strong><span>L'export regroupe maintenant les cinq parties, quelle que soit la partie affichée.</span></div><button className="primary-button" type="button" onClick={() => window.print()}><Printer size={17} /> Exporter tout le dossier</button></div>
        </div>
      </section>
    </div>
  </main>;
}
