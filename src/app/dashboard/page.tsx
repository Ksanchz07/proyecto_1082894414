export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#EFF3FB] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-[24px] bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-slate-200">
        <h1 className="text-3xl font-semibold mb-3">Dashboard</h1>
        <p className="text-slate-600 mb-6">
          Bienvenido a CuentaFácil. En esta fase inicial el sistema valida el login del administrador y prepara la aplicación para el bootstrap.
        </p>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-slate-700 font-medium mb-2">Siguiente paso</p>
          <p className="text-sm text-slate-600">
            Ve a <code className="rounded-md bg-white px-2 py-1 text-slate-800">/admin/db-setup</code> para aplicar las migrations y cargar el usuario admin si el entorno está configurado.
          </p>
        </div>
      </div>
    </main>
  );
}
