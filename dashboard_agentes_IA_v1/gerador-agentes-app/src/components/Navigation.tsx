import { useState } from 'react';

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#000000] border-b border-[#333] p-4 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-roboto">Dashboard</h1>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
          <i className="fas fa-bars"></i>
        </button>
        <div className={`${menuOpen ? "block" : "hidden"} md:block`}>
          <ul className="md:flex space-x-6">
            <li>
              <a href="#" className="hover:text-[#ff0000]">Dashboard</a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff0000]">Maintenance</a>
            </li>
            <li>
              <a href="#" className="hover:text-[#ff0000]">Reports</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
