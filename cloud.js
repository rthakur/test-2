(function($) {

        var origAppend = $.fn.append;

        $.fn.append = function () {
            return origAppend.apply(this, arguments).trigger("append");
        };
    })(jQuery);
    
$(document).ready(function(){
	var token = $('[name="csrf_token"]').attr('content');
	var project = $('#getprojectid').val();
	var question_id = $('.lightbox_title').attr('data-question');
	var urlget = '/project/'+project+'/'+question_id+'';
	if(project && question_id)
	 createUserImageCLoud('#jumble' ,urlget, question_id ,'canvas');
	
	function notification(message,type){
		color = 'blue';
		if(type=='success')
			color = 'green';
		else if(type=='error')
				color='red';
				
	var html  = '<div class="chadnoty"><p style="font-weight:bold; color:white;">'+message+'</p></span></span></div>';
	$('#wrap').prepend(html);
        setTimeout(function(){ $('.chadnoty').remove();},5000)
	}
	
	//var images = $('#images option').attr('data-images');
	//var json = $.parseJSON(images);
	//getWordCloudCreate();
	
	// to handle IE 9 missing the console object
		if(!(window.console && console.log)) {
		  console = {
			log: function(){},
			debug: function(){},
			info: function(){},
			warn: function(){},
			error: function(){}
		  };
		}
	
		// To handle missing array.filter function From: 
		// http://www.tutorialspoint.com/javascript/array_filter.htm
		if (!Array.prototype.filter)
		{
		  Array.prototype.filter = function(fun /*, thisp*/)
		  {
			var len = this.length;
			if (typeof fun != "function")
			  throw new TypeError();

			var res = new Array();
			var thisp = arguments[1];
			for (var i = 0; i < len; i++)
			{
			  if (i in this)
			  {
				var val = this[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, this))
				  res.push(val);
			  }
			}

			return res;
		  };
		}


function createUserImageCLoud(jroot, urlget, question_id, canvasid){
	var savecloud = true;
	$inputData = $('.cloud_data');
	var checkdata = $('.cloud_data').val();
	if(checkdata.length){
		var jid = 0;
		var question = 1;
		$inputData.each(function(){
			var cloud_data = $(this).val();
			if(cloud_data.length){
				var jrootid  = jroot+'_'+jid;
				var canvas_id = canvasid+'_'+jid;
				var lightbox = 'lightboxcheck_'+jid;
				savecloud = false;
				//console.log(JSON.parse(cloud_data));
				//console.log(lightbox);
				cloud(JSON.parse(cloud_data),canvas_id,jrootid,question,savecloud,$('#'+lightbox));
				jid++;
				question++;
				}
				
			return true;	
			});
	
	}
	
}	
	
function getimagecloud(jroot, urlget,question_id,canvasid,lightbox_title,lightbox){
	var savecloud= true;
	var data = urlget.split('/');
	$.ajax({
		url  : urlget+'/json',
		type : 'post',
		data : 'project_id='+data[2]+'&question_id='+data[3]+'&_token='+token+'&lightbox_title='+lightbox_title,
		success : function(response){
				if(response.status==404){
						$msghtml = $('.activelightbox').find('.lightbox_title').css('margin-left','44%').css('color','red');
						$msghtml.text('No data found');
						return false;
					}
				var getresponse = response;
				var respondent = JSON.parse(getresponse.data).respondent;
				$('.activelightbox').find('.respondentId').val(respondent);
				$('.activelightbox').find('.cloud_data').val(getresponse.data);
			cloud(JSON.parse(getresponse.data),canvasid,jroot,question_id,savecloud,lightbox);
			createTrashImage(getresponse.trash_images);
			createTrashWord(getresponse.trash_words);
			} 
			
		});
}
function createTrashWord(trash_words){
		var html = '';
		$.each(trash_words,function (){
			
			 html += '<div data-size="'+this.size+'" data-text="'+this.word+'" draggable="true" class="deletedResultWord toBeDragged deleteResultWord"><span>'+this.word+'</span></div>';
		});
		
		$('.activelightbox').find('.word_drag').append(html);
		if (html.length) {
			$('.activelightbox').find('.word_drag .drag span').hide();
		}
		
		$('.deletedResultWord').draggable({
			  cancel: "a.ui-icon", 
			  revert: "invalid",
			  cursor: "move",
			  start: function(event, ui) {
					
				},
			  stop: function(event, ui) {
				
				}
		});
			
	}

function createTrashImage(trashimages){
	var html = '';
	$.each(trashimages,function (){
			 html += '<div data-imageid="'+this.image_id+'" data-imagename="'+this.image+'" id="trash_'+this.image_id+'" class="deletedResultImage ui-draggable ui-draggable-handle" data-tags="'+this.tags+'" data-count="'+this.count+'"><img width="60" height="60" alt="Drag Image" src="/uploads/images/'+this.image_id+'/'+this.image+'" class="ui-draggable ui-draggable-handle" /></div>';
		});
	$('.activelightbox').find('.checkdragimage').append(html);

	if (html.length) {
		$('.activelightbox').find('.getimagedragdiv span').hide();
	}
}

function cloud(response,canvasid,jroot,question,savecloud,lightbox){
			var rootObject =response.finalData.datap;
			   var objectId = null;
				for (var key in rootObject) {
					if (rootObject.hasOwnProperty(key)) {
						objectId = key;
					}
				}
				//console.log(response);
			var data = response.finalData.datap[objectId];
			getWordCloudCreate(data,canvasid,lightbox);
			
			//appendImagelists(response.finalData.datap[question]);	
			//init_DOMNodeInserted();
			var options1 = {
				dataRoot:   "finalData.datap",
				jumbleRoot: jroot,
				detailRoot: "#imageInfoPage1",
				rootUrl: "/uploads/",
				width: 449,
				height: 346,
				margin: 5,
				randomRangeX: 40,
				randomRangeY: 10,
				minSpace: 0.5,
				dragSize: 150,      // size while dragging images
				deletedSize: 60,    // size of deleted images in the trash area
				highlightScaleUp: 1.5 // how much to scale up the images when doing mouse-over

			};
			$.when(imageJumbleGotImageJson('', response, options1)).then(getPrepareData(jroot,savecloud));
			
	} 
	
function getPrepareData(jroot,savecloud){
	var respondent = $('.activelightbox').find('.respondentId').val();
	//console.log(respondent);
		var dataObject =[];
		//console.log($('.jumblePage').length);
		//jroot = $('.jumblePage');
		$(jroot).find('svg').find('.imaged').each(function(){
		    var thisImage = d3.select(this);
			var data={
				'id':thisImage.attr('imageId'),
				'image':thisImage.attr('imageName'),
				'count':thisImage.attr('count'),
				'x':thisImage.attr('x'),
				'y':thisImage.attr('y'),
				'tags':thisImage.attr('tags')
				};
			dataObject.push(data);
			});
			dataObject.push({'respondent':respondent});
			var dataObject = JSON.stringify(dataObject);
			if(savecloud){
				saveCLoudDB(dataObject);
			}	
	}

function saveCLoudDB(data){
		var project_id = $('#getprojectid').val();
		var getlightbox = $('.activelightbox').find('.lightbox_title');
		var lightbox_title = getlightbox.text();
		var visual_exercise = $('.activelightbox').find('.lightbox_title').attr('data-question');
		
		var data = {
			"cloud" : data,
			"project_id":project_id,
			"lightbox_title":lightbox_title,
			"visual_exercise":visual_exercise,
			"_token":token
			};
		
		$.post('/project/savecloud', data, function (response)
		{
			if(response.status=='success'){
						getlightbox.attr('data-visual' , response.visual_id);
					//	notification('Image cloud save successfully','success');
						}else if(response.status=='error'){
							notification('Image cloud not saved','error');
							}else{
								notification('Something went wrong during save image cloud','error');
								}
		});
	}
	
// CALL WORD CLOUD FUNCTION
function getWordCloudCreate(json,canvasid,lightbox){
	var datatext =''; 
	$.each(json, function(){
		if(this.tags && this.tags!='Not found ~ Not found'){
			//var gettags = this.tags.replace(/~|^/g,' ');
			var tags = this.tags.split('^');
			var gettags='';
			for(var i=0; i<tags.length; i++){
					var getData = tags[i].split('~');
					getData = getData.slice(0,2);
					gettags += getData.join("");
					}
			datatext += gettags;
		}
	 });
	var tagArray = datatext.split(' ');
	var tagarrpush = [];  
	var obj = {};
	for (i = 0; i < tagArray.length; i++) {
		if (tagArray[i] != '') {
			var strval = tagArray[i].toLowerCase();
			if (!obj[strval]) {
				obj[strval] = 0;
			}
			obj[strval]++;
			
		}
	}
	
	var wrapwords = '<option value="all">All Words</option>';
	$.each(obj, function(key, value){
		var tagarr = [];
		
		if($.isNumeric(key)){
				return;
			}
		if(value>100){
			return;
				
			}
		key.trim();
		var ignoredKey = ["a","about","above","after","again","against","all","am","an","and","any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","this","his","ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there's","these","they","they'd","they'll","they're","they've","this","those","through","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","you've","your","yours","yourself","yourselves","us"];
		if(ignoredKey.indexOf(key.toLowerCase()) === -1){
			if(value<3){
				value=3;
				}
			
			//wrapwords +='<option value="'+value+'">'+key+'</option>';	
			/*tagarr.push(key.trim(),value);
			
			tagarrpush.push(tagarr);*/
			
			var text = {"text":''+key.trim()+'',"size":value};
			tagarrpush.push(text);
			
			}
		});	
		
		
		if(json)
			localStorage.setItem("getjson", JSON.stringify(json));
		else
		  json = JSON.parse(localStorage.getItem("getjson"));
		
		var data = tagarrpush.splice(0,100);
		
		function compare(a,b) {
			  if (a.size > b.size)
				return -1;
			  if (a.size < b.size)
				return 1;
			  return 0;
			}
		
		data.sort(compare);
		var maxval= 0;
		var finalArray  = removeTrashWords(data,lightbox);
		$.each(finalArray,function(key,value){
				if(this.size>maxval){
						maxval = this.size;
					}
			
			});
		lightbox.prepend('<input type="hidden" class="maxwordvalue" value="'+maxval+'"/>');
	
		
	textCloudCreate(finalArray,canvasid,json,lightbox);	
}

	
$('body').on('click','.cloudButton',function(){
	$('.activelightbox').removeClass('activelightbox');
	var project = $(this).attr('data-project');
	$getparent = $(this).parent().parent().parent().parent();
	$getpar = $(this).parent().parent().parent().parent().parent().parent().parent().parent().parent().parent();
	$getpar.addClass('activelightbox');
	var question_id = $getparent.find('input[type=radio]:checked').val();
	var lightbox_title = $getparent.find('.labelinput').val();
			if(lightbox_title.length==0){
				$getparent.find('.messageset').find('p:first').remove();
					var html ='<p style="color:red; font-weight:bold; font-size:14px;">Label field is required</p>';
					$getparent.find('.messageset').prepend(html);
					setTimeout(function(){$getparent.find('.messageset').find('p:first').remove();},4000);
					return false;
				}	
	if(!$getparent.find('input[type=radio]').is(':checked')){
			$getparent.find('.messageset').find('p:first').remove();
			var html ='<p style="color:red; font-weight:bold; font-size:14px;">Please choose question first</p>';
			$getparent.find('.messageset').prepend(html);
			setTimeout(function(){$getparent.find('.messageset').find('p:first').remove();},4000);
			return false;
		}	
		var geturl = '/project/'+project+'/'+question_id+'';
		var lightbox_title = $getparent.find('.labelinput').val();
			if(lightbox_title.length==0){
				$getparent.find('.messageset').find('p:first').remove();
					var html ='<p style="color:red; font-weight:bold; font-size:14px;">Label field is required</p>';
					$getparent.find('.messageset').prepend(html);
					setTimeout(function(){$getparent.find('.messageset').find('p:first').remove();},4000);
					return false;
				}	
		$.ajax({
			url :'/project/getcloudoverlay',
			type :'post',
			data : '_token='+token+'&lightbox_title='+lightbox_title+'&question_id='+question_id,
			success : function(response){
						$getpar.html(response);
						$getpar.prepend('<input type="hidden" class="cloud_data" value=""/>');
						$getpar.prepend('<input type="hidden" class="respondentId" value=""/>');
						var randstr = randomString();
						var canvasid = 'canvas'+randstr;
						var jumbleid = 'jumble'+randstr;
						$getpar.find('svg:first').attr('id', ''+canvasid+'');
						$getpar.find('#jumble').attr('id', ''+jumbleid+'');
						$('.drag').jScrollPane({ autoReinitialise: true });
						$(".photobrand .photobrand-body").jScrollPane({ autoReinitialise: true });
						getimagecloud('#'+jumbleid,geturl,question_id,canvasid,lightbox_title,$getpar);	
				}
			});
	});	
	
function appendImagelists(data){
		var images = '<option value="">All images</option>';
		for(var i = 0 ; i!=data.length; i++){
			
				images +='<option value='+data[i]['id']+'>'+data[i]['image']+'</option>';
			}
		$('.activelightbox').find('#oneimage').append(images);	
	}
	
	
$('body').on('click','.closesetquestion img',function(){
		$this = $(this);
		$getparent = $(this).parent().parent().parent().parent();
		$getpar    = $(this).parent().parent().parent().parent().parent().parent().parent();
		$getpar.find('.lightbox_title').html('');
		$this.parent().parent().hide();
		
	});
	
$('body').on('change','#words',function(){
	var canvas_id = $(this).parent().parent().parent().find('canvas').attr('id');
	if($(this).val()=='all'){
		wrapAllTextCloud($(this),canvas_id);
		return false;
		}
	var count = $(this).val();
	var word = $(this).find("option:selected").text();
	var tagArrray = [[word,count]];
	textCloudCreate(tagArrray,canvas_id,false);
	});	
	
function wrapAllTextCloud($this,canvas_id){
		words = [];
		$this.find('option').not(':first').each(function(){
			var tagarr = [];
			var count=parseInt($(this).val()); 
				tagarr.push($(this).text(),count);
				words.push(tagarr);
			});
	
	textCloudCreate(words,canvas_id,false);
	}						

$('body').on('click','.lightbox',function(){
	$('.activelightbox').removeClass('activelightbox');
	$(this).addClass('activelightbox');
	
	});
	
$('body').on('click','.deleteVisual',function(){
	_this = $(this);
	
	$getdata = $('.activelightbox').find('.lightbox_title');	
	var id = $getdata.attr('data-visual').trim();
		if(confirm('Are you sure you want to delete this lightbox?')){	
			//$(_this).parents('.activelightbox').remove();
			deleteVisualLightBox(id , _this);
		}else{
			return false;
			}	
		
	});	
function deleteVisualLightBox(id,_this){
	$parent = _this.parent().parent().parent().parent().parent().parent().parent().parent().parent().parent();
	if(!id.length){
		$parent.remove();
		return false;	
		}
	
	return $.ajax({
		url : '/project/deletevisual',
		type : 'post',
		data  : 'id='+id+'&_token='+token,
		beforeSend: function(){_this.text('processing..');},
		success : function(response){
				_this.text('Delete');
				if(response.status=='success'){
						$lightbox  =  $parent.find('.lightbox_title');
						$lightbox.attr('data-visual','');
						$lightbox.attr('data-lightbox_title','');
						$lightbox.attr('data-question','');
						$lightbox.text('');
						$parent.find('.cell').html('');
						$parent.remove();
					}else{
						alert('Somethig went wrong please try again!');
						}
			}
		
		});
	
	}
	

function randomString() {
		charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		len = 6;
		var randomString = '';
		for (var i = 0; i < len; i++) {
			var randomPoz = Math.floor(Math.random() * charSet.length);
			randomString += charSet.substring(randomPoz,randomPoz+1);
		}
		return randomString;
}

if($('.results img').length){
	$(this).closest('div.jspPane').next().find('text').html('');
}


$('body').on('click','.wordmyarrow',function(){
	//$activelightbox = $('.activelightbox');
	$parentOBJ = $(this).parent().parent().parent();
	$parentOBJ.find('.show_content_first').html($(this).attr('data-text'));
	$(this).parent().parent().addClass('abc');
	//$parentOBJ.find('.word_content').css('display','block').css('position','relative');
	$parentOBJ.find('.word_content').addClass('opac');
	});

$('body').on('click','.wordmyarrow.new-arrow',function(){
	$parentOBJ = $(this).parent().parent();
	$parentOBJ.find('.word_content').removeClass('opac');
	$parentOBJ.find('.graphs').removeClass('abc');
	
	});
	
$('body').on('click','.myarrow',function(){
	$(this).parent().addClass('image_graph');
	$(this).parent().parent().find('.image_content').addClass('show_c');
	
	});	
$('body').on('click','.wordmyarrow.imagenew-arrow',function(){
	$(this).parent().removeClass('show_c');
	$(this).parent().parent().find('.image_graph').removeClass('image_graph');
	
	});	

});
