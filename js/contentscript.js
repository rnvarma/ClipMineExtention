
var YOUTUBE_ID_LENGTH = 11
var YOUTUBE_BASE = "https://www.youtube.com/";
var DEFAULT_IMG_FRNT = "http://img.youtube.com/vi/";
var DEFAULT_IMG_BCK = "/default.jpg";

var MAIN_VID_ID = "watch-headline-title";
var TITLE_CLASS = "yt-uix-sessionlink yt-uix-tile-link spf-link yt-ui-ellipsis yt-ui-ellipsis-2";
var RELATED_VID_CLASS = "video-list-item related-list-item";
var RELATED_VIDEO_TAG = " related-video spf-link yt-uix-sessionlink"
var VIEW_COUNT_CLASS = "stat view-count";
var TIME_CLASS = "video-time";
var MAIN_VIEW_CLASS = "watch-view-count";
var MAIN_USER_CLASS = "g-hovercard yt-uix-sessionlink yt-user-name ";

var HOME_VIDS_CLASS = "yt-shelf-grid-item";
var HOME_VIDS_ID_CLASS = "ux-thumb-wrap yt-uix-sessionlink yt-fluid-thumb-link contains-addto spf-link";
var HOME_VIDS_TITLE_CLASS = "yt-uix-sessionlink yt-uix-tile-link spf-link yt-ui-ellipsis yt-ui-ellipsis-2";
var HOME_VIDS_VIEW_CLASS = "yt-lockup-meta-info";
var SECTION_CLASS = "shelf-wrapper clearfix";
var SECTION_TITLE_CLASS = "branded-page-module-title-text";
var HOME_SHELF_CLASS = "lohp-shelf-content";
var HOME_SHELF_MAIN_VIEW_CLASS = "view-count lohp-video-metadata-item";
var HOME_LARGE_VID_CLASS = "lohp-large-shelf-container";
var HOME_SHELF_MED_CLASS = "lohp-medium-shelf spf-link";
var HOME_SHELF_TITLE_ID_CLASS = "lohp-video-link max-line-2 yt-uix-sessionlink spf-link";

var SEARCH_VID_CLASS = "yt-lockup clearfix yt-uix-tile result-item-padding yt-lockup-video yt-lockup-tile";
var SEARCH_VID_TITLE_ID_CLASS = "yt-uix-sessionlink yt-uix-tile-link spf-link yt-ui-ellipsis yt-ui-ellipsis-2";
var SEARCH_VIEW_CLASS = "yt-lockup-meta-info";
var SEARCH_TIME_CLASS = "video-time";

var MUSIC_PAGE_SECTION_CLASS = "feed-item-container yt-section-hover-container browse-list-item-container branded-page-box vve-check ";
var MUSIC_VID_CLASS = "channels-content-item yt-shelf-grid-item yt-uix-shelfslider-item ";

/* ------------ GENERAL FUNCTIONS ------------ */

function merge_lists(a, b){
  /* function to create list of size a_size + b_size
  where the first a_size elements are a and the next
  b_size elements are b */

  for (var i = 0; i < b.length; i ++){
    a.push(b[i]);
  }
  return a;
}

function get_id_from_youtube_url (url) {
  /* the id is always the first argument in the url
  marked with a 'v' key */

	var start = url.indexOf("?v=")

  // if the v= tag is not present, send a signal to function caller
  // that this link does not have an id
  if (start < 0) {
    return -1;
  } else {
    start = start + 3; // want whats after '?v='
  }
	var end = start + YOUTUBE_ID_LENGTH;
	return url.slice(start, end);
}

function is_keyword_in_url (keyword, max) {
  /* identifies if a keyword is contained in the beginning part of
  the url. this is to handle when get requests are made on a page that have 
  nothing to do with the extension but crash the program*/

  var url = document.URL
  var word_len = keyword.length;

  // only check the first 'max' characters at most because just want to check
  // if the keyword is contained in the domain name
  var max_len = (url.length < max) ? url.length - word_len : max - word_len;
  for (var i = 0; i < max_len; i ++){
    var slice = url.slice(i, i + word_len);
    if (slice == keyword) {
      return true;
    }
  }
  return false;
}

