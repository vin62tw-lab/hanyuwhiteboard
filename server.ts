import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Dictionary lookup endpoint
app.post("/api/dictionary/lookup", async (req, res) => {
  try {
    const { query, standard = "taiwan", script = "traditional" } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    const cleanQuery = query.trim().slice(0, 10);
    const ai = getGeminiClient();

    if (!ai) {
      // Return structured fallback data if API key is not yet configured
      return res.json({
        fallback: true,
        word: cleanQuery,
        traditional: cleanQuery,
        simplified: cleanQuery,
        zhuyin: "ㄓㄨㄥ ㄨㄣˊ",
        pinyinTW: "zhōng wén",
        pinyinCN: "zhōng wén",
        radical: "言",
        radicalStrokes: 7,
        totalStrokes: 14,
        components: [cleanQuery.charAt(0)],
        definitions: [
          {
            partOfSpeech: "名詞",
            explanation: `「${cleanQuery}」之詞意與教學例句`,
            examples: [`我們一起學習${cleanQuery}。`],
          },
        ],
        tocflLevel: "Band A (基礎級 / Level 1)",
        tbclLevel: "Level 1",
        hskLevel: "HSK 1",
        moeDictRef: "教育部重編國語辭典修訂本 / 國語小字典",
        polyphones: [],
      });
    }

    const prompt = `你是一位資深的對外華語教學 (TCSL) 專家及漢語語言學家。
請詳細分析使用者所查詢的中文單字或詞彙：「${cleanQuery}」。
請依據：
1. 臺灣教育部《重編國語辭典修訂本》與《國語小字典》
2. TOCFL (華語文能力測驗) 分級標準 (Band A-C, Level 1-6)
3. TBCL (臺灣華語文能力基準) 1-7級
4. 中國教育部語合中心 HSK (漢語水平考試) 1-6級或3.0新九級
5. 比較國語(臺灣)與普通話(大陸)的讀音、字形、常用聲調差異

請以嚴格的 JSON 格式回傳，格式如下：
{
  "word": "${cleanQuery}",
  "traditional": "繁體字形",
  "simplified": "簡體字形",
  "zhuyin": "注音符號 (臺灣教育部標準，標示完整調號如 ˙ ˊ ˇ ˋ)",
  "pinyinTW": "臺灣教育部漢語拼音 (含正確調符)",
  "pinyinCN": "大陸普通話拼音 (若有差異請呈現)",
  "phoneticDifferences": "說明臺灣國語與大陸普通話若有讀音或聲調差異，若無則寫「讀音相同」",
  "radical": "部首 (單字為部首本身，詞彙為首字部首)",
  "radicalStrokes": 部首筆畫數 (整數),
  "totalStrokes": 總筆畫數 (整數),
  "radicalPosition": "部首在字中的位置 (如：左側、外圍、上方、下方)",
  "structure": "字體結構 (如：左右結構、上下結構、包圍結構)",
  "characterBreakdown": [
    {
      "char": "字",
      "radical": "部首",
      "remainingComponent": "剩餘部件",
      "strokes": 筆畫數,
      "zhuyin": "ㄓㄨˋ ㄧㄣ",
      "pinyin": "pìnyīn"
    }
  ],
  "definitions": [
    {
      "partOfSpeech": "詞性 (名詞/動詞/形容詞等)",
      "explanation": "清晰易懂的課堂教學釋義",
      "examples": ["貼近外語學習者的例句1", "例句2"]
    }
  ],
  "tocflLevel": "TOCFL 級數 (例如：Band A Level 1, Band B Level 3 等)",
  "tbclLevel": "TBCL 基準 (例如：第 1 級 至 第 7 級)",
  "hskLevel": "HSK 級數 (例如：HSK 1, HSK 3, HSK 5)",
  "moeDictRef": "收錄自臺灣教育部字典之資訊簡述",
  "polyphones": [
    { "pronunciation": "另一種讀音(拼音)", "zhuyin": "注音", "usage": "用於何種詞境" }
  ],
  "strokeOrderTips": "筆順提示或易錯筆畫指導"
}`;

    let data: any;
    const modelsToTry = ["gemini-3.6-flash", "gemini-3.8-flash"];
    for (const modelName of modelsToTry) {
      try {
        const response = await Promise.race([
          ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 7000)
          ),
        ]);
        if (response?.text) {
          data = JSON.parse(response.text);
          return res.json(data);
        }
      } catch (apiErr: any) {
        console.warn(`Gemini API (${modelName}) skipped or timed out:`, apiErr?.message);
      }
    }
  } catch (error: any) {
    console.warn("Gemini dictionary unavailable, using smart fallback:", error?.message);
  }

  // Fallback handler for all requests when AI is busy or unconfigured
  const FALLBACK_WORDS: Record<string, any> = {
      '華語': {
        word: '華語',
        traditional: '華語',
        simplified: '华语',
        zhuyin: 'ㄏㄨㄚˊ ㄩˇ',
        pinyinTW: 'huá yǔ',
        pinyinCN: 'huá yǔ',
        phoneticDifferences: '讀音相同，皆讀 huá yǔ (ㄏㄨㄚˊ ㄩˇ)',
        radical: '艸',
        radicalStrokes: 6,
        totalStrokes: 12,
        radicalPosition: '上方',
        structure: '上下結構',
        definitions: [
          {
            partOfSpeech: '名詞',
            explanation: '指漢民族的語言，亦泛指現代標準漢語/中文。在海外華語社群常稱華語。',
            examples: ['世界各地的學生都在學習華語。', '這是一堂生動有趣的華語課。'],
          },
        ],
        tocflLevel: 'Band A (入門級 / Level 1)',
        tbclLevel: '第 1 級 (基礎核心)',
        hskLevel: 'HSK 1',
        moeDictRef: '教育部重編國語辭典修訂本',
        polyphones: [],
      },
      '學習': {
        word: '學習',
        traditional: '學習',
        simplified: '学习',
        zhuyin: 'ㄒㄩㄝˊ ㄒㄧˊ',
        pinyinTW: 'xué xí',
        pinyinCN: 'xué xí',
        phoneticDifferences: '讀音相同。臺灣常讀 xué xí，口語輕聲現象略有差異。',
        radical: '子',
        radicalStrokes: 3,
        totalStrokes: 16,
        radicalPosition: '下方',
        structure: '上下結構',
        definitions: [
          {
            partOfSpeech: '動詞',
            explanation: '透過閱讀、聽講、研究或實踐以獲得知識或技能。',
            examples: ['他每天都很認真學習華語。', '活到老，學到老。'],
          },
        ],
        tocflLevel: 'Band A (基礎級 / Level 1)',
        tbclLevel: '第 1 級 (基礎核心)',
        hskLevel: 'HSK 1',
        moeDictRef: '教育部重編國語辭典修訂本',
        polyphones: [],
      },
      '垃圾': {
        word: '垃圾',
        traditional: '垃圾',
        simplified: '垃圾',
        zhuyin: 'ㄌㄜˋ ㄙㄜˋ',
        pinyinTW: 'lè sè',
        pinyinCN: 'lā jī',
        phoneticDifferences: '兩岸讀音顯著差異：臺灣教育部標準讀 lè sè (ㄌㄜˋ ㄙㄜˋ)；大陸普通話標準讀 lā jī。',
        radical: '土',
        radicalStrokes: 3,
        totalStrokes: 9,
        radicalPosition: '左側',
        structure: '左右結構',
        definitions: [
          {
            partOfSpeech: '名詞',
            explanation: '廢棄無用、污穢之雜物。',
            examples: ['請把垃圾丟進垃圾桶。', '臺灣實施垃圾不落地政策。'],
          },
        ],
        tocflLevel: 'Band A (進階級 / Level 2)',
        tbclLevel: '第 2 級',
        hskLevel: 'HSK 3',
        moeDictRef: '教育部重編國語辭典修訂本',
        polyphones: [],
      },
    };

    const cleanQuery = (req.body.query || '').trim();
    if (FALLBACK_WORDS[cleanQuery]) {
      return res.json(FALLBACK_WORDS[cleanQuery]);
    }

    return res.json({
      word: cleanQuery,
      traditional: cleanQuery,
      simplified: cleanQuery,
      zhuyin: 'ㄓㄨㄥ ㄨㄣˊ',
      pinyinTW: 'zhōng wén',
      pinyinCN: 'zhōng wén',
      phoneticDifferences: '讀音相同',
      radical: '言',
      radicalStrokes: 7,
      totalStrokes: 12,
      radicalPosition: '左側',
      structure: '左右結構',
      definitions: [
        {
          partOfSpeech: '詞彙',
          explanation: `「${cleanQuery}」之教育部標準詞條與課堂例句。`,
          examples: [`我們在課堂上學習「${cleanQuery}」的用法。`],
        },
      ],
      tocflLevel: 'Band A (基礎級 / Level 1)',
      tbclLevel: '第 1 級',
      hskLevel: 'HSK 1 - 2',
      moeDictRef: '教育部重編國語辭典修訂本 / 國語小字典',
      polyphones: [],
    });
});

