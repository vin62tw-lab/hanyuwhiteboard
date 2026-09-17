import React, { useState } from 'react';
import {
  X,
  Copy,
  FileText,
  FileDown,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { TextBlockItem, PhoneticDisplayMode } from '../types';
import {
  copyPlainText,
  copyRubyHtmlToClipboard,
  copyCanvasImageToClipboard,
  exportToPdf,
  exportToPng,
} from '../utils/export';

interface ExportModalProps {
  textBlocks: TextBlockItem[];
  displayMode: PhoneticDisplayMode;
  boardElementRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  textBlocks,
  displayMode,
  boardElementRef,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [docTitle, setDocTitle] = useState('華語白板課堂教材');

  const showCopySuccess = (type: string) => {
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyText = async () => {
    const success = await copyPlainText(textBlocks);
    if (success) showCopySuccess('text');
  };

  const handleCopyRuby = async () => {
    const success = await copyRubyHtmlToClipboard(textBlocks, displayMode);
    if (success) showCopySuccess('ruby');
  };

  const handleCopyImage = async () => {
    if (!boardElementRef.current) return;
    setExporting(true);
    const success = await copyCanvasImageToClipboard(boardElementRef.current);
    setExporting(false);
    if (success) showCopySuccess('image');
  };

  const handleExportPdf = async () => {
    if (!boardElementRef.current) return;
    setExporting(true);
    await exportToPdf(boardElementRef.current, docTitle);
    setExporting(false);
    showCopySuccess('pdf');
  };

  const handleExportPng = async () => {
    if (!boardElementRef.current) return;
    setExporting(true);
    await exportToPng(boardElementRef.current, docTitle);
    setExporting(false);
    showCopySuccess('png');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-lg">白板內容複製與多格式匯出</h3>
              <p className="text-xs text-stone-500">支援 PDF 講義與 PNG 圖檔匯出，以及剪貼簿快速複製</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Document Title Input */}
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1">講義/教材文件標題：</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              placeholder="例如：第一課 歡迎學習華語"
            />
          </div>

          {/* Quick Copy Section */}
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
              剪貼簿快速複製 (可直接 Ctrl+V 貼上)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={handleCopyRuby}
                className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all group"
              >
                <div className="p-2 bg-indigo-50 group-hover:bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                  {copiedType === 'ruby' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-800">複製注音/拼音</div>
                  <div className="text-[11px] text-stone-500">含 Ruby 格式排版</div>
                </div>
              </button>

              <button
                onClick={handleCopyText}
                className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-left transition-all"
              >
                <div className="p-2 bg-stone-100 text-stone-700 rounded-lg shrink-0">
                  {copiedType === 'text' ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-800">複製純文字</div>
                  <div className="text-[11px] text-stone-500">純漢字內容</div>
                </div>
              </button>

              <button
                onClick={handleCopyImage}
                disabled={exporting}
                className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:border-sky-500 hover:bg-sky-50/50 text-left transition-all group"
              >
                <div className="p-2 bg-sky-50 group-hover:bg-sky-100 text-sky-700 rounded-lg shrink-0">
                  {copiedType === 'image' ? <Check className="w-4 h-4 text-emerald-600" /> : <ImageIcon className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-800">複製為圖片</div>
                  <div className="text-[11px] text-stone-500">直接貼入簡報</div>
                </div>
              </button>
            </div>
          </div>

          {/* Export File Formats */}
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
              輸出為檔案格式
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PDF Handout */}
              <button
                onClick={handleExportPdf}
                disabled={exporting}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-red-500 hover:bg-red-50/40 text-left transition-all group"
              >
                <div className="p-2.5 bg-red-100 text-red-700 rounded-xl group-hover:scale-105 transition-transform">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-stone-800 text-sm">PDF 課堂教材講義</div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    高解析度 A4 格式，適合列印作業與學習單
                  </p>
                </div>
              </button>

              {/* PNG Image */}
              <button
                onClick={handleExportPng}
                disabled={exporting}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
              >
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-stone-800 text-sm">高解析度 PNG 圖檔</div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    清晰保存白板上的手寫劃線、田字格與打字筆記
                  </p>
                </div>
              </button>
            </div>
          </div>

          {copiedType && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>操作成功！內容已成功處理或匯出完成。</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-xl transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
