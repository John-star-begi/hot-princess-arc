export default function ArticleLayout({ data, html }: { data: any; html: string }) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      {data.thumbnail && (
        <img
          src={data.thumbnail}
          alt={data.title}
          className="w-full h-64 object-cover rounded-2xl mb-6 shadow"
        />
      )}
      <h1 className="text-3xl font-bold text-pink-700 mb-2">{data.title}</h1>
      {data.date && <p className="text-gray-500 mb-6">{data.date}</p>}
      <article
        className="prose prose-pink max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
