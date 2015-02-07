var api_key = "0a8758f33eb41c087d4e20f4be40d335:10:70164093";
var latitude = "40.7589545";
var longitude = "-73.9849801";
var radius = "5000";
var final_url;
var borough = "Manhattan";
var boroughLatLong = [ ['Manhattan', '40.7589545','-73.9849801'],
                       ['Brooklyn','40.645244','-73.9449976'],
                       ['Bronx','40.85166','-73.840934'],
                       ['Queens','40.651018','-73.871192'],
                       ['StatenIsland','40.5646056','-74.1468185']];
var thisPage = [];
var colNum = 1;
var index = 0; //Map label index
var totalResults = 0;
var offset = 0;
var eventType = "All";
var filter = "";

//object present in array
function Bookmark(eventTitle,eventURL) {
    this.eventTitle=eventTitle;
    this.eventURL=eventURL;
}


//previous page
function previouspage(){
	if (offset === 0)
	{
		alert("You are on the first page!"); 
	} 
	else
	{
		offset = offset-20; 
        getResults(offset);
	}	
}

//next page 
function nextpage(){ 
	if ((offset+20) >= totalResults){
		alert("You are on the last page!");
	}
	else
	{
		offset=offset+20;
        getResults(offset);
	}	
}

//make the URL we need to query from the API
function makeURL(offset){
    var first_date = $("#mindate").data("DateTimePicker").getDate();
    var second_date = $("#maxdate").data("DateTimePicker").getDate();
    var first_date_formatted = timeprocess(first_date);
    var second_date_formatted = timeprocess(second_date);
    
    
    radius = $('#radius').val() * 1000;
    borough = $('#borough').val();
    eventType = $('#eventtype').val();
    
    if(eventType == "All")
    {
        filter = "";
    }
    else
    {
        filter = "&filters=category:" + eventType;
    }
    
    for (var i=0;i<5;i++)
    {
        if(boroughLatLong[i][0] == borough)
        {
            latitude = boroughLatLong[i][1];
            longitude = boroughLatLong[i][2];
            break;
        }
    }
    final_url = "https://api.nytimes.com/svc/events/v2/listings.jsonp?&ll=" + latitude + "," + longitude + 
        "&radius=" + radius + "&offset=" + offset + filter + "&date_range=" + first_date_formatted + ":" + second_date_formatted + "&sort=event_name+asc&api-key=" + api_key;
}


//When the user clicks on the Search button, the getResults() function is executed which makes the query URL and sends to the API server
function getResults(inputoffset){
    $('#col2').empty();
    $('#col3').empty();
    $('#prev').css('visibility','hidden');
    $('#next').css('visibility','hidden');
    colNum = 1;
    makeURL(inputoffset);
    //console.log(inputoffset);
    offset = inputoffset;
    $.ajax({url: final_url,
	dataType: "jsonp",
	type: "get",
	success: function(data){
	    totalResults = data.num_results;
	    if (totalResults === 0){
	        $('#initialMain').css("display","none");
            $('.row').css("display","block");
            $('#map').css("display","none");
	        $("#col2").html("<h3> No events found! </h3>");
	        return; 
	    }
		parseResults(data);
	},
	error: function(data){
		alert("Your first date comes after your second date!");
	}
    });
}




//Parses the data returned from the API call
function parseResults(data){
    
    //pop array with information about the page 
    while (thisPage.length) { thisPage.pop(); }
    $('#initialMain').css("display","none");
    $('.row').css("display","block");
    $('#map').css("display","block");
    //Display the next and prev buttons depending on the number of results returned
    if(totalResults > 20)
    {
        //make the next and prev buttons visible
        if(offset > 0)
        {
            $('#prev').css('visibility','visible');
        }
        else
        {
            $('#prev').css('visibility','hidden');   
        }
        if((offset+20) < totalResults)
        {
            $('#next').css('visibility','visible');
        }
        else
        {
            $('#next').css('visibility','hidden');
        }
    }
    
    
    //Initialize the map that shows all the events
    var map_var = map_initialize(latitude,longitude);
    for(var i=0; i < data.results.length; i++){
        index = i;
        //For each result returned, display the result
        printResult(data.results[i],map_var,i);
    }
}


