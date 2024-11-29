module.exports = {
  content: ['dist/**/*.js', 'dist/**/*.html'],
  css: ['dist/**/styles*.css'],
  fontFace: true,
  keyframes: false,
  variables: false,
  safelist: {
    deep: [/--purge-ignore$/],
    standard: [/\!|\[|%|:|\.|\//],
  },
};
