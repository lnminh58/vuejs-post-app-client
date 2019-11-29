module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', '@vue/airbnb'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/prefer-default-export': 0,
    'import/no-cycle': 0,
    'no-shadow': 1,
    'comma-dangle': 0,
    'import/extensions': 0,
    'import/no-unresolved': [2, {
      amd: true,
      ignore: ['@/']
    }],
    'space-before-function-paren': 0,
    'arrow-parens': [2, 'as-needed'],
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
};
