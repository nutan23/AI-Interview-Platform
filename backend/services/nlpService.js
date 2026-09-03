const natural = require("natural");


// ==========================================
// NLP CONFIGURATION
// ==========================================

const tokenizer = new natural.WordTokenizer();


// ==========================================
// STOP WORDS
// ==========================================

const STOP_WORDS = new Set([
    "a", "an", "the",
    "and", "or", "but",

    "is", "are", "was", "were",
    "be", "been", "being",

    "to", "of", "in", "on", "at",
    "for", "from", "with", "by", "as",

    "i", "me", "my",
    "we", "our",
    "you", "your",
    "he", "she",
    "they", "them", "their",

    "it", "this", "that",
    "these", "those",

    "have", "has", "had",
    "do", "does", "did",

    "will", "would",
    "can", "could",
    "should", "may",
    "might", "must",

    "am"
]);


// ==========================================
// RESUME NOISE WORDS
// ==========================================

const RESUME_NOISE_WORDS = new Set([
    "resume",
    "curriculum",
    "vitae",

    "name",
    "email",
    "phone",
    "mobile",
    "contact",
    "address",

    "linkedin",
    "gmail",
    "yahoo",
    "outlook",
    "com",

    "objective",
    "career",
    "profile",
    "summary",

    "education",
    "educational",
    "qualification",

    "skills",
    "skill",

    "project",
    "projects",

    "certificate",
    "certificates",
    "certification",
    "certifications",

    "experience",
    "experiences",

    "college",
    "university",
    "school",

    "completed",
    "completion",

    "year",
    "years",
    "month",
    "months",

    "present",
    "currently",

    "personal",
    "details",

    "language",
    "languages",

    "known",

    "using",
    "used",

    "based",
    "developed",
    "worked",
    "working",

    "knowledge",
    "basic",
    "good"
]);


// ==========================================
// TECHNICAL SKILLS
// ==========================================

const TECHNICAL_SKILLS = [
    "java",
    "python",
    "javascript",
    "typescript",
    "html",
    "css",

    "react",
    "reactjs",
    "angular",
    "vue",

    "node",
    "nodejs",
    "express",
    "expressjs",

    "spring",
    "spring boot",
    "springboot",

    "mysql",
    "postgresql",
    "mongodb",
    "sql",
    "sqlite",
    "oracle",
    "redis",
    "tidb",

    "machine learning",
    "deep learning",
    "artificial intelligence",
    "data science",
    "data engineering",

    "nlp",
    "natural language processing",

    "cnn",
    "rnn",
    "lstm",

    "tensorflow",
    "keras",
    "pytorch",
    "opencv",

    "scikit learn",
    "scikit-learn",

    "power bi",
    "powerbi",
    "tableau",

    "pandas",
    "numpy",
    "matplotlib",

    "aws",
    "azure",
    "gcp",
    "google cloud",

    "docker",
    "kubernetes",

    "git",
    "github",
    "postman",

    "rest api",
    "restful api",
    "api",

    "dbms",
    "dsa",
    "data structures",
    "algorithms",

    "computer networks",
    "operating system",

    "cyber security",
    "cybersecurity",

    "blockchain"
];


// ==========================================
// NORMALIZE TEXT
// ==========================================

function normalizeText(text) {

    if (!text) {
        return "";
    }

    return String(text)
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


// ==========================================
// TOKENIZE TEXT
// ==========================================

function tokenizeText(text) {

    const normalizedText =
        normalizeText(text);

    return tokenizer.tokenize(
        normalizedText
    );
}


// ==========================================
// VALID KEYWORD CHECK
// ==========================================

function isValidKeyword(token) {

    if (!token) {
        return false;
    }

    const word =
        token.toLowerCase();


    // Too short
    if (word.length < 3) {
        return false;
    }


    // Stop words
    if (STOP_WORDS.has(word)) {
        return false;
    }


    // Resume noise
    if (RESUME_NOISE_WORDS.has(word)) {
        return false;
    }


    // Pure numbers
    if (/^\d+$/.test(word)) {
        return false;
    }


    // URL / email fragments
    const internetNoise = [
        "www",
        "http",
        "https",
        "mailto",
        "gmail",
        "yahoo",
        "outlook",
        "linkedin",
        "com",
        "org",
        "net",
        "edu"
    ];

    if (internetNoise.includes(word)) {
        return false;
    }


    return true;
}


// ==========================================
// REMOVE STOP WORDS / NOISE
// ==========================================

function removeStopWords(tokens) {

    if (!Array.isArray(tokens)) {
        return [];
    }

    return tokens.filter(
        token => isValidKeyword(token)
    );
}


// ==========================================
// KEYWORD FREQUENCY
// ==========================================

function getKeywordFrequency(tokens) {

    const frequency = {};


    if (!Array.isArray(tokens)) {
        return [];
    }


    tokens.forEach(token => {

        const word =
            token.toLowerCase();


        if (!isValidKeyword(word)) {
            return;
        }


        if (!frequency[word]) {
            frequency[word] = 0;
        }


        frequency[word]++;

    });


    return Object.entries(frequency)
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(
            0,
            20
        )
        .map(
            ([word, count]) => ({
                word,
                count
            })
        );
}


// ==========================================
// TECHNICAL SKILL EXTRACTION
// ==========================================

function extractSkills(text) {

    const normalizedText =
        normalizeText(text);


    if (!normalizedText) {
        return [];
    }


    const foundSkills = [];


    TECHNICAL_SKILLS.forEach(skill => {

        const escapedSkill =
            skill.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );


        const pattern =
            new RegExp(
                `(^|[^a-z0-9])${escapedSkill}([^a-z0-9]|$)`,
                "i"
            );


        if (pattern.test(normalizedText)) {

            foundSkills.push(
                skill
            );

        }

    });


    return [
        ...new Set(foundSkills)
    ];
}


// ==========================================
// COMPLETE NLP ANALYSIS
// ==========================================

function analyzeResumeText(text) {

    const normalizedText =
        normalizeText(text);


    const tokens =
        tokenizeText(
            normalizedText
        );


    const filteredTokens =
        removeStopWords(
            tokens
        );


    const keywords =
        getKeywordFrequency(
            filteredTokens
        );


    const skills =
        extractSkills(
            normalizedText
        );


    return {

        totalTokens:
            tokens.length,

        meaningfulTokens:
            filteredTokens.length,

        filteredTokens:
            filteredTokens,

        keywords:
            keywords,

        skills:
            skills

    };
}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    normalizeText,

    tokenizeText,

    removeStopWords,

    getKeywordFrequency,

    extractSkills,

    analyzeResumeText

};