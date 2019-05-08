module.exports = {
  "extends": "airbnb-base",
  "env": {
    "jest": true
  },
  "rules": {
    "comma-dangle": [
      "error",
      "never"
    ],

    "indent": [
      "error",
      2
    ],

    "linebreak-style": 0,
    "prefer-destructuring": "off",
    "no-console": "off",
    "no-return-await": "off",
    "no-undef": "warn",
    "no-unused-vars": "warn",
    "no-use-before-define": "off",
    "no-await-in-loop": "warn",
    "no-nested-ternary": "off",
    "no-restricted-syntax": "warn",
    "arrow-parens": ["error", "as-needed", { "requireForBlockBody": false }],

    "semi": [
      "error",
      "never"
    ]
  }
}
