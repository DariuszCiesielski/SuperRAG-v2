/**
 * Edge Function: generate-legal-document
 * Generuje dokument prawny w formacie DOCX na podstawie szablonu i danych formularza
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from "https://esm.sh/docx@8.5.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateDocumentRequest {
  document_id?: string;
  template_id?: string;
  content: string;
  form_data?: Record<string, any>;
  title?: string;
  document_type?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const requestData: GenerateDocumentRequest = await req.json();
    const { document_id, template_id, content, form_data, title, document_type } = requestData;

    console.log('Generate document request:', {
      document_id,
      template_id,
      title,
      contentLength: content?.length
    });

    if (!content) {
      throw new Error('Missing content');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse content and create DOCX document
    const docSections = parseContentToDocx(content, title || 'Dokument prawny');

    const doc = new Document({
      creator: 'InsightsLM Legal Assistant',
      title: title || 'Dokument prawny',
      description: `Wygenerowany dokument typu: ${document_type || 'pismo'}`,
      styles: {
        default: {
          document: {
            run: {
              font: 'Times New Roman',
              size: 24, // 12pt
            },
            paragraph: {
              spacing: {
                after: 200,
                line: 276, // 1.15 line spacing
              },
            },
          },
        },
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              font: 'Times New Roman',
              size: 24,
            },
          },
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              font: 'Times New Roman',
              size: 28,
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 240,
                after: 120,
              },
              alignment: AlignmentType.CENTER,
            },
          },
          {
            id: 'Heading2',
            name: 'Heading 2',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              font: 'Times New Roman',
              size: 26,
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 200,
                after: 100,
              },
            },
          },
          {
            id: 'RightAligned',
            name: 'Right Aligned',
            basedOn: 'Normal',
            run: {
              font: 'Times New Roman',
              size: 24,
            },
            paragraph: {
              alignment: AlignmentType.RIGHT,
            },
          },
        ],
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: docSections,
      }],
    });

    // Generate DOCX buffer
    const buffer = await Packer.toBuffer(doc);
    const uint8Array = new Uint8Array(buffer);

    // Generate filename
    const sanitizedTitle = (title || 'dokument')
      .toLowerCase()
      .replace(/[^a-z0-9ąćęłńóśźż]/gi, '_')
      .substring(0, 50);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedTitle}_${timestamp}.docx`;

    // Upload to Supabase Storage
    const filePath = `${user.id}/${document_id || crypto.randomUUID()}/${filename}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('generated-documents')
      .upload(filePath, uint8Array, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload document');
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('generated-documents')
      .getPublicUrl(filePath);

    // Update document record if document_id provided
    if (document_id) {
      const { error: updateError } = await supabase
        .from('generated_legal_documents')
        .update({
          docx_file_path: filePath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', document_id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        // Don't throw - document was generated successfully
      }
    }

    console.log('Document generated successfully:', filePath);

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: urlData.publicUrl,
        filePath: filePath,
        filename: filename,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-legal-document:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to generate document'
      }),
      {
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

/**
 * Parsuje treść dokumentu i tworzy elementy DOCX
 */
function parseContentToDocx(content: string, title: string): (Paragraph)[] {
  const elements: Paragraph[] = [];

  // Podziel treść na paragrafy
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  for (const para of paragraphs) {
    const trimmed = para.trim();

    // Nagłówek H1 (# )
    if (trimmed.startsWith('# ')) {
      elements.push(
        new Paragraph({
          text: trimmed.slice(2),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        })
      );
      continue;
    }

    // Nagłówek H2 (## )
    if (trimmed.startsWith('## ')) {
      elements.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_2,
        })
      );
      continue;
    }

    // Nagłówek H3 (### )
    if (trimmed.startsWith('### ')) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.slice(4),
              bold: true,
            }),
          ],
        })
      );
      continue;
    }

    // Wyrównanie do prawej [PRAWY]
    if (trimmed.startsWith('[PRAWY]')) {
      const text = trimmed.slice(7).trim();
      // Obsłuż wiele linii
      const lines = text.split('\n');
      for (const line of lines) {
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: line })],
            alignment: AlignmentType.RIGHT,
          })
        );
      }
      continue;
    }

    // Wyrównanie do środka [ŚRODEK]
    if (trimmed.startsWith('[ŚRODEK]')) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed.slice(8).trim() })],
          alignment: AlignmentType.CENTER,
        })
      );
      continue;
    }

    // Podpis [PODPIS]
    if (trimmed.startsWith('[PODPIS]')) {
      elements.push(
        new Paragraph({
          children: [],
          spacing: { before: 600 },
        })
      );
      elements.push(
        new Paragraph({
          children: [
            new TextRun({ text: '_'.repeat(30) }),
          ],
          alignment: AlignmentType.RIGHT,
        })
      );
      elements.push(
        new Paragraph({
          children: [
            new TextRun({ text: trimmed.slice(8).trim() }),
          ],
          alignment: AlignmentType.RIGHT,
        })
      );
      continue;
    }

    // Lista numerowana (1. 2. 3.)
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split(/\n(?=\d+\.\s)/);
      for (const item of items) {
        const match = item.match(/^(\d+)\.\s(.+)/s);
        if (match) {
          elements.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${match[1]}. ${match[2].trim()}` }),
              ],
              indent: {
                left: 720, // 0.5 inch
              },
            })
          );
        }
      }
      continue;
    }

    // Lista punktowana (- lub *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split(/\n(?=[-*]\s)/);
      for (const item of items) {
        const text = item.replace(/^[-*]\s/, '').trim();
        elements.push(
          new Paragraph({
            children: [
              new TextRun({ text: `• ${text}` }),
            ],
            indent: {
              left: 720,
            },
          })
        );
      }
      continue;
    }

    // Zwykły paragraf - obsłuż formatowanie bold i italic
    const children: TextRun[] = [];
    let remaining = trimmed;

    // Prosta obsługa **bold** i *italic*
    const parts = remaining.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

    for (const part of parts) {
      if (part.startsWith('**') && part.endsWith('**')) {
        children.push(new TextRun({
          text: part.slice(2, -2),
          bold: true,
        }));
      } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        children.push(new TextRun({
          text: part.slice(1, -1),
          italics: true,
        }));
      } else if (part) {
        children.push(new TextRun({ text: part }));
      }
    }

    if (children.length > 0) {
      elements.push(
        new Paragraph({
          children,
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  }

  return elements;
}
