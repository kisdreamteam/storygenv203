export type VocabularyItem = {
  word: string;
  definition_or_example: string;
  sort_order: number;
};

type VocabularyListProps = {
  items: VocabularyItem[];
};

export function VocabularyList({ items }: VocabularyListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500">No vocabulary items for this story.</p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 border border-gray-300 rounded-2xl drop-shadow-lg p-5">
      {items.map((item) => (
        <li
          key={item.sort_order}
          className="rounded-xl border border-gray-200 bg-white p-4"
        >
          <p className="font-medium text-gray-900">{item.word}</p>
          <p className="mt-1 text-sm text-gray-600">{item.definition_or_example}</p>
        </li>
      ))}
    </ul>
  );
}
