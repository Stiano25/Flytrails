export default function Toast({ message, show, onClose }) {
  if (!show) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-brand-light shadow-lg"
    >
      {message}
      <button
        type="button"
        onClick={onClose}
        className="ml-3 text-accent underline"
      >
        Dismiss
      </button>
    </div>
  );
}
