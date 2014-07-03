(function() {
    // Matter aliases
    var Engine = Matter.Engine,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        RenderPixi = Matter.RenderPixi,
        Events = Matter.Events,
        Bounds = Matter.Bounds,
        Vector = Matter.Vector,
        Vertices = Matter.Vertices,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Query = Matter.Query;

    var _engine,
        _mouseConstraint,
        _isMobile = /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent);
    
    function init() {
        var container = document.getElementById('canvas-container');

        var w = $(window).width() - 25;
        var h = $(window).height() - 25;

        var options = {
            positionIterations: 6,
            velocityIterations: 4,
            enableSleeping: false,
            world: {
                bounds: {
                    min: {x: 0, y: 0},
                    max: {x: w, y: h}
                }
            },
            render: {
                options: {
                    width: w,
                    height: h
                },
                bounds: {
                    min: {x: 0, y: 0},
                    max: {x: w, y: h}
                }
            }
        };

        // create a Matter engine
        // NOTE: this is actually Matter.Engine.create(), see the aliases at top of this file
        _engine = Engine.create(container, options);

        // add a mouse controlled constraint
        _mouseConstraint = MouseConstraint.create(_engine);
        World.add(_engine.world, _mouseConstraint);

        // run the engine
        Engine.run(_engine);

        reset();
        pipe();

        var renderOptions = _engine.render.options;
        renderOptions.wireframes = false;
        //renderOptions.showAngleIndicator = false;

        if (window.chrome)
            renderOptions.showShadows = true;
            
        loadImages();
    };

    if (window.addEventListener) {
        window.addEventListener('load', init);
    } else if (window.attachEvent) {
        window.attachEvent('load', init);
    }
    
    function pipe() {
        var w = $(window).width() - 25;
        var h = $(window).height() - 25;
        var pipe = $("#pipe");
        var left = (w - pipe.width()) / 2;
        var top = h - pipe.height();
        pipe.css({top: top, left: left});

        var inputDiv = $("#board-div");
        inputDiv.css({top: top + 150, left: (w - inputDiv.width()) / 2 });
        var input = $("#input-board");
        input.val(board);
        input.keyup(function(event){
            if(event.keyCode == 13){
                window.location.href = "?board=" + input.val();
            }
        });        

        var pipewidth1 = 235;
        var pipeheight1 = 89;
        var pipewidth2 = 181;
        var pipeheight2 = 213;
        var offset = 8;
        World.add(_engine.world, [
            Bodies.rectangle(left + pipe.width() / 2 - offset, top + pipeheight1 / 2 - offset, pipewidth1, pipeheight1, { isStatic: true }),
            Bodies.rectangle(left + pipe.width() / 2 - offset, top + pipeheight1 + pipeheight2 / 2 - offset, pipewidth2, pipeheight2, { isStatic: true }),
        ]);
    }

    function reset() {
        var _world = _engine.world;
        
        World.clear(_world);
        Engine.clear(_engine);

        // clear scene graph (if defined in controller)
        var renderController = _engine.render.controller;
        if (renderController.clear)
            renderController.clear(_engine.render);

        // reset id pool
        Common._nextId = 0;

        // reset mouse offset and scale (only required for Demo.views)
        Mouse.setScale(_engine.input.mouse, { x: 1, y: 1 });
        Mouse.setOffset(_engine.input.mouse, { x: 0, y: 0 });

        _engine.enableSleeping = false;
        _engine.world.gravity.y = 1;
        _engine.world.gravity.x = 0;
        _engine.timing.timeScale = 1;

        var offset = 5;
        var x2 = _engine.render.options.width;
        var y2 = _engine.render.options.height;
        var x1 = x2 / 2;
        var y1 = y2 / 2;
        var asd = 50.5;
        World.add(_world, [
            Bodies.rectangle(x1, -offset, x2 + 2 * offset, asd, { isStatic: true }),
            Bodies.rectangle(x1, y2 + offset, x2 + 2 * offset, asd, { isStatic: true }),
            Bodies.rectangle(x2 + offset, y1, asd, y2 + 2 * offset, { isStatic: true }),
            Bodies.rectangle(-offset, y1, asd, y2 + 2 * offset, { isStatic: true })
        ]);

        _mouseConstraint = MouseConstraint.create(_engine);
        World.add(_world, _mouseConstraint);
        
        var renderOptions = _engine.render.options;
        renderOptions.wireframes = true;
        renderOptions.hasBounds = false;
        renderOptions.showDebug = false;
        renderOptions.showBroadphase = false;
        renderOptions.showBounds = false;
        renderOptions.showVelocity = false;
        renderOptions.showCollisions = false;
        renderOptions.showAxes = false;
        renderOptions.showPositions = false;
        renderOptions.showAngleIndicator = true;
        renderOptions.showIds = false;
        renderOptions.showShadows = false;
        renderOptions.background = '#fff';

        if (_isMobile)
            renderOptions.showDebug = true;
    };

    function createBody(url, width, height) {
        var sprite = { texture: url };
        var w = Common.random(50, 200);
        var ratio = w / width;
        var h = ratio * height;
        sprite.xScale = ratio;
        sprite.yScale = ratio;
        
        var x = _engine.render.options.width / 2;
        var y = _engine.render.options.height / 2;

        var body = Bodies.rectangle(x, y, w, h, { angle: Common.random(0, 2*Math.PI), torque: Common.random(0, 150) * ratio, render: { sprite: sprite } });
        Body.applyForce(body, { x: x, y: y } , { x: Common.random(-2, 2) * ratio, y: Common.random(-2, 0) * ratio });
        return body;
    }
    
    function imageLoaded(url, width, height) {
        var _world = _engine.world;

        /*
        var stack = Composites.stack(20, 20, 15, 4, 0, 0, function(x, y, column, row) {
            return createBody(url, x, y, width, height);
        });

        World.add(_world, stack);
        */
        World.add(_world, createBody(url, width, height));
    };
    
    var board = 'b';
    var params = getSearchParameters();
    if (params.board !== undefined) {
        board = params.board;
    }

    var parsed = [];
    function parseJson(js) {
        if (typeof js == "object") {
            if (js.ext !== undefined && js.tim !== undefined) {
                //parsed.push(js.tim + js.ext);
                parsed.push(js.tim + "s.jpg"); // thumbnail
            }
        
            $.each(js, function(k,v) {
                // k is either an array index or object key
                parseJson(v);
            });
        }
    }
    
    function loadImages() {
        $.getJSON("json/" + board + "/catalog.json", null, function(data) {
            parseJson(data);
            loadImage(0);
        });
    };
    
    function loadImage(i) {
        var img = new Image();
        img.addEventListener('load', function() {
            imageLoaded(img.src, img.naturalWidth, img.naturalHeight);
            setTimeout(function() { loadImage(i + 1); }, 1000);
        }, false);
        img.addEventListener('error', function() {
            setTimeout(function() { loadImage(i + 1); }, 1000);
        }, false);
        img.addEventListener('click', function() { console.log('clicked' + parsed[i] )}, false);
        //img.src = "http://t.4cdn.org/" + board + "/" + parsed[i];
        img.src = "t/" + board + "/" + parsed[i];
    }

    function getSearchParameters() {
          var prmstr = window.location.search.substr(1);
          return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
    }

    function transformToAssocArray( prmstr ) {
        var params = {};
        var prmarr = prmstr.split("&");
        for ( var i = 0; i < prmarr.length; i++) {
            var tmparr = prmarr[i].split("=");
            params[tmparr[0]] = tmparr[1];
        }
        return params;
    }
})();
