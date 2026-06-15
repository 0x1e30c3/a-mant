# a-MANT — AI Wealth Guardian on Mantle
## Project Context & Planning Document

---

## 1. Hackathon Context

**Event:** The Turing Test Hackathon 2026 by Mantle  
**Track:** AI x RWA  
**Track Description:** Dynamic yield strategies and automated risk management for assets including USDY and mETH, built on Mantle's RWA infrastructure.  
**Prize:** Track First Prize $8,500 + Grand Champion $9,000 + Best UI/UX $3,000  
**Submission Deadline:** 15 Juni 2026  
**Demo Day:** 2–3 Juli 2026  
**Platform:** DoraHacks + HackQuest  
**Submission Requirements:** Thread di X dengan #MantleAIHackathon — pitch, demo video, GitHub link, Mantle contract address  

**Kriteria Juri:**
1. Technical execution
2. Product & UX
3. Market potential — apakah solusi menyentuh masalah nyata
4. Mantle integration — seberapa dalam pakai tools Mantle
5. Scalability & impact

---

## 2. Problem Statement

### Masalah Nyata (Data-Backed)

Kondisi ekonomi global 2025–2026 tidak stabil:
- IMF menaikkan proyeksi inflasi emerging markets dari **4.8% → 5.5%** di 2026
- Depresiasi mata uang 10% langsung menaikkan harga konsumen ~2% di emerging markets
- Bahan baku, BBM, kebutuhan pokok terus naik
- Mata uang lokal (IDR, PHP, VND, NGN, TRY, ARS, dll) terus melemah terhadap dolar

**Respons masyarakat yang sudah terjadi:**
- **66% dari seluruh supply stablecoin global** dipegang oleh orang di emerging markets
- Bukan untuk spekulasi — untuk **melindungi tabungan dari mata uang lokal yang melemah**
- Di Southeast Asia, Latin America, Africa — orang sudah beli USDT/USDC dan hold diam

**Gap yang belum terselesaikan:**
- Orang yang hold USDT/USDC hanya *diam* — tidak menghasilkan apa-apa
- USDY (di-back US Treasury, yield ~4-5% APY) ada di Mantle tapi tidak diketahui
- mETH (liquid staking ETH, yield dari validator) juga ada tapi terlalu kompleks
- Tidak ada cara mudah bagi orang biasa untuk akses dan manage aset-aset ini
- Mereka butuh seseorang — atau sesuatu — yang bisa dipercaya untuk mengurus ini

### Siapa Target User

Orang biasa di negara dengan mata uang tidak stabil yang:
- Sudah punya sedikit tabungan dalam bentuk crypto/stablecoin
- Ingin proteksi dari inflasi dan depresiasi mata uang
- **Tidak paham DeFi** dan tidak mau belajar
- Percaya pada teknologi tapi butuh sesuatu yang sederhana
- Punya tujuan finansial konkret: dana darurat, tabungan pendidikan anak, dll

---

## 3. Solusi: a-MANT

> **a-MANT adalah AI guardian pertama yang secara otonom melindungi dan menumbuhkan tabungan user menggunakan aset RWA dollar-backed di Mantle — tanpa user perlu paham DeFi.**

User deposit sekali. AI yang urus selamanya.

### Filosofi Produk

- Blockchain-nya **invisible** — user tidak perlu tahu Mantle, Aave, atau Ondo Finance
- AI-nya yang **terasa nyata** — user berinteraksi dengan Axiom (nama AI mereka), bukan protokol
- **Bukan chatbot** — AI benar-benar eksekusi on-chain secara otonom, chat hanya jendela untuk memahami apa yang AI lakukan
- **Bukan yield optimizer biasa** — AI membaca sinyal dunia nyata (macro ekonomi) bukan hanya on-chain data

---

## 4. Fitur Produk

### 4.1 Core: Autonomous AI Vault

AI agent (ERC-8004 identity) yang benar-benar memegang dan mengelola USDY/mETH user di Mantle secara mandiri.

**Yang AI lakukan on-chain tanpa input user:**

**Yield Optimization**
- Monitor APY real-time di seluruh protokol Mantle (Aave, Agni Finance, Merchant Moe)
- Shift alokasi USDY/mETH ke protokol dengan yield terbaik secara otomatis
- Tidak perlu user tahu protokol apa yang dipakai

**Auto-Compounding**
- Yield di-reinvest otomatis kembali ke posisi (mode grow)
- Atau di-distribusikan ke wallet user sesuai jadwal (mode income)

**Yield Distribution**
- Kirim hasil yield ke wallet user — mingguan atau bulanan
- User terima "gaji" dari tabungan mereka tanpa klaim manual

