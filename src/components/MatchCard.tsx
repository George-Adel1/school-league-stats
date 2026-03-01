import { Clock } from "lucide-react";

interface MatchCardProps {
  team1Name: string;
  team2Name: string;
  team1Score?: number;
  team2Score?: number;
  date: string;
  time?: string;
  onClick?: () => void;
}

const MatchCard = ({ team1Name, team2Name, team1Score, team2Score, date, time, onClick }: MatchCardProps) => {
  const hasScore = team1Score !== undefined && team2Score !== undefined;
  const formattedDate = new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "numeric", year: "2-digit" });

  return (
    <div
      onClick={onClick}
      className="glass-card p-3 cursor-pointer hover:shadow-md transition-shadow min-w-[200px]"
    >
      {/* Score / Time badge */}
      <div className="flex items-center justify-center mb-2">
        <div className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {hasScore ? `${team1Score} - ${team2Score}` : time || "TBD"}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground">
              {team1Name.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-xs font-medium truncate">{team1Name}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium truncate text-right">{team2Name}</span>
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-muted-foreground">
              {team2Name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="text-center mt-2">
        <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
      </div>
    </div>
  );
};

export default MatchCard;
