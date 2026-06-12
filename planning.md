# a-MANT — Planning & Product Roadmap

> Dokumen perencanaan fitur. Fokus: membangun **moat (pembeda yang susah ditiru)**, bukan menambah fitur komoditas.
> Status: **draft diskusi** — sebagian keputusan desain masih terbuka (lihat tanda 🟡).

---

## 1. Ringkasan Produk

**a-MANT** = AI guardian otonom & **non-custodial** yang melindungi serta menumbuhkan tabungan on-chain di **Mantle**.

- **Axiom** = AI agent yang memantau sinyal makro 24/7 dan merebalance posisi.
- User cukup set **goal + durasi + risk** sekali (~2 menit), lalu **deposit sekali** → setelah itu tanpa input.
- Dana ditahan **smart contract vault**, bukan oleh Axiom/tim. AI hanya punya hak rebalance.

**Stack:** Mantle (chain 5000), USDY (RWA stablecoin / Ondo), mETH (liquid staking), LI.FI (DEX aggregator), ERC-8004 (AI identity NFT + reputation).

**Permukaan aplikasi saat ini:**
- `/` — landing page (`src/components/landing/*`)
- `/onboard` — setup flow (goal → duration → risk → connect → activate) — *mock*
- `/app` — dashboard (Portfolio value, allocation, claimable yield, Axiom status, latest chapter)
- `/app/chronicle` — narasi keputusan AI ("Chronicle")
- `/app/chat` — "Ask Axiom" (chat) via `/api/chat`

**Catatan teknis penting:** hooks di `src/hooks/useVault.ts` & `useAgent.ts` saat ini **read-only / mock**. Belum ada fungsi write (deposit/rebalance) on-chain. Onboarding & deposit modal saat ini **simulasi**.

---

## 2. Analisis USP (jujur)

### Yang SUDAH ramai (bukan pembeda)
| Klaim | Kenapa bukan USP |
|---|---|
| Auto-rebalance / yield optimizer otonom | Yearn, Beefy, Sommelier, Enzyme sudah lama. Standar DeFi. |
| Non-custodial | Tabel-stakes, hampir semua DeFi begitu. |
| Macro signal monitoring | Trading bot & vault strategy sudah baca sinyal makro. |
| "AI savings assistant" | Kata "AI" sudah jenuh sejak 2024–2025. |

### Yang MASIH tipis (kandidat USP sesungguhnya)
1. **Chronicle** — keputusan AI ditulis jadi narasi bahasa manusia yang bisa dibaca, bukan log mentah. → angle **trust/UX**, kompetisinya sepi.
2. **Explainability sebagai produk inti** ("Ask Axiom") — posisi "AI yang **akuntabel**" > "AI yang pintar".
3. **Segmen EM / proteksi inflasi** — melayani orang awam yang takut inflasi, bukan degen yield-chaser.

### Kesimpulan jujur
- Diferensiasi **teknologi → lemah** (semua bisa ditiru).
- Diferensiasi **narasi + segmen + trust → masih ada ruang**, tapi moat tipis. Yang bikin tahan: **eksekusi UX, brand, distribusi**, dan fitur yang **compounding** (makin lama dipakai makin susah disusul).

**Positioning satu kalimat:**
> *AI guardian otonom & non-custodial yang melindungi tabungan dari inflasi — deposit sekali, Axiom memantau makro 24/7 dan menjelaskan tiap keputusannya dalam cerita yang bisa kamu baca.*

---

## 3. Kandidat Fitur (diurut berdasarkan kekuatan moat)

### Tier 1 — Moat sesungguhnya
- **Proof of Value (counterfactual):** "Tanpa Axiom: $X. Dengan Axiom: $Y (+Z%)."
- **Benchmark mata uang lokal:** performa diukur dalam **daya beli IDR/NGN/ARS**, bukan cuma USD/APY.
- **Reputasi Axiom yang compounding (ERC-8004):** track record keputusan publik & verifiable on-chain.

### Tier 2 — Trust melalui kontrol
- **Veto window / pre-action notify:** "Axiom akan rebalance karena sinyal X — batalkan dalam 1 jam."
- **AI belajar dari reaksi user:** adaptasi dari veto/pertanyaan → makin personal (data perilaku compounding).

### Tier 3 — Retensi (bukan moat, tapi murah & berharga)
- Recurring deposit / auto-DCA
- Multi-goal (dana darurat vs jangka panjang)
- Chronicle shareable (distribusi organik)

### Hard tapi paling tahan (jangka panjang)
- **Local on/off-ramp** (rupiah masuk-keluar mulus) → distribusi & partnership = moat terkuat untuk EM.
- **Signal data proprieter** (HORIZON) → data flywheel.

---

## 4. Roadmap Eksekusi (3 fase)

### Fase 1 — "Proof of Value" + Benchmark Lokal ⭐ PRIORITAS
Kartu di dashboard yang menunjukkan nilai tambah Axiom secara konkret + framing daya beli lokal.

- **Kenapa duluan:** paling murah dibanding dampaknya, langsung mempertajam USP, numpang Chronicle & `useVaultPosition`.
- **Output:** komponen `ProofOfValueCard` di `/app`.

### Fase 2 — Veto Window
Banner/notif "Axiom akan rebalance — batalkan dalam 1 jam" + catat ke Chronicle.

