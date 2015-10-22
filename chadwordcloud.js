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
  
    var wordDraggerSelector = ".wordDragger";
	
	var $widgetRoot = $('#'+options.canvasid).parent().parent().parent();
	var cloudRoot = d3.select('#'+options.canvasid+'')
                .attr("width", 457)
                .attr("height", 356)
                .append("g")
                .attr("transform", "translate(230,185)");

  	var restoreWord = function(word, value) {
  		console.log("restoring: " + word + ", " + value);
  		cloudRoot.append("text")
		.attr("transform", function(d) {
			return "translate(" + [0, 0] + ")rotate(" + 0 + ")";
		})
  		.attr("data-word", word)
  		.attr("data-value", value)
  		.text(word);

  		refreshWordCloud();
  	}
  	
	
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
						  dragger.find("span").html(d.text);
						  
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

					var dragger = $(wordDraggerSelector, dragDOM);

					dragger.fadeOut(500, function() {
						  dragger.css({display:"none"}); 
					});

					if (checkDragDest(d3.event.sourceEvent)) {
						//dest.find('.drag').find('span').remove();
						var wordRoot = dest.append('<div class="deletedResultWord toBeDragged"><span data-value="'+d.value+'">'+d.text+'</span></div>').fadeIn(500);
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
						//var wordCouldSvgOBJ = $('.activelightbox').find("svg:first"); //$('#canvas_'+canvas_get[1]); 
						var wordCouldSvgOBJ = $widgetRoot.find(".box > .cell");

						wordCouldSvgOBJ.droppable({
						  accept: ".deletedResultWord",
						  activeClass: "word-cloud-state-highlight",
						  hoverClass: "word-cloud-state-hover",
						  drop: function( event, ui ) {
							 transitioning = true;
								console.log(ui);
							 //ui.draggable.fadeOut(300).animate({'max-height':0, height:0}, 1300, function() {ui.draggable.remove()});
							 ui.draggable.hide(500, function() {ui.draggable.remove()});
							 var word = ui.draggable.find("span").html();
							 var value = ui.draggable.find("span").attr("data-value");
							 if (!value) {
								value = ui.draggable.attr("data-value");
							 }
							 if (!value) {
								value = ui.draggable.data("value");
							 }
							 if (!value) {
								value = ui.draggable[0].attr("data-value");
							 }
							 if (!value) {
								value = ui.draggable[0].data("value");
							 }
							 _.delay(_.bind(restoreWord, null, word, value), 50);
							 // TODO: Call AJAX function to restore word to word cloud on server
							  //trashBackImage(ui.draggable.attr("data-imageId"));
						  }
						});	
					  
						d3.select(this)
							//.transition(500)
							//.style("opacity", 0)
							.remove();
						refreshWordCloud();		
				}
				dest.removeClass("highlight");
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
			
			
    function draw(words) {

    		var wordCloud = cloudRoot
                .selectAll("text", function(d) { return d.text; })
                .data(words);
                
            var addedWords = wordCloud
                .enter()
                .append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d, i) { return color(i); })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .attr("class", "wordcloud")
                .attr('id',function(d,i){ return 'word_'+i; })
                .attr('text-anchor' ,'middle')
                .attr('data-value' ,function(d,i){  return d.value; })
                .attr('data-word' ,function(d,i){  return d.text; })
                .text(function(d) { return d.text; })
				.style("opacity", 0)
                .call(drag)
                .on("click", function(d, i) {
					var thisText = d3.select(this);
						 options.click([d.text,d.value]);
					});
				;
					// fade in the words
			addedWords
				.transition()
				.duration(500)
				.style("opacity", 1)
				;
			
			// update all word's to their current positions and sizes
			wordCloud
                .attr('id',function(d,i){ return 'word_'+i; })
				.transition()
				.duration(500)
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d, i) { return color(i); })
				.style("opacity", 1)
				;
				
			wordCloud.exit().transition()
				.duration(500)
				.style("opacity", 0)
			    .remove();
		}
	
	function  refreshWordCloud() {
		
		/*var lightbox_id = $('.activelightbox').attr('id');
		var canvas_get = lightbox_id.split('_');*/
		var tagarrpush = [];
		//var svgOBJ = $('.activelightbox').find("svg:first").attr("id"); //'canvas_'+canvas_get[1]; 
		var svgId = $widgetRoot.find("svg").attr("id");

		$('#'+svgId+' text').each(function(){
				var text = {"text":''+$(this).attr('data-word')+'',"value":$(this).attr('data-value')};
				tagarrpush.push(text);
			});
			
		console.log(tagarrpush);
			
		var data = tagarrpush;
		var maxval= 0;
		$.each(data,function(key,value) {
				if (this.value > maxval) {
						maxval = this.value;
					}
			});

		//console.log(data);
		$('.activelightbox').find('.maxwordvalue').val(maxval);
		//lightbox.prepend('<input type="hidden" class="maxwordvalue" value="'+maxval+'"/>');
		/*
		d3.select("#"+svgOBJ).selectAll("*").remove();
		
		var options = {
				list: data,
				canvasid: svgOBJ,
				click: function(word, value) {
					console.log(word);
					console.log(value);
					getTextDetail(word, json);
				 },
			};
		chadwordcloud(options);
		*/
			
		wordCloud.words(data);
		
	    wordCloud.start();

		
		}

	// Make trash words that are in the trash when the page loads work as draggable objects
	var addWordTrashDragging = function() {
		var trashImages = $widgetRoot.find(".deletedResultWord");
		trashImages.each( function() {
			var image = $(this);
			image.draggable({
			  cancel: "a.ui-icon", // clicking an icon won't initiate dragging
			  revert: "invalid", // when not dropped, the item will revert back to its initial position
			  containment: "document",
			  helper: "clone",
			  cursor: "move",
			  start: function(event, ui) {
				dragging = true;
				// copy the data from the div to the span
				ui.helper.find("span").attr("data-value", ui.helper.find("div").attr("data-value"));
				ui.helper.find("span").attr("data-word", ui.helper.find("div").attr("data-word"));
				ui.helper.addClass("draggingWord");
				},
			  stop: function(event, ui) {
				ui.helper.removeClass("draggingWord");
				dragging = false;
				}
			});
		});
		
		// let the word cloud SVG be droppable, accepting the deleted words
		var wordCouldSvgOBJ = $widgetRoot.find("svg");
		
    	wordCouldSvgOBJ.droppable({
		  accept: ".deletedResultWord",
		  activeClass: "word-cloud-state-highlight",
		  hoverClass: "word-cloud-state-hover",
		  drop: function( event, ui ) {
			 transitioning = true;
				console.log(ui);
			 //ui.draggable.fadeOut(300).animate({'max-height':0, height:0}, 1300, function() {ui.draggable.remove()});
			 ui.draggable.hide(500, function() {ui.draggable.remove()});
			 var word = ui.draggable.find("span").html();
			 var value = ui.draggable.find("span").attr("data-value");
			 if (!value) {
			    value = ui.draggable.find("div").attr("data-value");
			 }
			 if (!value) {
				value = ui.draggable.attr("data-value");
			 }
			 if (!value) {
				value = ui.draggable.data("value");
			 }
			 if (!value) {
				value = ui.draggable[0].attr("data-value");
			 }
			 if (!value) {
				value = ui.draggable[0].data("value");
			 }
			 _.delay(_.bind(restoreWord, null, word, value), 50);
			 // TODO: Call AJAX function to restore word to word cloud on server
			  //trashBackImage(ui.draggable.attr("data-imageId"));
		  }	
		  });
	};
	
  	var fill = d3.scale.category20();
  	
    var color = d3.scale.linear()
            .domain([0,1,2,3])
            .range(['#7cb742','#2d80a1','#1b4975','#001024']);

    var wordCloud = d3.layout.cloud().size([457, 356])
            .words(options.list)
            .padding(3)
            .font("'Conv_News Gothic Condense',Sans-Serif")
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .fontSize(function(d) { return Math.pow(d.value, 1.5); })
            .on("end", draw);
            
    wordCloud.start();
	
	addWordTrashDragging();

}//CHAD CLOUD CLOSED
