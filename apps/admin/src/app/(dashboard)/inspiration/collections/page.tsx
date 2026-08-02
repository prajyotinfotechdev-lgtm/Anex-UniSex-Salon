import { InspirationCollectionManager } from '@/modules/inspiration/components/inspiration-collection-manager';

export const metadata = {
  title: 'Collections | Inspiration Studio | Anex OS',
};

export default function InspirationCollectionsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <InspirationCollectionManager />
    </div>
  );
}
