import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, AlertCircle, FileText } from 'lucide-react';
import { PDFUtil } from '../../lib/pdfUtil';

interface PDFPreviewCardProps {
  title: string;
  category: string;
  year: string;
  pdfPath: string;
}

const PDFPreviewCard: React.FC<PDFPreviewCardProps> = ({
  title,
  category,
  year,
  pdfPath,
}: PDFPreviewCardProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const preview = await PDFUtil.getPDFPreview(pdfPath);
        if (preview) {
          setPreviewImage(preview);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load PDF preview:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [pdfPath]);

  const handleDownload = () => {
    PDFUtil.downloadPDF(pdfPath, `${title.replace(/\s+/g, '_')}_${year}.pdf`);
  };

  const handleOpenPDF = () => {
    window.open(pdfPath, '_blank');
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative h-full rounded-2xl border border-surface overflow-hidden bg-primary/[0.02] backdrop-blur-xl hover:border-accent/40 transition-all duration-300"
    >
      {/* Background Preview or Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-amber-500/10">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-accent/20 rounded-full" />
              <p className="text-xs text-accent/50 mt-2 text-center">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-500/5">
            <div className="text-center">
              <FileText className="w-8 h-8 text-amber-600/60 mx-auto mb-2" />
              <p className="text-xs text-amber-600/60">PDF tidak dapat di-preview</p>
            </div>
          </div>
        ) : previewImage ? (
          <img
            src={previewImage}
            alt={`Preview ${title}`}
            className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-300"
          />
        ) : null}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        {/* Icon & Title */}
        <div>
          <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
            <Award size={20} />
          </div>
          <h3 className="text-lg font-bold text-primary mb-1">
            {title}
          </h3>
        </div>

        {/* Footer Info */}
        <div className="space-y-3">
          <div className="pt-4 border-t border-accent/10 flex justify-between items-center text-xs text-muted">
            <span>{category}</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
              {year}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download file PDF"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {error && (
              <button
                onClick={handleOpenPDF}
                className="flex-1 py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-xs font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                title="Buka PDF di tab baru"
              >
                <FileText className="w-3 h-3" />
                <span className="hidden sm:inline">Buka</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PDFPreviewCard;
