
function get_vid_obj(meta_data, vid_type){
  /* Function creates a DOM object for the inputed video
  consisting of a image, title, view_count, and button */

  var video = document.createElement('div')
  video.setAttribute('class', vid_type);

  // image div creation
  var picture = document.createElement('div');
  picture.setAttribute('class','image');
  var img = document.createElement('img');
  img.setAttribute('src', meta_data.vid_image);
  picture.appendChild(img);

  // title div creation
  var title_node = document.createElement('div');
  title_node.setAttribute('class','title');
  var name = document.createTextNode(meta_data.vid_title);
  title_node.appendChild(name);

  // view count div creation
  var views = document.createElement('div');
  views.setAttribute('class','views');
  var view_count = document.createTextNode(meta_data.vid_views);
  views.appendChild(view_count);

  // button to go to clipmine div creation
  var button_div = document.createElement('div');
  button_div.setAttribute('class', 'button');
  button_div.setAttribute('data-id', meta_data.vid_id);
  var button_text = document.createTextNode('Open in ClipMine');
  button_div.appendChild(button_text);

  //attach divs to video object
  video.appendChild(picture);
  video.appendChild(title_node);
  video.appendChild(views);
  video.appendChild(button_div);

  return video;
}

function insert_video_to_parent(menu, video) {
  /* function attaches video DOM to parent DOM
  and puts the seperator div after the video.
  Generalized to handle both menu and section parents*/

  menu.appendChild(video);

  //seperator creation 
  var sep = document.createElement('div');
  sep.setAttribute('class', 'seperator');
  menu.appendChild(sep);
}

function get_id_from_url (url) {
  var start = url.indexOf("?v=");
  if (start > 0){
    start = start + 3
    var end = start + 11;
    return url.slice(start, end);
  }
  return -1;
}

function create_jquery_ui() {
  /* Function uses jQuery-UI interface to turn each button
  into appropriately styled button and also creates show/hide
  animation for the buttons. Also creates accordian */

  $(function() {
    $('#search_box').attr('placeholder', 'Enter a URL');

    $('#search_box').focusin(function() {
      $(this).animate({
        width: "200px"
      }, 1000);
      $(this).attr('placeholder', 'Open any Youtube URL in ClipMine');
      $('#top_photo').animate({
        left: "20px"
      },1000);
    });

    $('form').submit( function() { return false; } );

    $('#search_img').click(function() {
      var url = $('#search_box').val();
      var id = get_id_from_url(url);
      if (id != -1){
        // will fix to create using url encoding
        var link = 'http://staging.clipmineinc.com/search/?keywords=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D' + id;
        window.open(link);
      }
    })

    $('#search_box').focusout(function(){
      $(this).animate({
        width: "70px"
      }, 1000);
      $(this).attr('placeholder', 'Enter a URL');
      $('#top_photo').animate({
        left: "140px"
      }, 1000);
    });

    $('.button').each(function() {
      $(this).button();
      $(this).hide();
      var id = $(this).attr('data-id');
      // will fix to create using url encoding
      var link = 'http://staging.clipmineinc.com/search/?keywords=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D' + id;
      $(this).click(function() {
        window.open(link);
      })
    });

    $('.main_video').hover(function (){
      $(this).find('.button').show(); //'blind', 500);
      },
      function () {
      $(this).find('.button').hide(); //'blind', 500);
      }
    );

    $('.video_item').hover(function (){
      $(this).find('.button').show(); //'blind', 500);
      },
      function () {
      $(this).find('.button').hide(); //'blind', 500);
      }
    );

    $('.accordian_contents').each(function() {
      $(this).hide();
    });

    $('.accordian_folder').each(function() {
      $(this).click(function (){
        $(this).next().toggle('slow');
      })
    })
  });
}

function attach_identifier(menu, message) {
  var watch_text_div = document.createElement('div');
  watch_text_div.setAttribute('class','identifier');
  var watch_text = document.createTextNode(message);
  watch_text_div.appendChild(watch_text);
  menu.appendChild(watch_text_div);
}

