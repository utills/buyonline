// 95 diseases across 14 medical categories
export const DISEASES = [
  // ── Existing (19) ───────────────────────────────────────────────────
  { name: 'Cancer',               category: 'oncology',       description: 'Any form of malignancy or tumour' },
  { name: 'Diabetes',             category: 'metabolic',      description: 'Type 1 or Type 2 diabetes mellitus' },
  { name: 'Hypertension',         category: 'cardiac',        description: 'High blood pressure' },
  { name: 'Heart Disease',        category: 'cardiac',        description: 'Coronary artery disease, heart failure, etc.' },
  { name: 'Kidney Disease',       category: 'renal',          description: 'Chronic kidney disease or renal failure' },
  { name: 'Liver Disease',        category: 'gastrointestinal', description: 'Cirrhosis, hepatitis, or liver failure' },
  { name: 'Asthma',               category: 'respiratory',    description: 'Chronic respiratory condition' },
  { name: 'Thyroid Disorder',     category: 'endocrine',      description: 'Hypothyroidism or hyperthyroidism' },
  { name: 'Arthritis',            category: 'musculoskeletal', description: 'Rheumatoid arthritis or osteoarthritis' },
  { name: 'Stroke',               category: 'neurological',   description: 'Cerebrovascular accident' },
  { name: 'Epilepsy',             category: 'neurological',   description: 'Seizure disorder' },
  { name: 'HIV/AIDS',             category: 'infectious',     description: 'Human immunodeficiency virus infection' },
  { name: 'Tuberculosis',         category: 'infectious',     description: 'Active or latent TB' },
  { name: 'COPD',                 category: 'respiratory',    description: 'Chronic obstructive pulmonary disease' },
  { name: 'Depression',           category: 'mental_health',  description: 'Major depressive disorder' },
  { name: 'Anxiety Disorder',     category: 'mental_health',  description: 'Generalized anxiety disorder' },
  { name: 'Obesity',              category: 'lifestyle',      description: 'BMI greater than 35' },
  { name: 'Sleep Apnea',          category: 'chronic',        description: 'Obstructive sleep apnea' },
  { name: 'Autoimmune Disorder',  category: 'autoimmune',     description: 'Lupus, multiple sclerosis, etc.' },

  // ── Cardiac (8) ──────────────────────────────────────────────────────
  { name: 'Coronary Artery Disease',    category: 'cardiac',  description: 'Narrowing or blockage of coronary arteries due to plaque buildup' },
  { name: 'Heart Failure',              category: 'cardiac',  description: 'Inability of the heart to pump sufficient blood to meet body requirements' },
  { name: 'Atrial Fibrillation',        category: 'cardiac',  description: 'Irregular and often rapid heart rate causing poor blood flow' },
  { name: 'Cardiomyopathy',             category: 'cardiac',  description: 'Disease of the heart muscle affecting its size, shape, or structure' },
  { name: 'Valvular Heart Disease',     category: 'cardiac',  description: 'Damage to or defect in one of the four heart valves' },
  { name: 'Pulmonary Hypertension',     category: 'cardiac',  description: 'High blood pressure in the arteries of the lungs' },
  { name: 'Peripheral Artery Disease',  category: 'cardiac',  description: 'Narrowed arteries reducing blood flow to the limbs' },
  { name: 'Aortic Aneurysm',            category: 'cardiac',  description: 'Bulge or ballooning in the wall of the aorta' },

  // ── Oncology (10) ─────────────────────────────────────────────────────
  { name: 'Breast Cancer',     category: 'oncology',  description: 'Malignant tumour originating in breast tissue' },
  { name: 'Lung Cancer',       category: 'oncology',  description: 'Malignant tumour in lung tissue, often linked to smoking' },
  { name: 'Colorectal Cancer', category: 'oncology',  description: 'Cancer of the colon or rectum' },
  { name: 'Prostate Cancer',   category: 'oncology',  description: 'Cancer in the prostate gland in men' },
  { name: 'Cervical Cancer',   category: 'oncology',  description: 'Cancer of the cervix, often caused by HPV' },
  { name: 'Leukemia',          category: 'oncology',  description: 'Cancer of blood-forming tissues including bone marrow' },
  { name: 'Lymphoma',          category: 'oncology',  description: 'Cancer of the lymphatic system' },
  { name: 'Ovarian Cancer',    category: 'oncology',  description: 'Cancer originating in the ovaries' },
  { name: 'Oral Cancer',       category: 'oncology',  description: 'Cancer of the mouth, tongue, lips, or throat' },
  { name: 'Stomach Cancer',    category: 'oncology',  description: 'Malignant tumour in the lining of the stomach' },

  // ── Neurological (8) ──────────────────────────────────────────────────
  { name: "Parkinson's Disease",    category: 'neurological', description: 'Progressive nervous system disorder affecting movement' },
  { name: "Alzheimer's Disease",    category: 'neurological', description: 'Progressive brain disorder causing memory loss and cognitive decline' },
  { name: 'Multiple Sclerosis',     category: 'neurological', description: 'Immune-mediated process in which myelin sheath is damaged' },
  { name: 'Muscular Dystrophy',     category: 'neurological', description: 'Group of diseases causing progressive weakness of skeletal muscles' },
  { name: 'Motor Neuron Disease',   category: 'neurological', description: 'Progressive degeneration of the motor neurons' },
  { name: 'Cerebral Palsy',         category: 'neurological', description: 'Group of disorders affecting movement and muscle tone' },
  { name: 'Chronic Migraine',       category: 'neurological', description: 'Recurring headaches occurring 15 or more days per month' },
  { name: 'Peripheral Neuropathy',  category: 'neurological', description: 'Damage to the peripheral nerves causing weakness or numbness' },

  // ── Metabolic / Endocrine (6) ─────────────────────────────────────────
  { name: 'Type 1 Diabetes Mellitus',  category: 'metabolic',  description: 'Autoimmune condition destroying insulin-producing pancreatic cells' },
  { name: 'Polycystic Ovary Syndrome', category: 'endocrine',  description: 'Hormonal disorder causing enlarged ovaries with small cysts' },
  { name: "Cushing's Syndrome",        category: 'endocrine',  description: 'Condition caused by prolonged exposure to high cortisol levels' },
  { name: 'Adrenal Insufficiency',     category: 'endocrine',  description: 'Adrenal glands do not produce sufficient steroid hormones' },
  { name: 'Metabolic Syndrome',        category: 'metabolic',  description: 'Cluster of conditions including high blood pressure, high blood sugar, and abnormal cholesterol' },
  { name: 'Gout',                      category: 'metabolic',  description: 'Form of inflammatory arthritis caused by excess uric acid' },

  // ── Respiratory (5) ───────────────────────────────────────────────────
  { name: 'Pulmonary Fibrosis',  category: 'respiratory',  description: 'Scarring of lung tissue making breathing progressively difficult' },
  { name: 'Sarcoidosis',         category: 'respiratory',  description: 'Inflammatory disease forming granulomas in the lungs and lymph nodes' },
  { name: 'Pulmonary Embolism',  category: 'respiratory',  description: 'Blockage of arteries in the lungs by blood clots' },
  { name: 'Bronchiectasis',      category: 'respiratory',  description: 'Permanent enlargement of the airways of the lungs' },
  { name: 'Pneumoconiosis',      category: 'respiratory',  description: 'Occupational lung disease caused by inhalation of dust particles' },

  // ── Mental Health (5) ─────────────────────────────────────────────────
  { name: 'Bipolar Disorder',                  category: 'mental_health',  description: 'Mental illness causing extreme mood swings including emotional highs and lows' },
  { name: 'Schizophrenia',                     category: 'mental_health',  description: 'Serious mental disorder affecting how a person thinks, feels, and behaves' },
  { name: 'Obsessive-Compulsive Disorder',     category: 'mental_health',  description: 'Pattern of unwanted thoughts and fears driving repetitive behaviours' },
  { name: 'Post-Traumatic Stress Disorder',    category: 'mental_health',  description: 'Mental health condition triggered by experiencing or witnessing a traumatic event' },
  { name: 'Eating Disorder',                   category: 'mental_health',  description: 'Serious conditions related to persistent eating behaviours including anorexia and bulimia' },

  // ── Musculoskeletal (7) ───────────────────────────────────────────────
  { name: 'Osteoporosis',               category: 'musculoskeletal',  description: 'Condition in which bones become weak and brittle' },
  { name: 'Scoliosis',                  category: 'musculoskeletal',  description: 'Abnormal lateral curvature of the spine' },
  { name: 'Ankylosing Spondylitis',     category: 'musculoskeletal',  description: 'Inflammatory arthritis primarily affecting the spine' },
  { name: 'Fibromyalgia',               category: 'musculoskeletal',  description: 'Widespread musculoskeletal pain accompanied by fatigue and sleep issues' },
  { name: 'Intervertebral Disc Disease', category: 'musculoskeletal', description: 'Degeneration of one or more intervertebral discs causing back or neck pain' },
  { name: 'Osteoarthritis',             category: 'musculoskeletal',  description: 'Degeneration of joint cartilage causing pain and stiffness' },
  { name: 'Rheumatoid Arthritis',       category: 'autoimmune',       description: 'Chronic inflammatory disorder affecting joints and other body systems' },

  // ── Gastrointestinal (8) ──────────────────────────────────────────────
  { name: "Crohn's Disease",                    category: 'gastrointestinal',  description: 'Chronic inflammatory bowel disease affecting the digestive tract' },
  { name: 'Ulcerative Colitis',                 category: 'gastrointestinal',  description: 'Chronic inflammatory bowel disease causing ulcers in the colon' },
  { name: 'Pancreatitis',                       category: 'gastrointestinal',  description: 'Inflammation of the pancreas, acute or chronic' },
  { name: 'Celiac Disease',                     category: 'gastrointestinal',  description: 'Immune reaction to eating gluten causing small intestine damage' },
  { name: 'Gastroesophageal Reflux Disease',    category: 'gastrointestinal',  description: 'Chronic digestive disease where stomach acid flows back into the oesophagus' },
  { name: 'Peptic Ulcer Disease',               category: 'gastrointestinal',  description: 'Open sores developing in the lining of the stomach or small intestine' },
  { name: 'Irritable Bowel Syndrome',           category: 'gastrointestinal',  description: 'Common disorder affecting the large intestine causing cramping and bloating' },
  { name: 'Hepatitis B',                        category: 'infectious',        description: 'Serious liver infection caused by the hepatitis B virus' },

  // ── Infectious (4) ────────────────────────────────────────────────────
  { name: 'Hepatitis C',            category: 'infectious',  description: 'Viral infection causing liver inflammation and long-term liver damage' },
  { name: 'Dengue Complications',   category: 'infectious',  description: 'Severe dengue with haemorrhage, organ failure, or plasma leakage' },
  { name: 'COVID-19 Long Haul',     category: 'infectious',  description: 'Persistent symptoms lasting more than 12 weeks after acute COVID-19 infection' },
  { name: 'Malaria',                category: 'infectious',  description: 'Mosquito-borne disease caused by plasmodium parasites' },

  // ── Renal / Urological (4) ────────────────────────────────────────────
  { name: 'Polycystic Kidney Disease',  category: 'renal',  description: 'Genetic disorder causing clusters of cysts in the kidneys' },
  { name: 'Nephrotic Syndrome',         category: 'renal',  description: 'Kidney disorder causing the body to excrete too much protein in urine' },
  { name: 'Chronic Renal Failure',      category: 'renal',  description: 'Gradual loss of kidney function over time requiring dialysis or transplant' },
  { name: 'Bladder Dysfunction',        category: 'renal',  description: 'Inability to control bladder function due to nerve or muscle problems' },

  // ── Genetic / Congenital (5) ──────────────────────────────────────────
  { name: 'Sickle Cell Disease',  category: 'genetic',  description: 'Inherited blood disorder causing abnormally shaped red blood cells' },
  { name: 'Hemophilia',           category: 'genetic',  description: 'Rare blood disorder impairing the ability to form clots' },
  { name: 'Thalassemia',          category: 'genetic',  description: 'Inherited blood disorder causing abnormal haemoglobin production' },
  { name: 'Cystic Fibrosis',      category: 'genetic',  description: 'Inherited disorder causing severe lung and digestive problems' },
  { name: 'Marfan Syndrome',      category: 'genetic',  description: 'Connective tissue disorder affecting the heart, eyes, blood vessels, and skeleton' },

  // ── Ocular (4) ────────────────────────────────────────────────────────
  { name: 'Glaucoma',               category: 'ocular',  description: 'Group of eye conditions damaging the optic nerve, often due to high eye pressure' },
  { name: 'Macular Degeneration',   category: 'ocular',  description: 'Deterioration of the central area of the retina causing vision loss' },
  { name: 'Diabetic Retinopathy',   category: 'ocular',  description: 'Diabetes complication affecting the blood vessels in the retina' },
  { name: 'Retinal Detachment',     category: 'ocular',  description: 'Emergency in which the retina pulls away from the supporting tissue' },

  // ── Dermatological (2) ────────────────────────────────────────────────
  { name: 'Psoriasis',                   category: 'dermatological',  description: 'Immune-mediated skin condition causing rapid skin cell buildup' },
  { name: 'Eczema (Atopic Dermatitis)',  category: 'dermatological',  description: 'Chronic skin condition causing itchy, inflamed, and cracked skin' },
];

