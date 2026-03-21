export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-20 mb-30">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-6">Sorry, the page you’re looking for doesn’t exist.</p>
      <a
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Home
      </a>
    </div>
  );
}
