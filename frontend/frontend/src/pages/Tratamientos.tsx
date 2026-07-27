import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Servicio, Categoria } from '../services/api';
import { 
  Activity, 
  Search, 
  Clock, 
  Grid, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

export const Tratamientos: React.FC = () => {
  // Data States
  const [services, setServices] = useState<Servicio[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter States
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load all services and categories
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [servicesData, categoriesData] = await Promise.all([
        apiService.getServicios(),
        apiService.getCategorias()
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Services List
  const [filteredServices, setFilteredServices] = useState<Servicio[]>([]);

  useEffect(() => {
    let result = [...services];

    // Filter out inactive services (estado !== 'Activo')
    result = result.filter(s => s.estado?.toUpperCase() === 'ACTIVO');

    // Search Query (name, code, description)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((s) => {
        const name = (s.nombre || '').toLowerCase();
        const code = (s.codigo || '').toLowerCase();
        const desc = (s.descripcion || '').toLowerCase();
        // Lookup category name for search
        const cat = categories.find(c => c.idCategoria === s.idCategoria);
        const catName = cat ? cat.nombre.toLowerCase() : '';

        return name.includes(q) || code.includes(q) || desc.includes(q) || catName.includes(q);
      });
    }

    // Category Filter
    if (filterCategory !== 'todos') {
      const categoryId = Number(filterCategory);
      result = result.filter((s) => s.idCategoria === categoryId);
    }

    // Status Filter (estadoServicio)
    if (filterStatus !== 'todos') {
      result = result.filter((s) => s.estadoServicio?.toLowerCase() === filterStatus.toLowerCase());
    }

    setFilteredServices(result);
    setCurrentPage(1); // Reset page on filter change
  }, [query, filterCategory, filterStatus, services, categories]);

  // Helper formatting functions
  const formatDuration = (durationStr: string) => {
    if (!durationStr) return '';
    const parts = durationStr.split(':');
    if (parts.length < 2) return durationStr;
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;
    return result.trim() || '0m';
  };

  const getCategoryName = (idCategoria: number) => {
    const cat = categories.find(c => c.idCategoria === idCategoria);
    return cat ? cat.nombre : 'Sin categoría';
  };

  const formatCode = (code: string) => {
    if (!code) return '';
    return code.startsWith('#') ? code : `#${code}`;
  };

  // Stats Calculations
  const totalActive = services.filter(s => s.estado?.toUpperCase() === 'ACTIVO').length;
  const totalAvailable = services.filter(s => s.estado?.toUpperCase() === 'ACTIVO' && s.estadoServicio?.toLowerCase() === 'disponible').length;
  const totalCats = categories.filter(c => c.estado?.toLowerCase() === 'activo').length;

  const getAverageDuration = () => {
    const activeServices = services.filter(s => s.estado?.toUpperCase() === 'ACTIVO');
    if (activeServices.length === 0) return '0m';
    let totalMin = 0;
    activeServices.forEach(s => {
      const parts = s.duracion.split(':');
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        totalMin += h * 60 + m;
      }
    });
    const avg = Math.round(totalMin / activeServices.length);
    return avg >= 60 ? `${Math.floor(avg / 60)}h ${avg % 60}m` : `${avg}m`;
  };

  // Pagination indexing
  const totalItems = filteredServices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentServices = filteredServices.slice(startIndex, endIndex);

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Servicios
          </h1>
          <p className="text-slate-500 mt-1">
            Consulta los servicios odontológicos en el sistema.
          </p>
        </div>
      </div>

      {/* Loading / Error States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <RefreshCw className="animate-spin text-brand-700 mb-2" size={32} />
          <span className="text-sm font-medium text-slate-500">Cargando tratamientos...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-6 flex flex-col items-center text-center">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <h3 className="font-bold text-red-800">Error de Conexión</h3>
          <p className="text-sm text-red-600 mt-1 max-w-md">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl transition-colors duration-150 cursor-pointer"
          >
            Reintentar Carga
          </button>
        </div>
      ) : (
        <>
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Card 1: Total */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                <Activity size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Servicios</span>
                <span className="text-2xl font-extrabold text-slate-800">{totalActive}</span>
              </div>
            </div>

            {/* Card 2: Available */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disponibles</span>
                <span className="text-2xl font-extrabold text-slate-800">{totalAvailable}</span>
              </div>
            </div>

            {/* Card 3: Avg Duration */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duración Promedio</span>
                <span className="text-2xl font-extrabold text-slate-800">{getAverageDuration()}</span>
              </div>
            </div>

            {/* Card 4: Categories */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Grid size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categorías</span>
                <span className="text-2xl font-extrabold text-slate-800">{totalCats}</span>
              </div>
            </div>
          </div>

          {/* Toolbar Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search Input */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por código, nombre, descripción o categoría..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-700 focus:ring-4 focus:ring-teal-700/5 transition-all duration-200 text-sm font-medium text-slate-700"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold transition-all duration-150 cursor-pointer ${
                    showFilters || filterCategory !== 'todos' || filterStatus !== 'todos'
                      ? 'bg-brand-50 text-brand-700 border-brand-200'
                      : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  <span>Filtros</span>
                </button>
              </div>
            </div>

            {/* Expandable Filter Box */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 animate-slide-down">
                {/* Category Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-teal-800 uppercase tracking-wider">Filtrar por Categoría</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-700 cursor-pointer"
                  >
                    <option value="todos">Todas las categorías</option>
                    {categories.map((c) => (
                      <option key={c.idCategoria} value={c.idCategoria}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-teal-800 uppercase tracking-wider">Filtrar por Estado</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-700 cursor-pointer"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="no disponible">No Disponible</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider">Nombre del Servicio</th>
                    <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider">Duración</th>
                    <th className="px-6 py-4 text-xs font-bold text-teal-800 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentServices.length > 0 ? (
                    currentServices.map((s) => {
                      const isDisponible = s.estadoServicio?.toLowerCase() === 'disponible';
                      
                      return (
                        <tr key={s.idServicio} className="hover:bg-slate-50/40 transition-colors duration-150">
                          {/* Código */}
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                            {formatCode(s.codigo)}
                          </td>

                          {/* Nombre */}
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">
                            {s.nombre}
                          </td>

                          {/* Descripción */}
                          <td className="px-6 py-4 text-sm text-slate-500 max-w-[300px] truncate" title={s.descripcion}>
                            {s.descripcion || '-'}
                          </td>

                          {/* Categoría */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                              {getCategoryName(s.idCategoria)}
                            </span>
                          </td>

                          {/* Duración */}
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              <span>{formatDuration(s.duracion)}</span>
                            </div>
                          </td>

                          {/* Estado */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isDisponible 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isDisponible ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {s.estadoServicio || 'No Disponible'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                        No se encontraron tratamientos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {totalItems > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                <span className="text-xs font-medium text-slate-500">
                  Mostrando {startIndex + 1} a {endIndex} de {totalItems} tratamientos
                </span>

                <div className="flex items-center gap-1">
                  {/* Prev Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-150 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                        currentPage === page
                          ? 'bg-brand-700 text-white shadow-sm shadow-teal-700/20'
                          : 'border border-transparent text-slate-600 hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-150 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
