import { InspirationPostEditor } from '@/modules/inspiration/components/inspiration-post-editor';

export const metadata = {
  title: 'Edit Post | Inspiration Studio | Anex OS',
};

export default function EditInspirationPostPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <InspirationPostEditor postId={params.id} />
    </div>
  );
}
