function splitBalanced(value, lineCount = 3) {
  const words = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (!words.length) return [];
  if (words.length <= lineCount) return words;

  const totalChars = words.reduce((count, word) => count + word.length, 0);
  const targetChars = Math.max(1, totalChars / lineCount);
  const lines = [];
  let currentLine = [];
  let currentChars = 0;

  words.forEach((word, index) => {
    const remainingWords = words.length - index;
    const remainingLines = lineCount - lines.length;
    const lineValue = currentLine.length ? `${currentLine.join(" ")} ${word}` : word;
    const nextChars = currentChars + word.length;

    if (
      currentLine.length &&
      nextChars > targetChars &&
      remainingWords >= remainingLines
    ) {
      lines.push(currentLine.join(" "));
      currentLine = [word];
      currentChars = word.length;
      return;
    }

    currentLine = lineValue.split(" ");
    currentChars = lineValue.replace(/\s+/g, "").length;
  });

  if (currentLine.length) {
    lines.push(currentLine.join(" "));
  }

  return lines;
}

export function buildRoleLines(value) {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const ampersandParts = clean.split("&").map((part) => part.trim()).filter(Boolean);
  if (ampersandParts.length === 2) {
    const [lead, trail] = ampersandParts;
    const trailWords = trail.split(" ").filter(Boolean);

    if (lead && trailWords.length >= 2) {
      return [
        lead,
        `& ${trailWords[0]}`,
        trailWords.slice(1).join(" "),
      ].filter(Boolean);
    }
  }

  return splitBalanced(clean, 3);
}
