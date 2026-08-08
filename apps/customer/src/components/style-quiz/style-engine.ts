// Style Quiz Rule Engine
// Maps face shape + hair texture combinations to recommended hairstyles

export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'diamond';
export type HairTexture = 'straight' | 'wavy' | 'curly';
export type HairLength = 'short' | 'medium' | 'long';

export interface StyleResult {
  id: string;
  name: string;
  description: string;
  whyItWorks: string;
  imageUrl: string;
  tags: string[];
  serviceKeyword: string;
}

export interface QuizAnswers {
  faceShape: FaceShape | null;
  hairTexture: HairTexture | null;
  hairLength: HairLength | null;
}

// ── Style Database ──────────────────────────────────────────────────────────
const STYLES: StyleResult[] = [
  // ── OVAL FACE ────────────────────────────────────────────────────────────
  {
    id: 'textured-crop',
    name: 'Textured Crop',
    description: 'Short on sides, textured and slightly longer on top with a natural finish.',
    whyItWorks: 'Oval faces can carry almost any style. The textured crop highlights your balanced proportions.',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Straight', 'Short'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'classic-side-part',
    name: 'Classic Side Part',
    description: 'A timeless, polished look with a clean side parting and tapered sides.',
    whyItWorks: 'The side part accentuates your oval symmetry for an effortlessly sharp, professional look.',
    imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Straight', 'Medium'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'wavy-pompadour',
    name: 'Wavy Pompadour',
    description: 'Volume brushed back with natural wave movement for a bold, confident look.',
    whyItWorks: 'Your oval shape perfectly supports height and volume on top without looking unbalanced.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Wavy', 'Medium', 'Long'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'curly-shag',
    name: 'Curly Shag',
    description: 'Layered cut that embraces natural curls with a relaxed, artistic vibe.',
    whyItWorks: 'Layers add definition to your curls while keeping the oval balance intact.',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Curly', 'Medium', 'Long'],
    serviceKeyword: 'Haircut',
  },

  // ── ROUND FACE ───────────────────────────────────────────────────────────
  {
    id: 'high-fade',
    name: 'High Skin Fade',
    description: 'Skin-tight fade on the sides with length on top to add vertical height.',
    whyItWorks: 'The high fade creates the illusion of a longer, slimmer face by drawing the eye upward.',
    imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Straight', 'Short'],
    serviceKeyword: 'Fade',
  },
  {
    id: 'faux-hawk',
    name: 'Faux Hawk',
    description: 'Sides clipped close with a raised strip of hair running down the centre.',
    whyItWorks: 'The central height elongates a round face and adds definition to the jawline.',
    imageUrl: 'https://images.unsplash.com/photo-1605497787747-7d4f7e1b97f8?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Straight', 'Wavy'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'angular-quiff',
    name: 'Angular Quiff',
    description: 'Voluminous top swept forward and slightly off-center for an angular look.',
    whyItWorks: 'The off-center styling creates angles that counterbalance a round face shape naturally.',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Wavy'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'curly-high-top',
    name: 'Curly High Top',
    description: 'Tight fade with natural curls left full on top for a bold, statement look.',
    whyItWorks: 'The height from your natural curls elongates the face and makes round features look sharp.',
    imageUrl: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Curly'],
    serviceKeyword: 'Haircut',
  },

  // ── SQUARE FACE ──────────────────────────────────────────────────────────
  {
    id: 'crew-cut',
    name: 'Crew Cut',
    description: 'Classic short cut, slightly longer on top with a gentle taper on the sides.',
    whyItWorks: 'The gentle taper softens a square jaw, while the clean top complements your strong bone structure.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    tags: ['Square', 'Straight', 'Short'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'modern-undercut',
    name: 'Modern Undercut',
    description: 'Shaved or closely cropped sides with medium length on top, worn sleek or textured.',
    whyItWorks: 'Disconnected sides visually reduce jaw width, letting your defined cheekbones stand out.',
    imageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&auto=format&fit=crop&q=80',
    tags: ['Square', 'Straight', 'Wavy', 'Medium'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'slick-back',
    name: 'Slicked Back',
    description: 'Longer hair combed straight back using a strong hold pomade for a commanding presence.',
    whyItWorks: 'Slicking back reduces width perception at the forehead, balancing a strong square jawline.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    tags: ['Square', 'Wavy', 'Long'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'curly-undercut',
    name: 'Curly Undercut',
    description: 'Tight sides with natural curls left flowing on top for a contrasting, eye-catching style.',
    whyItWorks: 'The curls add softness that beautifully offsets the angular, strong lines of a square face.',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80',
    tags: ['Square', 'Curly'],
    serviceKeyword: 'Haircut',
  },

  // ── HEART FACE ───────────────────────────────────────────────────────────
  {
    id: 'textured-fringe',
    name: 'Textured Fringe',
    description: 'Forehead-skimming fringe with textured layers and tapered sides.',
    whyItWorks: 'A fringe reduces the appearance of a wide forehead and draws attention to the eyes and cheekbones.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    tags: ['Heart', 'Straight'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'mid-part-curtains',
    name: 'Curtain Fringe',
    description: 'Center-parted hair that falls naturally to each side, like parted curtains.',
    whyItWorks: 'The center part visually narrows a wider forehead and creates a harmonious, elegant heart-shaped frame.',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
    tags: ['Heart', 'Wavy', 'Long'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'chin-length-layers',
    name: 'Layered Mid-Length',
    description: 'Layers that add width and volume at the chin level to balance the face.',
    whyItWorks: 'Adding volume at the chin balances a wider forehead and makes the narrow chin appear fuller.',
    imageUrl: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=600&auto=format&fit=crop&q=80',
    tags: ['Heart', 'Wavy', 'Curly', 'Medium'],
    serviceKeyword: 'Haircut',
  },

  // ── DIAMOND FACE ─────────────────────────────────────────────────────────
  {
    id: 'classic-side-sweep',
    name: 'Classic Side Sweep',
    description: 'Medium length hair swept to one side, softly covering part of the forehead.',
    whyItWorks: 'A side sweep adds width at the forehead and softens angular cheekbones, balancing a diamond face.',
    imageUrl: 'https://images.unsplash.com/photo-1533167649158-6d508895b680?w=600&auto=format&fit=crop&q=80',
    tags: ['Diamond', 'Straight'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'short-back-sides',
    name: 'Short Back & Sides',
    description: 'Neatly tapered sides with a defined, slightly longer top for a sharp, structured finish.',
    whyItWorks: 'Minimising width on the sides reduces the appearance of prominent cheekbones, refining your look.',
    imageUrl: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=600&auto=format&fit=crop&q=80',
    tags: ['Diamond', 'Straight', 'Short'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'wavy-side-part',
    name: 'Wavy Side Part',
    description: 'A defined side part with natural wave movement for a relaxed yet polished look.',
    whyItWorks: 'Waves and a side part add soft width to the forehead, creating beautiful balance with high cheekbones.',
    imageUrl: 'https://images.unsplash.com/photo-1570158268183-d296b2892211?w=600&auto=format&fit=crop&q=80',
    tags: ['Diamond', 'Wavy', 'Medium'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'curly-voluminous',
    name: 'Voluminous Curls',
    description: 'Natural curls left to their full volume, creating a lush and expressive silhouette.',
    whyItWorks: 'Volume at the top and bottom of natural curls adds width that balances striking diamond cheekbones.',
    imageUrl: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=600&auto=format&fit=crop&q=80',
    tags: ['Diamond', 'Curly'],
    serviceKeyword: 'Haircut',
  },
];

// ── Recommendation Engine ───────────────────────────────────────────────────
export function getRecommendations(answers: QuizAnswers): StyleResult[] {
  const { faceShape, hairTexture, hairLength } = answers;
  if (!faceShape || !hairTexture) return [];

  const faceLabel = faceShape.charAt(0).toUpperCase() + faceShape.slice(1);
  const textureLabel = hairTexture.charAt(0).toUpperCase() + hairTexture.slice(1);

  let results = STYLES.filter(s =>
    s.tags.includes(faceLabel) &&
    (s.tags.includes(textureLabel) || !['Straight', 'Wavy', 'Curly'].some(t => s.tags.includes(t)))
  );

  // Secondary filter: hair length if provided
  if (hairLength && results.length > 2) {
    const lengthLabel = hairLength.charAt(0).toUpperCase() + hairLength.slice(1);
    const lengthFiltered = results.filter(s =>
      !['Short', 'Medium', 'Long'].some(l => s.tags.includes(l)) ||
      s.tags.includes(lengthLabel)
    );
    if (lengthFiltered.length >= 2) results = lengthFiltered;
  }

  // Return max 3 results
  return results.slice(0, 3);
}
