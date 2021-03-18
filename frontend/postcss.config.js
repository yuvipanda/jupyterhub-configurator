module.exports = {
  // These two are needed to include bootstrap globally
  // See https://getbootstrap.com/docs/4.0/getting-started/webpack/#importing-precompiled-sass
  plugins: [require("autoprefixer"), require("precss")],
};
