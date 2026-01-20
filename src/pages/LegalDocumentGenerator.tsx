/**
 * Strona generatora dokumentów prawnych
 * Umożliwia tworzenie dokumentów na podstawie szablonów
 */

import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DocumentWizard } from '@/components/legal/DocumentGenerator';

const LegalDocumentGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const caseId = searchParams.get('caseId') || undefined;
  const templateId = searchParams.get('templateId') || undefined;

  const handleComplete = () => {
    if (caseId) {
      navigate(`/legal/case/${caseId}`);
    } else {
      navigate('/legal');
    }
  };

  const handleCancel = () => {
    if (caseId) {
      navigate(`/legal/case/${caseId}`);
    } else {
      navigate('/legal/library');
    }
  };

  return (
    <DocumentWizard
      caseId={caseId}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
};

export default LegalDocumentGenerator;