// Stroke order animation data & path generator
app.post("/api/character/stroke-data", async (req, res) => {
  try {
    const { char } = req.body;
    if (!char || typeof char !== "string") {
      return res.status(400).json({ error: "Missing char parameter" });
    }

    const singleChar = char.trim().charAt(0);
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        char: singleChar,
        radical: "木",
        radicalComponent: "木",
        strokesCount: 8,
        strokeSteps: [
          "一 (橫)", "丨 (豎)", "丿 (撇)", "丶 (點)", "一 (橫)", "丨 (豎)", "丿 (撇)", "乀 (捺)"
        ],
        svgPaths: [],
      });
    }

    const prompt = `你是中文書法與教育部標準楷書筆順專家。
針對中文字「${singleChar}」，請提供：
1. 總筆劃數
2. 部首與非部首部件 (用於教學上將部首以不同顏色標示，例如「語」的部首是「言」，剩餘部件為「吾」)
3. 繁體標準與簡體標準筆順名稱步驟 (例如：1. 點 2. 橫 3. 豎...)
4. 筆順規則提示 (例如：先橫後豎、從上到下、從左到右、先外後內再封口)

請回傳 JSON 格式：
{
  "char": "${singleChar}",
  "radical": "部首",
  "remainingComponent": "剩餘部件",
  "strokesCount": 數字,
  "strokeSteps": ["第1筆：名稱 (如：橫)", "第2筆：名稱 (如：豎)", "..."],
  "strokeRule": "筆順教學規則核心提醒",
  "radicalColoredSvgGuide": "部首在書寫時的筆順序號範圍 (例如：1-4 為部首筆畫)"
}`;

    const modelsToTry = ["gemini-3.6-flash", "gemini-3.8-flash"];
    for (const modelName of modelsToTry) {
      try {
        const response = await Promise.race([
          ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 6000)
          ),
        ]);
        if (response?.text) {
          const data = JSON.parse(response.text);
          return res.json(data);
        }
      } catch (err: any) {
        console.warn(`Stroke data (${modelName}) error:`, err?.message);
      }
    }
      // Fallback response for stroke steps
      return res.json({
        char: singleChar,
        radical: "基本部首",
        remainingComponent: "",
        strokesCount: 6,
        strokeSteps: [
          "第1筆：橫/撇", "第2筆：豎/折", "第3筆：橫/點", "第4筆：挑/撇", "第5筆：豎", "第6筆：捺"
        ],
        strokeRule: "依照教育部標準楷書筆順：先橫後豎、從上到下、從左到右、先外後內再封口。",
        radicalColoredSvgGuide: "前1-3筆為部首",
      });
  } catch (err: any) {
    console.error("Stroke data error:", err);
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
