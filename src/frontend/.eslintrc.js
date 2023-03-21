module.exports = {
    extends: [
        // add more generic rulesets here, such as:
        // 'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:vue/base',
        // 'plugin:vue/recommended' // Use this if you are using Vue.js 2.x.
    ],
    rules: {
        // override/add rules settings here, such as:
        'vue/no-unused-vars': 'error',
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        // 'vue/script-indent': ['error', 4, {'baseIndent': 1}],
        indent: ['error', 4],
        'vue/html-indent': ['error', 4],
    },
    parserOptions: {
        ecmaVersion: 13,
    }
}