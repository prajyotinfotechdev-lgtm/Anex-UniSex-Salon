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

// ── Premium Style Database ───────────────────────────────────────────────────
export const STYLES: StyleResult[] = [
  // ── FADES & TAPERS ────────────────────────────────────────────────────────
  {
    id: 'high-skin-fade',
    name: 'High Skin Fade',
    description: 'A sharp, zero-gap fade that starts high on the sides, blended flawlessly into textured length on top.',
    whyItWorks: 'The tight sides create a slimming effect, while the high fade line draws attention upward, elongating the face profile perfectly.',
    imageUrl: 'https://images.unsplash.com/photo-1622281537877-fd9017290a18?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Square', 'Straight', 'Wavy', 'Short'],
    serviceKeyword: 'Fade',
  },
  {
    id: 'low-taper-fade',
    name: 'Low Taper Fade',
    description: 'A classic, gentleman’s taper that drops low around the ears and neckline, leaving natural weight on the sides.',
    whyItWorks: 'Maintaining some weight on the sides helps balance prominent cheekbones, while the clean neckline ensures a polished finish.',
    imageUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=600&auto=format&fit=crop&q=80',
    tags: ['Diamond', 'Heart', 'Oval', 'Straight', 'Wavy', 'Short', 'Medium'],
    serviceKeyword: 'Fade',
  },
  {
    id: 'drop-fade',
    name: 'Drop Fade',
    description: 'A striking fade that smoothly drops behind the ear, creating a beautiful arc and preserving fullness at the crown.',
    whyItWorks: 'The swooping arc of the drop fade softens angular jawlines while providing a clean, modern aesthetic.',
    imageUrl: 'https://images.unsplash.com/photo-1605497787747-7d4f7e1b97f8?w=600&auto=format&fit=crop&q=80',
    tags: ['Square', 'Round', 'Wavy', 'Curly', 'Short', 'Medium'],
    serviceKeyword: 'Fade',
  },
  {
    id: 'burst-fade',
    name: 'Burst Fade',
    description: 'A circular fade focused entirely around the ear, leaving a trailing neckline reminiscent of a subtle mullet or faux hawk.',
    whyItWorks: 'This bold style adds width to the back of the head, balancing out narrower faces while offering maximum texture.',
    imageUrl: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Heart', 'Curly', 'Wavy', 'Medium'],
    serviceKeyword: 'Fade',
  },

  // ── CLASSICS & GENTLEMEN ──────────────────────────────────────────────────
  {
    id: 'classic-side-part',
    name: 'Classic Side Part',
    description: 'A timeless, polished contour with a razor-sharp side parting and scissored-over-comb tapered sides.',
    whyItWorks: 'The defined side part highlights symmetrical features and provides an effortlessly sharp, boardroom-ready look.',
    imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Square', 'Straight', 'Medium'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'slicked-back',
    name: 'Slicked Back Undercut',
    description: 'Long top hair combed straight back using a high-hold pomade, contrasted sharply with disconnected, buzzed sides.',
    whyItWorks: 'Slicking back reduces width perception at the forehead, perfectly balancing a strong, square jawline.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    tags: ['Square', 'Diamond', 'Straight', 'Wavy', 'Long', 'Medium'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'crew-cut',
    name: 'Textured Crew Cut',
    description: 'A premium take on a military classic—short, textured length on top fading seamlessly into the sides.',
    whyItWorks: 'The minimal top volume and gentle side taper soften sharp angles without adding unnecessary height to your face.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    tags: ['Square', 'Heart', 'Straight', 'Short'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'ivy-league',
    name: 'Ivy League',
    description: 'Slightly longer than a crew cut, allowing the front to be elegantly swept to the side for a distinguished profile.',
    whyItWorks: 'The subtle side-sweep adds a touch of width to the upper face, balancing out diamond or heart proportions elegantly.',
    imageUrl: 'https://images.unsplash.com/photo-1533167649158-6d508895b680?w=600&auto=format&fit=crop&q=80',
    tags: ['Diamond', 'Heart', 'Straight', 'Wavy', 'Medium', 'Short'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'pompadour',
    name: 'Modern Pompadour',
    description: 'Voluminous, swept-up fringe with maximum height at the front, gradually tapering toward the crown.',
    whyItWorks: 'The dramatic front volume powerfully elongates the face, making it the ultimate style for round or oval structures.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Oval', 'Straight', 'Wavy', 'Medium', 'Long'],
    serviceKeyword: 'Styling',
  },

  // ── MODERN & TEXTURED ─────────────────────────────────────────────────────
  {
    id: 'french-crop',
    name: 'Textured French Crop',
    description: 'A blunt, straight-cut fringe combined with heavily texturised top layers and a tight skin fade.',
    whyItWorks: 'The blunt fringe shortens the appearance of a longer face, while the textured top adds a rugged, contemporary edge.',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Diamond', 'Straight', 'Short'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'modern-quiff',
    name: 'Messy Quiff',
    description: 'A relaxed, heavily textured front brushed upward and slightly forward, offering a matte, lived-in aesthetic.',
    whyItWorks: 'The effortless height counters roundness, while the messy texture softens the overall facial geometry naturally.',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Square', 'Wavy', 'Straight', 'Medium'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'faux-hawk',
    name: 'Textured Faux Hawk',
    description: 'Sides clipped close with a raised, textured strip of hair running centrally down the head, styled with matte clay.',
    whyItWorks: 'The central ridge creates striking vertical angles, elongating the face and adding definition to the jawline.',
    imageUrl: 'https://images.unsplash.com/photo-1582230231904-7a137aa83b70?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Oval', 'Straight', 'Wavy', 'Short'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'disconnected-undercut',
    name: 'Disconnected Undercut',
    description: 'A stark, striking contrast where the buzzed sides abruptly meet the long top without any fading or blending.',
    whyItWorks: 'The stark disconnect visually reduces jaw width instantly, allowing your defined cheekbones to take center stage.',
    imageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&auto=format&fit=crop&q=80',
    tags: ['Square', 'Heart', 'Straight', 'Wavy', 'Medium', 'Long'],
    serviceKeyword: 'Haircut',
  },

  // ── LONGER & FLOWING ──────────────────────────────────────────────────────
  {
    id: 'bro-flow',
    name: 'The Bro Flow',
    description: 'Mid-length locks effortlessly swept back, allowing natural waves to frame the face with a relaxed, premium vibe.',
    whyItWorks: 'The natural sweeping motion softens angular jawlines and adds beautiful, balanced width to diamond face shapes.',
    imageUrl: 'https://images.unsplash.com/photo-1562159278-1253a58da141?w=600&auto=format&fit=crop&q=80',
    tags: ['Diamond', 'Square', 'Wavy', 'Medium', 'Long'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'modern-shag',
    name: 'Modern Layered Shag',
    description: 'A highly layered, shoulder-skimming cut that embraces natural texture for an artistic, rock-and-roll aesthetic.',
    whyItWorks: 'Strategic layering adds volume exactly where needed, harmonizing perfectly with oval or heart-shaped profiles.',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Heart', 'Curly', 'Wavy', 'Long', 'Medium'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'curtain-bangs',
    name: 'Curtain Fringe',
    description: 'A stylish 90s revival featuring a center part where the front layers drape naturally down the sides of the face.',
    whyItWorks: 'The center part effectively narrows a wider forehead, creating a harmonious and incredibly elegant framing effect.',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
    tags: ['Heart', 'Diamond', 'Straight', 'Wavy', 'Medium', 'Long'],
    serviceKeyword: 'Styling',
  },
  {
    id: 'surfer-hair',
    name: 'Surfer Waves',
    description: 'Long, sun-kissed, sea-salt textured hair that cascades naturally past the shoulders with minimal styling effort.',
    whyItWorks: 'The sheer length draws the eye downward, beautifully elongating round or square face shapes.',
    imageUrl: 'https://images.unsplash.com/photo-1549411082-f6735e05465e?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Square', 'Wavy', 'Long'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'man-bun',
    name: 'Top Knot / Man Bun',
    description: 'Long hair gathered and tied neatly at the crown or back of the head, often paired with an undercut or fade.',
    whyItWorks: 'Pulling the hair back highlights strong facial features, while the knot adds flattering height for rounder faces.',
    imageUrl: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Round', 'Straight', 'Wavy', 'Long'],
    serviceKeyword: 'Styling',
  },

  // ── CURLS & TEXTURE ───────────────────────────────────────────────────────
  {
    id: 'curly-fade',
    name: 'Curly Top Fade',
    description: 'A crisp skin fade on the sides that sharply contrasts with voluminous, naturally defined curls on the crown.',
    whyItWorks: 'The tight sides keep your profile slim, while the natural curl volume elongates your face structure effortlessly.',
    imageUrl: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Square', 'Curly', 'Short', 'Medium'],
    serviceKeyword: 'Fade',
  },
  {
    id: 'sponge-twists',
    name: 'Sponge Twists',
    description: 'Highly textured, defined twists created using a curl sponge, offering a neat yet expressive finish on top.',
    whyItWorks: 'The twists add beautiful symmetrical volume that balances out heart or diamond face shapes perfectly.',
    imageUrl: 'https://images.unsplash.com/photo-1616474136611-667799ff246e?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Heart', 'Curly', 'Short', 'Medium'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'short-afro',
    name: 'Tapered Short Afro',
    description: 'A meticulously shaped, even-length natural afro with a subtle temple and nape taper for a clean, modern silhouette.',
    whyItWorks: 'The precise geometric shaping complements the strong lines of square and oval face shapes beautifully.',
    imageUrl: 'https://images.unsplash.com/photo-1520101968532-6a8439df67a6?w=600&auto=format&fit=crop&q=80',
    tags: ['Square', 'Oval', 'Curly', 'Short', 'Medium'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'voluminous-curls',
    name: 'Voluminous Natural Curls',
    description: 'Natural curls allowed to grow out into their full volume, shaped expertly to avoid boxiness.',
    whyItWorks: 'The explosive volume at the sides and top creates a halo effect that brilliantly softens sharp diamond cheekbones.',
    imageUrl: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=600&auto=format&fit=crop&q=80',
    tags: ['Diamond', 'Heart', 'Curly', 'Long', 'Medium'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'waves-360',
    name: '360 Waves',
    description: 'A highly technical, brushed pattern that creates continuous rippling waves across a closely buzzed head.',
    whyItWorks: 'The ultra-close cut highlights your natural bone structure, making it ideal for well-proportioned oval and square faces.',
    imageUrl: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=600&auto=format&fit=crop&q=80',
    tags: ['Oval', 'Square', 'Curly', 'Short'],
    serviceKeyword: 'Haircut',
  },

  // ── BOLD & EDGY ───────────────────────────────────────────────────────────
  {
    id: 'modern-mullet',
    name: 'The Modern Mullet',
    description: 'Business in the front, party in the back—featuring textured layers, tapered sides, and a flowing neckline.',
    whyItWorks: 'The narrow sides slim the face while the back length adds unique character, perfect for breaking up round features.',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Diamond', 'Straight', 'Wavy', 'Medium', 'Long'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'buzz-cut-lineup',
    name: 'Buzz Cut with Line-Up',
    description: 'A uniform, ultra-short clipper cut paired with a razor-sharp, geometric line-up at the forehead and temples.',
    whyItWorks: 'The extreme minimalism showcases strong jawlines and cheekbones, making it a powerhouse look for square faces.',
    imageUrl: 'https://images.unsplash.com/photo-1555069278-1a5c68ff3780?w=600&auto=format&fit=crop&q=80',
    tags: ['Square', 'Oval', 'Straight', 'Wavy', 'Curly', 'Short'],
    serviceKeyword: 'Haircut',
  },
  {
    id: 'french-crop-fringe',
    name: 'Angular Fringe Crop',
    description: 'A bold, asymmetrical fringe swept sharply across the forehead, contrasting with a high, tight fade.',
    whyItWorks: 'The sharp diagonal lines of the fringe break up the symmetry of round faces, providing an edgy, slimming contour.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    tags: ['Round', 'Heart', 'Straight', 'Short'],
    serviceKeyword: 'Haircut',
  }
];

// ── Smart Recommendation Engine ─────────────────────────────────────────────
export function getRecommendations(answers: QuizAnswers): StyleResult[] {
  const { faceShape, hairTexture, hairLength } = answers;
  if (!faceShape || !hairTexture) return [];

  const faceLabel = faceShape.charAt(0).toUpperCase() + faceShape.slice(1);
  const textureLabel = hairTexture.charAt(0).toUpperCase() + hairTexture.slice(1);
  const lengthLabel = hairLength ? hairLength.charAt(0).toUpperCase() + hairLength.slice(1) : null;

  // 1. Score every style based on match quality
  const scoredStyles = STYLES.map(style => {
    let score = 0;
    
    // Face shape match is critical (primary filter)
    if (style.tags.includes(faceLabel)) {
      score += 3;
    }
    
    // Texture match (secondary filter)
    if (style.tags.includes(textureLabel)) {
      score += 2;
    } else if (!['Straight', 'Wavy', 'Curly'].some(t => style.tags.includes(t))) {
      // If the style doesn't explicitly mandate a texture, it's versatile
      score += 1;
    }
    
    // Length match (tertiary filter)
    if (lengthLabel) {
      if (style.tags.includes(lengthLabel)) {
        score += 2;
      } else if (!['Short', 'Medium', 'Long'].some(l => style.tags.includes(l))) {
        // Versatile length
        score += 1;
      }
    }

    return { style, score };
  });

  // 2. Filter out anything that doesn't at least match the face shape and have a decent score
  const viable = scoredStyles.filter(s => s.score >= 3);

  // 3. Sort by score descending
  viable.sort((a, b) => b.score - a.score);

  // 4. Return the top 4 highly curated matches
  return viable.slice(0, 4).map(s => s.style);
}
