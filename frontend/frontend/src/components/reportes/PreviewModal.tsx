import React from 'react';

// Estilos globales de impresión incrustados en la vista previa
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #reporte-preview, #reporte-preview * {
      visibility: visible;
    }
    #reporte-preview {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 0;
      margin: 0;
    }
    @page { margin: 10mm; }
  }
`;

interface PreviewProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const PreviewModal: React.FC<PreviewProps> = ({ onClose, title, children }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('reporte-preview');
    if (!element) return;

    // Importación dinámica para evitar problemas en el bundle si no se usa
    const html2pdf = (await import('html2pdf.js')).default;

    const opt = {
      margin: 10,
      filename: `${title.replace(/ /g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-sm overflow-hidden animate-in fade-in duration-300">
      <style>{printStyles}</style>

      {/* Barra de herramientas superior */}
      <div className="flex justify-between items-center bg-white px-6 pb-2.5 shadow-sm z-10 border-b border-slate-200">
        <div className="flex items-center gap-6">
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
          >
            Cerrar
          </button>

          <div className="h-4 w-px bg-slate-200"></div>

          <span className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
            Vista Previa de Documento
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 border-2 border-[#009688] bg-white text-[#009688] hover:bg-[#009688] hover:text-white px-5 py-2 rounded-lg font-medium text-sm transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
            Imprimir Documento
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-2 bg-[#009688] hover:bg-[#004d43] text-white px-5 py-2 rounded-lg font-medium text-sm transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Contenedor de la vista previa centrada */}
      <div className="flex-1 overflow-auto bg-slate-100 p-8 flex justify-center pb-20">
        {/* El div 'reporte-preview' es el que se capturará para imprimir/PDF */}
        <div id="reporte-preview" className="bg-white shadow-xl rounded-sm w-full max-w-[800px] min-h-[1131px] relative">
          {children}
        </div>
      </div>
    </div>
  );
};
