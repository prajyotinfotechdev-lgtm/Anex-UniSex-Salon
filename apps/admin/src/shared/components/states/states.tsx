import { PremiumLoader } from '../ui/premium-loader';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return <PremiumLoader text={message} />;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-center border rounded-md bg-muted/20">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
    </div>
  );
}

export function ErrorState({ title = 'Error', description, onRetry }: { title?: string; description: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full text-center border border-destructive/20 rounded-md bg-destructive/10">
      <h3 className="text-lg font-semibold text-destructive">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mb-4">{description}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-background border rounded-md text-sm font-medium hover:bg-muted"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
