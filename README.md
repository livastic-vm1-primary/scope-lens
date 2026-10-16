# ScopeLens — Ask better questions before quoting

**Free, open-source and local-first.** A bilingual (English / Korean) project brief preflight for freelancers, designers, indie makers and small teams. Paste a client request, scan eight visible topics and export a Markdown checklist. Optionally load an open-weight model into your browser to draft more specific questions.

**Status:** original beta; not a lawyer, accountant, certified contract analyzer, or commercial payment processor.

Public app: https://livastic-vm1-primary.github.io/scope-lens/

## Why this exists

A client might describe deliverables and a deadline but forget revision limits, approval criteria, deposit, and scope-change policy. Those gaps can lead to preventable disputes and expensive rework. ScopeLens highlights *keyword signals*, not confirmed legal or contractual risk. It never claims that the presence of a word means a real agreement exists.

## Features

- Eight transparent checks: deliverables, deadline, budget, acceptance criteria, revisions, payment, dependencies/access, and decision-maker.
- Weighted gap score **0–100**, explicitly **not** a financial risk or contract validity rating. Missing keywords might be false positives; covered topics might be false negatives.
- Specific client clarification questions, including Korean translations.
- Optional local text generation using **SmolLM2-360M-Instruct** quantized ONNX weights with **Transformers.js** in browser WebAssembly. Download on first request; the UI can work without an AI model.
- On-device processing. Brief text is not sent to a hosted inference API, nor saved to the project website server.
- Export a Markdown report and copy questions to clipboard. Sample briefs contain **fictional** client information.
- Responsive mobile UI, keyboard focus indicators, reduced-motion support, and generated text always inserted with `textContent`, not HTML.

## Usage

Visit the public app, paste at least 20 characters, then **Scan for scope gaps**. To try the model, choose **Draft with local AI** (downloads weights from Hugging Face on first use; requires a modern supported browser with sufficient memory). Model results can be inaccurate, rambling or repetitive; unsuitable output is rejected and deterministic questions remain available.

**한국어:** 고객 의뢰 내용을 입력하고 '계약 범위 점검'을 누르세요. 납품물·납기·예산·검수·수정·결제 조건 중 추가로 확인할 항목과 고객에게 물을 질문을 보여줍니다. 선택 기능인 '로컬 AI 질문 생성'은 공개 모델을 기기에 내려받아 실행합니다. 고객 정보는 서버의 AI API에 전송되지 않으나, 사용하는 기기의 보안과 브라우저 환경은 직접 관리해야 합니다.

### Privacy & limitations

- When you click the AI button, the browser fetches model **files** from Hugging Face; the brief is fed into **local inference**, not a hosted language-model service. Model download endpoints may see the user's IP and browser request metadata.
- The app doesn't create a persistent brief database. Markdown exports are saved to your own device. The clipboard may retain copied content.
- User-supplied text and model output render as plain text. Input is capped at 8,000 characters; the model prompt uses at most 2,800.
- Local AI is optional and best effort. The model's generation can miss facts or suggest inappropriate wording. No generated question should be sent to a real client without verification.
- The ambiguity score is a simple rule of thumb; a covered keyword is not proof of a negotiated term.
- There is no authentication, subscription, AI key, crypto wallet connection, analytics, client email automation or on-site checkout.
- Contact link opens the visitor's own mail app. It does not automatically collect data.
- This is not legal, tax, financial, cybersecurity, or human resources advice.

## Run locally

Node.js 20.19+ or 22.12+:

```bash
npm ci --include=dev
npm test
npm run build
npm run test:browser
npm run dev
# open the printed local URL
```

Build static Pages output:

```bash
npm run build
# built files are under docs/
```

## Architecture

`src/analyze.mjs`: dependency-free, testable deterministic rule and prompt engine.
`src/app.mjs`: event handling, safe DOM rendering, Markdown report download, lazy local model loader.
`src/styles.css`: responsive layout and styles.
`tests/analyze.test.mjs`: Node built-in test runner assertions.
`docs/`: deployable static GitHub Pages artifact, no secrets.
`public/`: public favicon.

We build with Vite and Transformers.js. **Model weights are not committed**; the publicly downloaded model resides in the user's browser cache subject to the browser and model provider's behavior.

## Third-party licenses and attribution

Application source MIT (see LICENSE). Underlying SmolLM2-360M-Instruct model by Hugging Face TB has [Apache-2.0 license](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct). ONNX conversion is served at [onnx-community/SmolLM2-360M-Instruct-ONNX](https://huggingface.co/onnx-community/SmolLM2-360M-Instruct-ONNX); consult those upstream artifacts for their complete terms. Transformers.js and Vite each have their own upstream licenses.

## Development integrity

The initial 135M parameter model generated repetitive nonsense on the actual VM test, so it was discarded. A 360M parameter model generated plausible clarification questions in a VM Node smoke test. Public browser inference remains subject to independent WebAssembly and download checks.

**No verified earnings, competition prize or customers are claimed by this repository.** This is a free prototype and opt-in potential consulting lead source.

To run headless browser QA, install a compatible Google Chrome binary and optionally set PLAYWRIGHT_CHROME_PATH. Screenshots are kept in git-ignored test-artifacts/. On low-resource devices you may skip optional AI inference.


### Optional custom-scope contact

A distinct, owner-activated [login-free inquiry form](https://livastic-vm1-primary.github.io/paperpilot-tools/contact.html) is linked from this prototype. Unlike ScopeLens's on-device brief scan, this contact form sends consented contact and general project details through **third-party FormSubmit**, and the form clearly discloses this. Visitors may instead use the original direct email link or public GitHub issue. It is not a payment checkout or an accepted paid order.
