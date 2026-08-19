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

export function splitList(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
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

function splitStory(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildCaseStudySections(project) {
  const shortCopy = splitStory(project?.shortDescription);
  const longCopy = splitStory(project?.longDescription);

  return [
    {
      label: "Problem",
      body:
        shortCopy[0] ||
        "Use the admin to describe the brief, audience tension, or business challenge behind this project.",
    },
    {
      label: "Idea",
      body:
        longCopy[0] ||
        "Use this section to explain the framing, creative angle, and core narrative move that shaped the work.",
    },
    {
      label: "Execution",
      body:
        longCopy[1] ||
        project?.tools ||
        "Describe how the concept moved through production, editing, motion, design, or delivery.",
    },
    {
      label: "Why it worked",
      body:
        longCopy.slice(2).join(" ") ||
        project?.credits ||
        "Summarize the outcome, feeling, or result that made the piece land.",
    },
  ];
}
