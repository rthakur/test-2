function chadwordcloud(options) {

	var dragging = false;
	var transitioning = false;
	var xStart = 0;
	var yStart = 0;
	var dragDOM = null;
	var lastX = 0;
	var dragDist = 0;
	 var lastY = 0;
    var dragSize = options.dragSize || 200;
    var dragToDestSelector = options.dragToDestSelector || ".word_drag";

	$('.deletedResultWord').draggable({
			 cancel: "a.ui-icon", // clicking an icon won't initiate dragging
			  revert: "invalid", // when not dropped, the item will revert back to its initial position
			  cursor: "move",
			  start: function(event, ui) {
					
				},
			  stop: function(event, ui) {
				
				}
			});
			
	var svgOBJDrop =$('.activelightbox').find("svg:first").parent(); 
		//console.log(svgOBJDrop);
		svgOBJDrop.droppable({
		  hoverClass: "word-cloud-state-hover",
		  accept:".deletedResultWord",
		  drop: function( event, ui ) {
			  var elem = ui.draggable;
			  var $apend = '<text class="wordcloud" id="word_53" text-anchor="middle" data-size="'+elem.attr("data-size")+'" data-word="'+elem.attr("data-text")+'">'+elem.attr("data-text")+'</text>';
				svgOBJDrop.find("g").append($apend);
				elem.remove();
				trashBackWord(elem.attr("data-text"), elem.attr("data-size"));
				refreshWordCloud();
			}
		});	
  
    var wordDraggerSelector = ".wordDragger";
	
	var drag = d3.behavior.drag()
				.origin(function(d) { return d; })
				.on("dragstart",function(d){
						  xStart = d3.event.sourceEvent.x/2;
						  yStart = d3.event.sourceEvent.y/2;
						  dragging = true;
						  if (dragDOM == null) {
							 dragDOM = $("body").append('<div class="wordDragger" style="display:none"><span>'+d.text+'</span></div>');
						  }
						  var dragger = $(wordDraggerSelector, dragDOM);
						  lastX = d3.event.sourceEvent.pageX;
						  lastY = d3.event.sourceEvent.pageY;
						  dragDist = 0;
					})
				.on("drag", function(d){
					d3.event.sourceEvent.stopPropagation();
					var event = d3.event.sourceEvent;
					var thisWord = d3.select(this);
					var x = +thisWord.attr("x");
					var y = +thisWord.attr("y");
					var w = +thisWord.attr("width");
					var h = +thisWord.attr("height");
					var tx = d3.event.x/2 - xStart - ((x + (w / 2)) / 2);
					var ty = d3.event.y/2 - yStart - ((y + (h / 2)) / 2);
					
					var dx = d3.event.sourceEvent.pageX - lastX;
					var dy = d3.event.sourceEvent.pageY - lastY;
					var prevDragDist = dragDist;

					var event = d3.event.sourceEvent;

					dragDist += Math.sqrt(dx*dx + dy*dy);
					lastX = event.pageX;
					lastY = event.pageY;

					var dragger = $(wordDraggerSelector, dragDOM)

					if (dragDist > 15) {
					 if (prevDragDist < 15) {
						 dragger
							//.css({display:"initial"})
							.fadeIn(500);
						}
					 }
				dragger.css({left: event.pageX, top: event.pageY});
				
				//d3.select('#'+this.id).remove();
					
					/* var x = d3.event.x;
					  var y = d3.event.y;
					  d3.select(this).attr("transform", "translate(" + x + "," + y + ")");*/
					  checkDragDest(event);	
					  
					})
				.on("dragend",function(d){
					
					d3.event.sourceEvent.stopPropagation();
					var dest = $('.activelightbox').find('.word_drag');
					if (checkDragDest(d3.event.sourceEvent)) {
						//dest.find('.drag').find('span').remove();
						var wordRoot = dest.append('<div class="deletedResultWord toBeDragged"><span data-size="'+d.size+'">'+d.text+'</span></div>').fadeIn(500);
						wordRoot = wordRoot.find(".deletedResultWord");
						wordRoot.removeClass("toBeDragged");
						/*
						$('.results').droppable({
						  //accept: "#gallery > li",
						  activeClass: "word-cloud-state-highlight",
						  hoverClass: "word-cloud-state-hover",
						  drop: function( event, ui ) {
								 ui.draggable.hide(500, function() {ui.draggable.remove()});
						  }
						});
						*/

						wordRoot.draggable({
						  cancel: "a.ui-icon", // clicking an icon won't initiate dragging
						  revert: "invalid", // when not dropped, the item will revert back to its initial position
						  containment: "document",
						  helper: "clone",
						  cursor: "move",
						  start: function(event, ui) {
							dragging = true;
							ui.helper.addClass("draggingWord");
							},
						  stop: function(event, ui) {
							ui.helper.removeClass("draggingWord");
							dragging = false;
							}
						});
		
						// let the word cloud SVG object be droppable, accepting the deleted words
					
						/*var lightbox_id = $('.activelightbox').attr('id');
						var canvas_get = lightbox_id.split('_');*/
						var wordCouldSvgOBJ = $('.activelightbox').find("svg:first"); //$('#canvas_'+canvas_get[1]); 

						wordCouldSvgOBJ.droppable({
						  accept: ".deletedResultWord",
						  activeClass: "word-cloud-state-highlight",
						  hoverClass: "word-cloud-state-hover",
						  drop: function( event, ui ) {

							  var elem = ui.draggable;
							  var $apend = '<text class="wordcloud" id="word_53" text-anchor="middle" data-size="'+elem.attr("data-size")+'" data-word="'+elem.attr("data-text")+'">'+elem.attr("data-text")+'</text>';
								svgOBJDrop.find("g").append($apend);
								elem.remove();
								trashBackWord(d.text, d.size);
								refreshWordCloud();
							}
							
						});	
					  
						d3.select(this).remove();
						dragDOM = null;
						$('body').find('.wordDragger:last').remove();	
						dest.removeClass("highlight");
						trashWord(d.text, d.size);
						refreshWordCloud();
									
				}else{
					dest.removeClass("highlight");
					}
			});
			
			
			 var  checkDragDest = function(event) {
				var dest = $('.activelightbox').find('.word_drag');
				var destParentOffset = dest.parent().offset();
				var relativeX = (event.pageX - destParentOffset.left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
				var relativeY = (event.pageY - destParentOffset.top);
				var destW = dest.width();
				var destH = dest.height();
				if (relativeX > 0 && relativeX < destW && relativeY > 0 && relativeY < destH) {
				   dest.addClass("highlight");
				   return true;
				} else {
				   dest.removeClass("highlight");
				   return false;
				}
			}
			
	
  var fill = d3.scale.category20();
    var color = d3.scale.linear()
            .domain([0,1,2,3])
            .range(['#7cb742','#2d80a1','#1b4975','#001024']);

    d3.layout.cloud().size([457, 356])
            .words(options.list)
            .padding(1)
            .font("'Conv_News Gothic Condense',Sans-Serif")
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .fontSize(function(d) { return Math.pow(d.size, 1.5); })
            .on("end", draw)
            .start();

    function draw(words) {
        d3.select('#'+options.canvasid+'')
                .attr("width", 457)
                .attr("height", 356)
                .append("g")
                .attr("transform", "translate(230,185)")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                 .on("click", function(d, i) {
					var thisText = d3.select(this);
						 options.click([d.text,d.size]);
					})
				.on("mouseover",function(d,i){
							var thisText = d3.select(this);
							if(options.hover){
									thisText.transition().duration(200).delay(300).style("font-size",d.size+20+"px");
								
								}
					
					})
				.on("mouseout",function(d,i){
					var thisText = d3.select(this);
							if(options.hover){
									thisText.transition().delay(100).style("font-size",d.size+"px");
								}
					
					})
				.call(drag)	
				.attr("transform", "rotate(0)")
				.transition()
				.duration(1000)
				.delay(500)
				.attr("opacity",1)
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d, i) { return color(i); })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .attr("class", "wordcloud")
                .attr('id',function(d,i){ return 'word_'+i; })
                .attr('text-anchor' ,'middle')
                .attr('data-size' ,function(d,i){  return d.size; })
                .attr('data-word' ,function(d,i){  return d.text; })
                .text(function(d) { return d.text; })
				//.ease("elastic")
				;	
		}
	
	function  refreshWordCloud(){
		
		/*var lightbox_id = $('.activelightbox').attr('id');
		var canvas_get = lightbox_id.split('_');*/
		var tagarrpush = [];
		var svgOBJ = $('.activelightbox').find("svg:first").attr("id"); //'canvas_'+canvas_get[1]; 
		
		$('#'+svgOBJ+' text').each(function(){
				var text = {"text":''+$(this).attr('data-word')+'',"size":$(this).attr('data-size')};
				tagarrpush.push(text);
			});
			
		//	console.log(tagarrpush);
		var	json = $('.activelightbox').find(".cloud_data").val();
		var data = tagarrpush;
		var finalArray  = removeTrashWords(data,$('.activelightbox'));
		var maxval= 0;
		$.each(finalArray,function(key,value){
				if(this.size>maxval){
						maxval = this.size;
					}
			
			});
			//console.log(data);
			$('.activelightbox').find('.maxwordvalue').val(maxval);
		//lightbox.prepend('<input type="hidden" class="maxwordvalue" value="'+maxval+'"/>');
		d3.select("#"+svgOBJ).selectAll("*").remove();
		var options = {
				list:data,
				canvasid:svgOBJ,
				click: function(item) {
					console.log(item);
					getTextDetail(item,json);
				 },
						};

		textCloudCreate(finalArray,svgOBJ,json,'');
		
		}
	
}//CHAD CLOUD CLOSED
