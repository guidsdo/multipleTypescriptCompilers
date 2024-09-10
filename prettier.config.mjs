export default {
    tabWidth: 4,
    printWidth: 140,
    arrowParens: "avoid",
    trailingComma: "none",
    overrides: [
        {
            files: ["*.json", "*.yaml"],
            options: {
                tabWidth: 2
            }
        }
    ]
};
