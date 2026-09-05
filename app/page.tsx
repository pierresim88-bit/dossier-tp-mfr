'use client';

import {
  Check,
  ChefHat,
  ChevronRight,
  ClipboardCheck,
  Download,
  GlassWater,
  GraduationCap,
  LayoutTemplate,
  ListChecks,
  MapPinned,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  UtensilsCrossed,
  Wine,
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
type ServiceCourseWork = {
  technique: string;
  material: string;
  preparation: string;
  argument: string;
  wine: string;
  vineyard: string;
  pairing: string;
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
  guestCount: string;
  tableCount: string;
  roomContext: string;
  roomLayout: string;
  serviceType: string;
  serviceCourseWork: Record<string, ServiceCourseWork>;
  cocktailName: string;
  cocktailType: string;
  cocktailGlass: string;
  cocktailIngredients: string;
  cocktailMethod: string;
  cocktailDecoration: string;
  cocktailArgument: string;
  serverSuccess: string;
  serverDifficulty: string;
  serverNextGoal: string;
  commisSuccess: string;
  commisDifficulty: string;
  commisNextGoal: string;
};

const cuisineTabs = [
  ['cadre', 'Le TP'],
  ['techniques', 'Techniques'],
  ['fiches', 'Fiches techniques'],
  ['organisation', 'Ordonnancement'],
  ['bilan', 'Finaliser'],
] as const;
const serviceTabs = [
  ['cadre', 'Le service'],
  ['techniques', 'Techniques par plat'],
  ['fiches', 'Vente & vins'],
  ['organisation', 'Cocktail & salle'],
  ['bilan', 'Bilan'],
] as const;
type TabId = (typeof cuisineTabs)[number][0];

const emptyServiceCourse = (): ServiceCourseWork => ({
  technique: '', material: '', preparation: '', argument: '', wine: '', vineyard: '', pairing: '',
});

const serviceTechniqueOptions = techniques.service.flatMap((group) => group.items);
const vineyards = [
  'Alsace', 'Beaujolais', 'Bordeaux', 'Bourgogne', 'Champagne', 'Corse', 'Jura',
  'Languedoc-Roussillon', 'Lorraine', 'Provence', 'Savoie-Bugey', 'Sud-Ouest',
  'Vallée de la Loire', 'Vallée du Rhône',
];
const menuHeaders = /^(menu|entrée|entrées|plat|plats|plat principal|plats principaux|garniture|garnitures|fromage|fromages|dessert|desserts|boisson|boissons)$/i;

function menuProductions(menu: string) {
  const blocks = menu.split(/\n\s*\n/).map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean)).filter((block) => block.length);
  const fromBlocks = blocks.map((lines) => {
    const content = menuHeaders.test(lines[0]) ? lines.slice(1) : lines;
    return content.join(' — ');
  }).filter(Boolean);
  if (fromBlocks.length > 1) return fromBlocks;
  return menu.split('\n').map((line) => line.trim()).filter((line) => line && !menuHeaders.test(line));
}

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
  guestCount: '', tableCount: '', roomContext: '', roomLayout: '', serviceType: '',
  serviceCourseWork: {},
  cocktailName: '', cocktailType: '', cocktailGlass: '', cocktailIngredients: '',
  cocktailMethod: '', cocktailDecoration: '', cocktailArgument: '',
  serverSuccess: '', serverDifficulty: '', serverNextGoal: '',
  commisSuccess: '', commisDifficulty: '', commisNextGoal: '',
});
const storageKey = 'trame-dossier-tp-mfr-v3';
const legacyStorageKeys = ['trame-dossier-tp-mfr-v2', 'trame-dossier-tp-mfr-v1'];

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
    const raw = window.localStorage.getItem(storageKey) ?? legacyStorageKeys.map((key) => window.localStorage.getItem(key)).find(Boolean);
    if (!raw) return;
    try {
      const restored = JSON.parse(raw) as Dossier;
      if (restored.formation && restored.productions && restored.schedule) {
        setDossier({ ...makeDossier(restored.formation), ...restored, serviceCourseWork: restored.serviceCourseWork ?? {} });
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
        properties: { section: { type: 'string', enum: cuisineTabs.map(([id]) => id) } },
        required: ['section'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        const section = (input as { section?: unknown }).section;
        if (!cuisineTabs.some(([id]) => id === section)) throw new Error('Partie invalide');
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
  const tabs = dossier.formation === 'cuisine' ? cuisineTabs : serviceTabs;
  const serviceCourses = useMemo(() => menuProductions(dossier.menu), [dossier.menu]);

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
  const updateServiceCourse = (course: string, key: keyof ServiceCourseWork, value: string) => setDossier((current) => ({
    ...current,
    serviceCourseWork: {
      ...current.serviceCourseWork,
      [course]: { ...(current.serviceCourseWork[course] ?? emptyServiceCourse()), [key]: value },
    },
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
        setDossier({ ...makeDossier(imported.formation), ...imported, serviceCourseWork: imported.serviceCourseWork ?? {} }); setFormationChoice(imported.formation); setStarted(true); setActiveTab('cadre');
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
    legacyStorageKeys.forEach((key) => window.localStorage.removeItem(key));
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

  return <main className={`app-shell ${dossier.formation === 'service' ? 'service-mode' : 'cuisine-mode'}`}>
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
          <SectionHeading eyebrow={dossier.formation === 'cuisine' ? '1 · Le TP' : '1 · Le service'} title={dossier.formation === 'cuisine' ? 'Préparer le dossier' : 'Structurer la prestation'} intro={dossier.formation === 'cuisine' ? 'Les informations indispensables pour contextualiser la séance et donner le dossier aux apprentis.' : 'Le contexte et le menu sont saisis une seule fois. Ils alimentent ensuite tout le dossier de service.'} />
          <div className="field-grid essential-grid">
            <Field label="Numéro du dossier" value={dossier.dossierNumber} onChange={(v) => update('dossierNumber', v)} placeholder="Exemple : 02" />
            <Field label="Dates de la session" value={dossier.sessionDates} onChange={(v) => update('sessionDates', v)} placeholder="Exemple : du 14 au 19 septembre" />
            <Field wide label="Thème de la session" value={dossier.theme} onChange={(v) => update('theme', v)} />
          </div>
          <TextArea label="Situation professionnelle issue du plan de formation" value={dossier.situation} onChange={(v) => update('situation', v)} rows={6} placeholder="Copier ici la situation du plan de formation." />
          {dossier.formation === 'service' && <div className="service-context-card">
            <h3><LayoutTemplate size={20} /> Contexte de la prestation</h3>
            <div className="field-grid service-context-grid">
              <Field label="Nombre de couverts" value={dossier.guestCount} onChange={(v) => update('guestCount', v)} placeholder="Exemple : 24" />
              <Field label="Nombre de tables" value={dossier.tableCount} onChange={(v) => update('tableCount', v)} placeholder="Exemple : 6" />
              <label className="field"><span>Type de service</span><select value={dossier.serviceType} onChange={(event) => update('serviceType', event.target.value)}><option value="">À choisir</option><option>Service à l’assiette</option><option>Service au plat</option><option>Service au guéridon</option><option>Buffet</option><option>Banquet</option><option>Cocktail</option><option>Service mixte</option></select></label>
              <label className="field"><span>Implantation de la salle</span><select value={dossier.roomLayout} onChange={(event) => update('roomLayout', event.target.value)}><option value="">À choisir</option><option>Tables rondes</option><option>Tables carrées</option><option>Tables rectangulaires</option><option>Buffet</option><option>Implantation mixte</option></select></label>
            </div>
            <TextArea label="Contexte particulier" value={dossier.roomContext} onChange={(v) => update('roomContext', v)} rows={3} placeholder="Clientèle, occasion, contraintes de salle ou niveau de prestation…" />
          </div>}
          <div className="menu-editor">
            <div className="menu-editor-title"><UtensilsCrossed size={22} /><div><strong>Menu du TP</strong><span>Ce texte reste enregistré pendant toute la préparation.</span></div></div>
            <textarea value={dossier.menu} onChange={(event) => update('menu', event.target.value)} rows={10} placeholder={'ENTRÉE\nNom du plat\n\nPLAT ET GARNITURES\nNom du plat\n\nFROMAGE\nNom du fromage\n\nDESSERT\nNom du dessert'} />
          </div>
          <TextArea label="Consigne ou mission donnée aux apprentis" value={dossier.mission} onChange={(v) => update('mission', v)} rows={4} placeholder="Une consigne courte suffit." />
        </div>

        <div className={`section-content ${activeTab === 'techniques' ? 'is-active' : ''}`}>
          {dossier.formation === 'cuisine' ? <>
            <SectionHeading eyebrow="2 · Techniques" title="Choisir les techniques professionnelles" intro="Cocher uniquement les techniques réellement travaillées pendant le TP de cuisine." />
            <div className="technique-toolbar"><label className="search-field"><Search size={18} /><input value={techniqueSearch} onChange={(event) => setTechniqueSearch(event.target.value)} placeholder="Rechercher une technique" /></label><span>{dossier.selectedTechniques.length} sélectionnée(s)</span></div>
            <div className="technique-layout"><div className="technique-catalogue">
              {groups.map((group) => <details key={group.category} open={!techniqueSearch}><summary>{group.category}<span>{group.items.length}</span></summary><div className="technique-options">
                {group.items.map((item) => { const selected = dossier.selectedTechniques.some((entry) => entry.name === item); return <button key={item} type="button" className={selected ? 'technique-option selected' : 'technique-option'} onClick={() => toggleTechnique(item)}><span className="check-box">{selected && <Check size={14} />}</span>{item}</button>; })}
              </div></details>)}
            </div><aside className="selected-panel"><h3><ListChecks size={19} /> Techniques retenues</h3>
              {dossier.selectedTechniques.length === 0 ? <p className="empty-state">Cliquez sur les techniques à intégrer au dossier.</p> : dossier.selectedTechniques.map((item) => <div className="selected-technique simple" key={item.name}><strong>{item.name}</strong><button type="button" aria-label={`Retirer ${item.name}`} onClick={() => toggleTechnique(item.name)}><Trash2 size={15} /></button></div>)}
            </aside></div>
            <TextArea label="Points à préparer et critères de réussite" value={dossier.pointsToPrepare} onChange={(v) => update('pointsToPrepare', v)} rows={6} placeholder="Gestes attendus, vigilance, résultat recherché…" />
          </> : <>
            <SectionHeading eyebrow="2 · Techniques par plat" title="Préparer le geste de service" intro="Chaque élément du menu possède sa technique imposée. Le menu de la première page crée automatiquement les lignes ci-dessous." />
            {serviceCourses.length === 0 ? <div className="empty-service-state"><UtensilsCrossed /><strong>Commencez par saisir le menu</strong><span>Les plats apparaîtront automatiquement ici.</span></div> : <div className="service-course-list">
              {serviceCourses.map((course, index) => { const work = dossier.serviceCourseWork[course] ?? emptyServiceCourse(); return <article className="service-course-card" key={course}>
                <header><span>{index + 1}</span><h3>{course}</h3></header>
                <label className="field"><span>Technique imposée pour ce plat · choisie par le formateur</span><select value={work.technique} onChange={(event) => updateServiceCourse(course, 'technique', event.target.value)}><option value="">Sélectionner une technique</option>{serviceTechniqueOptions.map((technique) => <option key={technique}>{technique}</option>)}</select></label>
                <TextArea label="Matériel nécessaire · à compléter par l’apprenti" value={work.material ?? ''} onChange={(v) => updateServiceCourse(course, 'material', v)} rows={3} placeholder="Vaisselle, couverts, verrerie, plateau, guéridon, pince, liteau…" />
                <TextArea label="Points à préparer et critères de réussite" value={work.preparation} onChange={(v) => updateServiceCourse(course, 'preparation', v)} rows={3} placeholder="Gestes, posture, sécurité et résultat attendu…" />
              </article>; })}
            </div>}
          </>}
          <p className="source-note">Techniques issues du référentiel officiel. <a href={techniqueSources[dossier.formation]} target="_blank" rel="noreferrer">Consulter le référentiel</a></p>
        </div>

        <div className={`section-content ${activeTab === 'fiches' ? 'is-active' : ''}`}>
          {dossier.formation === 'cuisine' ? <>
            <SectionHeading eyebrow="3 · Fiches techniques" title="Préparer les productions" intro="Trois fiches sont proposées par défaut. Ne renseigner que les rubriques utiles au TP." />
            <div className="production-list">{dossier.productions.map((production, index) => <article className="production-card" key={production.id}>
              <header><span>Fiche technique {index + 1}</span>{dossier.productions.length > 1 && <button type="button" aria-label="Supprimer cette fiche" onClick={() => update('productions', dossier.productions.filter((item) => item.id !== production.id))}><Trash2 size={17} /></button>}</header>
              <div className="field-grid compact-grid"><Field wide label="Intitulé de la production" value={production.title} onChange={(v) => updateProduction(production.id, 'title', v)} /><Field wide label="Nombre de couverts ou portions" value={production.covers} onChange={(v) => updateProduction(production.id, 'covers', v)} /></div>
              <div className="technical-sheet-grid"><TextArea label="Denrées · unités · quantités" value={production.ingredients} onChange={(v) => updateProduction(production.id, 'ingredients', v)} rows={8} /><TextArea label="Progression technique · étapes · contrôles" value={production.progression} onChange={(v) => updateProduction(production.id, 'progression', v)} rows={8} /></div>
              <TextArea label="Point critique d'hygiène ou de sécurité" value={production.hygiene} onChange={(v) => updateProduction(production.id, 'hygiene', v)} rows={3} />
            </article>)}</div>
            <button className="secondary-button" type="button" onClick={() => update('productions', [...dossier.productions, emptyProduction(dossier.productions.length + 1)])}><Plus size={17} /> Ajouter une fiche technique</button>
          </> : <>
            <SectionHeading eyebrow="3 · Vente & vins" title="Construire l’argumentation commerciale" intro="Pour chaque plat : une présentation claire au client, un vin choisi et un accord justifié." />
            {serviceCourses.length === 0 ? <div className="empty-service-state"><Wine /><strong>Le menu alimentera cette partie</strong><span>Saisissez-le dans « Le service ».</span></div> : <div className="sales-layout"><div className="sales-course-list">
              {serviceCourses.map((course, index) => { const work = dossier.serviceCourseWork[course] ?? emptyServiceCourse(); return <article className="sales-card" key={course}>
                <header><span>Plat {index + 1}</span><h3>{course}</h3></header>
                <TextArea label="Argumentation commerciale" value={work.argument} onChange={(v) => updateServiceCourse(course, 'argument', v)} rows={5} placeholder="Produits, origine, sensations, méthode, bénéfice pour le client…" />
                <div className="field-grid wine-fields"><Field label="Vin ou appellation proposé" value={work.wine} onChange={(v) => updateServiceCourse(course, 'wine', v)} placeholder="Exemple : Muscadet Sèvre-et-Maine" /><label className="field"><span>Vignoble</span><select value={work.vineyard} onChange={(event) => updateServiceCourse(course, 'vineyard', event.target.value)}><option value="">À rechercher</option>{vineyards.map((vineyard) => <option key={vineyard}>{vineyard}</option>)}</select></label></div>
                <TextArea label="Pourquoi cet accord mets-vin ?" value={work.pairing} onChange={(v) => updateServiceCourse(course, 'pairing', v)} rows={3} placeholder="Relier l’intensité, les saveurs, la texture, la sauce et le mode de cuisson." />
              </article>; })}
            </div><aside className="vineyard-card"><div><MapPinned size={22} /><h3>Recherche sur les vignobles</h3></div><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Map_of_France%27s_wines-regions_and_appelations-fr.svg/1280px-Map_of_France%27s_wines-regions_and_appelations-fr.svg.png" alt="Carte des régions viticoles et appellations de France" /><p>Repérer le vignoble, l’appellation et la localisation du vin retenu.</p><small>Carte : Wikimedia Commons, licence CC BY-SA.</small></aside></div>}
          </>}
        </div>

        <div className={`section-content wide-section ${activeTab === 'organisation' ? 'is-active' : ''}`}>
          {dossier.formation === 'cuisine' ? <>
            <SectionHeading eyebrow="4 · Ordonnancement" title="Organiser le travail" intro="Un ordonnancement simple, sans horaires : l'ordre des tâches, la répartition chef/commis et les contrôles." />
            <div className="schedule-table"><div className="schedule-head"><span>Ordre</span><span>Chef / commis</span><span>Production ou tâche</span><span>Point de contrôle</span><span /></div>
              {dossier.schedule.map((row) => <div className="schedule-row" key={row.id}><input aria-label="Ordre" value={row.step} onChange={(event) => updateSchedule(row.id, 'step', event.target.value)} /><input aria-label="Chef ou commis" value={row.responsible} onChange={(event) => updateSchedule(row.id, 'responsible', event.target.value)} /><textarea aria-label="Production ou tâche" value={row.action} onChange={(event) => updateSchedule(row.id, 'action', event.target.value)} rows={2} /><textarea aria-label="Point de contrôle" value={row.control} onChange={(event) => updateSchedule(row.id, 'control', event.target.value)} rows={2} /><button type="button" aria-label="Supprimer cette étape" onClick={() => update('schedule', dossier.schedule.filter((item) => item.id !== row.id))}><Trash2 size={16} /></button></div>)}
            </div><button className="secondary-button" type="button" onClick={() => update('schedule', [...dossier.schedule, emptyScheduleRow(dossier.schedule.length + 1)])}><Plus size={17} /> Ajouter une étape</button>
          </> : <>
            <SectionHeading eyebrow="4 · Cocktail & salle" title="Préparer la fiche cocktail et l’implantation" intro="Une fiche technique courte, puis un schéma de salle à réaliser par l’apprenti." />
            <article className="cocktail-card">
              <header><GlassWater size={23} /><div><span>Fiche technique</span><h3>Cocktail</h3></div></header>
              <div className="field-grid">
                <Field label="Nom du cocktail" value={dossier.cocktailName} onChange={(v) => update('cocktailName', v)} />
                <label className="field"><span>Type</span><select value={dossier.cocktailType} onChange={(event) => update('cocktailType', event.target.value)}><option value="">À choisir</option><option>Sans alcool</option><option>Short drink</option><option>Long drink</option><option>Boisson collective</option></select></label>
                <Field label="Verrerie" value={dossier.cocktailGlass} onChange={(v) => update('cocktailGlass', v)} placeholder="Type de verre et contenance" />
                <Field label="Décoration / finition" value={dossier.cocktailDecoration} onChange={(v) => update('cocktailDecoration', v)} />
              </div>
              <div className="technical-sheet-grid"><TextArea label="Ingrédients et dosages" value={dossier.cocktailIngredients} onChange={(v) => update('cocktailIngredients', v)} rows={7} /><TextArea label="Progression technique" value={dossier.cocktailMethod} onChange={(v) => update('cocktailMethod', v)} rows={7} placeholder="Méthode, matériel, ordre de réalisation et points de vigilance…" /></div>
              <TextArea label="Argumentation commerciale du cocktail" value={dossier.cocktailArgument} onChange={(v) => update('cocktailArgument', v)} rows={4} />
            </article>
            <div className="final-block room-plan-block"><h3><LayoutTemplate size={20} /> Schéma du dressage de salle</h3><p>L’apprenti représente les tables, le buffet éventuel, les circulations, l’office et le sens du service. Implantation retenue : <strong>{dossier.roomLayout || 'à définir'}</strong>.</p><div className="sketch-zone room-sketch"><span>Schéma à réaliser par l’apprenti</span><small>Tables · buffet · circulation · office · sens du service</small></div></div>
          </>}
        </div>

        <div className={`section-content ${activeTab === 'bilan' ? 'is-active' : ''}`}>
          <SectionHeading eyebrow={dossier.formation === 'cuisine' ? '5 · Finaliser' : '5 · Bilan'} title={dossier.formation === 'cuisine' ? 'Hygiène, présentation et bilan' : 'Contrôler la prestation et analyser son travail'} intro={dossier.formation === 'cuisine' ? 'Les dernières pages du dossier à remettre aux apprentis.' : 'Une dernière page adaptée au travail en salle, à compléter par le serveur et le commis.'} />
          <div className="final-block">
            <h3><ClipboardCheck size={20} /> {dossier.formation === 'cuisine' ? 'Points critiques d’hygiène' : 'Points de vigilance du service'}</h3>
            <TextArea label={dossier.formation === 'cuisine' ? 'Quels sont les dangers et les mesures de maîtrise à prévoir ?' : 'Quels risques faut-il anticiper pendant la prestation ?'} value={dossier.hygieneAnalysis} onChange={(v) => update('hygieneAnalysis', v)} rows={6} placeholder={dossier.formation === 'service' ? 'Allergènes, températures, casse, alcool, circulation, sécurité du client…' : undefined} />
            <TextArea label={dossier.formation === 'cuisine' ? 'Quel point critique devra être contrôlé en priorité ?' : 'Quel contrôle est prioritaire avant l’accueil des clients ?'} value={dossier.priorityControl} onChange={(v) => update('priorityControl', v)} rows={3} />
          </div>
          {dossier.formation === 'cuisine' && <div className="final-block">
            <h3><Sparkles size={20} /> Croquis de la présentation</h3>
            <div className="sketch-zone" aria-label="Zone de croquis imprimable"><span>Zone libre pour le croquis de présentation</span></div>
          </div>}
          {dossier.formation === 'cuisine' ? <div className="final-block">
            <h3><GraduationCap size={20} /> Bilan réflexif de l'apprenti</h3>
            <div className="reflection-grid three"><TextArea label="J'ai réussi" value={dossier.success} onChange={(v) => update('success', v)} rows={5} /><TextArea label="Je dois encore travailler" value={dossier.difficulty} onChange={(v) => update('difficulty', v)} rows={5} /><TextArea label="Mon prochain objectif" value={dossier.nextGoal} onChange={(v) => update('nextGoal', v)} rows={5} /></div>
          </div> : <div className="role-reflections">
            <article className="role-card"><header><span>Serveur</span><strong>Mon bilan de la prestation</strong></header><TextArea label="J’ai réussi" value={dossier.serverSuccess} onChange={(v) => update('serverSuccess', v)} rows={4} /><TextArea label="Je dois encore travailler" value={dossier.serverDifficulty} onChange={(v) => update('serverDifficulty', v)} rows={4} /><TextArea label="Mon prochain objectif" value={dossier.serverNextGoal} onChange={(v) => update('serverNextGoal', v)} rows={3} /></article>
            <article className="role-card"><header><span>Commis</span><strong>Mon bilan de la prestation</strong></header><TextArea label="J’ai réussi" value={dossier.commisSuccess} onChange={(v) => update('commisSuccess', v)} rows={4} /><TextArea label="Je dois encore travailler" value={dossier.commisDifficulty} onChange={(v) => update('commisDifficulty', v)} rows={4} /><TextArea label="Mon prochain objectif" value={dossier.commisNextGoal} onChange={(v) => update('commisNextGoal', v)} rows={3} /></article>
          </div>}
          <div className="completion-card"><GraduationCap /><div><strong>Le dossier complet est prêt</strong><span>L'export regroupe maintenant les cinq parties, quelle que soit la partie affichée.</span></div><button className="primary-button" type="button" onClick={() => window.print()}><Printer size={17} /> Exporter tout le dossier</button></div>
        </div>
      </section>
    </div>
  </main>;
}
