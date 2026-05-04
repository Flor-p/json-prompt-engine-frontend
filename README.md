JSON Prompt Engine es una herramienta profesional para construir prompts estructurados para modelos de IA generativa de imagen y video.
El problema que resuelve:
Cada modelo de IA tiene su propia sintaxis, parámetros y lógica. Midjourney usa --ar, --v, --sref. Stable Diffusion usa pesos (word:1.3) y samplers. Kling tiene CFG scale y camera controls. Runway tiene motion amount. Hasta ahora no existía una sola herramienta que unificara todo esto con campos específicos por modelo, output formateado correcto y persistencia real.
En qué te ayuda:

Construís prompts complejos sin memorizar la sintaxis de cada modelo
Describís tu idea en español y el AI Assistant la convierte en un prompt en inglés listo para usar
Guardás presets de tus configuraciones favoritas y los recuperás cuando quieras
Tu historial de prompts queda guardado en base de datos real, no en el browser
Copiás el output con un click y lo pegás directo en el modelo

Modelos soportados:
→ Imagen: Midjourney V8.1, Stable Diffusion (A1111), Gemini 2.5 Pro/Flash
→ Video: Runway Gen-4, Luma Dream Machine, Kling 3.0, Seedance 2.0
Features clave:
→ Campos específicos por modelo — no genéricos
→ JSON Editor en tiempo real con validación inline
→ AI Prompt Assistant integrado — escribís en tu idioma, genera en inglés
→ Output formateado con sintaxis exacta por modelo
→ Historial y presets persistidos en PostgreSQL
→ Schema-driven — agregar un modelo nuevo = un entry en el config
→ Responsive: funciona en desktop, tablet y mobile
Stack:
→ Frontend: Next.js 14 · TypeScript · Tailwind CSS · Zustand · shadcn/ui
→ Backend: Node.js · Express · PostgreSQL
→ AI: Anthropic API (Claude Haiku)
→ Deploy: Vercel + Railway
Construido con: Bolt.new + Claude Code
🔗 https://json-prompt-engine-frontend.vercel.app/
