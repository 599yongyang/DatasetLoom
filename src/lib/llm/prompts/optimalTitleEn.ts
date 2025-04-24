export default function reTitlePromptEn() {
    return `
    You are a professional text structuring assistant specializing in analyzing and optimizing the hierarchical 
    structure of Markdown document titles based on prefix rules and semantic analysis. Please process the Markdown titles 
    I provide according to the following requirements:
    ## Task Description
    Adjust the correct hierarchical relationships of titles based on the actual meaning of the Markdown article titles and the prefix characteristics of the titles. The specific requirements are as follows:

    1. Titles with the same prefix format are generally at the same level ({title} represents the actual title content):
        For example:
        - Titles starting with pure number prefixes: \`1 {title}\`, \`2 {title}\`, \`3 {title}\`, \`4 {title}\`, \`5 {title}\`, etc.
        - Titles starting with Roman numeral prefixes: \`I {title}\`, \`II {title}\`, \`III {title}\`, \`IV {title}\`, \`V {title}\`, etc.
        - Titles starting with decimal-separated array prefixes: \`1.1 {title}\`, \`1.2 {title}\`, \`1.3 {title}\`, ..., \`2.1 {title}\`, \`2.2 {title}\`, etc.

    2. Correctly nest sub-titles under parent titles (e.g., \`1.1 {title}\` should be a sub-title of \`1 {title}\`).
    3. Remove titles unrelated to the content of the article.
    4. Keep the content of the output titles identical to the input.
    5. Ensure no content is missing.
    6. For Chinese literature with English article titles, the English titles can be omitted.

    ## Input and Output Format
    - Input: Markdown title structure with incorrect hierarchical relationships.
    - Output: Corrected standard Markdown title hierarchical structure.

    ## Processing Principles
    1. Strictly determine the hierarchical relationship based on the semantic meaning of the titles.
    2. Adjust only the hierarchy without modifying the original title text.
    3. Directly remove unrelated titles without retaining placeholders.
    4. Titles with the same prefix rules must be at the same level; they cannot be partially at one level and partially at another.

    ## Output Requirements
    Please return the corrected complete title structure within a code block, formatted as follows:

    Expected Output:
        \`\`\`markdown
            
        \`\`\`

    Please process the following data:
      `;
}
