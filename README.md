Practical and realistic Web Assembly use case
If you are a regular tech blog reader, chances are that you have come into contact with WebAssembly (Wasm) and the hype that surrounds it. Put simply, WebAssembly is a byte code that can be executed by web browsers, which means that applications written in any language could be compiled into WebAssembly and then executed in your browser. The hype brings many quality articles and talks demonstrating use cases and advantages, such as fully coding your GUI in C++.
Getting your app into Google Play is an easy task, but Apple's App Store makes things a tad more difficult. Amongst many requirements, your app icon images must not have an alpha channel. Even if said alpha channel is unused. Now removing the alpha channel is not rocket sciene and a matter of minutes, using ImageMagick (written in C++) it can be achieved with a simple one liner:
TODO
So what if we wanted to create a website where we can supply our images and automatically remove all alpha channels? The typical architecture could look something like this:
TODO
While this is a typical application for a web app, especially one handling image manipulation, using Wasm we can do better! We want to create a progressive web app that works without an internet connection. This brings the advantage that the user has to load the website once and then he won't need an internet connection again. This won't be possible if our image manipulation happens on a server, so let's take a look at our new architecture:
TODO
Yep, that's it. We will have all our logic in the frontend, no images are ever uploaded to any server. But we won't be using any Javascript image manipulation library, instead we want to use ImageMagick, which we already know and love. But there is one problem, it's an executable, how do we get it into our code base in a way that we can execute it from our JS?
Luckily someone has already done most of the work for us and recompiled the ImageMagick code base into WebAssembly, ready to be used in browsers. By simply using a high level Javascript API we can now use the full power (well almost) of ImageMagick in our frontend. Let's start by importing the ES module using a script tag for simplicity reasons, the package is also available on npm.