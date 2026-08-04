import { InspirationDetail } from '@/modules/inspiration/components/inspiration-detail';

export const metadata = {
  title: 'Inspiration | Anex',
};

export default async function InspirationDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <InspirationDetail idOrSlug={params.id} />;
}