//Display the result in a card layout and map the events on the map
function printResult(result,map_var,ind){
    //console.log(result.event_detail_url);

    thisPage.push(new Bookmark(result.event_name,result.event_detail_url));

    //Make the card which has the current event details
    var cardDiv = document.createElement('div');
    cardDiv.id = "cardContainer";
    cardDiv.className = 'panel panel-default';
    
    //CardContainer contains event letter on map, event name and event body
    var letter = String.fromCharCode("A".charCodeAt(0) + index);
    var marker_img = document.createElement('img');
    marker_img.src = "https://maps.google.com/mapfiles/marker" + letter + ".png";

    var eventLetterOnMap = document.createElement('div');
    eventLetterOnMap.id = "evtLetter";
    eventLetterOnMap.appendChild(marker_img);    
    
    var eventName = document.createElement('div');
    eventName.id = "evtName";
    eventName.className = 'panel-heading';
    eventName.appendChild(document.createTextNode(result.event_name));

    if(result.times_pick){
        var critics_rating = document.createElement('img');
        critics_rating.src = "star1.jpg";
        critics_rating.className = 'img-circle pull-right';

        var pick = document.createElement('span');
        pick.innerHTML = "NY Times Critics' Pick";
        pick.className = 'pull-right';
        pick.style.fontWeight = "bolder";
        pick.style.color = "black";
        pick.style.fontSize = "12px";

        eventName.appendChild(critics_rating);
        eventName.appendChild(document.createElement('br'));
        eventName.appendChild(pick);
    }
    
    //The event body contains the description of the event, type of event, date and time description, go to event button and bookmark button
    var eventBody = document.createElement('div');
    eventBody.id = "evtBody";
    eventBody.className = 'panel-body';
    var eventDesc = document.createElement('div');
    eventDesc.innerHTML = result.web_description;
    eventBody.appendChild(eventDesc);
    eventBody.appendChild(document.createElement('hr'));
    
    //Event body contains event details
    var eventDetails = document.createElement('div');
    eventDetails.id = "list-group";
    
    
    var eventBtns = document.createElement('div');
    
    var eventurl = document.createElement('a');
    eventurl.id = "evtURL";
    eventurl.className = "btn btn-default";
    eventurl.target = "_blank";
    eventurl.innerHTML = "Event Page";
    eventurl.href = result.event_detail_url;
    
    var bookmark = document.createElement('button');
    bookmark.id = "bm" + ind.toString();
    bookmark.className = "btn btn-default btn-primary bookmarks";
    bookmark.setAttribute('onclick','addBookmark(this.id)');
    bookmark.innerHTML = "Bookmark";
    
    eventBtns.appendChild(eventurl);
    eventBtns.appendChild(bookmark);

    var eventCat = document.createElement('a');
    eventCat.className = 'list-group-item';
    //console.log(result.category);
    var dataCategory = result.category;
    //converts jargony categories to user friendly ones
    if (dataCategory == "spareTimes"){
        dataCategory = "Seasonal Events";
    }
    if (dataCategory == "forChildren"){
        dataCategory = "for Children";
    }
    eventCat.appendChild(document.createTextNode(dataCategory));
    eventDetails.appendChild(eventCat);

    if(result.date_time_description){
        var times = document.createElement('a');
        times.className = 'list-group-item';
        times.appendChild(document.createTextNode(result.date_time_description));
        if(result.recur_days){
            times.appendChild(document.createTextNode(result.recur_days));
        }
        eventDetails.appendChild(times);
    }
    
    if(result.free){
        var freeEvt = document.createElement('a');
        freeEvt.className = 'list-group-item';
        freeEvt.appendChild(document.createTextNode("FREE"));
        eventDetails.appendChild(freeEvt);
    }

    eventBody.appendChild(eventDetails);
    eventBody.appendChild(eventBtns);
    
    
    //Make the map and the map marker for the current result
    var myLatlng = new google.maps.LatLng(result.geocode_latitude,result.geocode_longitude);

    letter = String.fromCharCode("A".charCodeAt(0) + index);
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map_var,
      icon: "https://maps.google.com/mapfiles/marker" + letter + ".png",
      animation: google.maps.Animation.DROP,
      title: result.event_name
    });
  
    var contentStringMarker = '<div style="font-weight: bolder; font-size: 15px;color: #2979FF;text-align:center;"><img src="' 
                                + marker_img.src + '"><br/>' + result.event_name + 
                                '</div> <div class="panel-body" style="text-align:center;"> <a class="btn btn-default" href="' + result.event_detail_url 
                                + '" target="_blank"> Event Page &raquo;</a> </div>'
    
    var infowindow = new google.maps.InfoWindow({
                content: contentStringMarker,
                maxWidth: 200
            });
  
    //Listener for displaying the event infowindow when user clicks on the event marker on the map
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map_var,marker);
        google.maps.event.addListenerOnce(map_var, 'mousemove', function(){
            infowindow.close();
        });
    });
    
    //Append all the components to the event card
    cardDiv.appendChild(eventLetterOnMap);
    cardDiv.appendChild(eventName);
    cardDiv.appendChild(eventBody);
    colNum = colNum + 1;
    if(colNum == 4)
        colNum = 2;
    $("#col" + colNum).append(cardDiv);
}

