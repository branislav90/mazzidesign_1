// Renders text with an `em` substring as italic sand serif (hrast: em{font-style:italic;color:var(--sand)}).
export default function EmText({ text, em }: { text: string; em?: string }) {
  if (!em) return <>{text}</>;
  const idx = text.indexOf(em);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <em className="italic text-sand">{em}</em>
      {text.slice(idx + em.length)}
    </>
  );
}
