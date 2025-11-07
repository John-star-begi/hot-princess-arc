import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import ArticleLayout from "@/components/ArticleLayout";

export default function NutritionArticle({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), "src/content/nutrition", `${params.slug}.md`);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);
  const html = marked(content);

  return <ArticleLayout data={data} html={html} />;
}

