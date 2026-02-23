'use client';

import React, { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { HealthQuestionConfig } from '@buyonline/shared-types';
import { SortableQuestionList } from './SortableQuestionList';

// Question text lookup — category label → [questionKey, text]
const QUESTION_META: { key: string; text: string; category: string }[] = [
  { key: 'hq_hospitalized_last_4_years',    text: 'Have you been hospitalized in the last 4 years?',                                        category: 'Hospitalization' },
  { key: 'hq_surgery_planned',              text: 'Do you have any surgery planned in the near future?',                                    category: 'Hospitalization' },
  { key: 'hq_hospitalized_last_year',       text: 'Were you hospitalized more than once in the last 12 months?',                           category: 'Hospitalization' },
  { key: 'hq_icu_admission_history',        text: 'Have you ever been admitted to an ICU?',                                                category: 'Hospitalization' },
  { key: 'hq_emergency_admission_history',  text: 'Have you required emergency hospitalization in the last 2 years?',                      category: 'Hospitalization' },
  { key: 'hq_chronic_medication',           text: 'Are you currently on any long-term medication?',                                        category: 'Medication' },
  { key: 'hq_blood_thinners',              text: 'Are you currently taking blood-thinning medication?',                                   category: 'Medication' },
  { key: 'hq_insulin_dependent',           text: 'Are you currently dependent on insulin injections?',                                    category: 'Medication' },
  { key: 'hq_immunosuppressants',          text: 'Are you taking immunosuppressant medications?',                                         category: 'Medication' },
  { key: 'hq_heart_condition',             text: 'Have you ever been diagnosed with any heart condition?',                                 category: 'Cardiac' },
  { key: 'hq_blood_pressure',              text: 'Do you suffer from high or low blood pressure?',                                        category: 'Cardiac' },
  { key: 'hq_chest_pain_episodes',         text: 'Have you experienced recurring chest pain in the last 12 months?',                     category: 'Cardiac' },
  { key: 'hq_pacemaker_or_implant',        text: 'Do you have a pacemaker or any cardiac implant?',                                      category: 'Cardiac' },
  { key: 'hq_cardiac_surgery_history',     text: 'Have you undergone any cardiac surgery?',                                               category: 'Cardiac' },
  { key: 'hq_irregular_heartbeat',         text: 'Have you been diagnosed with an irregular heartbeat?',                                  category: 'Cardiac' },
  { key: 'hq_diabetes',                    text: 'Have you been diagnosed with diabetes or high blood sugar?',                            category: 'Metabolic' },
  { key: 'hq_high_cholesterol',            text: 'Have you been diagnosed with high cholesterol?',                                        category: 'Metabolic' },
  { key: 'hq_thyroid_condition',           text: 'Do you have any diagnosed thyroid condition?',                                          category: 'Metabolic' },
  { key: 'hq_kidney_disease_history',      text: 'Have you been diagnosed with any kidney disease?',                                      category: 'Metabolic' },
  { key: 'hq_liver_condition_history',     text: 'Have you been diagnosed with any liver condition?',                                     category: 'Metabolic' },
  { key: 'hq_respiratory',                 text: 'Do you have any respiratory conditions like asthma or COPD?',                           category: 'Respiratory' },
  { key: 'hq_chronic_cough',               text: 'Do you have a chronic cough lasting more than 8 weeks?',                               category: 'Respiratory' },
  { key: 'hq_oxygen_therapy',              text: 'Do you currently use supplemental oxygen therapy?',                                     category: 'Respiratory' },
  { key: 'hq_sleep_apnea_diagnosed',       text: 'Have you been diagnosed with sleep apnea and using CPAP?',                             category: 'Respiratory' },
  { key: 'hq_cancer_history',              text: 'Have you ever been diagnosed with cancer?',                                             category: 'Oncology' },
  { key: 'hq_cancer_treatment_ongoing',    text: 'Are you currently undergoing cancer treatment?',                                        category: 'Oncology' },
  { key: 'hq_family_cancer_history',       text: 'Does any immediate family member have a history of cancer?',                            category: 'Oncology' },
  { key: 'hq_radiation_therapy',           text: 'Have you undergone radiation therapy in the past 5 years?',                            category: 'Oncology' },
  { key: 'hq_mental_health',               text: 'Have you been treated for any mental health conditions?',                               category: 'Mental Health' },
  { key: 'hq_psychiatric_medication',      text: 'Are you currently taking psychiatric medication?',                                      category: 'Mental Health' },
  { key: 'hq_substance_abuse_history',     text: 'Have you received treatment for alcohol or drug dependency?',                           category: 'Mental Health' },
  { key: 'hq_counselling_ongoing',         text: 'Are you currently undergoing psychiatric counselling?',                                 category: 'Mental Health' },
  { key: 'hq_disability',                  text: 'Do you have any physical disability or impairment?',                                    category: 'General' },
  { key: 'hq_physical_therapy_ongoing',    text: 'Are you currently undergoing physiotherapy?',                                           category: 'General' },
  { key: 'hq_weight_loss_surgery',         text: 'Have you undergone bariatric or weight-loss surgery?',                                  category: 'General' },
  { key: 'hq_organ_transplant_history',    text: 'Have you received an organ or tissue transplant?',                                      category: 'General' },
  { key: 'hq_autoimmune_condition',        text: 'Have you been diagnosed with any autoimmune condition?',                                category: 'General' },
  { key: 'hq_tobacco_use',                 text: 'Do you currently use tobacco in any form?',                                             category: 'Lifestyle' },
  { key: 'hq_alcohol_consumption',         text: 'Do you consume alcohol more than 14 units per week?',                                  category: 'Lifestyle' },
  { key: 'hq_bmi_over_35',                 text: 'Is your BMI greater than 35?',                                                          category: 'Lifestyle' },
  { key: 'hq_sedentary_lifestyle',         text: 'Do you sit 8+ hours/day and exercise less than once a week?',                          category: 'Lifestyle' },
  { key: 'hq_occupational_hazard_exposure',text: 'Does your job expose you to hazardous chemicals or machinery?',                        category: 'Lifestyle' },
  { key: 'hq_adventure_sports',            text: 'Do you participate in adventure sports?',                                               category: 'Lifestyle' },
  { key: 'hq_family_heart_disease',        text: 'Does any immediate family member have heart disease before 60?',                        category: 'Family History' },
  { key: 'hq_family_diabetes',             text: 'Does any immediate family member have diabetes?',                                       category: 'Family History' },
  { key: 'hq_family_cancer',               text: 'Does any immediate family member have hereditary cancer?',                              category: 'Family History' },
  { key: 'hq_family_mental_illness',       text: 'Does any immediate family member have serious mental illness?',                         category: 'Family History' },
  { key: 'hq_family_genetic_disorder',     text: 'Does any immediate family member have a genetic disorder?',                             category: 'Family History' },
  { key: 'hq_major_surgery_last_5_years',  text: 'Have you undergone any major surgery in the last 5 years?',                            category: 'Surgical History' },
  { key: 'hq_organ_tissue_donation',       text: 'Have you donated an organ or tissue in the past?',                                     category: 'Surgical History' },
];

const QUESTION_TEXTS: Record<string, string> = Object.fromEntries(
  QUESTION_META.map((q) => [q.key, q.text])
);

interface HealthQuestionsConfiguratorProps {
  questions: HealthQuestionConfig[];
  onChange: (questions: HealthQuestionConfig[]) => void;
}

export const HealthQuestionsConfigurator: React.FC<HealthQuestionsConfiguratorProps> = ({
  questions,
  onChange,
}) => {
  const [search, setSearch] = useState('');
  const categories = [...new Set(QUESTION_META.map((q) => q.category))];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const sorted = [...questions].sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIdx = sorted.findIndex((q) => q.questionKey === active.id);
    const newIdx = sorted.findIndex((q) => q.questionKey === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      const reordered = arrayMove(sorted, oldIdx, newIdx).map((q, i) => ({ ...q, sortOrder: i + 1 }));
      onChange(reordered);
    }
  };

  const handleToggle = (key: string) => {
    onChange(questions.map((q) => (q.questionKey === key ? { ...q, enabled: !q.enabled } : q)));
  };

  const handleBulkToggle = (categoryKeys: string[], enable: boolean) => {
    onChange(questions.map((q) => (categoryKeys.includes(q.questionKey) ? { ...q, enabled: enable } : q)));
  };

  const filteredMeta = search
    ? QUESTION_META.filter((m) => m.text.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()))
    : null;

  const enabledCount = questions.filter((q) => q.enabled).length;

  return (
    <div>
      {/* Stats + search */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="px-3 py-1.5 rounded-lg text-sm"
          style={{ background: 'var(--cfg-surface)', border: '1px solid var(--cfg-border)', color: 'var(--cfg-text-muted)' }}
        >
          {enabledCount}/{questions.length} questions active
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--cfg-surface)',
            border: '1px solid var(--cfg-border)',
            color: 'var(--cfg-text)',
          }}
        />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {filteredMeta ? (
          <SortableQuestionList
            questions={questions.filter((q) => filteredMeta.some((m) => m.key === q.questionKey))}
            questionTexts={QUESTION_TEXTS}
            onToggle={handleToggle}
          />
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const catKeys = QUESTION_META.filter((m) => m.category === category).map((m) => m.key);
              const catQs = questions.filter((q) => catKeys.includes(q.questionKey));
              const allEnabled = catQs.every((q) => q.enabled);
              const noneEnabled = catQs.every((q) => !q.enabled);

              return (
                <div key={category} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--cfg-border)' }}>
                  <div
                    className="px-4 py-2.5 flex items-center justify-between"
                    style={{ background: 'var(--cfg-surface-2)' }}
                  >
                    <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--cfg-text-muted)' }}>
                      {category} ({catQs.filter((q) => q.enabled).length}/{catQs.length})
                    </span>
                    <button
                      onClick={() => handleBulkToggle(catKeys, noneEnabled ? true : !allEnabled)}
                      className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                      style={{
                        background: 'var(--cfg-surface-3)',
                        color: 'var(--cfg-text-muted)',
                        border: '1px solid var(--cfg-border)',
                      }}
                    >
                      {allEnabled ? 'Disable all' : 'Enable all'}
                    </button>
                  </div>
                  <SortableQuestionList
                    questions={catQs}
                    questionTexts={QUESTION_TEXTS}
                    onToggle={handleToggle}
                  />
                </div>
              );
            })}
          </div>
        )}
      </DndContext>
    </div>
  );
};
