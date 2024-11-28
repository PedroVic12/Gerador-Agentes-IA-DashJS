export default function StatusMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-[#1a1a1a] rounded p-4 text-white">
        <p className="text-sm">TPS</p>
        <p className="text-lg">110%</p>
      </div>
      <div className="bg-[#1a1a1a] rounded p-4 text-white">
        <p className="text-sm">P. Dianteira</p>
        <p className="text-lg">0 PSI</p>
      </div>
      <div className="bg-[#1a1a1a] rounded p-4 text-white">
        <p className="text-sm">P. Traseira</p>
        <p className="text-lg">0 PSI</p>
      </div>
      <div className="bg-[#1a1a1a] rounded p-4 text-white">
        <p className="text-sm">P. Mestre 1</p>
        <p className="text-lg">0 PSI</p>
      </div>
      <div className="bg-[#1a1a1a] rounded p-4 text-white">
        <p className="text-sm">P. Mestre 2</p>
        <p className="text-lg">0 PSI</p>
      </div>
    </div>
  );
}
