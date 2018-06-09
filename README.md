[Datanimusic](https://github.com/erich666/turk)
====

An Animusic-inspired machine that plays classical music with ball bearings, and shows a summary of the notes played.

[Run the demo!](https://bit.ly/datanimusic)

[![Screenshot](http://erich.realtimerendering.com/datanimusic/screenshot1.png)](https://github.com/erich666/turk)

Inspired by the Animusic video "Pipe Dream" ([watch it on YouTube](http://www.youtube.com/watch?v=hyCIpKAIFyo)) and [Euphony](https://github.com/qiao/euphony) by [Xueqiao Xu](https://github.com/qiao).
Built atop the [Musical Turk](http://ulysse.io/turk) framework by [Ulysse Carion](http://ulysse.io).

Made with help from:

* [three.js](https://github.com/mrdoob/three.js)
* [MIDI.js](http://mudcu.be/midi-js)
* [jasmid](https://github.com/gasman/jasmid)
* [jQuery](http://jquery.com)
* [bootstrap](http://twitter.github.com/bootstrap)

and a lot of the code and _all_ of the pieces are from [Euphony](https://github.com/qiao/euphony).

The PipeGeometry is an update of the [TubeGeometry code](https://github.com/Troilk/cs291-contest) by [Vitalii Maslikov](https://github.com/Troilk).

Because it requires high-precision MIDI playing, this demo is usually best with Chrome. I recommend letting it run half a minute when you start up, so that all the libraries needed load and are in cache, then refresh the web page. Even then there's a glitch at the beginning of any tune - I may figure that out someday (hints appreciated). Note that you can interact at any point during the animation and take control. When you change music, you may also need to hit "reload."

Just not working but you want to see the thing run? See [the YouTube video](https://youtu.be/plBX-CFx5DM), with the starting glitch and all.
