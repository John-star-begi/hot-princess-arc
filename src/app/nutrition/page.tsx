import { nutritionArticles } from "@/content/nutrition";

export default function NutritionPage() {
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", color: "#c026d3" }}>Nutrition</h1>

      {nutritionArticles.map((article, i) => (
        <div key={i} style={{ background: "#fff0f6", padding: "20px", borderRadius: "16px", marginTop: "20px" }}>
          <h2 style={{ fontSize: "20px", color: "#86198f" }}>{article.title}</h2>
          <p style={{ color: "#4b5563" }}>{article.summary}</p>
          <div 
            style={{ marginTop: "10px", color: "#374151", lineHeight: "1.6" }}
            dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, "<br/>") }}
          />
        </div>
      ))}
    </div>
  );
}
