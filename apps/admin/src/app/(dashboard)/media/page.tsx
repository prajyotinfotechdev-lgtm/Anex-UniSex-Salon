import { MediaStudio } from '@/modules/media/components/media-studio';

export default function MediaPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Media Studio</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage your centralized visual assets</p>
      </div>
      <MediaStudio />
    </div>
  );
}
