import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { TextBlockItem, PhoneticDisplayMode } from '../types';
import { SimpleGifEncoder } from './gifEncoder';
import { getFontFamilyStyle } from './fonts';

// Generate standard HTML with Ruby tags for Google Docs / MS Word / Web
export function generateRubyHtml(blocks: TextBlockItem[], displayMode: PhoneticDisplayMode): string {
  const content = blocks.map(block => {
    const charsHtml = block.characters.map(item => {
      const char = item.char;
      if (!item.zhuyin && !item.pinyin) {
        return `<span>${char}</span>`;
      }

      const showZhuyin = (displayMode === 'zhuyin' || displayMode === 'both') && item.zhuyin;
      const showPinyin = (displayMode === 'pinyin' || displayMode === 'both') && item.pinyin;

      let rubyText = '';
      if (showZhuyin && showPinyin) {
        rubyText = `${item.zhuyin}${item.zhuyinTone} / ${item.pinyin}`;
      } else if (showZhuyin) {
        rubyText = `${item.zhuyin}${item.zhuyinTone}`;
      } else if (showPinyin) {
        rubyText = item.pinyin;
      }

      if (!rubyText || displayMode === 'none') {
        return `<span>${char}</span>`;
      }

      return `<ruby style="ruby-align: center; margin: 0 4px;"><rb style="font-size: ${block.fontSize}px; font-family: ${getFontFamilyStyle(block.fontFamily)};">${char}</rb><rt style="font-size: ${Math.max(12, Math.round(block.fontSize * 0.4))}px; color: #64748b; font-family: system-ui, sans-serif;">${rubyText}</rt></ruby>`;
    }).join('');

    return `<p style="margin: 16px 0; line-height: 2.2;">${charsHtml}</p>`;
  }).join('');

  return content;
}

// Copy plain text
export async function copyPlainText(blocks: TextBlockItem[]): Promise<boolean> {
  try {
    const text = blocks.map(b => b.rawText).join('\n');
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}

// Copy Ruby formatted HTML to clipboard for Google Docs / Microsoft Word / Pages
export async function copyRubyHtmlToClipboard(blocks: TextBlockItem[], displayMode: PhoneticDisplayMode): Promise<boolean> {
  try {
    const rubyBody = generateRubyHtml(blocks, displayMode);
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${rubyBody}</body></html>`;
    const plainText = blocks.map(b => b.rawText).join('\n');

    const blobHtml = new Blob([fullHtml], { type: 'text/html' });
    const blobText = new Blob([plainText], { type: 'text/plain' });

    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      }),
    ]);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

// Copy canvas image directly to clipboard as PNG
export async function copyCanvasImageToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fbfbfa',
    });
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('Image clipboard copy failed:', err);
    return false;
  }
}

// Export to Microsoft Word (.doc with native ruby tags and UTF-8 header)
export function exportToWordDoc(blocks: TextBlockItem[], displayMode: PhoneticDisplayMode, title: string = '華語白板課堂講義'): void {
  const bodyContent = generateRubyHtml(blocks, displayMode);
  const wordDocumentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: 'DFKai-SB', 'BiauKai', 'KaiTi', 'Times New Roman', serif;
          font-size: 16pt;
          line-height: 2.2;
          padding: 40px;
        }
        h1 {
          font-size: 24pt;
          color: #1e293b;
          text-align: center;
          margin-bottom: 24px;
        }
        ruby {
          ruby-align: center;
        }
        rt {
          font-size: 10pt;
          color: #475569;
          font-family: Arial, sans-serif;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p style="text-align: right; color: #64748b; font-size: 11pt;">產生日期：${new Date().toLocaleDateString('zh-TW')}</p>
      <hr style="border: 0; border-top: 1px solid #cbd5e1; margin-bottom: 30px;" />
      ${bodyContent}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordDocumentHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title}_${Date.now()}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to Google Docs helper
export function exportToGoogleDocsDoc(blocks: TextBlockItem[], displayMode: PhoneticDisplayMode): void {
  const bodyContent = generateRubyHtml(blocks, displayMode);
  const htmlBlob = new Blob([bodyContent], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(htmlBlob);
  link.download = `GoogleDocs_華語教材_${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to PNG Image
export async function exportToPng(
  element: HTMLElement,
  filename: string = '華語教學白板'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#fbfbfa',
  });
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}_${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to PDF
export async function exportToPdf(
  element: HTMLElement,
  title: string = '華語教學白板課堂筆記'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#fbfbfa',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const ratio = Math.min(pdfWidth / (canvasWidth / 2.83), (pdfHeight - 15) / (canvasHeight / 2.83));

  const finalWidth = (canvasWidth / 2.83) * ratio;
  const finalHeight = (canvasHeight / 2.83) * ratio;
  const x = (pdfWidth - finalWidth) / 2;
  const y = 10;

  pdf.text(title, 14, 8);
  pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
  pdf.save(`${title}_${Date.now()}.pdf`);
}

// Export animated GIF from canvas frames
export function exportToGif(canvases: HTMLCanvasElement[], delayMs: number = 300, filename: string = '筆順與板書動畫'): void {
  if (canvases.length === 0) return;
  const w = canvases[0].width;
  const h = canvases[0].height;
  const encoder = new SimpleGifEncoder(w, h, delayMs);

  for (const c of canvases) {
    const ctx = c.getContext('2d');
    if (ctx) {
      const imgData = ctx.getImageData(0, 0, w, h);
      encoder.addFrame(imgData);
    }
  }

  const gifBlob = encoder.encode();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(gifBlob);
  link.download = `${filename}_${Date.now()}.gif`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
