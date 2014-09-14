# WebGL Panorama

Easy-to-use jQuery plugin to display cube map panoramas on a HTML canvas object using WebGL.

#### Downloads

[production version][prod]<br/>
[development version][dev]

[prod]: https://github.com/ulfbiallas/jquery-webglpanorama/raw/master/src/jquery-webglpanorama.min.js
[dev]: https://github.com/ulfbiallas/jquery-webglpanorama/raw/master/src/jquery-webglpanorama.js

#### Demo

Click [here][demo] to see a demo of the plugin.

[demo]: http://ulfbiallas.github.io/jquery-webglpanorama/demo.html

## How to use?
All you need to use *WebGL Panorama* is a canvas object and a 360 degree panorama in shape of a cube map (consisting of 6 images)

```html
<script type="text/javascript" src="jquery-1_0.js"></script>
<script type="text/javascript" src="jquery-panorama.min.js"></script>

<script type="text/javascript">
$(document).ready(function(){

    var data = {
        xp : "xp.png",
        xn : "xn.png",
        yp : "yp.png",
        yn : "yn.png",
        zp : "zp.png",
        zn : "zn.png"
    }
	$('#pano').panorama(data);

});
</script>

<canvas id="pano" width="640" height="400"></canvas>
```

#### Optional parameters
For the moment, there is just one optional parameter:
##### Field of view
To set the field of view, just add the entry 'fov : someValue' to the parameter hash.
If not explicitly set, it is set to its default value which is 90.

## Browser support
Even if *WebGL Panorama* runs with every jQuery version, 
your browser has to support WebGL to work with it!

## License
Copyright (c) 2014 Ulf Biallas. Licensed under the [MIT license][MIT].
[MIT]: https://raw.githubusercontent.com/ulfbiallas/jquery-webglpanorama/master/LICENSE
