jQuery(function(){ // dom ready function
	initMenuItems();
	initCanvas();
	
	
	
});

// initializations
initMenuItems = function(){
	// select the first menu item and make corresponding ribbon visible
	var menuItem = $('.eld-menu:first');
	var ribbonId = menuItem.attr('id').replace('menu', 'ribbon')
	displayRibbon($('#' + ribbonId));

	// make menu items clickable
	$('.eld-menu').click(function(e){
		var ribbonId = $(this).attr('id').replace('menu', 'ribbon')
		displayRibbon($('#' + ribbonId));
	});
	
	// make floor items draggable
	$('.eldr-floor').draggable({
		appendTo: 'body',
		helper: 'clone'
	});

};
initCanvas = function(){
	// make ground resizable
	$(".eld-ground").resizable({ 
		grid: [12, 12],
		handles: 'se',
		start: function(event, ui) {
			$(this).append('<div class="evt-measurement"></div>');
		},
		resize: function(event, ui) {
			var msr='(' + $(this).width()/12 + ' x ' + $(this).height()/12 + ')ft';
			$(".tb-measurement-h").html(msr);
			$(this).find(".evt-measurement").html(msr);
		},
		stop: function(event, ui) {
			$(this).find('.evt-measurement').remove();
		},
	});
	
	// make ground droppable
	$('.eld-ground').droppable({
		accept: '.eld-ribbon .eldr-floor',
		drop: function(event, ui) {
			var div=ui.draggable.clone();
			console.log(ui);
			console.log();
			var left = ui.helper.offset().left - $(".eld-ground").offset().left - parseInt($(".eld-ground").css("border-left-width"));
			if(left<0)
				left=0;
			else
				left=parseInt(left/12) * 12;
			
			var top = ui.helper.offset().top - $(".eld-ground").offset().top - parseInt($(".eld-ground").css("border-top-width"));
			if(top<0)
				top=0;
			else
				top=parseInt(top/12) * 12;
				
			div.css({"top": top + 'px', "left": left + 'px', "position": 'absolute'});
			
			div.hover(
				function(){
					$(this).removeClass("mouse-out");
				}, 
				function(){
					$(this).addClass("mouse-out");
				}
			);
			$('.eld-ground').append(div);
			
			div.draggable({
				appendTo: 'body',
				helper: 'original',
				grid: [12, 12],
				containment: 'parent'
			});
			div.resizable({ 
				grid: [12, 12],
				handles: 'se, ne, nw, sw',
				containment: 'parent',
				start: function(event, ui) {
					$(this).append('<div class="evt-measurement"></div>');
				},
				resize: function(event, ui) {
					var w=parseInt($(this).outerWidth()/12);
					var h=parseInt($(this).outerHeight()/12);
					var msr='(' + w + ' x ' + h + ')ft';
					$(".tb-measurement-h").html(msr);
					$(this).find(".evt-measurement").html(msr);
				},
				stop: function(event, ui) {
					$(this).find('.evt-measurement').remove();
				},
			});
		}
	});

};

displayRibbon = function(ribbon){
	$('.eld-ribbon').not(ribbon).hide();
	ribbon.show();
};
