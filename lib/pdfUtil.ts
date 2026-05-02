import * as pdfjsLib from 'pdfjs-dist';

// Set up worker - gunakan public folder untuk menghindari bundler issues
const initWorker = () => {
  if (typeof window !== 'undefined' && 'Worker' in window) {
    try {
      // Worker file di-serve dari public folder (tidak di-bundling)
      // Bisa menggunakan .js atau .mjs - keduanya work
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      console.log('✅ PDF.js worker initialized from public folder');
    } catch (e) {
      console.error('⚠️ Worker initialization error:', e);
    }
  }
};

initWorker();

export const PDFUtil = {
  /**
   * Extract first page of PDF and convert to canvas/image
   */
  async getPDFPreview(pdfPath: string): Promise<string | null> {
    try {
      console.log('Loading PDF from:', pdfPath);
      
      // Validate PDF path
      if (!pdfPath || typeof pdfPath !== 'string') {
        console.error('Invalid PDF path:', pdfPath);
        return null;
      }

      // Ensure absolute path for loading
      const absolutePath = pdfPath.startsWith('/') ? pdfPath : `/${pdfPath}`;
      
      const pdf = await pdfjsLib.getDocument(absolutePath).promise;
      const page = await pdf.getPage(1);
      
      // Create canvas with proper dimensions
      const scale = 2;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('Failed to get canvas context');
        return null;
      }
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to data URL
      const imageData = canvas.toDataURL('image/png');
      console.log('PDF preview generated successfully');
      return imageData;
    } catch (error) {
      console.error('Error rendering PDF preview:', {
        error,
        pdfPath,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  },

  /**
   * Download PDF file
   */
  downloadPDF(pdfPath: string, filename: string): void {
    try {
      const absolutePath = pdfPath.startsWith('/') ? pdfPath : `/${pdfPath}`;
      const link = document.createElement('a');
      link.href = absolutePath;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('PDF downloaded:', filename);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  }
};
