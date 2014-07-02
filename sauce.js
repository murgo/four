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

        // some example engine options
        var options = {
            positionIterations: 6,
            velocityIterations: 4,
            enableSleeping: false
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
        World.add(_world, [
            Bodies.rectangle(400, -offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
            Bodies.rectangle(400, 600 + offset, 800.5 + 2 * offset, 50.5, { isStatic: true }),
            Bodies.rectangle(800 + offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true }),
            Bodies.rectangle(-offset, 300, 50.5, 600.5 + 2 * offset, { isStatic: true })
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

    function imageLoaded(url, width, height) {
        var _world = _engine.world;

        var stack = Composites.stack(20, 20, 15, 4, 0, 0, function(x, y, column, row) {
            // round the edges of some bodies
            
            var sprite = { texture: url };
            var w = Common.random(10, 200);
            var ratio = w / width;
            var h = ratio * height;
            sprite.xScale = ratio;
            sprite.yScale = ratio;

            return Bodies.rectangle(x, y, w, h, { angle: Common.random(0, 2*Math.PI), render: { sprite: sprite } });
        });

        World.add(_world, stack);
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
                parsed.push(js.tim + js.ext)
            }
        
            $.each(js, function(k,v) {
                // k is either an array index or object key
                parseJson(v);
            });
        }
    }
    
    function loadImages() {
    /*
        $.getJson("json", {board: board}, function(data) {
            parseJson(data);
            loadImage(0);
        });
        */
    };
    
    function loadImage(i) {
        var img = new Image();
        img.addEventListener('load', function() {
            imageLoaded(img.src, img.naturalWidth, img.naturalHeight);
            setTimeout(function() { loadImage(i + 1}, 1000);
        }, false);
        img.src = 'http://narf-archive.com/pix/ca639b9e18fda05a6cc2eb1eed668c212c41d0ab.gif';
        //img.src = "http://i.4cdn.org/" + board + "/" + parsed[i];
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
