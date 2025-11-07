
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

export default function NutritionPage() {
  const dir = path.join(process.cwd(), "src/content/nutrition");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  const articles = files.map((filename) => {
    const fileContent = fs.readFileSync(path.join(dir, filename), "utf8");
    const { data } = matter(fileContent);
    return {
      slug: filename.replace(".md", ""),
      ...data,
    };
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-rose-700 mb-8">Nutrition</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/nutrition/${a.slug}`}
            className="group block bg-rose-50 rounded-2xl shadow overflow-hidden transition hover:shadow-lg"
          >
            {a.thumbnail && (
              <img
                src={a.thumbnail}
                alt={a.title}
                className="h-48 w-full object-cover"
              />
            )}
            <div className="p-5">
              <h2 className="text-xl font-semibold text-rose-800 mb-2 group-hover:underline">
                {a.title}
              </h2>
              <p className="text-gray-600 text-sm group-hover:text-gray-800 transition line-clamp-2">
                {a.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
