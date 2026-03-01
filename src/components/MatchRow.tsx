import { ArrowRight, Clock } from "lucide-react";

interface MatchRowProps {
  team1Name: string;
  team2Name: string;
  team1Score?: number;
  team2Score?: number;
  date: string;
  time?: string;
  onClick?: () => void;
}

const MatchRow = ({ team1Name, team2Name, team1Score, team2Score, date, time, onClick }: MatchRowProps) => {
  const hasScore = team1Score !== undefined && team2Score !== undefined;
  const formattedDate = new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div
      onClick={onClick}
      className="glass-card px-4 py-3 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
    >
      {/* Team 1 */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground">
            {team1Name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium">{team1Name}</span>
      </div>

      {/* Score */}
      <div className="bg-foreground text-background text-xs font-bold px-2.5 py-1 rounded-md min-w-[40px] text-center">
        {hasScore ? `${team1Score} - ${team2Score}` : "vs"}
      </div>

      {/* Team 2 */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <span className="text-sm font-medium">{team2Name}</span>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground">
            {team2Name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Time & Date */}
      <div className="flex items-center gap-3 text-muted-foreground text-xs">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{time || "TBD"}</span>
        </div>
        <span>{formattedDate}</span>
      </div>

      {/* View Details */}
      <button className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
        <span className="hidden sm:inline">View Details</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default MatchRow;
