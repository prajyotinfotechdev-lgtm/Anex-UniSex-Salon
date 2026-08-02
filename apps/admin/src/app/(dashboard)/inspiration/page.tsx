import { InspirationStudio } from '@/modules/inspiration/components/inspiration-studio';

export const metadata = {
  title: 'Inspiration Studio | Anex OS',
};

export default function InspirationPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <InspirationStudio />
    </div>
  );
}
