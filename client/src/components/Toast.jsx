export default function Toast({ message, show, onClose, variant = 'success' }) {
  if (!show) return null;
  const tone =
    variant === 'error'
      ? 'bg-red-800 text-white'
      : 'bg-primary text-brand-light';
  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg px-6 py-3 text-sm font-medium shadow-lg ${tone}`}
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