**mETH ↔ USDY Rotation**
- Market volatile → AI perbesar porsi USDY (lebih stabil)
- Market tenang → AI tambah porsi mETH (yield lebih tinggi)
- Keputusan berdasarkan volatilitas on-chain + sinyal macro

**Depeg Protection**
- Monitor kesehatan USDY (Ondo Finance health score, redemption queue)
- Monitor mETH/ETH peg ratio
- Deteksi early warning → pindah ke aset lebih aman sebelum terlambat

### 4.2 HORIZON — Macro Signal Engine

Yang membedakan a-MANT dari yield optimizer biasa: AI membaca sinyal **dunia nyata** yang mempengaruhi RWA, sebelum dampaknya terasa on-chain.

**Sinyal yang dimonitor:**
- Fed interest rate decisions → langsung mempengaruhi yield USDY (backed US Treasury)
- Ondo Finance health metrics → keamanan USDY
- ETH staking demand → yield mETH
- Mantle TVL flow → kondisi likuiditas protokol
- Indikator volatilitas macro global

**Contoh aksi berbasis Horizon:**
- Fed sinyal rate cut → AI proyeksikan USDY yield akan turun → rotate sebagian ke mETH lebih awal
- ETH staking rate drop signifikan → AI kurangi eksposur mETH sebelum yield compress
- Ondo redemption queue naik abnormal → AI siapkan exit plan dari USDY

### 4.3 CHRONICLE — Story of Your Savings

Setiap keputusan signifikan AI diabadikan sebagai "chapter" — bukan log transaksi teknis, tapi narasi yang bisa dipahami siapapun.

**Struktur sebuah chapter:**
- Apa yang terjadi di dunia (konteks macro)
- Apa yang AI lakukan (aksi on-chain)
- Dampaknya ke tabungan user (dalam angka dan narasi)
- Tanggal dan waktu

**Contoh chapter:**
> **Chapter 3: "Malam yang Aman"** — Jun 3, 2026  
> *Semalam pasar ETH bergejolak dan nilai mETH sempat turun. Axiom mendeteksi ini pukul 02.14 dan memindahkan 40% posisimu ke USDY sebelum penurunan terjadi. Pagi ini tabunganmu masih utuh, bahkan tumbuh Rp18.000.*

**Milestone NFT:**
- Ketika goal tercapai, seluruh Chronicle bisa di-mint sebagai NFT
- Proof permanen bahwa AI berhasil melindungi dan menumbuhkan tabungan
- Bisa di-share ke sosial media

### 4.4 SAGE — Conversational Layer

Chat interface bukan fitur utama, tapi jendela bagi user untuk memahami apa yang AI lakukan.

**Fungsi SAGE:**
- AI aktif kirim notifikasi/update dalam bahasa manusia biasa
- User bisa tanya kapan saja: "gimana kondisi tabungan saya?"
- AI jelaskan keputusannya dalam bahasa yang mudah dimengerti
- User bisa adjust parameter lewat chat: "lebih aman ya untuk sekarang"

**Bukan** tempat user memerintah AI untuk eksekusi — AI sudah jalan sendiri.  
**Tapi** tempat user merasa terhubung dan paham dengan apa yang terjadi pada tabungan mereka.

---

## 5. User Journey

### Onboarding (< 3 menit)

```
Langkah 1: Tujuan
"Berapa yang ingin kamu lindungi?"
→ User input nominal

Langkah 2: Jangka waktu
"Dalam berapa bulan?"
→ User pilih durasi

Langkah 3: Profil risiko
"Seberapa berani kamu?"
→ [Aman] [Seimbang] [Agresif]

Langkah 4: Connect Wallet
→ Baru di sini user connect wallet

Langkah 5: Deposit
→ USDY atau mETH atau keduanya

Langkah 6: AI lahir
→ Animasi "Axiom is now active"
→ AI langsung mulai kerja
```

### Daily Experience

- Notifikasi pagi: ringkasan semalam, tabungan tumbuh berapa
- Notifikasi ketika AI mengambil aksi penting
- Halaman utama: satu angka besar (progress ke goal)
- Chapter baru muncul ketika ada momen signifikan
- Chat tersedia kapan saja untuk tanya atau adjust preferensi

---

## 6. UX Principles

### Yang Tidak Boleh Ada di Permukaan UI
- Kata: APY, TVL, liquidity, slippage, rebalance, protocol, vault, gas, smart contract
- Tabel data mentah
- Candlestick chart di halaman utama
- Error message teknis blockchain
- Emoji berlebihan / icon dekoratif tidak bermakna
- Gradient glossy / glow neon ala DeFi generik
- Card bertumpuk penuh angka

