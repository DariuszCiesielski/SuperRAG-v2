/**
 * Typy TypeScript dla modułu pomocy prawnej (Legal Assistant)
 */

// ============================================================================
// ENUMS
// ============================================================================

export type LegalDocumentType =
  | 'ustawa'
  | 'rozporzadzenie'
  | 'kodeks'
  | 'orzeczenie'
  | 'template'
  | 'umowa'
  | 'pozew'
  | 'wniosek'
  | 'odwolanie'
  | 'wezwanie'
  | 'pismo'
  | 'skarga';

export type LegalCategory =
  | 'cywilne'
  | 'administracyjne'
  | 'pracownicze'
  | 'konsumenckie'
  | 'rodzinne'
  | 'spadkowe'
  | 'nieruchomosci'
  | 'umowy'
  | 'karne'
  | 'wykroczenia';

export type CaseStatus =
  | 'active'
  | 'archived'
  | 'won'
  | 'lost'
  | 'settled'
  | 'dismissed';

export type ProceedingStageType =
  | 'policja'
  | 'prokuratura'
  | 'sad_rejonowy'
  | 'sad_okregowy'
  | 'sad_apelacyjny'
  | 'sad_najwyzszy'
  | 'organ_administracyjny'
  | 'wsa'
  | 'nsa'
  | 'komornik'
  | 'mediacja'
  | 'arbitraz'
  | 'inne';

export type ProceedingOutcome =
  | 'w_toku'
  | 'przekazano'
  | 'umorzono'
  | 'wyrok_korzystny'
  | 'wyrok_niekorzystny'
  | 'ugoda'
  | 'apelacja'
  | 'kasacja'
  | 'zakonczone';

export type PartyType =
  | 'powod'
  | 'pozwany'
  | 'wnioskodawca'
  | 'uczestnik'
  | 'oskarzyciel'
  | 'oskarzony'
  | 'pokrzywdzony'
  | 'swiadek'
  | 'biegly'
  | 'interwenient'
  | 'kurator'
  | 'pelnomonik';

// ============================================================================
// WSPÓLNA BAZA PRAWNA
// ============================================================================