function not_supported_url() {
  /* currently support youtube and google.
  This is to handle misc url calls on a youtube
  page which should not go through the pipeline
  but should not trigger to turn the icon off*/

  var url = document.URL;
  if (url.indexOf("youtube") >= 0) {
    return false;
  } else if (url.indexOf("google") >= 0) {
    return false;
  } else {
    return true;
  }
}

function get_youtube_ids_from_page(){
  /* function for internal uses to see if we can access the 
  youtube ids on a misc page*/

  var text = document.body.innerHTML;
  var key = "youtube.com/";
  var id = "watch?v="
  var id_list = []
  for (var i = 0; i < text.length - key.length; i ++){
    if (text.slice(i, i + key.length) == key) {
      var match = (text.slice(i, i + 40));
      if (match.indexOf(id) > 0) {
        start = match.indexOf(id) + 8;
        end = start + YOUTUBE_ID_LENGTH;
        the_id = match.slice(start, end);
        id_list.push(the_id);
      }
    }
  }
  return id_list;
}


/* ------------ YOUTUBE FUNCTIONS ------------ */

function get_search_terms_youtube() {
	var url = document.URL;
	var start = url.indexOf("search_query=") + 13; // want whats after the search
	var end = start;
  
  // get everything contained in the argument search_query
	while (end < url.length && url.charAt(end) !="&"){
		end ++;
	}
	var query_raw = url.slice(start, end);

  // url has '+' in place for spaces, so remove those
	while (query_raw.indexOf('+') > 0){
		query_raw = query_raw.replace('+', ' ');
	}

  // turn the query into a human-readable string
	return decodeURIComponent(query_raw)
}

function get_views_from_html (html) {
  /* views are not accesible through walking the dom
  so instead locally search through the specific video dom and
  retrieve the view count*/

  var i = 0;
  while (html.slice(i, i + 5) != "views"){
    i ++;
  }
  var end = i + 5; // i is on the 'v' in views
  while (html.charAt(i) != ">") {
    i --;
  }
  var start = i + 1; // i is on the '>' right before the number of views
  var views = html.slice(start, end);
  return views
}

function remove_duplicate_sections_youtube(page_info) {
  /* handles when the homepage has section headers that match. 
  Dont want to display two sections for the same heading. Merges all
  the videos of repeated sections to the first instance of each section */

  // any name in name_list will be indexed in the corresponsing
  // location of the section in new_list
  new_list = [];
  name_list = [];

  for (var i = 0; i < page_info.length; i ++){
    var section = page_info[i];
    var sec_name = section.name;

    // check if we've seen the name already,
    // if no, then record it. if yes, then combine with seen instance
    if (name_list.indexOf(sec_name) < 0) {
      name_list.push(sec_name);
      new_list.push(section)
    } else {
      var index_of_repeat = name_list.indexOf(sec_name);
      var orig_list = new_list[index_of_repeat].videos
      var rep_list = section.videos

      new_list[index_of_repeat].videos = merge_lists(orig_list,rep_list)
      new_list[index_of_repeat].num_vids += section.num_vids;
    }
  }
  return new_list;
}

function get_search_vid_info(){
  /* returns all videos on a page showing results of a youtube search*/

  var video_objs = document.getElementsByClassName(SEARCH_VID_CLASS);
  var vids_info = [];
  for (var i = 0; i < video_objs.length; i ++){
    var vid = video_objs[i]

  // each element in id_title_node contains the title and the id
	var id_title_node = vid.getElementsByClassName(SEARCH_VID_TITLE_ID_CLASS)[0];
	var link = id_title_node.getAttribute('href');
	var id = link.slice(link.length-YOUTUBE_ID_LENGTH, link.length);

	var title = id_title_node.innerText
	 
	 // retrieve views and handle case where the view count is not present
	var views_dom = vid.getElementsByClassName(SEARCH_VIEW_CLASS)[0]
	var views = get_views_from_html(views_dom.innerHTML);

	var time = vid.getElementsByClassName(SEARCH_TIME_CLASS)[0].innerText;

	var image = DEFAULT_IMG_FRNT + id + DEFAULT_IMG_BCK;

	var info = {
	  vid_id: id,
	  vid_title: title,
	  vid_views: views,
	  vid_time: time,
	  vid_image: image
	}
	vids_info.push(info);
  }
  return vids_info;
}

