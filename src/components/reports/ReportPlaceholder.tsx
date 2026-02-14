import { Construction, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

interface ReportPlaceholderProps {
  title: string;
  description?: string;
  suggestedReport?: {
    id: string;
    title: string;
  };
  onNavigateToReport?: (reportId: string) => void;
}

export function ReportPlaceholder({
  title,
  description = 'This report is planned for a future release.',
  suggestedReport,
  onNavigateToReport,
}: ReportPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center px-4">
      <div className="p-4 bg-[var(--color-gold)]/10 rounded-full mb-4">
        <Construction size={48} className="text-[var(--color-gold)]" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>

      <p className="text-[var(--theme-text-muted)] max-w-md mb-6">
        {description}
      </p>

      {suggestedReport && onNavigateToReport && (
        <Button
          variant="outline"
          onClick={() => onNavigateToReport(suggestedReport.id)}
          className="gap-2"
        >
          View {suggestedReport.title} instead
          <ArrowRight size={16} />
        </Button>
      )}
    </div>
  );
}

export default ReportPlaceholder;
