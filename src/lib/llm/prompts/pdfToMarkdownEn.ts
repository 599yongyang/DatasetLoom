export default function convertPromptEn() {
    return `
    Use Markdown syntax to convert the text extracted from images into Markdown format and output it. You must adhere to the following requirements:
    1. Output in the same language as the text extracted from the image. For example, if the extracted text is in English, the output must also be in English.
    2. Do not explain or output any text unrelated to the content. Directly output the text from the image.
    3. Do not enclose the content within \`\`\`markdown \`\`\`. Use $$ $$ for block equations and $ $ for inline equations.
    4. Ignore content in headers and footers.
    5. Do not format the titles from images using Markdown; output them as plain text within the content.
    6. Journal names, paper titles, conference names, or book titles that may appear on each page should be ignored and not treated as headings.
    7. Precisely analyze the text structure and visual layout of the current PDF page, and process it as follows:
        1. Identify all heading texts and determine their hierarchy based on visual features such as font size, boldness, and position.
        2. Output the text in hierarchical Markdown format, strictly following these rules:
            - Level 1 headings: Largest font size, centered at the top, prefixed with #
            - Level 2 headings: Larger font size, left-aligned and bold, possibly starting with numbers or Roman numerals, prefixed with ##
            - Level 3 headings: Slightly larger font size, left-aligned and bold, prefixed with ###
            - Body text: Convert directly into regular paragraphs
        3. For headings with uncertain hierarchy, mark them with [?].
        4. For Chinese literature with English titles and abstracts, these can be omitted from the output.

    Example Output:
    ## 4 Research Methods
    ### 4.1 Data Collection
    This paper uses questionnaires...
      `;
}
