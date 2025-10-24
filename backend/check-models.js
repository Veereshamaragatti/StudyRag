require("dotenv").config({ path: "../.env" });

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function checkModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("❌ GEMINI_API_KEY not found.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models`;

    console.log("🔍 Checking available Gemini models...\n");

    const response = await fetch(`${url}?key=${apiKey}`);

    if (response.status === 401) {
      console.error("❌ 401 Unauthorized: Invalid or expired key.");
      return;
    }
    if (response.status === 404) {
      console.error("❌ 404 Not Found: Endpoint mismatch — use '?key=' style for AI Studio keys.");
      return;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const data = await response.json();
    const models = data.models || [];

    console.log("✅ Available Gemini Models:\n");
    models.forEach((m) => {
      console.log(`🧠 ${m.name}`);
      if (m.description) console.log(`   📄 ${m.description}`);
      console.log("");
    });

    console.log(`📊 Total Models Found: ${models.length}`);
  } catch (err) {
    console.error("❌ Error fetching models:", err.message);
  }
}

checkModels();
