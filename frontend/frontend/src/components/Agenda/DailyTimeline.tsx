import React from "react";

interface Props {
  citas: any[];
  selectedDate: string;
}

const DailyTimeline: React.FC<Props> = ({ citas, selectedDate }) => {
  const dateObj = new Date(selectedDate + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#f0f9fa] border border-primary/10 rounded-xl p-6 flex-1 shadow-sm min-h-[400px] flex flex-col agenda-container">
      {/* Encabezado visible solo en Impresión */}
      <div className="hidden print:block mb-8 border-b-2 border-primary pb-4">
        <h1 className="text-2xl font-black text-primary uppercase">
          Reporte de Agenda Diaria
        </h1>
        <p className="text-sm text-outline font-bold">Clínica Odontológica</p>
      </div>

      <div className="mb-6 flex justify-between items-start">
        <div>
          <p className="text-[10px] uppercase font-bold text-primary tracking-widest mb-1">
            AGENDA DEL DÍA
          </p>
          <h3 className="text-xl font-bold text-secondary capitalize">
            {formattedDate}
          </h3>
        </div>

        {/* Botón de impresión (se oculta al imprimir) */}
        <button
          onClick={handlePrint}
          className="print:hidden p-2 bg-white hover:bg-primary/10 rounded-full text-primary transition-all shadow-sm border border-outline-variant"
          title="Imprimir Agenda"
        >
          <span className="material-symbols-outlined">print</span>
        </button>
      </div>

      <div className="space-y-4 relative flex-1">
        {/* Línea de tiempo (se oculta al imprimir para limpieza visual) */}
        <div className="absolute left-[7px] top-4 bottom-4 w-px bg-primary/20 border-l border-dashed border-primary/40 print:hidden"></div>

        {citas.length === 0 ? (
          /* RECORDATORIO SI NO HAY CITAS */
          <div className="pl-8 print:pl-0 py-12 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-outline/20 text-7xl mb-4">
              calendar_today
            </span>
            <div className="bg-white print:border print:border-dashed print:border-outline-variant p-6 rounded-xl w-full">
              <p className="text-lg font-bold text-on-surface-variant">
                Sin citas programadas
              </p>
              <p className="text-sm text-outline mt-1">
                No se encontraron registros de atención para el día
                seleccionado.
              </p>
            </div>
          </div>
        ) : (
          /* LISTADO DE CITAS */
          citas.map((cita) => (
            <div key={cita.idCita} className="relative pl-8 print:pl-0">
              {/* Punto de la línea (se oculta al imprimir) */}
              <div className="absolute left-0 top-2 w-3.5 h-3.5 rounded-full border-2 border-white bg-primary print:hidden"></div>

              <div className="bg-white p-4 rounded-lg border border-outline-variant shadow-sm print:shadow-none print:border-b print:rounded-none">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-primary">
                    {cita.hora}
                  </span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded uppercase print:border print:border-primary">
                    {cita.estadoCita}
                  </span>
                </div>
                <p className="font-bold text-sm text-on-surface uppercase">
                  {cita.nombrePaciente}
                </p>
                <p className="text-[11px] text-outline flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px] print:hidden">
                    dentistry
                  </span>
                  <span className="font-medium">Tratamiento:</span>{" "}
                  {cita.nombreServicio}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pie de página en impresión */}
      <div className="hidden print:block mt-auto pt-8 text-[10px] text-outline text-center border-t border-outline-variant">
        Documento generado automáticamente por el Sistema de Gestión de Agenda -{" "}
        {new Date().toLocaleString()}
      </div>

      {/* ESTILOS CSS PARA LA IMPRESIÓN */}
      <style>{`
        @media print {
          /* Ocultar todo excepto el contenedor de la agenda */
          body * {
            visibility: hidden;
          }
          .agenda-container, .agenda-container * {
            visibility: visible;
          }
          /* Posicionar la agenda al inicio de la página */
          .agenda-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          /* Forzar que los colores de fondo se impriman */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Evitar saltos de página a mitad de una cita */
          .bg-white {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default DailyTimeline;