### Yang Harus Terasa
- Satu angka paling penting: progress ke goal
- Narasi, bukan metrik
- AI yang proaktif menghubungi user, bukan user yang cek-cek sendiri
- Setiap aksi AI dikomunikasikan dalam konteks yang relevan untuk user
- Terasa seperti aplikasi finansial premium, bukan DeFi protocol

### Anti-Patterns yang Harus Dihindari
- **AI Slop UI** — layout generik hasil AI generate: hero section besar, 3 feature card sejajar, CTA hijau. Terlalu mudah ditebak, tidak berkarakter
- **AI Generated feel** — ilustrasi blob warna-warni, gradient rainbow, typography campur-campur, semua terasa template
- **Emoji abuse** — satu emoji per baris, icon decorative di mana-mana, tidak ada whitespace
- **DeFi clutter** — terlalu banyak angka di satu layar, warna merah/hijau di mana-mana, terasa seperti trading terminal

---

## 6a. Design System (berdasarkan referensi iNMerg)

**Referensi utama:** [iNMerg Beta](https://inmerge-beta.vercel.app/) — produk Mantle ekosistem dengan desain clean, tidak generik, terasa dipikirkan dengan serius.

### Yang dipelajari dari iNMerg

Dari analisis CSS dan design tokens iNMerg:

**Typography**
- Font: **Manrope** (variable weight 200–800) — geometric humanist sans-serif, modern tapi tidak dingin
- Tidak pakai serif, tidak pakai display font berlebihan
- Weight digunakan untuk hierarchy, bukan ukuran saja

**Color Palette**
```
Background    #0a0a0f   (240 10% 3.9%)  — near-black, bukan abu DeFi
Foreground    #fafafa   (0 0% 98%)      — near-white, high contrast
Accent        #ffefc5   (amber hangat)  — ini yang bikin beda, bukan green/blue
Border        subtle    (240 3.7% 15.9%) — hampir tidak kelihatan
Muted text    #a1a1aa   (240 5% 64.9%) — secondary info
Success       #4ade80   (green 400)     — hanya untuk state, bukan dekorasi
```

**Spacing & Structure**
- Border radius: `0.5rem` — tidak terlalu bulat, tidak tajam
- Component library: **shadcn/ui** — konsisten, accessible, tidak berlebihan
- Whitespace generous — setiap elemen punya ruang napas

**Design Philosophy**
- Dark-first — dark mode bukan afterthought, ini default-nya
- Functional > Decorative — setiap elemen ada alasannya
- Kontras tinggi untuk readability — teks utama selalu mudah dibaca
- Warna accent dipakai hemat — hanya untuk highlight yang benar-benar penting

### a-MANT Design Tokens

Mengadopsi spirit iNMerg, disesuaikan untuk a-MANT:

```css
:root {
  /* Background */
  --background: #09090b;          /* near-black */
  --surface: #111113;             /* card surface */
  --surface-elevated: #18181b;    /* elevated card */

  /* Text */
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #52525b;

  /* Accent — signature a-MANT */
  --accent-primary: #ffefc5;      /* amber hangat — sama spirit dengan iNMerg */
  --accent-glow: #ffefc514;       /* sangat subtle glow, hanya bila perlu */

  /* Semantic */
  --positive: #4ade80;            /* tabungan tumbuh */
  --warning: #fb923c;             /* perhatian diperlukan */
  --protective: #60a5fa;          /* AI sedang melindungi */

  /* Border */
  --border: #27272a;
  --border-subtle: #18181b;

  /* Typography */
  --font-sans: 'Manrope', sans-serif;
  --radius: 0.5rem;
}
```

### Komponen Utama & Tone

**Progress Bar (goal tracker)**
- Tipis, bukan tebal
- Warna amber (`--accent-primary`) bukan hijau
- Label di atas: angka nominal, bukan persentase APY

**AI Activity Card (chronicle chapter)**
- Background `--surface-elevated`
- Border kiri tipis warna `--protective` ketika AI sedang aktif
- Teks narasi, bukan log transaksi
- Timestamp kecil di bawah

**Notification / AI message**
- Tidak pakai toast pop-up agresif
- Muncul sebagai "message" dari AI — terasa seperti pesan dari seseorang
- Font weight medium, tidak bold berteriak

**Numbers**
- Angka nominal besar (tabungan total): `font-size: 2.5rem`, `font-weight: 300` — tipis tapi besar, terasa premium
- Angka perubahan kecil: `font-size: 0.875rem`, warna `--positive` atau `--warning`

**Buttons**
- Primary: background `--accent-primary`, text dark — subtle, tidak mencolok
- Secondary: border `--border`, background transparent
- Tidak ada shadow tebal, tidak ada gradient

### Screen-by-Screen Design Direction

**Onboarding**
- Full-screen per step, satu pertanyaan per layar
- Background gelap, teks putih besar di tengah
- Input minimal — angka saja, pilihan visual sederhana
- Tidak ada sidebar, tidak ada header navigasi dulu

**Dashboard (Home)**
- Angka besar di atas: total nilai tabungan sekarang
- Progress bar tipis ke goal
- Di bawah: 1–2 baris status AI terakhir ("Axiom bergerak 2 jam lalu")
- Chapter terbaru: 1 card, bisa scroll ke bawah untuk lihat semua
- Bottom navigation: Home / Chronicle / Chat — 3 tab saja

**Chronicle**
- Timeline vertikal, bukan grid card
- Setiap chapter: tanggal, judul, narasi singkat, impact angka
- Bisa expand untuk baca detail lengkap
- Milestone: visual sederhana, tidak berlebihan

**Chat (SAGE)**
- Clean message bubble
- Tidak ada avatar besar-besar
- Waktu pesan kecil di bawah setiap bubble
- Input di bawah, fixed

---

## 7. Technical Architecture

### Smart Contracts (Mantle L2)

```
VelaVault.sol
├── deposit(token, amount)
├── withdraw(amount)
├── distributeYield(user, amount)
└── getPosition(user) → (usdy, meth, totalValue)

VelaAgent.sol (ERC-8004)
├── executeRebalance(fromToken, toToken, amount, reason)
├── executeCompound(amount)
├── triggerProtection(riskLevel, action)
└── logDecision(action, context, timestamp)

VelaChronicle.sol
├── createChapter(user, title, narrative, impact)
├── mintChronicleNFT(user, goalId)
└── getChapters(user) → Chapter[]
```

### AI Agent Layer

```
Signal Collector
├── On-chain: APY rates, TVL, protocol health (via The Graph)
├── Off-chain: Fed rate, currency data, Ondo health score
└── Aggregator → Decision Engine

Decision Engine
├── Risk scorer — evaluate current market state
├── Allocation optimizer — calculate optimal USDY/mETH split
├── Action generator — produce rebalance/protect/compound actions
└── Narrator — generate human-readable explanation per action

Execution Layer
├── Sign & submit transactions on Mantle
├── Log decision on-chain via VelaAgent.sol
└── Trigger Chronicle chapter creation
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + Tailwind CSS + Framer Motion |
| Smart Contracts | Solidity on Mantle L2 |
| AI Agent Identity | ERC-8004 (Identity + Reputation + Validation Registry) |
| Conversational AI | NVIDIA NIM (meta/llama-3.1-8b-instruct) |
| RWA Assets | USDY (Ondo Finance), mETH (Mantle LSP) |
| DeFi Protocols | Aave Mantle, Agni Finance, Merchant Moe |
| On-chain Data | The Graph subgraph (Mantle) |
| Off-chain Signals | Public macro APIs (Fed, currency rates) |
| NFT Storage | IPFS (Chronicle NFT metadata) |
| Wallet | Wagmi + viem |

### ERC-8004 Integration

Setiap AI agent a-MANT punya:
- **Identity Registry** — NFT identity unik per user, on-chain
- **Reputation Registry** — track record keputusan AI yang ter-verify, portable
- **Validation Registry** — cryptographic proof setiap keputusan on-chain

---

## 8. RWA Asset Details

### USDY (Ondo Finance on Mantle)
- Di-back oleh US Treasury bonds dan bank demand deposits
- Yield ~4-5% APY, ter-accrue ke nilai token
- Wrapper mUSD tersedia (rebasing, tetap $1, yield via new tokens)
- TVL di Mantle: ~$29M
- Risiko: Ondo Finance counterparty risk, redemption queue

### mETH (Mantle LSP)
- Liquid Staking Token — stake ETH, dapat mETH
- Yield dari ETH validator staking
- Bisa dipakai di DeFi: lending, borrowing, liquidity
- Risiko: ETH price volatility, validator slashing, staking demand

### Protokol Yield di Mantle
- **Aave Mantle** — lending/borrowing untuk USDY dan mETH
- **Agni Finance** — concentrated liquidity DEX
- **Merchant Moe** — DEX dengan liquidity incentives
- **Fluxion** — additional yield source

---

## 9. Differentiators vs Existing Products

| | a-MANT | Yearn/Beefy | Chat AI (Chai dll) | Simple Vault |
|---|---|---|---|---|
| Eksekusi on-chain otonom | ✅ | ✅ | ❌ | ✅ |
| Macro signal awareness | ✅ | ❌ | ❌ | ❌ |
| RWA-specific logic | ✅ | ❌ | ❌ | ❌ |
| User goal alignment | ✅ | ❌ | ✅ | ❌ |
| Non-DeFi UX | ✅ | ❌ | ✅ | ❌ |
| Chronicle/story layer | ✅ | ❌ | ❌ | ❌ |
| ERC-8004 AI identity | ✅ | ❌ | ❌ | ❌ |
| Target: ordinary people | ✅ | ❌ | ✅ | ❌ |

---

## 10. Narrative untuk Pitch

**One-liner:**
> "a-MANT adalah AI yang secara otonom melindungi dan menumbuhkan tabungan orang biasa dari gejolak ekonomi global, menggunakan aset RWA dollar-backed di Mantle."

**Problem (1 kalimat):**
> 66% supply stablecoin global dipegang orang di emerging markets untuk melindungi diri dari inflasi dan depresiasi mata uang — tapi mereka hanya hold diam, tidak menghasilkan apa-apa.

**Solution (1 kalimat):**
> a-MANT adalah AI guardian yang deposit sekali, lalu secara otonom mengalokasikan, merebalance, dan mendistribusikan yield USDY/mETH di Mantle — user tidak perlu paham DeFi sama sekali.

**Why Mantle:**
> USDY dan mETH adalah RWA terdepan di Mantle. ERC-8004 memungkinkan AI agent punya identitas dan reputasi on-chain yang verified. Ekosistem Mantle (Aave, Agni, Merchant Moe) memberi AI cukup protokol untuk optimasi yield yang genuine.

**Why Now:**
> Inflasi dan instabilitas mata uang sedang di puncaknya. Orang sudah migrasi ke stablecoin — mereka hanya butuh sesuatu yang manage tabungan mereka dengan cerdas. a-MANT datang tepat waktu.

---

## 11. MVP Scope (untuk Hackathon)

### Must Have
- [ ] Smart contract VelaVault di Mantle testnet/mainnet
- [ ] AI agent dengan ERC-8004 identity
- [ ] Integrasi USDY (minimal read + basic deposit/withdraw)
- [ ] Satu aksi otonom AI: yield rebalancing antar 2 protokol
- [ ] Chronicle: minimal 1 chapter ter-generate otomatis
- [ ] Frontend: onboarding flow + halaman utama dengan progress goal
- [ ] Demo video yang menunjukkan AI benar-benar eksekusi on-chain

### Nice to Have
- [ ] mETH ↔ USDY rotation
- [ ] Horizon macro signal integration (Fed rate data)
- [ ] Auto-compound + yield distribution
- [ ] Chronicle NFT minting
- [ ] Chat interface (SAGE)
- [ ] Notifikasi push

### Tidak Perlu untuk Hackathon
- Mobile app native
- Multi-language support
- Full production security audit
- Multi-chain support

---

## 12. Referensi & Inspirasi

**Hackathon Pemenang Sebelumnya:**
- OwnaFarm (1st Place GameFi, Mantle Global Hackathon 2025) — tokenize invoice petani jadi in-game assets. Formula menang: real problem + RWA tokenization + engaging UX layer.

**Design Referensi Utama:**
- [iNMerg Beta](https://inmerge-beta.vercel.app/) — produk Mantle ekosistem. Referensi utama untuk design language: dark, clean, Manrope font, amber accent, tidak AI slop. *(CSS analyzed: font Manrope, bg #0a0a0f, accent #ffefc5, shadcn/ui)*
- Revolut — modern fintech feel, angka sebagai hero
- Linear — dark UI yang functional, tidak dekoratif

**Design Anti-Referensi (yang harus dihindari):**
- App hasil generate v0/Bolt tanpa editing — terasa template
- DeFi dashboard generik — terlalu banyak angka, warna neon
- Chat app dengan emoji berlebihan

**Technical Referensi:**
- [ERC-8004 Standard](https://eips.ethereum.org/EIPS/eip-8004)
- [ERC-8004 Developer Guide — QuickNode](https://blog.quicknode.com/erc-8004-a-developers-guide-to-trustless-ai-agent-identity/)
- [Mantle ERC-8004 Deployment](https://chainwire.org/2026/02/16/mantle-unlocks-autonomous-economy-with-erc-8004-deployment/)
- [USDY & mETH on Mantle — Minterest](https://minterest.com/blog/deep-dive-into-usdy-musd-and-meth/)
- [Mantle Turing Test Hackathon](https://dorahacks.io/hackathon/mantleturingtesthackathon2026/detail)
