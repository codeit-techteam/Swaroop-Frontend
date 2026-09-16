import { memo } from 'react';

import { Text } from 'react-native';

type HighlightedTextProps = {
  text: string;
  query: string;
  className?: string;
  numberOfLines?: number;
};

export const HighlightedText = memo(function HighlightedText({
  text,
  query,
  className,
  numberOfLines,
}: HighlightedTextProps) {
  const q = query.trim();
  const index = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;

  if (!q || index === -1) {
    return (
      <Text className={className} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  return (
    <Text className={className} numberOfLines={numberOfLines}>
      {text.slice(0, index)}
      <Text className="font-bold text-brand-heading">{text.slice(index, index + q.length)}</Text>
      {text.slice(index + q.length)}
    </Text>
  );
});
