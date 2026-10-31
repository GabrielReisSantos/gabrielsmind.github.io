# CyberLab Interactive — technical roadmap

## v0.6 complete at source level (browser-only)

- Five editable HTTP vulnerability fixtures: reflected output, SQL concatenation, object authorization, traversal, and unsafe uploads.
- Evidence-gated before/after repairs, fictional HTTP traces, root-cause analysis, safe Markdown export.
- Three clickable SVG Active Directory graphs with permission path search, conditional prerequisites, surgical edge repairs and legitimate-admin path protection.
- Eight traffic correlation timelines driven by the existing v0.5 troubleshooting engine, not a contradictory independent event model.
- Original CCNA, zero-trust, NGFW, Packet Studio, OSCP missions and Palo Alto certification practice retained.

## Required before stable release

1. Local full `npm test` and `npm run build` pass.
2. Firefox/Chromium smoke tests on all three new pages; inspect responsive/mobile layout and keyboard navigation.
3. Validate five HTTP cases using the complete evidence gates.
4. Validate all three AD cases while preserving legitimate access.
5. Validate eight traffic correlation cases and compare fail/repair records.
6. Technical review of explanations and limitations; fix any ambiguities.

## Next depth milestones (not implemented)

- HTTP: multiple content contexts, cookie flags, multi-request session transitions, authentication flows, secure-by-default server-side validation demonstration.
- AD: more graph assumptions, permission inheritance, constrained delegation and credentials preconditions; avoid treating graph reachability as proof of compromise.
- Troubleshooting: useful correlation filters (source/destination/session ID), stage evidence provenance, synthetic TCP flags, realistic App-ID policy timing, compare traces with an annotated explanation.
- Educational quality: standardized lesson rubric, spaced retrieval, detailed misconception feedback, accessibility audits, progress export/import, content review process.

## Out of scope

No live vulnerable targets, arbitrary code execution, VM management, Proxmox, cloud-hosted attack infrastructure, credential processing, real malicious payload execution or unsandboxed user-provided scripts.