function handle_youtube_video_page(menu, real_data, vid_list) {
  attach_identifier(menu, "CURRENTLY WATCHING");

  var watch_vid = real_data.watching;
  var video_obj = get_vid_obj(watch_vid, "main_video");  
  menu.appendChild(video_obj);

  var sep = document.createElement('div');
  sep.setAttribute('class', 'seperator');
  menu.appendChild(sep);

  attach_identifier(menu, "RELATED VIDEOS");

  for (var i = 0; i < vid_list.length; i ++){
    var cur_video = vid_list[i];
    var video_obj = get_vid_obj(cur_video, "video_item");
    insert_video_to_parent(menu, video_obj);
  }
}

function handle_youtube_home_page(menu, vid_list) {
  for (var i = 0; i < vid_list.length; i ++){
    var section = vid_list[i];
    // each section object has 3 fields: videos, num_vids, and name
    var sec_vids = section.videos;
    var sec_name = section.name;

    var accordian_folder = document.createElement('button');
    accordian_folder.setAttribute("class", "accordian_folder");
    var title_text = document.createTextNode(sec_name);
    var num_sec_vids = document.createElement('num_vids');
    num_sec_vids.setAttribute('class', 'num_vids');
    var number = document.createTextNode(section.num_vids.toString())
    num_sec_vids.appendChild(number);
    accordian_folder.appendChild(title_text);
    accordian_folder.appendChild(num_sec_vids);

    var accordian_contents = document.createElement('div');
    accordian_contents.setAttribute("class", "accordian_contents");
    menu.appendChild(accordian_folder);

    var sep = document.createElement('div');
    sep.setAttribute('class', 'seperator');
    accordian_contents.appendChild(sep);

    for (var j = 0; j < sec_vids.length; j ++){
      var cur_video = sec_vids[j];
      var video_obj = get_vid_obj(cur_video, "video_item");
      insert_video_to_parent(accordian_contents, video_obj);
    }
    menu.appendChild(accordian_contents);
  }
}

function handle_youtube_search_page (menu, real_data, vid_list) {
  var search_div = document.createElement('div');
  search_div.setAttribute('class', 'main_search_div');

  var results_for_div = document.createElement('div');
  results_for_div.setAttribute('class', 'results_for');
  var results_for_text = document.createTextNode('Displaying results for:');
  results_for_div.appendChild(results_for_text);
  search_div.appendChild(results_for_div)

  var query_div = document.createElement('div');
  query_div.setAttribute('class','search_query');
  var query_text = document.createTextNode(real_data.query);
  query_div.appendChild(query_text);
  search_div.appendChild(query_div);

  menu.appendChild(search_div);

  var sep = document.createElement('div');
  sep.setAttribute('class', 'seperator');
  menu.appendChild(sep);

  for (var i = 0; i < vid_list.length; i ++) {
    var cur_video = vid_list[i];
    var video_obj = get_vid_obj(cur_video, "video_item");
    insert_video_to_parent(menu, video_obj);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var background_page = chrome.extension.getBackgroundPage();
  background_page.get_tab_vids();
});

var background_page = chrome.extension.getBackgroundPage();

// $(function (){
//   console.log("trying to get the json");
//   $.getJSON("https://gdata.youtube.com/feeds/api/videos/XSgjks4T8ps?v=2", function(data) {
//     console.log(JSON.stringify(data));
//   });
//   console.log("finished trying");
// });

// get_vids function on the background page has access to 
// data about videos on the page

function main (data){
  console.log("called the main");
  var body = document.getElementById("main_body");
  var real_data = data['parameters'];
  var page = real_data.page_type;

  var menu = document.createElement('div');
  menu.setAttribute('id','menu');
  body.appendChild(menu);

  // in the case of home_page, the vid_list is actually
  // a list of sections that contain videos lists
  var vid_list = real_data.all_vids;

  // video_page means the youtube page unique to a video
  // when you are watching it. home_page is when you open
  // youtube.com
  if (page == "video_page"){
    handle_youtube_video_page(menu, real_data, vid_list);
  } else if (page == "home_page"){
    handle_youtube_home_page(menu, vid_list);
  } else if (page == "search_page"){
    handle_youtube_search_page(menu, real_data, vid_list);
  }
  create_jquery_ui();
}

background_page.get_vids(main);
