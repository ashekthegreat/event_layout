$(function () {
    $("#accordion").accordion({
        header:"> div > h3",
        heightStyle:"fill",
        active:2
    }).sortable({
            axis:"y",
            handle:"h3",
            stop:function (event, ui) {
                ui.item.children("h3").triggerHandler("focusout");
            }
        });
    $(".applySpinner").spinner({ min:1 });
});
$(function () {

});
var store = {"boxes": []};
var selected = false;
var startX = 0;
var startY = 0;
var endX = 600;
var endY = 600;
var canvasWidth = endX- startX;
var canvasHeight = endY-startY;
var gridWidth = 10;
var gridHeight = 10;
var grid;
var paper = false;
var zoomFactor = 1;

$(function () {
    function init(){
        var startVal =1;
        var newVal = 1;
        $(".zoom-control").slider({
            orientation:"vertical",
            range:false,
            min:1,
            max:5,
            value:1,
            step: 1,
            animate: "fast",
            start: function( event, ui ) {
                startVal = ui.value;
            },
            stop: function( event, ui ) {
                newVal = ui.value;
                $("#paper").width(600*newVal);
                $("#paper").height(600*newVal);
                zoomFactor = newVal;
                paper.gridWidth = gridWidth * newVal;
                paper.gridHeight = gridHeight * newVal;
                paper.setSize(canvasWidth*newVal, canvasHeight*newVal);
                paper.setViewBox(0, 0, 600 , 600 , true);
                return;

                var factor = newVal/ startVal;
                zoomFactor = newVal;
                $(".zoom-amount").html(ui.value + "x");
                store.paper.forEach(function (el) {
                    el.scale(factor, factor, 0, 0);
                });
                paper.gridWidth = gridWidth * newVal;
                paper.gridHeight = gridHeight * newVal;
                buildGrid();


/*                $.each(store, function(i, val){
                    if(val.length){
                        $.each(val, function(j, itm){
                            itm.undrag();
                            applyDraggable(itm)
                        });
                    } else{
                        //val.scale(zoomFactor, zoomFactor);
                    }
                });*/
            },
            slide:function (event, ui) {
            }
        });
        $(".zoom-amount").html($(".zoom-control").slider("value"));
    }

    init();

    paper = Raphael(document.getElementById("paper"), endX, endY);
    store.paper = paper;
    paper.gridWidth = gridWidth;
    paper.gridHeight = gridHeight;


    // draw background image
    store.image = paper.image("img/floor.png", 0, 0, 600, 600);

    $("#paper").draggable({handle:"image, image+path"});

    $("#paper").click(function (e) {
        if(e.target.nodeName=="circle" || e.target.nodeName=="rect"){
            return;
        }
        deSelectElement();
    });

    function buildGrid() {
        var gridPath = "";
        for (var i = 1; i <= endX*zoomFactor / paper.gridWidth; i++) {
            gridPath += "M" + (i * paper.gridWidth - 0.5) + " " + startY;
            gridPath += "V" + endY;
        }
        for (i = 1; i <= endY*zoomFactor / paper.gridHeight; i++) {
            gridPath += "M0 " + (i * paper.gridHeight - 0.5);
            gridPath += "H" + endX;
        }
        grid = paper.path(gridPath);
        grid.attr({"stroke":"#EEEEEE"});
        store.grid = grid;
    }

    buildGrid();

    function selectElement(c){
        if(selected){
            selected.freeTransform.hideHandles();
        }

        c.toFront();
        selected = c;
        var ft = c.freeTransform;
        ft.showHandles();

        $(".placeholder").hide();
        $(".measurement").show();

        $(".dimension-height").val((ft.attrs.scale.y * ft.attrs.size.y).toFixed(0));
        $(".dimension-width").val((ft.attrs.scale.x * ft.attrs.size.x).toFixed(0));
        $(".rotation-degree").val(ft.attrs.rotate.toFixed(2));

        ft.showHandles();
    }
    function deSelectElement(){
        console.log(selected);
        if(selected){
            var ft = selected.freeTransform;

            ft.hideHandles();

            $(".placeholder").hide();
            $(".measurement").show();

            $(".dimension-height").val(0);
            $(".dimension-width").val(0);
            $(".rotation-degree").val(0);

        }
        selected = undefined;

        $(".placeholder").show();
        $(".measurement").hide();
    }
    $(".map-editor").delegate(".block-type", "click", function () {
        var w = $(this).data("width");
        var h = $(this).data("height");

        var c = paper.rect(0, 0, w, h);
        c.attr({fill:"#FFED69", "stroke":"#000000"});

        var ft = paper.freeTransform(c, {
            size: 3,
            attrs: { fill: '#FFF', stroke: '#000' },
            draw: [ 'bbox'],
            scale: [ 'bboxSides' ],
            rotate: [ 'axisY' ],
            keepRatio: [ 'bboxCorners' ],
            snap: { rotate: 0, scale: 1, drag: 1 }
        }, function(ft, events) {
            /*console.log(events);*/
            switch (events[0]){
                case "drag end":

                    break;
                case "scale end":
                    $(".dimension-height").val((ft.attrs.scale.y * ft.attrs.size.y).toFixed(0));
                    $(".dimension-width").val((ft.attrs.scale.x * ft.attrs.size.x).toFixed(0));
                    break;
                case "rotate end":
                    $(".rotation-degree").val(ft.attrs.rotate.toFixed(2));
                    break;
            }

            if(events[0]=="drag end"){

            }
        });
        selectElement(c);
        c.click(function (e) {
            selectElement(c);
            e.stopPropagation();
            return false;
        });

        return;
    });
    $(".box-dimension .btn-update").click(function(){
        if(selected){
            var ft = selected.freeTransform;
            var h = $(".dimension-height").val();
            var w = $(".dimension-width").val();
            selected.attr({"width":w, "height": h});
            ft.attrs.scale.x = w / ft.attrs.size.x;
            ft.attrs.scale.y = h / ft.attrs.size.y;
            ft.apply();
            ft.updateHandles();
        }
    });
    $(".box-rotation .btn-update").click(function(){
        var d = $(this).closest(".rotation").find(".rotation-degree").val();
        var bBox = selected.getBBox();
        selected.transform("R" + 0 + "," + bBox.x + "," + bBox.y);
        bBox = selected.getBBox();
        selected.transform("R" + d + "," + bBox.x + "," + bBox.y);
        createResizeHandles(selected);
    });

});