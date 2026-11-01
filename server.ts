import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const SYSTEM_INSTRUCTION = `You are a panel of five Indian practitioners stress-testing a situation. Think in cascades and second-order effects. Be specific; do not invent facts about the situation; cite an Indian statute or section only if you are confident. Judge: jurisdiction, admissibility, evidence, equity, precedent, what a court would actually do and how fast. Advocate: strategy, limitation, remedies, leverage, weaknesses in the client's file. Businessperson: cash, deal value, relationships, reputation, leverage, exit options. Journalist: public interest, newsworthiness, framing, what documents would surface, defamation risk of reporting. Police: whether a cognisable offence exists, evidence preservation, procedure, jurisdiction, risk of misuse. Each role must reason from its own incentives.`;

const STRESS_TEST_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A punchy, dramatic title for the stress test'
    },
    summary: {
      type: Type.STRING,
      description: 'Exactly 2 sentences summarizing how the situation holds or cracks under stress'
    },
    score: {
      type: Type.INTEGER,
      description: 'Overall resilience score between 0 and 100'
    },
    verdict: {
      type: Type.STRING,
      enum: ['Resilient', 'Strained', 'Fragile', 'Breaks'],
      description: 'Overall verdict: Resilient (>=70), Strained (45-69), Fragile (25-44), or Breaks (<25)'
    },
    roles: {
      type: Type.ARRAY,
      description: 'Assessments from the five Indian practitioners in exact order: Judge, Advocate, Businessperson, Journalist, Police',
      items: {
        type: Type.OBJECT,
        properties: {
          role: {
            type: Type.STRING,
            enum: ['Judge', 'Advocate', 'Businessperson', 'Journalist', 'Police']
          },
          holds: {
            type: Type.INTEGER,
            description: 'Holds score between 0 and 100 representing how well this role\'s criteria hold up'
          },
          sees: {
            type: Type.STRING,
            description: 'What this practitioner immediately perceives or spots in the situation'
          },
          would_do: {
            type: Type.STRING,
            description: 'What action or strategy this practitioner would recommend or take'
          },
          turns_when: {
            type: Type.STRING,
            description: 'The specific tipping point or condition when this lens turns decisively against you'
          }
        },
        required: ['role', 'holds', 'sees', 'would_do', 'turns_when']
      }
    },
    clashes: {
      type: Type.ARRAY,
      description: '2 to 3 specific conflicts between named roles (e.g. Advocate vs Businessperson, Police vs Journalist)',
      items: {
        type: Type.STRING
      }
    },
    cascade: {
      type: Type.ARRAY,
      description: '5 escalating shocks as a chronological vertical timeline',
      items: {
        type: Type.OBJECT,
        properties: {
          when: {
            type: Type.STRING,
            description: 'Timeframe or trigger phase, e.g., "Hour 24", "Day 3", "Week 2", "Month 2", "Quarter 2"'
          },
          shock: {
            type: Type.STRING,
            description: 'The shock event that strikes'
          },
          impact: {
            type: Type.STRING,
            description: 'Direct and cascading damage caused by this shock'
          },
          severity: {
            type: Type.INTEGER,
            description: 'Severity level from 1 to 5'
          },
          hits: {
            type: Type.ARRAY,
            description: 'Roles most severely impacted by this shock',
            items: {
              type: Type.STRING
            }
          }
        },
        required: ['when', 'shock', 'impact', 'severity', 'hits']
      }
    },
    breaking_point: {
      type: Type.STRING,
      description: 'The exact systemic, legal, or commercial breaking point where the situation fails'
    },
    fixes: {
      type: Type.ARRAY,
      description: '4 to 5 actionable fixes with priority labels',
      items: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: 'The concrete action to take'
          },
          why: {
            type: Type.STRING,
            description: 'Why this action mitigates the risk or preserves leverage'
          },
          priority: {
            type: Type.STRING,
            enum: ['Now', 'Soon', 'Later'],
            description: 'Urgency tier'
          }
        },
        required: ['action', 'why', 'priority']
      }
    },
    blind_spots: {
      type: Type.ARRAY,
      description: '2 to 3 unseen legal, operational, or reputational blind spots',
      items: {
        type: Type.STRING
      }
    }
  },
  required: ['title', 'summary', 'score', 'verdict', 'roles', 'clashes', 'cascade', 'breaking_point', 'fixes', 'blind_spots']
};

app.post('/api/stress-test', async (req: Request, res: Response) => {
  try {
    const { situation, intensity = 'Severe', newShock, previousSummary, previousBreakingPoint } = req.body;

    if (!situation || typeof situation !== 'string' || situation.trim().length === 0) {
      return res.status(400).json({ error: 'Situation description is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    let prompt: string;
    if (newShock && typeof newShock === 'string' && newShock.trim().length > 0) {
      prompt = `Stress-test this situation at ${intensity} intensity: ${situation.trim()}

Context from previous stress test:
- Previous Summary: ${previousSummary || 'N/A'}
- Previous Breaking Point: ${previousBreakingPoint || 'N/A'}

Now add this new shock on top: ${newShock.trim()}`;
    } else {
      prompt = `Stress-test this situation at ${intensity} intensity: ${situation.trim()}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: STRESS_TEST_SCHEMA
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini API');
    }

    const parsedData = JSON.parse(responseText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating stress test analysis:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while stress-testing the situation. Please try again.'
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Stress Simulator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