function get_page_type_youtube(){
  /* returns if it is the youtube homepage or a specific video page.
  Uses the property that the home is a distinct length and a specific page
  is longer */

  var url = document.URL;
  var base_len = YOUTUBE_BASE.length
  var page_type = (url.length > base_len) ? "video_page":"home_page";
  if (is_keyword_in_url('search_query', 50)) {
  	page_type = "search_page";
  }
  return page_type
}

function get_main_vid_info_youtube(){
  /* return retrievable metadata for the video that the user is watching*/

  // url for specific page is *youtube.com/watch?v=xxxxxxxxxxx
  // id length is 11
  var url = document.URL;
  var id = get_id_from_youtube_url(url);
  
  // retrieves the DOM element containing the title
  // the first item in childNodes is the text, but we want the actualy child
  var title = document.getElementById(MAIN_VID_ID).childNodes[1].innerText;
  
  // getElementsByClassName returns a list but there will only be one element
  // in it so we want the 0th index, a DOM containing the view count
  var views = document.getElementsByClassName(MAIN_VIEW_CLASS)[0].innerHTML;
  
  // youtube has a nice format for thumbnails which is easily creatable
  var image = DEFAULT_IMG_FRNT + id + DEFAULT_IMG_BCK;
  var info = {
    vid_id: id,
    vid_title: title,
    vid_views: views,
    vid_image: image,
    vid_time: "5:00"
  }
  return info;
}

function get_related_vid_info_youtube(){
  /* retrieves meta-data for the related videos */

  var video_objs = document.getElementsByClassName(RELATED_VID_CLASS);
  var vids_info = [];
  for (var i = 0; i < video_objs.length; i ++){
    var vid = video_objs[i].childNodes[1];
    if (vid) {
      // some times the RELATED_VID_CLASS will pick up DOMs which are 
      // channels or users, but not videos. In this case, the video will
      // not have the tag attribute. Thus, only proceed if it matches the
      // RELATED_VIDEO_TAG
      if (vid.attributes[1]) {
        var item_class = vid.attributes[1].nodeValue;
      } else {
        var item_class = vid.attributes[0].nodeValue
      }
      if (item_class == RELATED_VIDEO_TAG){
        // searching for meta-data within the local dom for each video
        // first attribute is the 'href', e.g. /watch?v=xxxxxxxxxxx
        var id_node = vid.attributes[0].nodeValue;
        var id = get_id_from_youtube_url(id_node);
        
        var title_dom = vid.getElementsByClassName("title")[0]
        var title = title_dom.innerText;
         
         // retrieve views and handle case where the view count is not present
        var views_dom = vid.getElementsByClassName(VIEW_COUNT_CLASS)[0]
        if (views_dom) {
          var views = views_dom.innerHTML;
        } else {
          views_dom = "Recommended";
        }
        
        var time = vid.getElementsByClassName(TIME_CLASS)[0].innerHTML;

        var image = DEFAULT_IMG_FRNT + id + DEFAULT_IMG_BCK;

        var info = {
          vid_id: id,
          vid_title: title,
          vid_views: views,
          vid_time: time,
          vid_image: image
        }
        vids_info.push(info);
      }
    }
  }
  return vids_info;
}

function get_shelf_large_info(section) {
  var vid = section.getElementsByClassName(HOME_LARGE_VID_CLASS)[0];
  var time = vid.getElementsByClassName(TIME_CLASS)[0].innerText;
  var views = vid.getElementsByClassName(HOME_SHELF_MAIN_VIEW_CLASS)[0].innerText;
  var title_id_info = vid.getElementsByTagName('a')[1];
  var id = get_id_from_youtube_url(title_id_info.getAttribute('href'));
  var image = DEFAULT_IMG_FRNT + id + DEFAULT_IMG_BCK;
  var title = title_id_info.innerText;
  var info = {
    vid_id: id,
    vid_title: title,
    vid_views: views,
    vid_time: time,
    vid_image: image
  }
  return info
}