//processes returned moment object from calendar widget, DATE ONLY!
//will need to be modified if including time
function timeprocess(momentObject){
    var month = momentObject._d.getMonth()+1;
    var year = momentObject._d.getYear() + 1900;
    var date = momentObject._d.getDate();
    
    var mm = month.toString();
    var yyyy = year.toString();
    var dd = date.toString();

    if(date<10) {
        dd='0'+dd;
    } 

    if(month<10) {
        mm='0'+mm;
    } 

    return(yyyy + "-" + mm + "-" + dd);  
}


//Initialize map with the center as the chosen borough
function map_initialize(latitude,longitude) {
    var mapCenter = new google.maps.LatLng(latitude,longitude);
    var mapOptions = {
        zoom: 12,
        center: mapCenter
    }
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  
    return map;
}

//When the bookmark button is clicked, add the bookmark to the my bookmarked events and display all the bookmarked events
function addBookmark(theID){
    var aKey;

    //document.getElementById(theID).disabled = true;
    $('#myeventlist').empty(); //generate the bookmarks fresh each time
    var theIndex = parseInt(theID.substring(2));  
    var bmData = thisPage[theIndex];
    localStorage.setItem( bmData.eventTitle , bmData.eventURL);
    makeBookmarks();
    $(".bookmarks").attr("data-toggle", "modal");
    $(".bookmarks").attr("data-target", "#eventModal");
}   

//When viewing the bookmarks in the "My Bookmarked Events", user can remove the bookmark
function removeOneBookmark(theID){
    var theIndex = parseInt(theID.substring(3));
    console.log(theIndex);
    console.log(theID);
    var theKey = localStorage.key(theIndex); 
    localStorage.removeItem(theKey);
    $('#myeventlist').empty(); 
    makeBookmarks();
}

//Remove all bookmarks from "My Bookmarked Events"
function removeBookmarks(){
    $('#myeventlist').empty();
    localStorage.clear();
    //$('.bookmarks').prop('disabled', false);
}


//Make the bookmarks with the event page and remove buttons for all the events stored on the local storage
function makeBookmarks(){
    for (var i=0; i<localStorage.length; i++)  
    {  
        var aKey = localStorage.key(i);  
        $('#myeventlist').append( '<span style="font-weight:bolder;">' + aKey + '</span><br><a class="btn btn-default" href="' + localStorage.getItem(aKey) + '" target="_blank">Event Page</a><a id="bmr' + i.toString() + '" class="btn btn-default href="javascript:void(0);" onclick="removeOneBookmark(this.id)">Remove This Bookmark</a><hr>')
        
    }      
}
