import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink } from 'lucide-react';
import { Achievement } from '../../types';
import { PDFUtil } from '../../lib/pdfUtil';
import { fadeInUp } from '../../lib/motion';

interface CertificateCardProps {
  cert: Achievement;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ cert }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const preview = await PDFUtil.getPDFPreview(cert.pdfPath);
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
  }, [cert.pdfPath]);

  return (
    <motion.div
      className="relative bg-card border border-surface rounded-xl overflow-hidden hover:border-accent transition-all duration-300 group h-full"
      variants={fadeInUp}
    >
      {/* PDF Preview Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-accent/20 rounded-full" />
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-accent/5">
            <div className="text-center">
              <FileText className="w-6 h-6 text-accent/40 mx-auto mb-1" />
              <p className="text-xs text-accent/30">No preview</p>
            </div>
          </div>
        ) : previewImage ? (
          <img
            src={previewImage}
            alt={`Preview ${cert.title}`}
            className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-300"
          />
        ) : null}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors flex-shrink-0">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
                {cert.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted">
            <span className="font-medium">Penerbit:</span> {cert.issuer}
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
              {cert.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/10 text-muted text-xs font-medium rounded-full">
              {cert.year}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={cert.pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-colors text-sm font-medium"
            title="Lihat Sertifikat PDF"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </a>
          {cert.link && (
            <a
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium"
              title="Buka Kredensial"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Kredensial</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateCard;
