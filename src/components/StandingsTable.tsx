import { Trophy } from "lucide-react";

interface StandingRow {
  rank: number;
  teamName: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalDiff: number;
}

interface StandingsTableProps {
  data: StandingRow[];
  loading?: boolean;
}

const StandingsTable = ({ data, loading }: StandingsTableProps) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <h3 className="font-display text-base font-semibold uppercase">Standings</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-3 px-4 font-medium text-xs w-8">#</th>
              <th className="text-left py-3 px-2 font-medium text-xs">Team</th>
              <th className="text-center py-3 px-2 font-medium text-xs">W</th>
              <th className="text-center py-3 px-2 font-medium text-xs">D</th>
              <th className="text-center py-3 px-2 font-medium text-xs">L</th>
              <th className="text-center py-3 px-2 font-medium text-xs">GD</th>
              <th className="text-center py-3 px-2 font-medium text-xs">Pts</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No standings data</td></tr>
            ) : (
              data.map((row) => (
                <tr key={`${row.rank}-${row.teamName}`} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-muted-foreground">{row.rank}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-muted-foreground">
                          {row.teamName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-sm">{row.teamName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-medium">{row.wins}</td>
                  <td className="py-3 px-2 text-center font-medium">{row.draws}</td>
                  <td className="py-3 px-2 text-center font-medium">{row.losses}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`font-semibold ${row.goalDiff > 0 ? 'text-success' : row.goalDiff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="font-bold text-primary">{row.points}</span>
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

export default StandingsTable;
