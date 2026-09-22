/**
 * Unified expect matcher for Reduck case payloads (Snapchat + Anybuddy).
 * Pure function — no I/O. Used by unit tests; live benchmarks may import later.
 *
 * @param {object} expect
 * @param {object|null} result
 * @param {string|null} [error]
 * @returns {string[]} failure messages (empty = pass)
 */
export function checkExpect(expect, result, error = null) {
  const failures = [];
  if (!expect || typeof expect !== "object") return failures;

  if (expect.ok === false) {
    const err = error != null ? String(error) : "";
    if (!err) failures.push("expected run to fail (ok:false) but no error");
    if (typeof expect.errorIncludes === "string") {
      if (!err.toLowerCase().includes(expect.errorIncludes.toLowerCase())) {
        failures.push(
          `errorIncludes: "${err.slice(0, 120)}" does not include "${expect.errorIncludes}"`,
        );
      }
    }
    return failures;
  }

  if (expect.ok === true && result == null) {
    failures.push("expected a result object (ok:true)");
  }

  if ("notFound" in expect) {
    if (!!result?.notFound !== !!expect.notFound) {
      failures.push(`notFound: got ${!!result?.notFound}, want ${!!expect.notFound}`);
    }
  }

  if ("loggedIn" in expect) {
    if (!!result?.loggedIn !== !!expect.loggedIn) {
      failures.push(`loggedIn: got ${!!result?.loggedIn}, want ${!!expect.loggedIn}`);
    }
  }

  if ("opened" in expect) {
    if (!!result?.opened !== !!expect.opened) {
      failures.push(`opened: got ${!!result?.opened}, want ${!!expect.opened}`);
    }
  }

  if ("tooManyTabs" in expect) {
    if (!!result?.tooManyTabs !== !!expect.tooManyTabs) {
      failures.push(
        `tooManyTabs: got ${!!result?.tooManyTabs}, want ${!!expect.tooManyTabs}`,
      );
    }
  }

  if (typeof expect.count === "number") {
    const n = Number(result?.count);
    if (n !== expect.count) failures.push(`count: got ${n}, want ${expect.count}`);
  }

  if (typeof expect.minCount === "number") {
    const n = Number(result?.count ?? 0);
    if (n < expect.minCount) {
      failures.push(`minCount: got ${n}, want ≥ ${expect.minCount}`);
    }
  }

  if (typeof expect.maxCount === "number") {
    const n = Number(result?.count ?? 0);
    if (n > expect.maxCount) {
      failures.push(`maxCount: got ${n}, want ≤ ${expect.maxCount}`);
    }
  }

  if (typeof expect.urlIncludes === "string") {
    const url = String(result?.url || "");
    if (!url.toLowerCase().includes(expect.urlIncludes.toLowerCase())) {
      failures.push(`urlIncludes: "${url}" does not include "${expect.urlIncludes}"`);
    }
  }

  if (Array.isArray(expect.hasKeys)) {
    for (const k of expect.hasKeys) {
      if (result == null || !(k in result)) failures.push(`hasKeys: missing "${k}"`);
    }
  }

  if (typeof expect.chatNameIncludes === "string") {
    const names = (result?.chats || []).map((c) => String(c?.name || "").toLowerCase());
    const want = expect.chatNameIncludes.toLowerCase();
    if (!names.some((n) => n.includes(want))) {
      failures.push(
        `chatNameIncludes: none of [${names.join(", ")}] include "${expect.chatNameIncludes}"`,
      );
    }
  }

  if (Array.isArray(expect.chatRowHasKeys) && Array.isArray(result?.chats) && result.chats[0]) {
    const row = result.chats[0];
    for (const k of expect.chatRowHasKeys) {
      if (!(k in row)) failures.push(`chatRowHasKeys: first row missing "${k}"`);
    }
  }

  if (expect.hasAvailable === true) {
    if (!Array.isArray(result?.available) || result.available.length === 0) {
      failures.push("hasAvailable: expected non-empty available[]");
    }
  }

  if (typeof expect.messageTextIncludes === "string") {
    const blob = (result?.messages || [])
      .map((m) => String(m?.text || ""))
      .join("\n")
      .toLowerCase();
    if (!blob.includes(expect.messageTextIncludes.toLowerCase())) {
      failures.push(
        `messageTextIncludes: messages do not include "${expect.messageTextIncludes}"`,
      );
    }
  }

  // Anybuddy
  if (typeof expect.minCandidates === "number") {
    const n = Array.isArray(result?.candidates) ? result.candidates.length : 0;
    if (n < expect.minCandidates) {
      failures.push(`minCandidates: got ${n}, want ≥ ${expect.minCandidates}`);
    }
  }

  if (typeof expect.firstSlugIncludes === "string") {
    const slug = String(result?.candidates?.[0]?.slug || "");
    if (!slug.toLowerCase().includes(expect.firstSlugIncludes.toLowerCase())) {
      failures.push(
        `firstSlugIncludes: "${slug}" does not include "${expect.firstSlugIncludes}"`,
      );
    }
  }

  if (typeof expect.minClubs === "number") {
    const n = Array.isArray(result?.clubs) ? result.clubs.length : 0;
    if (n < expect.minClubs) {
      failures.push(`minClubs: got ${n}, want ≥ ${expect.minClubs}`);
    }
  }

  if (typeof expect.clubNameIncludes === "string") {
    const name = String(result?.club?.name || "");
    if (!name.toLowerCase().includes(expect.clubNameIncludes.toLowerCase())) {
      failures.push(
        `clubNameIncludes: "${name}" does not include "${expect.clubNameIncludes}"`,
      );
    }
  }

  return failures;
}
