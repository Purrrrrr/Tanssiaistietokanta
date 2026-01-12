export function LoadingSpinner({ loadingMessage }: { loadingMessage?: string }) {
  return <div className="flex flex-col items-center py-4">
    <img alt="" className="h-15 sepia-50" src="/loading.gif" />
    <div className="mt-2">
      {loadingMessage}
    </div>
  </div>
}