// 50 health questions across 10 categories
export const HEALTH_QUESTIONS = [
  // ── Hospitalization (5) ───────────────────────────────────────────────
  { questionKey: 'hq_hospitalized_last_4_years',     category: 'hospitalization',  questionText: 'Have you been hospitalized in the last 4 years?',                                          sortOrder: 1  },
  { questionKey: 'hq_surgery_planned',               category: 'hospitalization',  questionText: 'Do you have any surgery planned in the near future?',                                       sortOrder: 2  },
  { questionKey: 'hq_hospitalized_last_year',        category: 'hospitalization',  questionText: 'Were you hospitalized more than once in the last 12 months?',                               sortOrder: 3  },
  { questionKey: 'hq_icu_admission_history',         category: 'hospitalization',  questionText: 'Have you ever been admitted to an Intensive Care Unit (ICU)?',                              sortOrder: 4  },
  { questionKey: 'hq_emergency_admission_history',   category: 'hospitalization',  questionText: 'Have you required emergency hospitalization in the last 2 years?',                          sortOrder: 5  },

  // ── Medication (4) ────────────────────────────────────────────────────
  { questionKey: 'hq_chronic_medication',            category: 'medication',       questionText: 'Are you currently on any long-term medication?',                                            sortOrder: 6  },
  { questionKey: 'hq_blood_thinners',                category: 'medication',       questionText: 'Are you currently taking blood-thinning medication (anticoagulants)?',                     sortOrder: 7  },
  { questionKey: 'hq_insulin_dependent',             category: 'medication',       questionText: 'Are you currently dependent on insulin injections?',                                        sortOrder: 8  },
  { questionKey: 'hq_immunosuppressants',            category: 'medication',       questionText: 'Are you taking immunosuppressant medications for any condition?',                           sortOrder: 9  },

  // ── Cardiac (6) ───────────────────────────────────────────────────────
  { questionKey: 'hq_heart_condition',               category: 'cardiac',          questionText: 'Have you ever been diagnosed with any heart condition?',                                    sortOrder: 10 },
  { questionKey: 'hq_blood_pressure',                category: 'cardiac',          questionText: 'Do you suffer from high or low blood pressure?',                                           sortOrder: 11 },
  { questionKey: 'hq_chest_pain_episodes',           category: 'cardiac',          questionText: 'Have you experienced recurring chest pain or discomfort in the last 12 months?',           sortOrder: 12 },
  { questionKey: 'hq_pacemaker_or_implant',          category: 'cardiac',          questionText: 'Do you have a pacemaker, defibrillator, or any cardiac implant?',                         sortOrder: 13 },
  { questionKey: 'hq_cardiac_surgery_history',       category: 'cardiac',          questionText: 'Have you undergone any cardiac surgery including angioplasty or bypass?',                  sortOrder: 14 },
  { questionKey: 'hq_irregular_heartbeat',           category: 'cardiac',          questionText: 'Have you been diagnosed with an irregular heartbeat (arrhythmia)?',                       sortOrder: 15 },

  // ── Metabolic (5) ─────────────────────────────────────────────────────
  { questionKey: 'hq_diabetes',                      category: 'metabolic',        questionText: 'Have you been diagnosed with diabetes or high blood sugar?',                               sortOrder: 16 },
  { questionKey: 'hq_high_cholesterol',              category: 'metabolic',        questionText: 'Have you been diagnosed with high cholesterol or dyslipidaemia?',                         sortOrder: 17 },
  { questionKey: 'hq_thyroid_condition',             category: 'metabolic',        questionText: 'Do you have any diagnosed thyroid condition?',                                             sortOrder: 18 },
  { questionKey: 'hq_kidney_disease_history',        category: 'metabolic',        questionText: 'Have you been diagnosed with any kidney disease or renal impairment?',                    sortOrder: 19 },
  { questionKey: 'hq_liver_condition_history',       category: 'metabolic',        questionText: 'Have you been diagnosed with any liver condition including hepatitis or cirrhosis?',      sortOrder: 20 },

  // ── Respiratory (4) ───────────────────────────────────────────────────
  { questionKey: 'hq_respiratory',                   category: 'respiratory',      questionText: 'Do you have any respiratory conditions like asthma or COPD?',                             sortOrder: 21 },
  { questionKey: 'hq_chronic_cough',                 category: 'respiratory',      questionText: 'Do you have a chronic cough lasting more than 8 weeks?',                                  sortOrder: 22 },
  { questionKey: 'hq_oxygen_therapy',                category: 'respiratory',      questionText: 'Do you currently use supplemental oxygen therapy at home?',                               sortOrder: 23 },
  { questionKey: 'hq_sleep_apnea_diagnosed',         category: 'respiratory',      questionText: 'Have you been diagnosed with sleep apnea and are using a CPAP machine?',                 sortOrder: 24 },

  // ── Oncology (4) ──────────────────────────────────────────────────────
  { questionKey: 'hq_cancer_history',                category: 'oncology',         questionText: 'Have you ever been diagnosed with cancer or undergone cancer treatment?',                 sortOrder: 25 },
  { questionKey: 'hq_cancer_treatment_ongoing',      category: 'oncology',         questionText: 'Are you currently undergoing any cancer treatment such as chemotherapy or radiotherapy?', sortOrder: 26 },
  { questionKey: 'hq_family_cancer_history',         category: 'oncology',         questionText: 'Does any immediate family member have a history of cancer?',                              sortOrder: 27 },
  { questionKey: 'hq_radiation_therapy',             category: 'oncology',         questionText: 'Have you undergone radiation therapy in the past 5 years?',                               sortOrder: 28 },

  // ── Mental Health (4) ─────────────────────────────────────────────────
  { questionKey: 'hq_mental_health',                 category: 'mental_health',    questionText: 'Have you been treated for any mental health conditions?',                                 sortOrder: 29 },
  { questionKey: 'hq_psychiatric_medication',        category: 'mental_health',    questionText: 'Are you currently taking any prescribed psychiatric or mood-stabilising medication?',    sortOrder: 30 },
  { questionKey: 'hq_substance_abuse_history',       category: 'mental_health',    questionText: 'Have you ever received treatment for alcohol or drug dependency?',                       sortOrder: 31 },
  { questionKey: 'hq_counselling_ongoing',           category: 'mental_health',    questionText: 'Are you currently undergoing psychiatric or psychological counselling?',                 sortOrder: 32 },

  // ── General Health (5) ────────────────────────────────────────────────
  { questionKey: 'hq_disability',                    category: 'general',          questionText: 'Do you have any physical disability or impairment?',                                      sortOrder: 33 },
  { questionKey: 'hq_physical_therapy_ongoing',      category: 'general',          questionText: 'Are you currently undergoing physiotherapy or occupational therapy?',                    sortOrder: 34 },
  { questionKey: 'hq_weight_loss_surgery',           category: 'general',          questionText: 'Have you undergone bariatric or weight-loss surgery?',                                    sortOrder: 35 },
  { questionKey: 'hq_organ_transplant_history',      category: 'general',          questionText: 'Have you received an organ or tissue transplant?',                                       sortOrder: 36 },
  { questionKey: 'hq_autoimmune_condition',          category: 'general',          questionText: 'Have you been diagnosed with any autoimmune condition?',                                  sortOrder: 37 },

  // ── Lifestyle (6) ─────────────────────────────────────────────────────
  { questionKey: 'hq_tobacco_use',                   category: 'lifestyle',        questionText: 'Do you currently use tobacco in any form (smoking, chewing, or vaping)?',               sortOrder: 38 },
  { questionKey: 'hq_alcohol_consumption',           category: 'lifestyle',        questionText: 'Do you consume alcohol more than 14 units per week?',                                    sortOrder: 39 },
  { questionKey: 'hq_bmi_over_35',                   category: 'lifestyle',        questionText: 'Is your Body Mass Index (BMI) greater than 35?',                                         sortOrder: 40 },
  { questionKey: 'hq_sedentary_lifestyle',           category: 'lifestyle',        questionText: 'Do you spend more than 8 hours per day sitting and exercise less than once a week?',    sortOrder: 41 },
  { questionKey: 'hq_occupational_hazard_exposure',  category: 'lifestyle',        questionText: 'Does your occupation involve exposure to hazardous chemicals, radiation, or heavy machinery?', sortOrder: 42 },
  { questionKey: 'hq_adventure_sports',              category: 'lifestyle',        questionText: 'Do you participate in adventure sports such as skydiving, mountaineering, or motorsports?', sortOrder: 43 },

  // ── Family History (5) ────────────────────────────────────────────────
  { questionKey: 'hq_family_heart_disease',          category: 'family_history',   questionText: 'Does any immediate family member have a history of heart disease before age 60?',       sortOrder: 44 },
  { questionKey: 'hq_family_diabetes',               category: 'family_history',   questionText: 'Does any immediate family member have Type 1 or Type 2 diabetes?',                     sortOrder: 45 },
  { questionKey: 'hq_family_cancer',                 category: 'family_history',   questionText: 'Does any immediate family member have a history of hereditary cancer?',                 sortOrder: 46 },
  { questionKey: 'hq_family_mental_illness',         category: 'family_history',   questionText: 'Does any immediate family member have a history of serious mental illness?',            sortOrder: 47 },
  { questionKey: 'hq_family_genetic_disorder',       category: 'family_history',   questionText: 'Does any immediate family member have a known hereditary or genetic disorder?',        sortOrder: 48 },

  // ── Surgical History (2) ──────────────────────────────────────────────
  { questionKey: 'hq_major_surgery_last_5_years',    category: 'surgical_history', questionText: 'Have you undergone any major surgery in the last 5 years?',                             sortOrder: 49 },
  { questionKey: 'hq_organ_tissue_donation',         category: 'surgical_history', questionText: 'Have you donated an organ or tissue in the past?',                                      sortOrder: 50 },
];