- **Kenapa:** otonom **tapi tetap di tangan user** — jawaban langsung untuk ketakutan "AI ngapain uangku".
- Awal di-mock (state lokal), nanti disambung ke event on-chain.

### Fase 3 — Reputasi Axiom (ERC-8004)
Section/halaman track record publik: jumlah keputusan, % outcome membaik, reputation score.

- Sebagian data sudah ada di `useAgentProfile`. Tinggal diangkat jadi cerita.

### Backlog
Recurring deposit, multi-goal, Chronicle shareable, local on/off-ramp, signal data proprieter.

---

## 5. Desain Detail Fase 1 (Proof of Value)

Tujuan: bukti nilai yang **kredibel & jujur** — bukan marketing gimmick. Kalau dibuat dramatis tapi tidak jujur, justru merusak trust yang jadi USP.

### 5.1 Keputusan desain

| # | Keputusan | Opsi | Rekomendasi | Status |
|---|---|---|---|---|
| 1 | **Baseline pembanding** | A) Cash diam (0%) · B) Hold-stablecoin tanpa rebalance · C) Deposito bank lokal | Tampilkan **2 garis: vs bank lokal + vs hold-stablecoin**. Buang "cash diam" (strawman, turunkan kredibilitas). | 🟡 perlu konfirmasi |
| 2 | **Saat Axiom kalah** | Sembunyikan / Tampilkan apa adanya | **Tampilkan jujur (boleh negatif)** + alasan singkat. Kejujuran = inti trust. | 🟡 perlu konfirmasi |
| 3 | **Sumber data inflasi & kurs** | Hardcode statis / API live | **MVP: config statis** (mis. inflasi IDR ~2.5%/th, kurs dari 1 API ringan), arsitektur siap diganti API live. | 🟡 perlu konfirmasi |
| 4 | **Currency target** | Tambah step onboarding / default IDR + setting | **Default IDR + bisa diganti di setting** (lebih ringan dari nambah step). | 🟡 perlu konfirmasi |
| 5 | **Data historis** | Single-point / time-series grafik | **MVP single-point** ("sejak deposit pertama"). Grafik nyusul saat ada time-series beneran. | 🟡 perlu konfirmasi |

### 5.2 Prinsip
- **Jujur > dramatis.** Counterfactual harus tahan diaudit.
- **Fair baseline.** Bandingkan dengan apa yang user kemungkinan lakukan sendiri (hold-stablecoin), bukan skenario terburuk artifisial.
- **Lokal & emosional.** Bahasa "daya beli rupiahmu terjaga", bukan "APY 4.5%".

### 5.3 Sketsa UI (kartu dashboard)
```
┌─────────────────────────────────────────────┐
│ PROOF OF VALUE                      ● Live    │
│                                               │
│ Sejak deposit pertama, Axiom membuatmu        │
│                                               │
│   +Rp 1.240.000   (+4.8%)                     │
│                                               │
│ vs hold stablecoin saja   +Rp 320.000  (+1.2%)│
│ vs deposito bank lokal     +Rp 540.000  (+2.1%)│
│                                               │
│ Daya beli rupiahmu: terjaga, inflasi          │
│ IDR (2.5%) dikalahkan +2.3%                    │
└─────────────────────────────────────────────┘
```
*(angka ilustratif; tampilkan negatif apa adanya bila Axiom underperform)*

### 5.4 Catatan teknis (rencana implementasi)
- Komponen baru: `src/components/app/ProofOfValueCard.tsx` (pakai bahasa desain `A`/`GlassCard` dari `src/components/app/ui.tsx`).
- Data: `useVaultPosition` + `useTotalValue` (sudah ada) untuk nilai sekarang; baseline dihitung dari `depositedAt` + asumsi rate.
- Util baru: `src/lib/proofOfValue.ts` — fungsi murni hitung counterfactual (mudah di-test).
- Config: `src/lib/localRates.ts` — rate inflasi & bunga deposito per region + currency default IDR.
- Render di `/app` (kolom utama, di bawah balance hero).

---

## 6. Pertanyaan Terbuka (harus diputuskan sebelum ngoding)

1. **Baseline:** setuju "vs bank lokal + vs hold-stablecoin", buang "cash diam"? Atau cukup satu garis biar simpel?
2. **Currency:** default IDR + setting, atau tambah 1 step di onboarding?
3. **Tone:** oke dengan prinsip "jujur walau kadang Axiom kalah"?
4. **Sumber data:** mulai dari config statis, atau langsung integrasi API inflasi/kurs?

---

## 7. Risiko & Catatan

- **Mock vs on-chain:** banyak hal masih simulasi. Fase 1 sengaja dirancang agar berfungsi di layer UI/logic dulu; wiring on-chain (deposit/rebalance write, time-series riwayat) menyusul.
- **Kredibilitas counterfactual:** salah desain → merusak trust. Mitigasi: baseline fair + tampilkan jujur.
- **Moat tipis:** fitur bisa ditiru. Pertahanan jangka panjang = eksekusi UX + distribusi (terutama on/off-ramp lokal) + data yang compounding (reputasi Axiom, perilaku user).

---

*Langkah berikutnya: jawab pertanyaan di Bagian 6 → kunci desain kartu Fase 1 → mulai implementasi `ProofOfValueCard`.*
