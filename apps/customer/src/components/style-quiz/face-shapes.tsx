"use client";
// SVG face shape illustrations — clean geometric representations
import { FaceShape } from './style-engine';

interface Props {
  shape: FaceShape;
  size?: number;
  active?: boolean;
}

export function FaceShapeIllustration({ shape, size = 72, active = false }: Props) {
  const stroke = active ? '#c9a96e' : '#71717a';
  const fill = active ? 'rgba(201,169,110,0.08)' : 'none';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${shape} face shape`}
    >
      {shape === 'oval' && (
        <>
          {/* Oval: narrow-shouldered ellipse */}
          <ellipse cx="36" cy="36" rx="17" ry="26" stroke={stroke} strokeWidth="2" fill={fill} />
          {/* Ear hints */}
          <path d="M19 31 Q14 36 19 41" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M53 31 Q58 36 53 41" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          {/* Crown hair hint */}
          <path d="M28 11 Q36 6 44 11" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {shape === 'round' && (
        <>
          {/* Round: close to a circle, wider cheeks */}
          <ellipse cx="36" cy="38" rx="20" ry="22" stroke={stroke} strokeWidth="2" fill={fill} />
          <path d="M16 34 Q11 39 16 44" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M56 34 Q61 39 56 44" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M25 17 Q36 12 47 17" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {shape === 'square' && (
        <>
          {/* Square: angular jaw, roughly equal width and height */}
          <path
            d="M20 16 Q36 12 52 16 L54 50 Q36 62 18 50 Z"
            stroke={stroke} strokeWidth="2" fill={fill}
            strokeLinejoin="round"
          />
          <path d="M20 30 Q15 36 20 42" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M52 30 Q57 36 52 42" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {shape === 'heart' && (
        <>
          {/* Heart: wide forehead, narrow chin */}
          <path
            d="M18 18 Q36 10 54 18 L52 38 Q44 54 36 60 Q28 54 20 38 Z"
            stroke={stroke} strokeWidth="2" fill={fill}
            strokeLinejoin="round"
          />
          <path d="M18 26 Q13 32 18 38" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M54 26 Q59 32 54 38" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {shape === 'diamond' && (
        <>
          {/* Diamond: narrow forehead, wide cheekbones, narrow chin */}
          <path
            d="M36 8 L56 32 L36 60 L16 32 Z"
            stroke={stroke} strokeWidth="2" fill={fill}
            strokeLinejoin="round"
          />
          <path d="M16 28 Q12 33 16 38" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M56 28 Q60 33 56 38" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
