import { InspirationDetail } from '@/modules/inspiration/components/inspiration-detail';

export const metadata = {
  title: 'Inspiration | Anex',
};

export default function InspirationDetailPage({ params }: { params: { id: string } }) {
  return <InspirationDetail idOrSlug={params.id} />;
}
