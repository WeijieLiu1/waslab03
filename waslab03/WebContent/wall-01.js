var baseURI = "http://localhost:8080/waslab03";
var tweetsURI = baseURI+"/tweets";

var req;
var tweetBlock = "	<div id='tweet_{0}' class='wallitem'>\n\
	<div class='likes'>\n\
	<span class='numlikes'>{1}</span><br /> <span\n\
	class='plt'>people like this</span><br /> <br />\n\
	<button onclick='{5}Handler(\"{0}\")'>{5}</button>\n\
	<br />\n\
	</div>\n\
	<div class='item'>\n\
	<h4>\n\
	<em>{2}</em> on {4}\n\
	</h4>\n\
	<p>{3}</p>\n\
	</div>\n\
	</div>\n";




String.prototype.format = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined'
			? args[number]
		: match
		;
	});
};

function likeHandler(tweetID) {
	var target = 'tweet_' + tweetID;
	var uri = tweetsURI+ "/" + tweetID +"/likes";
	// e.g. to like tweet #6 we call http://localhost:8080/waslab03/tweets/6/like

	req = new XMLHttpRequest();
	req.open('POST', uri, /*async*/true);
	req.onreadystatechange = function() { 
		if (req.status == 200) { // 200 OK
			document.getElementById(target).getElementsByClassName("numlikes")[0].innerHTML = req.responseText;
		}
	};
	req.send(/*no params*/null);
}

function deleteHandler(tweetID) {
	/*

	 * TASK #4 

	 */	
	 
	req = new XMLHttpRequest();
	
	var token = localStorage.getItem("token"+tweetID);
	
	var newUri = tweetsURI+ "/" + tweetID+"/delete";
	console.log("newUri:"+newUri);
	req.open('DELETE', newUri, /*async*/true);
	req.onreadystatechange = function() { 
			
			var d = document.getElementById("tweet_"+tweetID);
			d.parentNode.removeChild(d);
			localStorage.removeItem("token"+tweetID);
			
			//document.getElementById("tweet_"+tweetID).remove();
		
	};
	req.send(/*no params*/null);
	
	location.reload();
}

function getTweetHTML(tweet, action) {  // action :== "like" xor "delete"
	var dat = new Date(tweet.date);
	var dd = dat.toDateString()+" @ "+dat.toLocaleTimeString();
	return tweetBlock.format(tweet.id, tweet.likes, tweet.author, tweet.text, dd, action);

}

function getTweets() {
	req = new XMLHttpRequest(); 
	req.open("GET", tweetsURI, true); 
	req.onload = function() {
		if (req.status == 200) { // 200 OK
			var tweet_list = req.responseText;
			/*
			 * TASK #2 -->
			 */
			 var tweets = JSON.parse(tweet_list);
			 var finalHtml;
			 for(let i = 0; i<tweets.length;++i){
				if(localStorage.getItem("id"+tweets[i].id) == tweets[i].id ){
					
					finalHtml += getTweetHTML(tweets[i],"delete");
				}
				else{
					finalHtml += getTweetHTML(tweets[i],"like");
				}
				
				
			}
			document.getElementById("tweet_list").innerHTML = finalHtml;
		}
	};
	req.send(null); 
};


function tweetHandler() {
	var author = document.getElementById("tweet_author").value;
	var text = document.getElementById("tweet_text").value;
	/*
	 * TASK #3 -->
	 */
	 req = new XMLHttpRequest();
	req.open('POST', tweetsURI, /*async*/true);
	req.onload = function() { 
		if (req.status == 200) { // 200 OK
			//document.getElementById(target).getElementsByClassName("numlikes")[0].innerHTML = req.responseText;
			var aux = JSON.parse(req.responseText);
			
			var finalHtml = getTweetHTML(aux,"delete")+document.getElementById("tweet_list").innerHTML;
			
			localStorage.setItem("token" + aux['id'], aux['token']);
			localStorage.setItem("id" + aux['id'], aux['id']);
			
			
			document.getElementById("tweet_list").innerHTML = finalHtml;
		}
	};
	
	let info ={
		"author": author,
		"text" : text
	}
	
	
	req.setRequestHeader("Content-Type","application/json");
	req.send(/*no params*/JSON.stringify(info));
	 
	 
	//var mes1 = "Someone ({0}) wants to insert a new tweet ('{1}'),\n but this feature is not implemented yet!";
	//alert(mes1.format(author, text));

	location.reload();

	// clear form fields
	document.getElementById("tweet_author").value = "";
	document.getElementById("tweet_text").value = "";

};

//main
function main() {
	
	document.getElementById("tweet_submit").onclick = tweetHandler;
	getTweets();
	
};