function get_home_page_shelf_vids(section){
  var all_sec_vids = [];
  var large_header_info = get_shelf_large_info(section);
  all_sec_vids.push(large_header_info);

  var vids_in_shelf = section.getElementsByClassName(HOME_SHELF_MED_CLASS);
  for (var i = 0; i < vids_in_shelf.length; i ++){
    var vid = vids_in_shelf[i];
    var time = vid.getElementsByClassName(TIME_CLASS)[0].innerText;
    var views = vid.getElementsByClassName('view-count')[0].innerText;
    var title_id_info = vid.getElementsByClassName(HOME_SHELF_TITLE_ID_CLASS)[0];
    var id = get_id_from_youtube_url(title_id_info.getAttribute('href'));
    var title = title_id_info.innerHTML;
    var image = DEFAULT_IMG_FRNT + id + DEFAULT_IMG_BCK;
    var info = {
      vid_id: id,
      vid_title: title,
      vid_views: views,
      vid_time: time,
      vid_image: image
    }
    all_sec_vids.push(info);
  }
  return all_sec_vids;
}

function get_home_page_section_vids (section) {
  var all_sec_vids = [];
  // retrieve all videos in section
  sec_vids = section.getElementsByClassName(HOME_VIDS_CLASS);

  for (var i = 0; i < sec_vids.length; i ++){
    var vid = sec_vids[i]

    // retrieve id
    var id_node_dom = vid.getElementsByClassName(HOME_VIDS_ID_CLASS)[0]
    var id_node = id_node_dom.attributes[0].nodeValue;
    var id = get_id_from_youtube_url(id_node);

    var title_dom = vid.getElementsByClassName(HOME_VIDS_TITLE_CLASS)[0]
    var title = title_dom.innerHTML;
    
    var html = vid.innerHTML;
    var views = get_views_from_html(html);
    
    var time = vid.getElementsByClassName(TIME_CLASS)[0].innerHTML;
    
    var image = DEFAULT_IMG_FRNT + id + DEFAULT_IMG_BCK;
    
    var info = {
      vid_id: id,
      vid_title: title,
      vid_views: views,
      vid_time: time,
      vid_image: image
    }
    all_sec_vids.push(info)
  }
  return all_sec_vids;
}

function get_home_page_vids(){
  /* retrieves the meta-data for ecah video on the home page and also
  associates each video with a specific section that it is shown in.*/

  page_info = []
  var sections = document.getElementsByClassName(SECTION_CLASS);

  for (var j = 0; j < sections.length; j ++){
    var all_sec_vids = []
    var section = sections[j];

    if (section.getElementsByClassName(HOME_SHELF_CLASS).length){
      all_sec_vids = get_home_page_shelf_vids(section);
      sec_info = {
        name: 'General',
        num_vids: all_sec_vids.length,
        videos: all_sec_vids
      };
      page_info.push(sec_info);
    } else {
      // retrieve name of section
      var s_name_dom = section.getElementsByClassName(SECTION_TITLE_CLASS)[0];
      var sec_name = s_name_dom.innerHTML;

      all_sec_vids = get_home_page_section_vids(section);
      sec_info = {
        name: sec_name,
        num_vids: all_sec_vids.length,
        videos: all_sec_vids
      };
      page_info.push(sec_info);
    }
  }
  page_info = remove_duplicate_sections_youtube(page_info);

  return page_info;
}

function handle_youtube_video_page(page) {
	var main_vid = get_main_vid_info_youtube();
	var related_vids = get_related_vid_info_youtube();
	var message = {
		act: "save_vids",
		page_type: page,
		watching: main_vid,
		all_vids: related_vids
	}
	return message
}

function handle_youtube_search_page(page) {
	var search_query = get_search_terms_youtube();
	var vids = get_search_vid_info();
	var message = {
		act: "save_vids",
		page_type: page,
		query: search_query,
		all_vids: vids
	}
	return message;
}

