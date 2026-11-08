import { useState } from 'react';
import type { CSSProperties } from 'react';
import { characterIdOf } from '../lib/characterImages';
import { useCharacterImage } from '../lib/useCharacterImages';
import { isBrokenSrc, markBrokenSrc, typeEmojiOf } from '../lib/characterArt';

interface Props {
  tag: { id: string; baseId?: string; types: string[]; name?: string };
  /** Size classes (e.g. 'text-5xl'). The image is sized in `em`, so it matches the emoji. */
  className?: string;
  style?: CSSProperties;
  /** Image box relative to the font size. */
  scale?: number;
  /** Override the character id (defaults to the species id of `tag`). */
  characterId?: string;
}

/**
 * The single place React renders a monster: the custom image when one is set
 * and loads, otherwise the type emoji (also when the image errors).
 */
export default function CharacterArt({ tag, className = '', style, scale = 1.2, characterId }: Props) {
  const id = characterId ?? characterIdOf(tag);
  const { src } = useCharacterImage(id);
  const [failed, setFailed] = useState<string | null>(null);
  const emoji = typeEmojiOf(tag);
  const usable = src && failed !== src && !isBrokenSrc(src) ? src : null;

  return (
    <span
      className={`inline-flex items-center justify-center leading-none ${className}`}
      style={style}
      data-character-id={id}
      data-art={usable ? 'image' : 'emoji'}
    >
      {usable ? (
        <img
          key={usable}
          src={usable}
          alt=""
          draggable={false}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="object-contain select-none"
          style={{ width: `${scale}em`, height: `${scale}em` }}
          onError={() => {
            markBrokenSrc(usable);
            setFailed(usable);
          }}
        />
      ) : (
        emoji
      )}
    </span>
  );
}
