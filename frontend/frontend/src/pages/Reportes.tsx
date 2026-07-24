import React, { useState } from 'react';
import { Calendar, Users, Grid, FileText, FileCode2 } from 'lucide-react';
import { reportesService } from '../services/reportes/reportesService';
import { PreviewModal } from '../components/reportes/PreviewModal';
import { 
  PreviewAgendaDiaria, 
  PreviewAgendaMensual, 
  PreviewPacientes, 
  PreviewServicios 
} from '../components/reportes/ReporteTemplates';

type ReportType = 'diaria' | 'mensual' | 'pacientes' | 'servicios' | null;

export const Reportes: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Estados para el Modal de Previsualización
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewType, setPreviewType] = useState<ReportType>(null);

  const getLocalTodayString = () => {
    // Retorna YYYY-MM-DD usando la zona horaria local, evitando problemas de UTC
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedDate = (dateStr: string) => {
    if(!dateStr) return '';
    // Evita problemas de desfase horario añadiendo 'T00:00:00' para forzar local
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handlePreviewAgendaDiaria = async () => {
    try {
      setLoading(true);
      const today = getLocalTodayString();
      const data = await reportesService.getAgenda(today);
      setPreviewData({ data, date: getFormattedDate(today) });
      setPreviewType('diaria');
    } catch (error) {
      console.error(error);
      alert('Error al obtener los datos de la agenda diaria.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewAgendaMensual = async () => {
    try {
      setLoading(true);
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
      
      const fechaInicio = `${year}-${month}-01`;
      const fechaFin = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
      
      const data = await reportesService.getAgendaMensual(fechaInicio, fechaFin);
      const mesAnio = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      setPreviewData({ data, date: mesAnio.charAt(0).toUpperCase() + mesAnio.slice(1) });
      setPreviewType('mensual');
    } catch (error) {
      console.error(error);
      alert('Error al obtener los datos de la agenda mensual.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPacientes = async () => {
    try {
      setLoading(true);
      const data = await reportesService.getPacientes();
      setPreviewData({ data, date: getFormattedDate(getLocalTodayString()) });
      setPreviewType('pacientes');
    } catch (error) {
      console.error(error);
      alert('Error al obtener los datos de pacientes.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTratamientos = async () => {
    try {
      setLoading(true);
      const data = await reportesService.getTratamientos();
      setPreviewData({ data, date: getFormattedDate(getLocalTodayString()) });
      setPreviewType('servicios');
    } catch (error) {
      console.error(error);
      alert('Error al obtener los datos de servicios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      {/* Header sin filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Centro de Reportes</h1>
          <p className="text-slate-500 mt-1">Genera y exporta la documentación detallada de la clínica.</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agenda Diaria */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Calendar size={24} />
            </div>
            <button 
              onClick={handlePreviewAgendaDiaria} 
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText size={16} /> PDF
            </button>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2 relative z-10">Agenda Diaria</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-2 relative z-10">
            Resumen detallado de todas las citas, horarios y tratamientos asignados para el <strong>día actual</strong>.
          </p>
        </div>

        {/* Agenda Mensual */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Grid size={24} />
            </div>
            <button 
              onClick={handlePreviewAgendaMensual} 
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText size={16} /> PDF
            </button>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2 relative z-10">Agenda Mensual</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-2 relative z-10">
            Vista panorámica del flujo de trabajo de <strong>este mes</strong>, permitiendo analizar la ocupación.
          </p>
        </div>

        {/* Listado de Pacientes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users size={24} />
            </div>
            <button 
              onClick={handlePreviewPacientes} 
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText size={16} /> PDF
            </button>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2 relative z-10">Listado de Pacientes</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-2 relative z-10">
            Base de datos de pacientes activos registrados con sus datos de contacto e historial clínico.
          </p>
        </div>

        {/* Listado de Tratamientos (Servicios) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileCode2 size={24} />
            </div>
            <button 
              onClick={handlePreviewTratamientos} 
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText size={16} /> PDF
            </button>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2 relative z-10">Listado de Tratamientos</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-2 relative z-10">
            Consolidado de tratamientos (servicios) activos realizados y categorías.
          </p>
        </div>
      </div>

      {/* Renderizado Condicional del Modal de Previsualización */}
      {previewType && previewData && (
        <PreviewModal 
          title={`Reporte ${previewType}`} 
          onClose={() => setPreviewType(null)}
        >
          {previewType === 'diaria' && <PreviewAgendaDiaria data={previewData.data} fecha={previewData.date} />}
          {previewType === 'mensual' && <PreviewAgendaMensual data={previewData.data} mesAnio={previewData.date} />}
          {previewType === 'pacientes' && <PreviewPacientes data={previewData.data} date={previewData.date} />}
          {previewType === 'servicios' && <PreviewServicios data={previewData.data} date={previewData.date} />}
        </PreviewModal>
      )}
    </div>
  );
};
