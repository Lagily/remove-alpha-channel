import { saveAs } from "file-saver";
import React, { useEffect } from "react";
import "./App.css";
var JSZip = require("jszip");

function App() {
  useEffect(() => {
    const $ = document.querySelector.bind(document);
    // trigger input
    $("#triggerFile").addEventListener("click", evt => {
      evt.preventDefault();
      $("input[type=file]").click();
    });

    // drop events
    $("#drop").ondragleave = evt => {
      $("#drop").classList.remove("active");
      evt.preventDefault();
    };
    $("#drop").ondragover = $("#drop").ondragenter = evt => {
      $("#drop").classList.add("active");
      evt.preventDefault();
    };
    $("#drop").ondrop = evt => {
      $("input[type=file]").files = evt.dataTransfer.files;
      evt.preventDefault();
      $("input[type=file]").dispatchEvent(new Event("change"));
    };

    $(".importar").addEventListener("click", () => {
      $(".list-files").innerHTML = "";
      $("footer").classList.remove("hasFiles");
      $(".importar").classList.remove("active");
      setTimeout(() => {
        $("#drop").classList.remove("hidden");
      }, 500);
    });

    // input change
    $("input[type=file]").addEventListener("change", handleFileSelect);
  }, []);

  return (
    <div className="upload">
      <div className="upload-files">
        <header>
          <p>
            <i className="fa fa-cloud-upload" aria-hidden="true"></i>
            <span className="up">up</span>
            <span className="load">load</span>
          </p>
          <span style={{color: "white"}}>The alpha channel of the images is removed as per iOS Apple requirements. No image is ever uploaded, the conversion takes place in your browser via <a style={{color: "white"}} target="_blank" href="https://developer.mozilla.org/en-US/docs/WebAssembly">Web Assembly</a>.</span>
        </header>
        <div className="body" id="drop">
          <i className="fa fa-file-text-o pointer-none" aria-hidden="true"></i>
          <p className="pointer-none">
            <b>Drag and drop</b> files here <br /> or{" "}
            <a href="" id="triggerFile">
              browse
            </a>{" "}
            to begin the conversion
          </p>
          <input type="file" multiple="multiple" />
        </div>
        <footer>
          <div className="divider">
            <span>FILES</span>
          </div>
          <div className="list-files"></div>
          <button className="importar">Convert more</button>
        </footer>
      </div>
    </div>
  );
}

function ReadFile(file) {
  let readFile = window.magick.CreatePromiseEvent();

  // read fileName & content
  let fr = new FileReader();
  fr.onload = function(txt) {
    let fileName = file.name;

    let encoded_txt = txt.target.result;
    let content = new Uint8Array(encoded_txt);
    let sourceFilename = fileName;

    readFile["resolve"]([sourceFilename, content]);
  };
  fr.readAsArrayBuffer(file);

  return readFile;
}

function handleFileSelect(evt) {
  const $ = document.querySelector.bind(document);
  const files = evt.target.files; // FileList object

  //files template
  let template = `${Object.keys(files)
    .map(
      file => `<div class="file file--${file}">
   <div class="name"><span>${files[file].name}</span></div>
   <div class="progress active"></div>
   <div class="done">
<a href="" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000">
  <g><path id="path" d="M500,10C229.4,10,10,229.4,10,500c0,270.6,219.4,490,490,490c270.6,0,490-219.4,490-490C990,229.4,770.6,10,500,10z M500,967.7C241.7,967.7,32.3,758.3,32.3,500C32.3,241.7,241.7,32.3,500,32.3c258.3,0,467.7,209.4,467.7,467.7C967.7,758.3,758.3,967.7,500,967.7z M748.4,325L448,623.1L301.6,477.9c-4.4-4.3-11.4-4.3-15.8,0c-4.4,4.3-4.4,11.3,0,15.6l151.2,150c0.5,1.3,1.4,2.6,2.5,3.7c4.4,4.3,11.4,4.3,15.8,0l308.9-306.5c4.4-4.3,4.4-11.3,0-15.6C759.8,320.7,752.7,320.7,748.4,325z"</g>
  </svg>
          </a>
   </div>
  </div>`
    )
    .join("")}`;

  $("#drop").classList.add("hidden");
  $("footer").classList.add("hasFiles");
  $(".importar").classList.add("active");
  setTimeout(() => {
    $(".list-files").innerHTML = template;
  }, 1000);

  Object.keys(files).forEach(file => {
    let load = 2000 + file * 2000; // fake load
    setTimeout(() => {
      $(`.file--${file}`)
        .querySelector(".progress")
        .classList.remove("active");
      $(`.file--${file}`)
        .querySelector(".done")
        .classList.add("anim");
    }, load);
  });

  processFiles(evt.target.files);
}

async function processFiles(files) {
  const len = files.length;
  //if images
  if (len > 0) {
    // for each file requested split them (files isn't an array)
    let processedImages = [];
    let failedProcessing = false;

    for (let fileIndex = 0; fileIndex < files.length; ++fileIndex) {
      let [fileName, content] = await ReadFile(files[fileIndex]);
      try {
        let destFilename = fileName + "_dest";
        let splitFiles = await window.magick.Call(
          [{ name: fileName, content: content }],
          [
            "convert",
            fileName,
            "-background",
            "white",
            "-alpha",
            "off",
            destFilename
          ]
        );
        console.log("HERE");
        processedImages.push(...splitFiles);
      } catch (e) {
        if (!failedProcessing) {
          failedProcessing = true;

          // TODO show failure
        }
      }
    }

    const outImages = [];
    for (let file of processedImages) {
      const outImage = {};

      outImage.src = URL.createObjectURL(file["blob"]);
      outImage.className = "split-image";
      outImage.name = file["name"];
      outImage.wasmResponse = file;
      // imageHolder.appendChild(img);
      console.log("processed image ", file);

      outImages.push(outImage);
    }

    console.log(outImages);
    if (outImages.length > 1) GenerateZip(outImages);
    else if (outImages.length === 1) {
      saveAs(outImages[0].wasmResponse.blob, outImages[0].name.replace("_dest", ""));
    }
  }
}

function GenerateZip(processedImages) {
  let zip = new JSZip();

  for (let i = 0; i < processedImages.length; i++) {
    let child = processedImages[i].wasmResponse;

    zip.file(child.name, child["blob"]);
  }
  zip.generateAsync({ type: "blob" }).then(function(content) {
    saveAs(content, "converted_files.zip");
  });
}
export default App;
