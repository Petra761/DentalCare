const AgendaStats = () => (
  <div className="bg-white border border-outline-variant rounded-lg p-5 shadow-sm">
    <h4 className="text-xs font-bold text-on-surface-variant mb-4">
      Resumen Octubre
    </h4>
    <div className="grid grid-cols-2 gap-4">
      <div className="border border-outline-variant rounded-lg p-3 bg-surface-container-low">
        <p className="text-[10px] text-outline font-bold mb-1 uppercase">
          Citas Totales
        </p>
        <p className="text-2xl font-black text-primary">124</p>
      </div>
      <div className="border border-outline-variant rounded-lg p-3 bg-surface-container-low">
        <p className="text-[10px] text-outline font-bold mb-1 uppercase">
          Confirmadas
        </p>
        <p className="text-2xl font-black text-secondary">92%</p>
      </div>
    </div>
  </div>
);

export default AgendaStats;
