// @ts-nocheck

document.querySelector("font-injector").innerHTML = `<style>
@font-face {
  font-family: Roboto;
  src: url(${pwd}/ui/shared/vendor/google/Roboto-Bold.ttf);
  font-weight: 700;
}
@font-face {
  font-family: Roboto;
  src: url(${pwd}/ui/shared/vendor/google/Roboto-Regular.ttf);
  font-weight: 400;
}
@font-face {
  font-family: "Open Sans";
  src: url(${pwd}/ui/shared/vendor/google/OpenSans-Bold.ttf);
  font-weight: 700;
}
</style>`;
