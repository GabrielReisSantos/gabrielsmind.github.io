# CyberLab: Password Auditing & Hash Cracking Session

## Source and training boundary

This original training session follows the *methodology and categories* in **Hash Crack: Password Cracking Manual (v3)** (the user-supplied PDF; see PDF pages 7–9, 12, 14, 70–72, 81). It does **not** reproduce the manual, copy its examples, embed its tables, or claim to be a current official OSCP syllabus. Tool syntax was cross-checked with Hashcat's current help documentation and John the Ripper documentation. Always verify version-specific parameters on your own installation.

**Explicit limitations:** There is no shell, no access to local hash files, no GPU, no internet access, and no actual Hashcat or John process. The three reference SHA-256 digests are generated from **fictional** passwords. The wordlist and rule/mask candidate checks really invoke `crypto.subtle.digest('SHA-256', ...)` locally inside the browser, with at most 2,700 mask candidates. The synthetic benchmark and Argon2id configuration are models, not measurements or real password hashing.

## Intended learning outcomes

By completing this one coherent, ordered session, the learner should be able to:

1. Establish written authorization and preserve the source of hash material.
2. Explain the difference between encoding, encryption and hashing, and why a digest's appearance alone does not identify its scheme.
3. Select the **raw SHA-256** format **because the fictional application's provenance says so**, not because it is 64 hexadecimal characters.
4. Contrast Hashcat's numeric modes and attack modes with John the Ripper's named formats.
5. Estimate small mask keyspace and separate a synthetic hash rate from a hardware benchmark.
6. Apply a focused straight wordlist, append-character rule and constrained mask; investigate why each yields different results.
7. Explain why unsalted raw SHA-256 is inadequate for password storage and why per-user salts and a purpose-built password KDF are needed.
8. Show that adopting Argon2id is not enough without credential rotation, and that offline guesses do not automatically generate Windows login telemetry.
9. Produce a technical written finding with evidence, limitations, mitigation and retest results.

## Session map

| # | Student types | Validation |
|---|---|---|
| 1 | `cat scope.txt`, `cat hashes.txt` | Both files inspected; hashes are **bare** hexadecimal digests, not `username:hash` lines |
| 2 | `cat provenance.txt`, `hashcat -m 1400 --example-hashes` | Known-source hash format established |
| 3 | `hashcat -b -m 1400`, `keyspace ?l?l?d?d` | Synthetic benchmark identified; 67,600 candidate keyspace computed |
| 4 | `hashcat -m 1400 -a 0 hashes.txt shortlist.txt` | Real local SHA-256 comparisons; straight candidate matched |
| 5 | `hashcat -m 1400 -a 0 hashes.txt shortlist.txt -r rules/append-bang.rule` | Append-character rule candidate matched |
| 6 | `hashcat -m 1400 -a 3 hashes.txt -1 sun ?1?1?1?d?d` | 2,700 bounded candidates and real SHA-256 comparisons |
| 7 | `john --format=raw-sha256 --wordlist=shortlist.txt hashes.txt` | John syntax recognized, candidate hashes verified locally |
| 8 | `policy inspect`, `policy set kdf argon2id`, `policy rotate all`, `policy test` | Both modeled defenses required, fresh test must pass |

**Manual-to-command difference:** `hashes.txt` contains hash-only lines so the displayed Hashcat/John examples do not require a separate `--username` option. `provenance.txt` provides the identity mapping for this fictional exercise. The original manual has many other hash formats and attacks; this session intentionally does not emulate them.

## How to complete

Visit **Learn → Password Auditing Lab** or **Pentest Academy → Password Cracking Lab**. Read the checkpoint; type the required commands in the terminal (Enter to run). The exercise does not accept command pipes, redirections, semicolons or arbitrary shell invocations. Commands that belong to a future checkpoint cannot skip ahead. Use **Guided** mode for hints, then try **Independent** mode without command prompts. Switching modes does **not** by itself prove independent recall.

Write a finding of at least 100 characters (length check only; the application does **not** assess report quality) and export the Markdown report. Progress is saved in browser localStorage and is portable via the app's existing progress-backup tool. Saved commands are replayed and validated on restoration; claimed grades and recovered passwords are not saved. This is a local, self-study record and is not tamper-proof.

## Responsible use

Use only material you own or are explicitly authorized to audit. Do not enter real credentials or confidential password hashes into the browser trainer. Use your own isolated lab with actual Hashcat/John if you want to measure hardware or evaluate real password-storage formats.
