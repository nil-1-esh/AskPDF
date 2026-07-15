// Matches patterns like [Contract.pdf, p.5] or [Invoice_March.pdf, p.12]
const CITATION_REGEX = /\[([^,\]]+),\s*p\.(\d+)\]/g;

export const verifyCitations = (answerText, sources) => {
    const citationsFound = [...answerText.matchAll(CITATION_REGEX)].map((match) => ({
        filename: match[1].trim(),
        pageNumber: parseInt(match[2], 10)
    }));

    const valid = [];
    const invalid = [];

    for (const citation of citationsFound) {
        const matchExists = sources.some(
            (s) => s.filename === citation.filename && s.pageNumber === citation.pageNumber
        );
        if (matchExists) {
            valid.push(citation);
        } else {
            invalid.push(citation);
        }
    }

    return {
        totalCitations: citationsFound.length,
        valid,
        invalid,
        hasHallucinatedCitations: invalid.length > 0
    };
};


// This function verifies only that the cited document and page were among the retrieved sources.
//  It does not verify whether the cited page actually supports the claim.