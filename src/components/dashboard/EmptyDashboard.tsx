import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Globe, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';

const EmptyDashboard = () => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const { createNotebook, isCreating } = useNotebooks();

  const handleCreateNotebook = () => {
    console.log('Create notebook button clicked');
    console.log('isCreating:', isCreating);
    createNotebook({
      title: t('notebookCard.defaultName'),
      description: ''
    }, {
      onSuccess: data => {
        console.log('Navigating to notebook:', data.id);
        navigate(`/notebook/${data.id}`);
      },
      onError: error => {
        console.error('Failed to create notebook:', error);
      }
    });
  };

  const features = [
    {
      icon: FileText,
      title: 'PDFs',
      description: 'Upload research papers, reports, and documents',
      iconBg: 'var(--info-light)',
      iconColor: 'var(--info)'
    },
    {
      icon: Globe,
      title: 'Websites',
      description: 'Add web pages and online articles as sources',
      iconBg: 'var(--success-light)',
      iconColor: 'var(--success)'
    },
    {
      icon: Video,
      title: 'Audio',
      description: 'Include multimedia content in your research',
      iconBg: 'var(--accent-light)',
      iconColor: 'var(--accent-primary)'
    }
  ];

  return (
    <div className="text-center py-16">
      <div className="mb-12">
        <h2
          className="text-3xl font-medium mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('empty.title')}
        </h2>
        <p
          className="text-lg max-w-2xl mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t('empty.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-lg border p-6 text-center"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
            }}
          >
            <div
              className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: feature.iconBg }}
            >
              <feature.icon
                className="h-6 w-6"
                style={{ color: feature.iconColor }}
              />
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {feature.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <Button
        onClick={handleCreateNotebook}
        size="lg"
        disabled={isCreating}
        style={{
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--text-inverse)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
        }}
      >
        <Upload className="h-5 w-5 mr-2" />
        {isCreating ? t('common:loading.creating') : t('empty.createButton')}
      </Button>
    </div>
  );
};

export default EmptyDashboard;
