export function ToolbarTitle({ text }: { text: React.ReactNode }) {
  return (
    <div className="inline-block px-2 py-1 [font-variant:small-caps] text-sm font-bold text-gray-700">
      {text}
    </div>
  )
}