function handle_youtube_home_page(page) {
	var vids = get_home_page_vids();
	var message = {
		act: "save_vids",
		page_type: page,
		all_vids: vids
	}
	return message
}

function handle_youtube() {
	var page = get_page_type_youtube();
    if (page == "video_page"){
    	message = handle_youtube_video_page(page);
    } else if (page == "search_page"){
    	message = handle_youtube_search_page(page);
    } else {
    	message = handle_youtube_home_page(page);
    }
    return message
}

/* ------------ GOOGLE FUNCTIONS ------------ */

function get_search_terms_from_google() {
  var url = document.URL;
  var key = "search?";
  var start = url.indexOf(key) + 7;
  url = url.slice(start, url.length);
  start = 0;
  while (url.charAt(start) != "q"){
    start = url.indexOf('&') + 1;
    url = url.slice(start, url.length);
    start = 0;
  }
  start = 2
  var end = url.indexOf("&");
  var query_raw = url.slice(start, end);
  while (query_raw.indexOf('+') >= 0) {
    query_raw = query_raw.replace('+', ' ');
  }
  return decodeURIComponent(query_raw);
}

function handle_google() {
  /* retrieves all the videos on any given google page.
  Use cases are mostly for the search and video pages.

  TODO: test on google plus*/

  var vid_list = []
  var potential_links = document.getElementsByTagName('a');
  var search_terms = get_search_terms_from_google();

  for (var i = 0; i < potential_links.length; i ++){
    var curr_elem = potential_links[i];
    var href_val = curr_elem.getAttribute('href');
    if (href_val) {

      // only handle youtube links
      if (href_val.indexOf("youtube") > 0) {
        var id = get_id_from_youtube_url(href_val); // returns -1 if no id
        if (id != -1) {
          var title = curr_elem.innerText;
          var image = DEFAULT_IMG_FRNT + id + DEFAULT_IMG_BCK;
          var views = "unkown";

          // handle when it curr_elem is not the desired DOM object
          // the innerHTML will be larger than 100 everytime
          // youtube max title length is 100, so this will keep all valid
          // titles
          if (curr_elem.innerHTML.length <= 100){
            var info = {
              vid_id: id,
              vid_title: title,
              vid_image: image,
              vid_views: views
            }
            vid_list.push(info);
          }
        }
      }
    }
  }
  // if there are no videos on the page, then turn off the icon
  if (vid_list.length > 0){
    message = {
      query: search_terms,
      act: "save_vids",    
      page_type: "search_page",
      all_vids: vid_list
    }
  } else {
    message = {act: "turn_off_icon"};
  }
  return message;
}

function handle_facebook () {
  var vid_list = []
  var ids_on_page = get_youtube_ids_from_page();
  for (var i = 0; i < ids_on_page.length; i ++) {
    var id = ids_on_page;
    var image = DEFAULT_IMG_FRNT + id + DEFAULT_IMG_BCK;
    var info = {
      vid_id: id,
      vid_image: image,
      vid_views: "unknown",
      vid_title: "unkonwn"
    }
    vid_list.push(info);
  }
  if (vid_list.length > 0){
    message = {
      query: "facebook",
      act: "save_vids",    
      page_type: "search_page",
      all_vids: vid_list
    }
  } else {
    message = undefined;
  }
  return message;
}

function main(){
  if (is_keyword_in_url("youtube", 35)){
  	message = handle_youtube();
    // send data to the background.js
    chrome.extension.sendMessage(message, function(response){});
  } else if (is_keyword_in_url("google.com/search?", 40)){
    message = handle_google();
    chrome.extension.sendMessage(message, function(response){});
  } else if (is_keyword_in_url("facebook", 35)) {
    message = handle_facebook();
    if (message){
      chrome.extension.sendMessage(message, function(response){});
    }
  } else if (not_supported_url()){
    chrome.extension.sendMessage({act:"turn_off_icon"});
  }
}

main();

chrome.runtime.onMessage.addListener(function(sender, msg, sendResponse) {
  console.log("got here");
  main();
});