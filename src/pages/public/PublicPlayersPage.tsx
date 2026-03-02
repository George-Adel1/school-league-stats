import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";

const PublicPlayersPage = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("players")
        .select("*, teams(name)")
        .order("last_name");
      setPlayers(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-black uppercase tracking-wide flex items-center gap-2">
        <Users className="w-6 h-6 text-[#00c853]" /> Players
      </h1>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a] text-[#888]">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Position</th>
              <th className="text-left px-4 py-3 font-medium">Team</th>
              <th className="text-center px-3 py-3 font-medium">Price</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-[#888]">Loading...</td></tr>
            ) : players.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-[#888]">No players yet</td></tr>
            ) : (
              players.map(p => (
                <tr key={p.id} className="border-b border-[#2a2a2a]/50 hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/players/${p.id}`} className="font-medium hover:text-[#00c853] transition-colors">
                      {p.name} {p.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#2a2a2a] text-[#aaa]">{p.position}</span>
                  </td>
                  <td className="px-4 py-3 text-[#888]">{p.teams?.name}</td>
                  <td className="text-center px-3 py-3 text-[#00c853] font-medium">${p.price}</td>
                  <td className="px-3">
                    <Link to={`/players/${p.id}`}><ChevronRight className="w-4 h-4 text-[#888]" /></Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicPlayersPage;