export interface LegalRegulation {
  id: string;
  title: string;
  short_name: string | null;
  document_type: LegalDocumentType;
  category: LegalCategory[];
  source_url: string | null;
  source_identifier: string | null;
  publication_date: string | null;
  effective_date: string | null;
  content: string;
  content_html: string | null;
  articles_json: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalRuling {
  id: string;
  court_name: string;
  case_number: string;
  ruling_date: string;
  ruling_type: string | null;
  category: LegalCategory[];
  summary: string | null;
  content: string;
  related_regulations: string[] | null;
  keywords: string[] | null;
  source_url: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LegalTemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'address';
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  helpText?: string;
}

export interface LegalTemplate {
  id: string;
  title: string;
  description: string | null;
  document_type: LegalDocumentType;
  category: LegalCategory[];
  template_content: string;
  template_fields: LegalTemplateField[];
  example_filled: string | null;
  usage_instructions: string | null;
  legal_basis: string | null;
  related_regulations: string[] | null;
  is_premium: boolean;
  popularity_score: number;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SPRAWY UŻYTKOWNIKA
// ============================================================================

export interface LegalCase {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: LegalCategory;
  status: CaseStatus;
  case_number: string | null;
  current_stage: ProceedingStageType | null;
  user_role: PartyType | null;
  opponent_name: string | null;
  opponent_type: string | null;
  parent_case_id: string | null;
  deadline_date: string | null;
  icon: string;
  color: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CaseProceeding {
  id: string;
  case_id: string;
  stage_type: ProceedingStageType;
  institution_name: string;
  case_number: string | null;
  started_at: string | null;
  ended_at: string | null;
  outcome: ProceedingOutcome;
  notes: string | null;
  previous_proceeding_id: string | null;
  merged_from_case_ids: string[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CaseParty {
  id: string;
  case_id: string;
  party_type: PartyType;
  name: string;
  address: string | null;
  pesel_or_nip: string | null;
  contact_info: string | null;
  is_user: boolean;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  title: string;
  document_type: string;
  file_path: string | null;
  file_size: number | null;
  content: string | null;
  summary: string | null;
  processing_status: string;
  document_date: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GeneratedLegalDocument {
  id: string;
  case_id: string | null;
  user_id: string;
  template_id: string | null;
  title: string;
  document_type: LegalDocumentType;
  content: string;
  form_data: Record<string, unknown> | null;
  docx_file_path: string | null;
  pdf_file_path: string | null;
  version: number;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CHAT I RAG
// ============================================================================

export interface LegalChatMessage {
  id: number;
  session_id: string;
  user_id: string;
  message: {
    type: 'human' | 'ai';
    content: string | LegalAIResponse;
  };
  sources_used: LegalSourceReference[] | null;
  created_at: string;
}

export interface LegalAIResponse {
  segments: LegalResponseSegment[];
  citations: LegalCitation[];
}

export interface LegalResponseSegment {
  text: string;
  citation_id?: number;
}

export interface LegalCitation {
  citation_id: number;
  source_type: 'regulation' | 'ruling' | 'template' | 'case_document';
  source_id: string;
  source_title: string;
  article?: string;
  paragraph?: string;
  excerpt: string;
}

export interface LegalSourceReference {
  source_type: string;
  source_id: string;
  similarity: number;
}

// ============================================================================
// ADMINISTRACJA I LIMITY
// ============================================================================

export interface LegalAdmin {
  id: string;
  user_id: string;
  role: 'editor' | 'admin' | 'super_admin';
  permissions: Record<string, unknown>;
  created_at: string;
}

export interface LegalPlanLimits {
  plan_id: string;
  cases_limit: number | null;
  documents_per_month: number | null;
  can_export_docx: boolean;
  can_access_rulings: boolean;
  can_generate_documents: boolean;
  full_rag_access: boolean;
  price_monthly_pln: number;
  features: Record<string, boolean>;
}

export interface UserLegalLimits {
  plan_id: string;
  cases_count: number;
  cases_limit: number | null;
  can_create_case: boolean;
  documents_this_month: number;
  documents_limit: number | null;
  can_generate_document: boolean;
  can_export_docx: boolean;
  can_generate_documents: boolean;
  full_rag_access: boolean;
  features: Record<string, boolean>;
}

export interface LegalImportLog {
  id: string;
  import_type: string;
  source_url: string | null;
  records_imported: number;
  records_failed: number;
  error_details: Record<string, unknown> | null;
  imported_by: string | null;
  started_at: string;
  completed_at: string | null;
}

// ============================================================================
// FORMULARZE I KREATOR DOKUMENTÓW
// ============================================================================

export interface DocumentGeneratorFormData {
  template_id: string;
  case_id?: string;
  fields: Record<string, string | number | Date>;
}

export interface GeneratedDocumentResult {
  id: string;
  title: string;
  content: string;
  docx_url?: string;
  pdf_url?: string;
}

// ============================================================================
// HELPERS I MAPOWANIA
// ============================================================================

export const STAGE_TYPE_LABELS: Record<ProceedingStageType, string> = {
  policja: 'Policja',
  prokuratura: 'Prokuratura',
  sad_rejonowy: 'Sąd Rejonowy',
  sad_okregowy: 'Sąd Okręgowy',
  sad_apelacyjny: 'Sąd Apelacyjny',
  sad_najwyzszy: 'Sąd Najwyższy',
  organ_administracyjny: 'Organ administracyjny',
  wsa: 'Wojewódzki Sąd Administracyjny',
  nsa: 'Naczelny Sąd Administracyjny',
  komornik: 'Komornik',
  mediacja: 'Mediacja',
  arbitraz: 'Arbitraż',
  inne: 'Inne',
};

export const STAGE_TYPE_ICONS: Record<ProceedingStageType, string> = {
  policja: '🚔',
  prokuratura: '⚖️',
  sad_rejonowy: '🏛️',
  sad_okregowy: '🏛️',
  sad_apelacyjny: '🏛️',
  sad_najwyzszy: '🏛️',
  organ_administracyjny: '🏢',
  wsa: '🏛️',
  nsa: '🏛️',
  komornik: '📋',
  mediacja: '🤝',
  arbitraz: '⚖️',
  inne: '📁',
};

export const OUTCOME_LABELS: Record<ProceedingOutcome, string> = {
  w_toku: 'W toku',
  przekazano: 'Przekazano',
  umorzono: 'Umorzono',
  wyrok_korzystny: 'Wyrok korzystny',
  wyrok_niekorzystny: 'Wyrok niekorzystny',
  ugoda: 'Ugoda',
  apelacja: 'Apelacja',
  kasacja: 'Kasacja',
  zakonczone: 'Zakończone',
};

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  active: 'Aktywna',
  archived: 'Zarchiwizowana',
  won: 'Wygrana',
  lost: 'Przegrana',
  settled: 'Ugoda',
  dismissed: 'Oddalona',
};

export const CATEGORY_LABELS: Record<LegalCategory, string> = {
  cywilne: 'Cywilne',
  administracyjne: 'Administracyjne',
  pracownicze: 'Pracownicze',
  konsumenckie: 'Konsumenckie',
  rodzinne: 'Rodzinne',
  spadkowe: 'Spadkowe',
  nieruchomosci: 'Nieruchomości',
  umowy: 'Umowy',
  karne: 'Karne',
  wykroczenia: 'Wykroczenia',
};

export const PARTY_TYPE_LABELS: Record<PartyType, string> = {
  powod: 'Powód',
  pozwany: 'Pozwany',
  wnioskodawca: 'Wnioskodawca',
  uczestnik: 'Uczestnik',
  oskarzyciel: 'Oskarżyciel',
  oskarzony: 'Oskarżony',
  pokrzywdzony: 'Pokrzywdzony',
  swiadek: 'Świadek',
  biegly: 'Biegły',
  interwenient: 'Interwenient',
  kurator: 'Kurator',
  pelnomonik: 'Pełnomocnik',
};

export const DOCUMENT_TYPE_LABELS: Record<LegalDocumentType, string> = {
  ustawa: 'Ustawa',
  rozporzadzenie: 'Rozporządzenie',
  kodeks: 'Kodeks',
  orzeczenie: 'Orzeczenie',
  template: 'Szablon',
  umowa: 'Umowa',
  pozew: 'Pozew',
  wniosek: 'Wniosek',
  odwolanie: 'Odwołanie',
  wezwanie: 'Wezwanie',
  pismo: 'Pismo',
  skarga: 'Skarga',
};
