const rollup = require("rollup");
const replace = require("rollup-plugin-re")
const babel = require("rollup-plugin-babel")
const minify = require("rollup-plugin-babel-minify");
const glob = require("glob-promise");
const del = require("del");
const copy = require("cpy");
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const gltfImportExport = require("gltf-import-export");
const replaceInFile = require('replace-in-file');

const clean = async function() {
  await del([
    "release/code/**/*",
    "release/assets/**/*"
  ]);
}

const buildCode = async function() {
  const inputOptions = {
    input: "../code/main.js",
    plugins: [
      replace({
        patterns: [{
          include: [ "../code/assets.js" ],
          test: ".gltf",
          replace: ".glb"
        }, {
          include: [ "../code/assets.js" ],
          test: "gltf/",
          replace: ""
        }, {
          include: [ "../code/main.js" ],
          test: "window.DEBUG = true;",
          replace: "window.DEBUG = false;"
        }]
      }),
      babel(),
      minify()
    ]
  };
  const outputOptions = {
    file: "release/code/app.js",
    sourceMap: "inline",
    format: "iife"
  };
  const bundle = await rollup.rollup(inputOptions);
  await bundle.generate(outputOptions);
  await bundle.write(outputOptions);
  await copy("../code/3rdparty/*.js", "release/code/3rdparty");
}

const buildAssets = async function() {
  await Promise.all([
    copy("../assets/fonts/*.{woff,woff2}", "release/assets/fonts"),
    copyCompressPNG("../assets/images/*.png", "release/assets/images"),
    copyConvertMeshes("../assets/meshes/gltf", "release/assets/meshes"),
    copy("../assets/shaders/*.fx", "release/assets/shaders"),
    copy("../assets/sounds/*.mp3", "release/assets/sounds"),
    copy("../assets/texts/*.json", "release/assets/texts")
  ]);
}

const copyCompressPNG = async function(from, to) {
  const files = await glob(from);
  await imagemin(files, to, {
    use: [
      imageminPngquant({
        quality: "50-100",
        speed: 1,
        nofs: true,
        strip: true
      })
    ]
  });
}

const copyConvertMeshes = async function(from, to) {
  // copy meshes files
  await Promise.all([
    copyCompressPNG(`${from}/*.png`, to),
    copy(`${from}/*.{gltf,bin}`, to),
    copy(`${from}/*.manifest`, to, {
      rename: basename => basename.replace(".gltf", ".glb")
    })
  ]);
  // convert .gltf to .glb
  for (const file of await glob(`${to}/*.gltf`))
    gltfImportExport.ConvertGltfToGLB(file, file.replace(".gltf", ".glb"));
  // update manifests version
  await replaceInFile({
    files: `${to}/*.glb.manifest`,
    from: /"version" : 1/,
    to: `"version" : ${Date.now()}`
  });
  // clean up
  await del([ `${to}/*.{gltf,gltf.manifest,bin,png}` ]);
}

const main = async function() {
  try {
    const startTime = Date.now();
    await clean();
    await buildCode();
    await buildAssets();
    console.log("Elapsed: " + (Date.now() - startTime) / 1000);
  } catch (err) {
    console.error(err.message);
  }
}

main();
