interface TablesProps {
  sampleData: {
    maintenance: {
      date: string;
      value: number;
      ships: number;
      cost: number;
    }[];
  };
}

export default function Tables({ sampleData }: TablesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-[#1a1a1a] rounded p-4 text-white">
        <h3 className="font-bold text-xl mb-4">System Status</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#333]">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#333]">
              <td className="p-2">25</td>
              <td className="p-2">Connected</td>
              <td className="p-2">23:47:42</td>
            </tr>
            <tr className="border-b border-[#333]">
              <td className="p-2">26</td>
              <td className="p-2">Active</td>
              <td className="p-2">23:48:12</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-[#1a1a1a] rounded p-4 text-white">
        <h3 className="font-bold text-xl mb-4">Performance</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#333]">
              <th className="p-2 text-left">Metric</th>
              <th className="p-2 text-left">Value</th>
              <th className="p-2 text-left">Change</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.maintenance.map((item, index) => (
              <tr key={index} className="border-b border-[#333]">
                <td className="p-2">{item.date}</td>
                <td className="p-2">{item.ships}</td>
                <td className="p-2 text-[#ff0000]">+{item.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
